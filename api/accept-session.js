import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'StudyNSync <onboarding@resend.dev>';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

function ics({ start, end, summary }) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyNSync//EN\nBEGIN:VEVENT\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${summary}\nEND:VEVENT\nEND:VCALENDAR`;
}

async function sendEmail(to, subject, html, attachments = []) {
  if (process.env.EMAIL_ENABLED !== 'true') {
    return { ok: true };
  }
  if (!RESEND_API_KEY) {
    console.log('[accept-session] RESEND_API_KEY missing, skipping email');
    return { ok: true };
  }
  const body = { from: RESEND_FROM, to: Array.isArray(to) ? to : [to], subject, html };
  if (attachments.length) body.attachments = attachments;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Email send failed');
  return { ok: true };
}

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Server not configured (Supabase URL or service key missing)' });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const id = (req.body || {}).id;
    if (!id) return res.status(400).json({ error: 'id required' });

    // Fetch session
    const { data: session, error: sErr } = await supabase
      .from('sessions')
      .select('id, from_user_id, to_user_id, start_at, end_at, status')
      .eq('id', id)
      .single();
    if (sErr) throw sErr;
    if (!session) return res.status(404).json({ error: 'session not found' });

    // Update status to accepted
    const { error: uErr } = await supabase
      .from('sessions')
      .update({ status: 'accepted' })
      .eq('id', id);
    if (uErr) throw uErr;

    // Fetch users
    const userIds = [session.from_user_id, session.to_user_id];
    const { data: users, error: u2Err } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .in('id', userIds);
    if (u2Err) throw u2Err;

    const a = users?.find(u => u.id === session.from_user_id);
    const b = users?.find(u => u.id === session.to_user_id);

    const recipients = [a?.email, b?.email].filter(Boolean);
    if (recipients.length) {
      const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">Your Study Session Is Confirmed</h2>
        <p>When: <strong>${session.start_at}</strong> to <strong>${session.end_at}</strong></p>
        <p><strong>${a?.name || a?.id}</strong> — Email: ${a?.email || 'N/A'} • Phone: ${a?.phone || 'N/A'}</p>
        <p><strong>${b?.name || b?.id}</strong> — Email: ${b?.email || 'N/A'} • Phone: ${b?.phone || 'N/A'}</p>
        <p><em>Happy Learning!</em></p>
        <p>With regards,<br/>StudyNSync<br/>C Vijaya Krishna</p>
      </div>`;
      const file = ics({ start: session.start_at, end: session.end_at, summary: `Study Session: ${a?.name || a?.id} x ${b?.name || b?.id}` });
      const attachments = [{ filename: 'session.ics', content: Buffer.from(file).toString('base64') }];
      await sendEmail(recipients, 'Your Study Session Is Confirmed', html, attachments);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('[accept-session]', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

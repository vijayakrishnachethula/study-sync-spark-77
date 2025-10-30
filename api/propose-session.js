import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'StudyNSync <onboarding@resend.dev>';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const APP_URL = process.env.APP_URL || 'https://studynsync.vercel.app';

function proposeHtml({ receiverName, senderName, topic, timeRange }) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px">New Study Session Proposal on <span style="color:#2563eb">StudyNSync</span></h2>
    <p>Hi ${receiverName || 'there'},</p>
    <p>You have received a new study session proposal from <strong>${senderName || 'a StudyNSync user'}</strong>.</p>
    <ul style="padding-left:16px">
      <li><strong>Topic:</strong> ${topic || 'Study Session'}</li>
      <li><strong>Date & Time:</strong> ${timeRange}</li>
    </ul>
    <p>Open your StudyNSync dashboard to review.</p>
    <p><a href="${APP_URL}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open StudyNSync</a></p>
    <p>With regards,<br/>StudyNSync<br/>C Vijaya Krishna</p>
  </div>
  `;
}

async function sendEmail(to, subject, html) {
  if (process.env.EMAIL_ENABLED !== 'true') {
    return { ok: true };
  }
  if (!RESEND_API_KEY) {
    console.log('[propose-session] RESEND_API_KEY missing, skipping email');
    return { ok: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Email send failed');
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { from_user_id, to_user_id, start_at, end_at, topic, message, note } = req.body || {};
    if (!from_user_id || !to_user_id || !start_at || !end_at) {
      return res.status(400).json({ error: 'from_user_id, to_user_id, start_at, end_at required' });
    }

    // Insert session (no email accept token)
    const safeNote = note ? (typeof note === 'object' ? JSON.stringify(note) : String(note)) : (message || '');
    const { data: inserted, error: iErr } = await supabase
      .from('sessions')
      .insert({ from_user_id, to_user_id, start_at, end_at, note: safeNote, status: 'pending' })
      .select('id')
      .single();
    if (iErr) throw iErr;

    // Fetch users
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', [from_user_id, to_user_id]);
    if (uErr) throw uErr;

    const sender = users?.find((u) => u.id === from_user_id);
    const receiver = users?.find((u) => u.id === to_user_id);

    const receiverEmail = receiver?.email;
    if (receiverEmail) {
      const timeRange = `${start_at} - ${end_at}`;
      await sendEmail(
        receiverEmail,
        'New Study Session Proposal on StudyNSync',
        proposeHtml({ receiverName: receiver?.name, senderName: sender?.name, topic, timeRange })
      );
    }

    return res.json({ ok: true, id: inserted?.id });
  } catch (e) {
    console.error('[propose-session]', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

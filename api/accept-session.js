import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'StudySync <onboarding@resend.dev>';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function sendEmail(to, subject, text) {
  if (!RESEND_API_KEY) {
    console.log('[accept-session] RESEND_API_KEY missing, skipping email');
    return { ok: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to: Array.isArray(to) ? to : [to], subject, text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Email send failed');
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Server not configured (Supabase URL or service key missing)' });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { id } = (req.body || {});
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
      .select('id, name, email')
      .in('id', userIds);
    if (u2Err) throw u2Err;

    const a = users?.find((u) => u.id === session.from_user_id);
    const b = users?.find((u) => u.id === session.to_user_id);

    const recipients = [a?.email, b?.email].filter(Boolean);
    if (recipients.length) {
      const text = `Your StudySync session is confirmed!\n\nWhen: ${session.start_at} - ${session.end_at}\n\nPartner A: ${a?.name || a?.id}\nPartner B: ${b?.name || b?.id}\n\nHappy studying!`;
      await sendEmail(recipients, 'StudySync session confirmed', text);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('[accept-session]', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

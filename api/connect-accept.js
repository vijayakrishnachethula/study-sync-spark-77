import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'StudyNSync <onboarding@resend.dev>';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const APP_URL = process.env.APP_URL || 'https://studynsync.vercel.app';

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.log('[connect-accept] RESEND_API_KEY missing, skipping email');
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
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const cid = req.query?.cid ? Number(req.query.cid) : undefined;
    const token = req.query?.t || '';
    if (!cid || !token) return res.status(400).json({ error: 'cid and token required' });

    const { data: conn, error: cErr } = await supabase
      .from('connections')
      .select('id, user_a_id, user_b_id, status, accept_token')
      .eq('id', cid)
      .single();
    if (cErr) throw cErr;
    if (!conn) return res.status(404).json({ error: 'connection not found' });
    if (conn.accept_token && conn.accept_token !== token) return res.status(403).json({ error: 'invalid token' });

    if (conn.status !== 'connected') {
      const { error: uErr } = await supabase
        .from('connections')
        .update({ status: 'connected' })
        .eq('id', cid);
      if (uErr) throw uErr;
    }

    // Notify both users: names only, no contacts
    const { data: users, error: u2 } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .in('id', [conn.user_a_id, conn.user_b_id]);
    if (u2) throw u2;
    const a = users?.find(u => u.id === conn.user_a_id);
    const b = users?.find(u => u.id === conn.user_b_id);

    const recipients = [a?.email, b?.email].filter(Boolean);
    if (recipients.length) {
      const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color:#28a745;">You’re Now Connected! 🎉</h2>

        <p>Hi <strong>${a?.name || a?.id}</strong> and <strong>${b?.name || b?.id}</strong>,</p>

        <p>
          Great news! You both are now connected on <strong>StudyNSync</strong>.  
          You can start collaborating, sharing notes, and scheduling your study sessions right away.
        </p>

        <h3 style="color:#0073e6;">📞 Connection Details</h3>

        <p>
          <strong>${a?.name || a?.id}</strong><br>
          Email: ${a?.email || 'N/A'}<br>
          Contact: ${a?.phone || 'N/A'}<br><br>

          <strong>${b?.name || b?.id}</strong><br>
          Email: ${b?.email || 'N/A'}<br>
          Contact: ${b?.phone || 'N/A'}
        </p>

        <p>
          Begin your first session by visiting your  
          <a href="${APP_URL}" style="color:#0073e6;">StudyNSync Dashboard</a>.
        </p>

        <br>
        <p>
          With regards,<br>
          <strong>StudyNSync</strong><br>
          C Vijaya Krishna
        </p>
      </div>
      `;
      await sendEmail(recipients, '🎉 Connection Accepted on StudyNSync!', html);
    }

    return res.status(302).setHeader('Location', '/?connected=1').end();
  } catch (e) {
    console.error('[connect-accept]', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

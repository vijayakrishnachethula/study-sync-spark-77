import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'StudyNSync <onboarding@resend.dev>';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const APP_URL = process.env.APP_URL || 'https://studynsync.vercel.app';

function randomToken() {
  return (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Math.random().toString(36).slice(2);
}

function connectionRequestHtml({ receiverName, senderName, acceptUrl }) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px">Connection Request on <span style="color:#2563eb">StudyNSync</span></h2>
    <p>Hi ${receiverName || 'there'},</p>
    <p><strong>${senderName || 'A StudyNSync user'}</strong> wants to connect with you.</p>
    <p>Only after connection will session proposals be enabled.</p>
    <p><a href="${acceptUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Accept connection</a></p>
    <p>With regards,<br/>StudyNSync<br/>C Vijaya Krishna</p>
  </div>
  `;
}

async function sendEmail(to, subject, html) {
  if (process.env.EMAIL_ENABLED !== 'true') {
    return { ok: true };
  }
  if (!RESEND_API_KEY) {
    console.log('[connect-request] RESEND_API_KEY missing, skipping email');
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

    const { from_user_id, to_user_id } = req.body || {};
    if (!from_user_id || !to_user_id) return res.status(400).json({ error: 'from_user_id and to_user_id required' });

    // Check existing connection (either direction)
    const { data: existing, error: e1 } = await supabase
      .from('connections')
      .select('id, status, user_a_id, user_b_id')
      .or(`and(user_a_id.eq.${from_user_id},user_b_id.eq.${to_user_id}),and(user_a_id.eq.${to_user_id},user_b_id.eq.${from_user_id})`)
      .limit(1);
    if (e1) throw e1;

    let connId;
    if (existing && existing.length) {
      const row = existing[0];
      if (row.status === 'connected') {
        return res.json({ ok: true, id: row.id, status: 'connected' });
      }
      // Update to pending with new token and unified direction from->to
      const token = randomToken();
      const { data: upd, error: e2 } = await supabase
        .from('connections')
        .update({ user_a_id: from_user_id, user_b_id: to_user_id, status: 'pending', accept_token: token })
        .eq('id', row.id)
        .select('id')
        .single();
      if (e2) throw e2;
      connId = upd.id;
    } else {
      const token = randomToken();
      const { data: ins, error: e3 } = await supabase
        .from('connections')
        .insert({ user_a_id: from_user_id, user_b_id: to_user_id, status: 'pending', accept_token: token })
        .select('id')
        .single();
      if (e3) throw e3;
      connId = ins.id;
    }

    // Fetch users for names/emails
    const { data: users, error: e4 } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', [from_user_id, to_user_id]);
    if (e4) throw e4;
    const sender = users?.find(u => u.id === from_user_id);
    const receiver = users?.find(u => u.id === to_user_id);

    const { data: tokenRow, error: e5 } = await supabase
      .from('connections')
      .select('accept_token')
      .eq('id', connId)
      .single();
    if (e5) throw e5;

    const acceptUrl = `${APP_URL}/api/connect-accept?cid=${connId}&t=${encodeURIComponent(tokenRow.accept_token || '')}`;

    if (receiver?.email) {
      await sendEmail(
        receiver.email,
        'Connection Request on StudyNSync',
        connectionRequestHtml({ receiverName: receiver?.name, senderName: sender?.name, acceptUrl })
      );
    }

    return res.json({ ok: true, id: connId });
  } catch (e) {
    console.error('[connect-request]', e?.message || e);
    return res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

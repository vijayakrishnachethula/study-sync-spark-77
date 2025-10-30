async function sendEmail({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set. Skipping email to', to, subject);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StudySync <noreply@studysync.local>',
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to send email');
    return { ok: true, data };
  } catch (e) {
    console.log('[email] send failed', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };

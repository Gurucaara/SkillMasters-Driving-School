// Sends email to the school through Resend (https://resend.com/docs/api-reference/emails/send-email).
// Used by the contact form and the Stripe webhook. With EMAIL_DRY_RUN=true (local testing only)
// the email is printed to the log instead of sent; never set that on Cloudflare, as it logs
// personal details.
import { serverEnv } from './server-env';

export interface OutgoingEmail {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/** True when an email could actually go out (or dry run is on). */
export const emailConfigured = () =>
  serverEnv.EMAIL_DRY_RUN === 'true' ||
  Boolean(serverEnv.RESEND_API_KEY && serverEnv.CONTACT_TO && serverEnv.CONTACT_FROM);

export async function sendToSchool(email: OutgoingEmail, tag: string): Promise<boolean> {
  if (serverEnv.EMAIL_DRY_RUN === 'true') {
    console.log(`[${tag}] EMAIL_DRY_RUN – not sent:\n${email.subject}\n${email.text}`);
    return true;
  }
  if (!emailConfigured()) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: serverEnv.CONTACT_FROM,
        to: [serverEnv.CONTACT_TO],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!res.ok) console.error(`[${tag}] Resend error`, res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (err) {
    console.error(`[${tag}] Resend unreachable`, String(err));
    return false;
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** A simple two-column email table from label/value rows. */
export function emailHtml(heading: string, rows: [string, string][], footer: string, note?: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#141414">
<h2 style="margin:0 0 12px">${escapeHtml(heading)}</h2>
<table cellpadding="6" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#5A5348;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join('\n')}
</table>
${note ? `<p style="margin:16px 0 0">${escapeHtml(note)}</p>` : ''}
<p style="color:#5A5348;font-size:12px;margin-top:20px">${escapeHtml(footer)}</p>
</body></html>`;
}

// Contact form: server-side validation and the email we send to the school.
// Kept free of Cloudflare/Resend calls so it can be tested on its own; the request handling
// lives in src/pages/api/contact.ts.
//
// Never trust the browser: every field is re-checked here (lengths, allowed choices, phone
// digits), whatever the form's own `required` / `pattern` said.
import { site } from '../data/site';
import { escapeHtml } from './email';

/** Topic chips on the contact page (kept in sync with src/pages/contact.astro). */
export const TOPICS = ['BDE program', 'G2 lessons', 'G lessons', 'Road test car', 'Pricing', 'Something else'] as const;
export const CONTACT_METHODS = ['WhatsApp', 'Text', 'Phone call', 'Email'] as const;

export interface ContactMessage {
  topic: string;
  name: string;
  phone: string;
  email: string; // '' when not given
  contactMethod: string;
  area: string;
  language: string;
  message: string; // '' when not given
}

export type ValidationResult =
  | { ok: true; data: ContactMessage }
  | { ok: false; errors: Record<string, string> };

const LIMITS = { name: 100, email: 150, message: 2000 };

/** Collapse whitespace and drop control characters (keeps newlines in the message). */
function clean(value: unknown, keepNewlines = false): string {
  if (typeof value !== 'string') return '';
  const noControl = value.replace(keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ');
  return keepNewlines
    ? noControl.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
    : noControl.replace(/\s+/g, ' ').trim();
}

const oneOf = (value: string, allowed: readonly string[], fallback: string) => (allowed.includes(value) ? value : fallback);

export function validateContact(input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  const name = clean(input.name);
  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  const phone = clean(input.phone);
  const digits = phone.replace(/\D/g, '');
  if (!phone) errors.phone = 'Please enter your phone number.';
  else if (!/^[0-9+().\- ]+$/.test(phone) || digits.length < 10 || digits.length > 15)
    errors.phone = 'Please enter a phone number with at least 10 digits.';

  const email = clean(input.email);
  if (email.length > LIMITS.email || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)))
    errors.email = 'Please check your email address, or leave it empty.';

  const message = clean(input.message, true);
  if (message.length > LIMITS.message) errors.message = `Please keep your message under ${LIMITS.message} characters.`;

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      topic: oneOf(clean(input.topic), TOPICS, 'Something else'),
      name,
      phone,
      email,
      contactMethod: oneOf(clean(input.contactMethod), CONTACT_METHODS, 'WhatsApp'),
      area: oneOf(clean(input.area), site.areas, site.areas[0]),
      language: oneOf(clean(input.language), site.languages, site.languages[0]),
      message,
    },
  };
}


/** The email Rahul receives. Plain text plus a simple HTML version (all values escaped). */
export function buildContactEmail(m: ContactMessage) {
  const subject = `Website message: ${m.topic} – ${m.name}`;
  const rows: [string, string][] = [
    ['Topic', m.topic],
    ['Name', m.name],
    ['Phone', m.phone],
    ['Email', m.email || '(not given)'],
    ['Best way to reach', m.contactMethod],
    ['Pickup area', m.area],
    ['Language', m.language],
  ];
  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\nMessage:\n${m.message || '(no message)'}\n\n— Sent from the contact form on ${new URL('/contact', 'https://skillmastersdrivingschool.ca').href}`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#141414">
<h2 style="margin:0 0 12px">New message from the website</h2>
<table cellpadding="6" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#5A5348"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('\n')}
</table>
<p style="margin:16px 0 4px"><strong>Message</strong></p>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(m.message || '(no message)')}</p>
<p style="color:#5A5348;font-size:12px;margin-top:20px">Sent from the contact form on ${escapeHtml(site.shortName)}'s website. Reply to answer${m.email ? ' by email' : ''}; or ${escapeHtml(m.contactMethod.toLowerCase())} ${escapeHtml(m.phone)}.</p>
</body></html>`;

  return { subject, text, html, replyTo: m.email || undefined };
}

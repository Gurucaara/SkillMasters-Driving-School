// POST /api/contact – the contact form (src/pages/contact.astro) sends JSON here.
//
// Order of checks (cheapest first, nothing is sent unless all pass):
//   1. JSON body, not too big
//   2. Rate limit per visitor IP (Cloudflare rate-limiting binding in wrangler.jsonc)
//   3. Honeypot field: bots that fill it get a fake "ok" and nothing is sent
//   4. Field validation (src/lib/contact.ts)
//   5. Cloudflare Turnstile token, verified with Cloudflare
//   6. Email to the school through Resend
//
// Settings (wrangler.jsonc "vars"): CONTACT_TO, CONTACT_FROM.
// Secrets (`npx wrangler secret put …`, never in code): TURNSTILE_SECRET_KEY, RESEND_API_KEY.
// Local testing (.dev.vars): Cloudflare's public test secret + EMAIL_DRY_RUN=true (logs instead of
// sending). A missing secret answers 503, so the page shows the phone/WhatsApp/email fallback.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { validateContact, buildContactEmail } from '../../lib/contact';

export const prerender = false; // runs on the server for every request

interface Env {
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_DRY_RUN?: string;
  CONTACT_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}
const config = env as unknown as Env;

const MAX_BODY_BYTES = 10_000;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append('secret', config.TURNSTILE_SECRET_KEY!);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false; // fail closed
  }
}

async function sendEmail(email: ReturnType<typeof buildContactEmail>): Promise<boolean> {
  if (config.EMAIL_DRY_RUN === 'true') {
    // Local testing only: show what would be sent. Never enable in production (it logs personal data).
    console.log('[contact] EMAIL_DRY_RUN – not sent:\n' + email.subject + '\n' + email.text);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.CONTACT_FROM,
      to: [config.CONTACT_TO],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });
  if (!res.ok) console.error('[contact] Resend error', res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

export const POST: APIRoute = async ({ request }) => {
  // Configuration check: refuse clearly rather than pretend a message was sent.
  const emailReady = config.EMAIL_DRY_RUN === 'true' || Boolean(config.RESEND_API_KEY);
  if (!config.TURNSTILE_SECRET_KEY || !emailReady || !config.CONTACT_TO || !config.CONTACT_FROM) {
    return json(503, { ok: false, error: 'not_configured' });
  }

  // 1. Body
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, error: 'json_required' });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return json(400, { ok: false, error: 'bad_json' });
  }

  // 2. Rate limit (a few messages a minute per IP is plenty for a real person)
  const ip = request.headers.get('CF-Connecting-IP');
  if (config.CONTACT_RATE_LIMITER) {
    const { success } = await config.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip ?? 'unknown'}` });
    if (!success) return json(429, { ok: false, error: 'rate_limited' });
  }

  // 3. Honeypot: pretend success so the bot moves on
  if (typeof body.company === 'string' && body.company.trim() !== '') return json(200, { ok: true });

  // 4. Fields
  const result = validateContact(body);
  if (!result.ok) return json(400, { ok: false, error: 'invalid', fields: result.errors });

  // 5. Turnstile
  const token = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
  if (!token || !(await verifyTurnstile(token, ip))) return json(403, { ok: false, error: 'turnstile' });

  // 6. Send
  const sent = await sendEmail(buildContactEmail(result.data));
  if (!sent) return json(502, { ok: false, error: 'send_failed' });
  return json(200, { ok: true });
};

// Anything other than POST
export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });

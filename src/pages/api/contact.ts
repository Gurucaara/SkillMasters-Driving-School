// POST /api/contact – the contact form (src/pages/contact.astro) sends JSON here.
//
// Order of checks (cheapest first, nothing is sent unless all pass):
//   1. JSON body, not too big
//   2. Rate limit per visitor IP (Cloudflare rate-limiting binding in wrangler.jsonc)
//   3. Honeypot field: bots that fill it get a fake "ok" and nothing is sent
//   4. Field validation (src/lib/contact.ts)
//   5. Cloudflare Turnstile token, verified with Cloudflare
//   6. Email to the school through Resend (src/lib/email.ts)
//
// Settings (wrangler.jsonc "vars"): CONTACT_TO, CONTACT_FROM.
// Secrets (`npx wrangler secret put …`, never in code): TURNSTILE_SECRET_KEY, RESEND_API_KEY.
// Local testing (.dev.vars): Cloudflare's public test secret + EMAIL_DRY_RUN=true (logs instead of
// sending). A missing secret answers 503, so the page shows the phone/WhatsApp/email fallback.
import type { APIRoute } from 'astro';
import { serverEnv, json, readJsonBody, withinRateLimit, verifyTurnstile } from '../../lib/server-env';
import { sendToSchool, emailConfigured } from '../../lib/email';
import { validateContact, buildContactEmail } from '../../lib/contact';

export const prerender = false; // runs on the server for every request

export const POST: APIRoute = async ({ request }) => {
  // Refuse clearly rather than pretend a message was sent.
  if (!serverEnv.TURNSTILE_SECRET_KEY || !emailConfigured()) return json(503, { ok: false, error: 'not_configured' });

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await withinRateLimit(serverEnv.CONTACT_RATE_LIMITER, `contact:${ip ?? 'unknown'}`))) {
    return json(429, { ok: false, error: 'rate_limited' });
  }

  // Honeypot: pretend success so the bot moves on
  if (typeof body.company === 'string' && body.company.trim() !== '') return json(200, { ok: true });

  const result = validateContact(body);
  if (!result.ok) return json(400, { ok: false, error: 'invalid', fields: result.errors });

  if (!(await verifyTurnstile(body['cf-turnstile-response'], ip))) return json(403, { ok: false, error: 'turnstile' });

  const sent = await sendToSchool(buildContactEmail(result.data), 'contact');
  if (!sent) return json(502, { ok: false, error: 'send_failed' });
  return json(200, { ok: true });
};

// Anything other than POST
export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });

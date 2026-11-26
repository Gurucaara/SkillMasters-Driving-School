// Typed access to the Worker's settings and secrets (server code only: src/pages/api/*).
//
// Settings live in wrangler.jsonc "vars". Secrets are set with `npx wrangler secret put <NAME>`
// and, for local testing, in .dev.vars (gitignored; see .dev.vars.example).
import { env } from 'cloudflare:workers';

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface ServerEnv {
  // settings
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  // secrets
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  // local testing only
  EMAIL_DRY_RUN?: string;
  // bindings
  CONTACT_RATE_LIMITER?: RateLimiter;
  CHECKOUT_RATE_LIMITER?: RateLimiter;
}

export const serverEnv = env as unknown as ServerEnv;

/** JSON response that is never cached. */
export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/** Read a small JSON object body, or say why not. */
export async function readJsonBody(
  request: Request,
  maxBytes = 10_000
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; response: Response }> {
  if (!request.headers.get('content-type')?.includes('application/json'))
    return { ok: false, response: json(415, { ok: false, error: 'json_required' }) };
  const raw = await request.text();
  if (raw.length > maxBytes) return { ok: false, response: json(413, { ok: false, error: 'too_large' }) };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return { ok: true, body: parsed };
  } catch {
    return { ok: false, response: json(400, { ok: false, error: 'bad_json' }) };
  }
}

/** Per-visitor rate limit; passes when the binding isn't configured. */
export async function withinRateLimit(limiter: RateLimiter | undefined, key: string): Promise<boolean> {
  if (!limiter) return true;
  return (await limiter.limit({ key })).success;
}

/** Verify a Cloudflare Turnstile token. Fails closed on any error. */
export async function verifyTurnstile(token: unknown, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || !token || !serverEnv.TURNSTILE_SECRET_KEY) return false;
  const form = new FormData();
  form.append('secret', serverEnv.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

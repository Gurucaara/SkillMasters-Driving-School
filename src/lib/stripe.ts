// Minimal Stripe API client using fetch (no Stripe SDK, to keep dependencies small).
// Stripe's API takes form-encoded bodies with bracket keys, e.g. line_items[0][quantity]=1.
// Docs: https://docs.stripe.com/api/checkout/sessions/create and
//       https://docs.stripe.com/webhooks#verify-manually
import { serverEnv } from './server-env';

type Params = Record<string, string | number | boolean | undefined | null | Params | Params[]>;

/** Flatten nested params into Stripe's bracket form encoding. */
export function encodeParams(params: Params, prefix = '', out = new URLSearchParams()): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) value.forEach((item, i) => encodeParams(item, `${name}[${i}]`, out));
    else if (typeof value === 'object') encodeParams(value, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export interface StripeResult<T> {
  ok: boolean;
  status: number;
  data: T & { error?: { message?: string; type?: string } };
}

export async function stripeRequest<T = Record<string, unknown>>(
  method: 'GET' | 'POST',
  path: string,
  params?: Params,
  idempotencyKey?: string
): Promise<StripeResult<T>> {
  const body = params ? encodeParams(params) : undefined;
  const url = `https://api.stripe.com/v1/${path}${method === 'GET' && body ? `?${body}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${serverEnv.STRIPE_SECRET_KEY}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: method === 'POST' ? body : undefined,
  });
  return { ok: res.ok, status: res.status, data: (await res.json()) as StripeResult<T>['data'] };
}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Constant-time string comparison (same length hex strings). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Check a webhook's Stripe-Signature header: HMAC-SHA256 of "<timestamp>.<raw body>" with the
 * endpoint's signing secret must match one of the v1 signatures, and the timestamp must be recent
 * (stops replays of old events).
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  now = Math.floor(Date.now() / 1000)
): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(',').map((p) => p.trim().split('='));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(now - Number(timestamp)) > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
  return signatures.some((sig) => safeEqual(sig, expected));
}

// POST /api/checkout – the checkout page (src/pages/checkout/index.astro) sends the order here.
// Returns { url } of Stripe's hosted payment page; the browser then goes there.
//
// Checks, cheapest first: JSON body → rate limit → field validation (src/lib/checkout.ts) →
// Turnstile → create the Stripe Checkout Session. The amount comes only from packages.json.
//
// Secrets: STRIPE_SECRET_KEY (`npx wrangler secret put`), TURNSTILE_SECRET_KEY. Missing → 503 and
// the page shows "online payment isn't available right now" with the phone/WhatsApp/email.
import type { APIRoute } from 'astro';
import { serverEnv, json, readJsonBody, withinRateLimit, verifyTurnstile } from '../../lib/server-env';
import { validateOrder, checkoutSessionParams } from '../../lib/checkout';
import { stripeRequest } from '../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!serverEnv.STRIPE_SECRET_KEY || !serverEnv.TURNSTILE_SECRET_KEY) {
    return json(503, { ok: false, error: 'not_configured' });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await withinRateLimit(serverEnv.CHECKOUT_RATE_LIMITER, `checkout:${ip ?? 'unknown'}`))) {
    return json(429, { ok: false, error: 'rate_limited' });
  }

  const result = validateOrder(body);
  if (!result.ok) return json(400, { ok: false, error: 'invalid', fields: result.errors });

  if (!(await verifyTurnstile(body['cf-turnstile-response'], ip))) {
    return json(403, { ok: false, error: 'turnstile' });
  }

  const origin = new URL(request.url).origin;
  const session = await stripeRequest<{ url?: string }>(
    'POST',
    'checkout/sessions',
    checkoutSessionParams(result.order, origin),
    crypto.randomUUID() // idempotency: a retried request can't create a second session
  );
  if (!session.ok || !session.data.url) {
    console.error('[checkout] Stripe error', session.status, session.data.error?.type, session.data.error?.message);
    return json(502, { ok: false, error: 'stripe_failed' });
  }
  return json(200, { ok: true, url: session.data.url });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });

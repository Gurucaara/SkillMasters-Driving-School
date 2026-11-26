// GET /api/checkout-status?session_id=cs_… – used by /checkout/success to confirm a payment.
// Asks Stripe for the session and returns only what the page shows: paid or not, the package name
// and the amount. No names, emails or phone numbers, so a guessed or shared link reveals nothing
// personal.
import type { APIRoute } from 'astro';
import { serverEnv, json } from '../../lib/server-env';
import { stripeRequest } from '../../lib/stripe';
import { checkoutPackage } from '../../lib/checkout';
import { cad } from '../../data/packages';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (!serverEnv.STRIPE_SECRET_KEY) return json(503, { ok: false, error: 'not_configured' });

  const id = url.searchParams.get('session_id') ?? '';
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id)) return json(400, { ok: false, error: 'bad_session_id' });

  const session = await stripeRequest<{
    payment_status?: string;
    amount_total?: number | null;
    metadata?: Record<string, string>;
  }>('GET', `checkout/sessions/${id}`);
  if (session.status === 404) return json(404, { ok: false, error: 'not_found' });
  if (!session.ok) return json(502, { ok: false, error: 'stripe_failed' });

  const pkg = checkoutPackage(session.data.metadata?.package_id ?? '');
  return json(200, {
    ok: true,
    paid: session.data.payment_status === 'paid',
    status: session.data.payment_status,
    packageName: pkg?.name ?? null,
    total: session.data.amount_total != null ? cad(session.data.amount_total / 100) : null,
  });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });

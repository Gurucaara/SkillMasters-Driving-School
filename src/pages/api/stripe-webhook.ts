// POST /api/stripe-webhook – Stripe calls this when a checkout payment completes.
// Set up in Stripe → Developers → Webhooks: endpoint URL https://<site>/api/stripe-webhook,
// events `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Stripe shows a
// signing secret (whsec_…): store it with `npx wrangler secret put STRIPE_WEBHOOK_SECRET`.
//
// Every call is checked against that secret (verifyStripeSignature), so nobody else can fake a
// "paid" event. A paid order is emailed to the school with what's needed to book the first lesson.
// Returning a non-2xx makes Stripe retry later (for up to 3 days), so a failed email is retried.
import type { APIRoute } from 'astro';
import { serverEnv, json } from '../../lib/server-env';
import { verifyStripeSignature } from '../../lib/stripe';
import { sendToSchool, emailHtml, emailConfigured } from '../../lib/email';
import { checkoutPackage } from '../../lib/checkout';
import { cad } from '../../data/packages';

export const prerender = false;

interface CheckoutSession {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string>;
  livemode?: boolean;
}

function orderEmail(session: CheckoutSession) {
  const m = session.metadata ?? {};
  const pkg = checkoutPackage(m.package_id ?? '');
  const email = session.customer_details?.email || session.customer_email || '';
  const total = session.amount_total != null ? cad(session.amount_total / 100) : '(unknown)';
  const rows: [string, string][] = [
    ['Package', pkg?.name ?? m.package_id ?? '(unknown)'],
    ['Paid', `${total} ${(session.currency ?? 'cad').toUpperCase()}`],
    ['Student', m.student_name ?? ''],
    ['Phone', m.phone ?? ''],
    ['Email', email],
    ['Licence stage', m.licence_stage ?? ''],
    ['Pickup area', m.pickup_area ?? ''],
    ['Preferred start', m.preferred_start ?? ''],
    ['Preferred time', m.preferred_time ?? ''],
    ['Stripe session', session.id],
  ];
  const test = session.livemode === false ? '[TEST] ' : '';
  return {
    subject: `${test}New booking paid: ${pkg?.name ?? 'package'} – ${m.student_name ?? ''}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n\nNext: contact the student to book their first lesson.',
    html: emailHtml(
      `${test}New booking paid`,
      rows,
      'Sent by the website when Stripe confirmed the payment. The receipt was emailed to the student by Stripe.',
      'Next: contact the student to book their first lesson.'
    ),
    replyTo: email || undefined,
  };
}

export const POST: APIRoute = async ({ request }) => {
  if (!serverEnv.STRIPE_WEBHOOK_SECRET) return json(503, { ok: false, error: 'not_configured' });

  const raw = await request.text(); // the signature covers the exact raw body
  if (raw.length > 200_000) return json(413, { ok: false, error: 'too_large' });
  const valid = await verifyStripeSignature(raw, request.headers.get('Stripe-Signature'), serverEnv.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json(400, { ok: false, error: 'bad_signature' });

  let event: { type?: string; data?: { object?: CheckoutSession } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'bad_json' });
  }

  const session = event.data?.object;
  const paidEvent =
    event.type === 'checkout.session.async_payment_succeeded' ||
    (event.type === 'checkout.session.completed' && session?.payment_status === 'paid');

  // Other events (or "completed" but still processing) need no action: acknowledge them.
  if (!paidEvent || !session) return json(200, { ok: true, ignored: event.type ?? 'unknown' });

  if (!emailConfigured()) return json(500, { ok: false, error: 'email_not_configured' }); // Stripe retries
  const sent = await sendToSchool(orderEmail(session), 'stripe-webhook');
  if (!sent) return json(500, { ok: false, error: 'email_failed' }); // Stripe retries
  return json(200, { ok: true });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'method_not_allowed' });

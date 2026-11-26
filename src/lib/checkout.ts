// Checkout: server-side validation of the order form and the Stripe Checkout Session it becomes.
// The price is ALWAYS looked up here from packages.json by package id; nothing the browser sends
// about money is used. Privacy: no licence numbers, dates of birth or licence expiry dates are
// accepted or sent to Stripe (CLAUDE.md, "Rules: honesty and privacy").
import { packages, withVariant, hst, toCents, HST_RATE, hstLabel, type Package, type PackageId } from '../data/packages';
import { site } from '../data/site';

export const LICENCE_STAGES = ['G1', 'G2'] as const;
export const PREFERRED_TIMES = ['Morning', 'Afternoon', 'Evening', 'Weekend'] as const;

export interface Order {
  pkg: Package; // with the wording students saw on the checkout page
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenceStage: string;
  area: string;
  startDate: string; // YYYY-MM-DD or ''
  preferredTime: string;
}

export type OrderResult = { ok: true; order: Order } | { ok: false; errors: Record<string, string> };

const clean = (v: unknown) => (typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim() : '');

/** The package as shown at checkout (BDE wording, lesson-page wording for the rest). */
export function checkoutPackage(id: string): Package | undefined {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) return undefined;
  return pkg.id.startsWith('bde') ? pkg : withVariant(pkg, 'lessons');
}

export function validateOrder(input: Record<string, unknown>, today = new Date()): OrderResult {
  const errors: Record<string, string> = {};

  const pkg = checkoutPackage(clean(input.packageId));
  if (!pkg) errors.packageId = 'Please choose a package.';

  const firstName = clean(input.firstName);
  const lastName = clean(input.lastName);
  if (!firstName || firstName.length > 60) errors.firstName = 'Please enter your first name.';
  if (!lastName || lastName.length > 60) errors.lastName = 'Please enter your last name.';

  const email = clean(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 150) errors.email = 'Please enter a valid email address.';

  const phone = clean(input.phone);
  const digits = phone.replace(/\D/g, '');
  if (!/^[0-9+().\- ]+$/.test(phone) || digits.length < 10 || digits.length > 15)
    errors.phone = 'Please enter a phone number with at least 10 digits.';

  const licenceStage = clean(input.licenceStage);
  if (!LICENCE_STAGES.includes(licenceStage as (typeof LICENCE_STAGES)[number])) errors.licenceStage = 'Please choose G1 or G2.';

  const area = clean(input.area);
  if (!site.areas.includes(area)) errors.area = 'Please choose a pickup area.';

  let startDate = clean(input.startDate);
  if (startDate) {
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(startDate) && !Number.isNaN(Date.parse(startDate));
    const notPast = valid && startDate >= today.toISOString().slice(0, 10);
    if (!valid || !notPast) errors.startDate = 'Please choose a start date from today onwards.';
  }

  const preferredTime = clean(input.preferredTime);
  const time = PREFERRED_TIMES.includes(preferredTime as (typeof PREFERRED_TIMES)[number]) ? preferredTime : 'Morning';

  if (input.agree !== 'yes') errors.agree = 'Please agree to the Terms and the Refund & Cancellation Policy.';

  if (Object.keys(errors).length || !pkg) return { ok: false, errors };
  return {
    ok: true,
    order: { pkg, firstName, lastName, email, phone, licenceStage, area, startDate, preferredTime: time },
  };
}

/** Amounts for an order, in cents. */
export function orderAmounts(pkg: Package) {
  const subtotal = toCents(pkg.price);
  const tax = toCents(hst(pkg.price));
  return { subtotal, tax, total: subtotal + tax };
}

/**
 * Stripe Checkout Session parameters for an order.
 * One line for the package and, when HST is charged, one line for HST, both priced from
 * packages.json. Metadata carries only what Rahul needs to schedule the first lesson.
 */
export function checkoutSessionParams(order: Order, origin: string) {
  const { subtotal, tax } = orderAmounts(order.pkg);
  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency: 'cad',
        unit_amount: subtotal,
        product_data: { name: order.pkg.name, description: order.pkg.includes.join(' · ').slice(0, 500) },
      },
    },
    ...(HST_RATE > 0 && tax > 0
      ? [{ quantity: 1, price_data: { currency: 'cad', unit_amount: tax, product_data: { name: hstLabel } } }]
      : []),
  ];

  return {
    mode: 'payment',
    customer_email: order.email,
    client_reference_id: order.pkg.id,
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?package=${encodeURIComponent(order.pkg.id)}&cancelled=1`,
    metadata: {
      package_id: order.pkg.id,
      student_name: `${order.firstName} ${order.lastName}`,
      phone: order.phone,
      licence_stage: order.licenceStage,
      pickup_area: order.area,
      preferred_start: order.startDate || 'not given',
      preferred_time: order.preferredTime,
    },
    payment_intent_data: { description: `${site.shortName}: ${order.pkg.name}` },
  };
}

export type { PackageId };

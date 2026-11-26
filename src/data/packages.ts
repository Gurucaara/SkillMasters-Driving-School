// Typed helpers around packages.json, so components never hard-code a price.
import data from './packages.json';

export type PackageId =
  | 'bde'
  | 'bde-road-test'
  | 'bde-ultimate'
  | 'lessons-10'
  | 'lessons-4'
  | 'lesson-1'
  | 'road-test';

/** Wording a page may override (see "_variants" in packages.json). Never prices. */
export interface PackageVariant {
  name?: string;
  note?: string;
  ribbon?: string;
  featured?: boolean;
  includes?: string[];
}

export interface Package {
  id: PackageId;
  name: string;
  price: number;
  separately: number | null;
  separatelyNote: string;
  ribbon: string;
  featured: boolean;
  bundle: boolean;
  listLabel: string;
  includes: string[];
  variants?: Record<string, PackageVariant>;
}

export const packages = data.packages as Package[];
export const taxNote = data.taxNote;

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package id: ${id}`);
  return pkg;
}

/** The package with a page's wording applied (falls back to the defaults). */
export function withVariant(pkg: Package, variant?: string): Package {
  const v = variant ? pkg.variants?.[variant] : undefined;
  if (!v) return pkg;
  return {
    ...pkg,
    name: v.name ?? pkg.name,
    separatelyNote: v.note ?? pkg.separatelyNote,
    ribbon: v.ribbon ?? pkg.ribbon,
    featured: v.featured ?? pkg.featured,
    includes: v.includes ?? pkg.includes,
  };
}

/** Real saving vs buying the parts separately (0 when there is no bundle). */
export function savings(pkg: Package): number {
  return pkg.separately ? pkg.separately - pkg.price : 0;
}

/** "$599" style, whole dollars. */
export function money(amount: number): string {
  return `$${amount.toLocaleString('en-CA')}`;
}

/** HST rate charged at checkout, from packages.json (0.13, or 0 if not registered for GST/HST). */
export const HST_RATE: number = data.hstRate;
/** e.g. "HST (13%)". */
export const hstLabel = `HST (${Math.round(HST_RATE * 100)}%)`;

/** A price in cents, as Stripe expects. */
export const toCents = (amount: number) => Math.round(amount * 100);

/** HST on a price, rounded to the cent. */
export function hst(amount: number): number {
  return Math.round(amount * HST_RATE * 100) / 100;
}

/** "$676.87" style, always with cents (for order totals). */
export function cad(amount: number): string {
  return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', currencyDisplay: 'narrowSymbol' });
}

/** Link that starts checkout with a package pre-selected. */
export function checkoutHref(id: PackageId): string {
  return `/checkout?package=${id}`;
}

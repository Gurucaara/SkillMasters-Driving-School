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

/** Link that starts checkout with a package pre-selected. */
export function checkoutHref(id: PackageId): string {
  return `/checkout?package=${id}`;
}

// Typed helpers around packages.json, so components never hard-code a price.
import data from './packages.json';

export type Package = (typeof data.packages)[number];
export type PackageId =
  | 'bde'
  | 'bde-road-test'
  | 'bde-ultimate'
  | 'lessons-10'
  | 'lessons-4'
  | 'lesson-1'
  | 'road-test';

export const packages = data.packages as Package[];
export const taxNote = data.taxNote;

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package id: ${id}`);
  return pkg;
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

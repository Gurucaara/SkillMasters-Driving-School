/**
 * The public URL path of the page being built, e.g. "/about" or "/".
 *
 * Pages are built as about.html (build.format: 'file' in astro.config.mjs) and Cloudflare serves
 * them at /about, but during the build Astro.url.pathname is "/about.html" (and "/index.html" for
 * the home page). Use this wherever a page needs its own URL: canonical links, the header's
 * current-page highlight and breadcrumbs.
 */
export function pagePath(url: URL): string {
  let path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (path.length > 1) path = path.replace(/\/$/, '');
  return path || '/';
}

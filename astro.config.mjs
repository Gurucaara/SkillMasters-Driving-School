// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { readdirSync, readFileSync } from 'node:fs';

// Blog articles still marked `sample: true` are noindex, so keep them out of the sitemap too.
const sampleBlogPaths = readdirSync('./src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .filter((f) => /^sample:\s*true\s*$/m.test(readFileSync(`./src/content/blog/${f}`, 'utf8')))
  .map((f) => `/blog/${f.replace(/\.md$/, '')}`);

// Other noindex pages (checkout flow) also stay out of the sitemap.
const noindexPaths = [...sampleBlogPaths, '/checkout', '/checkout/success'];

// https://astro.build/config
export default defineConfig({
  site: 'https://skillmastersdrivingschool.ca',
  // Pages are built as about.html (not about/index.html), so Cloudflare serves them at /about,
  // matching every link on the site with no redirect. Keep internal links without a trailing slash.
  build: { format: 'file' },
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
  // No code blocks on this site; Shiki's inline styles would also clash with the CSP below.
  markdown: { syntaxHighlight: false },
  integrations: [
    sitemap({
      filter: (page) => !noindexPaths.includes(new URL(page).pathname),
    }),
  ],
  // 'compile': images are optimised once at build time with sharp (honours quality={…}) and
  // served as static files. The site is fully static, so no on-demand image service is needed.
  adapter: cloudflare({ imageService: 'compile' }),
  // Content Security Policy. Astro hashes every inline <script>/<style> it outputs and adds a
  // <meta> CSP to each page, so no 'unsafe-inline' is needed for scripts. Inline style="…"
  // attributes (e.g. the About map pins) are allowed. Rules that only work as an HTTP header
  // (frame-ancestors) live in public/_headers.
  // When adding Stripe.js, Turnstile or Cal.com later, add their domains here.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "frame-src https://challenges.cloudflare.com", // Turnstile (contact form)
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: { resources: ["'self'", 'https://challenges.cloudflare.com'] }, // + Turnstile
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
});

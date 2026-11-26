# Skillmasters Driving School – Website

Website for **Skillmasters Driving School Ltd.**, a driving school in London, Ontario.
Tagline: **"Mastering the road"**. Built by Puru for the owner, Rahul.

Design mockup (source of truth for layout and content):
https://claude.ai/artifact/JUJeKb3qj5zULdAJ9Lt7Wb

## Reference files (read these first)

- `docs/design-spec.md` – full design spec: brand tokens, site map, every Home section in order,
  every other page, shared components, real vs SAMPLE content, open items.
- `docs/mockup/*.dc.html` – the mockup pages as HTML. Use them for exact copy, layout and styling.
  Their images point to `/_blob/...` and won't load here; use `src/assets/images/` instead.
- `src/assets/images/real/` – real, launch-ready photos (plates and test slips already blurred):
  logo.png, lion-mark.png, car-front.jpg, dual-brake.jpg, student-1..3.jpg.
- `src/assets/images/sample/` – Canva placeholders, filenames end in -SAMPLE. Must show a SAMPLE tag
  and be replaced before launch.
- Images go through Astro `<Image>` / `getImage` so they are optimised at build time.
- Where the built site differs from the mockup on purpose (honesty, accessibility, real data),
  the reason is in a comment at the top of the component or page.

## Stack

- Astro 7 (static-first, islands only where interactive)
- Tailwind CSS v4 via `@tailwindcss/vite` (config lives in CSS with `@theme`)
- `@astrojs/sitemap`, `@astrojs/cloudflare` adapter (`imageService: 'compile'`), deployed on
  Cloudflare Workers static assets
- Fonts self-hosted with Fontsource: Inter Variable (body), Montserrat 700/800 (headings)
- Not built yet (need Rahul's accounts): Stripe Checkout (hosted page), Cal.com embed,
  Resend for emails, Cloudflare Turnstile

## Commands

- `npm run dev` – local dev server. If a new page shows without some of its styles, restart it
  (Tailwind doesn't always pick up classes from brand-new files until then).
- `npm run build` – production build (must pass before every push)
- `npx astro preview --port 4322` – serve the production build locally, with the real
  `_headers`, redirects and service worker; `npx astro preview stop` to stop it
- `node scripts/make-og-image.mjs` – regenerate `public/og-image.png` (social preview card)
- `npm audit` – before releases
- Every push to `main` deploys to https://skillmasters-driving-school.pururana24.workers.dev
  (about a minute)

## Brand

- Colours: gold `#E6A817` (buttons, accents), gold text on white `#8A5F00`, ink `#0B0B0B`,
  cream `#FBF5EA` (section backgrounds), line `#EADFCB`, muted text `#5A5348`
- Light theme is always the default (the system dark-mode setting is ignored); dark theme =
  black `#0B0B0B` + gold. The toggle remembers the visitor's choice in localStorage. No flash on load.
- Logo: lion head, gold/black/white, on a cream rounded square.
- Real car: dark blue Mazda 3 (automatic, dual brake) with a lion roof sign.

## Business facts (use exactly)

- Phone / text / WhatsApp: 204-979-5184
- Email: info@skillmastersdrivingschool.ca
- Hours: 9 am – 6 pm, 7 days a week. Pickup only, no office.
- Areas: London, St. Thomas, Thorndale, Dorchester
- MTO BDE Course Provider Licence #L4H7
- Driving Instructor Licence #062254066 (Rahul)
- Languages taught: English, Hindi, Punjabi
- Experience: 20 years driving, 3 years teaching
- Facebook: https://www.facebook.com/profile.php?id=61560786427720
- Instagram: https://www.instagram.com/skillmastersdrivingschool/

## Prices (CAD + 13% HST). Keep in `src/data/packages.json`

| Package | Price | Bought separately | Saves |
| --- | --- | --- | --- |
| BDE Course (20h online + 10h home-link + 10h in-car) | $599 | – | – |
| BDE + Road Test (BDE + car & warm-up on test day) | $699 | $749 | $50 |
| BDE Ultimate (BDE + 2h practice + car for road test) | $769 | $849 | $80 |
| 10-Hour Lesson Pack | $450 | $500 | $50 |
| 4-Hour Lesson Pack | $180 | $200 | $20 |
| Single lesson (1h) | $50 | – | – |
| Road Test Package | $150 | – | – |

- Full payment only (no deposits). Packages valid 12 months.
- Refunds: reschedule with 24h notice; $50 late-cancellation / no-show fee;
  cancel within 15 days of registering = 50% refund; after 15 days non-refundable.
- No launch offer.

## Pages (routes)

`/` Home · `/about` · `/bde-program` · `/lessons` · `/pricing` · `/reviews` · `/blog` + `/blog/[slug]`
· `/g1-practice-test` · `/contact` · `/checkout` · `/checkout/success` · `/legal` (tabs `#privacy`,
`#terms`, `#refunds`) · `/offline` (shown by the service worker)

Home sections in order: header with gold top bar → hero → trust strip → who we serve → package
finder → packages → why Skillmasters → pass wall → FAQ → blog teaser → gold CTA band → footer.
Every inner page opens with `PageBanner` and ends with `CtaBand`. Floating WhatsApp button from
768px up; Call / WhatsApp / Book bar fixed at the bottom on phones (`MobileBar`).

## Project structure

```
src/components/    Header, Footer, MobileBar, ThemeToggle, PageBanner, CtaBand, TickList,
                   Hero, TrustStrip, WhoWeServe, PackageFinder, Packages, PackageCard,
                   WhySkillmasters, PassWall, FAQ, BlogTeaser, BlogCard
src/layouts/       BaseLayout.astro (head, SEO tags, JSON-LD, theme script, SW registration)
src/pages/         one file per route; src/pages/api/contact.ts (checkout, stripe-webhook to come)
src/content/blog/  blog articles (Markdown); file name = URL slug
src/content/legal/ privacy.md, terms.md, refunds.md (shown as tabs on /legal)
src/content.config.ts  fields allowed in blog and legal files
src/data/          site.ts        contact details, areas, licences, nav, trust points
                   packages.json  prices, bundles, per-page wording ("variants")
                   packages.ts    typed helpers: savings, money(), cad(), hst(), checkoutHref()
                   reviews.json   rating, pass-wall photos, Google reviews, review link
                   faq.json       FAQ sets per page ("home", "bde")
                   g1-quiz.json   G1 practice test questions
                   schema.ts      JSON-LD (DrivingSchool, breadcrumbs, articles)
src/lib/           page-path.ts   a page's clean URL path (see "How the site works")
                   contact.ts     contact form validation + email text
src/styles/        global.css     theme tokens (light/dark), .reveal/.lift/.grad, .prose
public/            _headers, robots.txt, manifest.webmanifest, icons, og-image.png,
                   sw.js, offline.html
scripts/           make-og-image.mjs
```

Anything Rahul may change (prices, reviews, FAQ, contact info, quiz) must come from
`src/data/` or `src/content/`, never hard-coded in components.

## How the site works (non-obvious parts)

- **Clean URLs.** Pages build as `about.html` (`build.format: 'file'`), which Cloudflare serves at
  `/about`. Internal links never end in `/`. During the build `Astro.url.pathname` is
  `/about.html`, so use `pagePath(Astro.url)` from `src/lib/page-path.ts` for canonicals,
  breadcrumbs and the header's current-page highlight.
- **Prices** are only ever read from `packages.json` and calculated at build time (cards, finder,
  comparison table, checkout totals with 13% HST). Client scripts only show/hide panels; the
  browser never decides a price. A package's `variants.<page>` changes wording on one page only.
- **Theme.** An inline script in `BaseLayout` applies a saved dark choice before paint and adds
  the `js` class to `<html>` (used by no-JS fallbacks on the quiz, checkout and legal tabs).
- **CSP.** The main Content-Security-Policy is generated by Astro (`security.csp` in
  `astro.config.mjs`) with hashes for every inline script/style; `public/_headers` adds the
  header-only rules (frame-ancestors, HSTS, etc.). When adding Stripe.js, Turnstile or Cal.com,
  add their domains in `astro.config.mjs`.
- **Search visibility.** Pages with `noindex` (checkout pages, blog articles with
  `sample: true`) are also left out of the sitemap by the filter in `astro.config.mjs`.
- **Blog drafts.** `sample: true` in an article's front matter shows a DRAFT notice and hides it
  from search. Set `sample: false` once Rahul has reviewed it.
- **Reviews.** Real Google reviews live in `reviews.json` (first name + last initial, word for
  word). Any item with `sample: true` gets a SAMPLE label automatically. Never add reviews from
  the owner, staff, family or the site builder.
- **Service worker** (`public/sw.js`): network-first pages with offline copies, cache-first
  `/_astro/*`, offline page at `/offline`. Bump `VERSION` in the file to reset every visitor's cache.
- **Contact form** → `src/pages/api/contact.ts` (validation in `src/lib/contact.ts`): rate limit
  (5/min per IP, `CONTACT_RATE_LIMITER` in `wrangler.jsonc`) → honeypot → field checks → Turnstile →
  email via Resend. Settings `CONTACT_TO` / `CONTACT_FROM` in `wrangler.jsonc`; secrets
  `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY` via `npx wrangler secret put`; the public
  `PUBLIC_TURNSTILE_SITE_KEY` is a build variable (`.env` locally). Missing secret → 503 and the page
  shows phone/WhatsApp/email. Local testing: copy `.dev.vars.example` → `.dev.vars` and
  `.env.example` → `.env` (Cloudflare's public test keys; `EMAIL_DRY_RUN=true` logs instead of sending,
  see `npx astro preview logs`).
- **Checkout** posts to `/api/checkout`, which doesn't exist yet: Pay shows the contact details and
  says no card was charged.

## Status (Nov 2026)

Built and live: every page above, SEO (JSON-LD, OG image, robots, sitemap), security headers +
CSP, PWA manifest + service worker. Lighthouse mobile: Accessibility, Best Practices and SEO 100,
Performance 95–99 (checkout SEO is low on purpose: noindex).

Before launch:
- Rahul's accounts: Stripe (7 packages), Resend (domain verified), Turnstile, Cal.com
- Contact form: set `TURNSTILE_SECRET_KEY` + `RESEND_API_KEY` secrets and the
  `PUBLIC_TURNSTILE_SITE_KEY` build variable once Rahul's accounts exist, then send a real test
- Build `/api/checkout`, Stripe webhook, verified success page, Cal.com embed
- Point skillmastersdrivingschool.ca at Cloudflare; Zoho email DNS (SPF, DKIM, DMARC)
- Rahul reviews the 6 blog drafts and the legal policies (marked Draft)
- Replace the Refresher SAMPLE photo; confirm G2/G and town for the pass-wall photos
- Update the Google review count in `reviews.json` if reviews are removed or added

## Rules: honesty and privacy

- Never invent stats, pass rates, student counts or reviews. Sample content must be clearly
  marked SAMPLE and removed before launch.
- Never show fake "was/now" prices. Strike-through prices only = real bought-separately totals
  (Canada's Competition Act forbids fake regular prices).
- Never publish Rahul's home address, his licence card image, or student personal data.
- In student photos, licence plates and road-test result slips must be blurred.
- BDE student details (licence number, date of birth, licence expiry) are never collected
  on public forms, by email or in Stripe metadata.

## Rules: security

- No secrets in code or git. Use `.env` locally (gitignored) and `wrangler secret put` in prod.
- Stripe: hosted Checkout only; prices looked up server-side from `packages.json`, never trusted
  from the browser; verify webhook signatures.
- Forms: server-side validation + Cloudflare Turnstile + basic rate limiting.
- Security headers in `public/_headers` (HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, frame-ancestors 'none') plus Astro's hashed CSP from `astro.config.mjs`.
  Target A+ on securityheaders.com.
- Keep dependencies minimal; run `npm audit` before releases.

## Rules: quality

- Mobile-first. Test at 360, 390, 768, 1024, 1280, 1440+ px.
- Accessibility: WCAG 2.2 AA. Semantic HTML, real buttons/links, labels on every input,
  4.5:1 contrast in both themes, visible focus, 44px tap targets, alt text on all images,
  respect `prefers-reduced-motion`.
- Performance: Lighthouse mobile 90+ in Performance, Accessibility, Best Practices, SEO.
  Use Astro `<Image>` (WebP/AVIF, sizes, lazy). Minimal client JS.
- PWA: web manifest (gold theme colour, lion icons 192/512 + maskable), apple-touch-icon,
  service worker with an offline page showing the phone number.
- SEO: unique title + description per page, canonical URLs, DrivingSchool/LocalBusiness
  JSON-LD (no street address), Open Graph image, sitemap.

## Workflow

- Build one component or page at a time. Run `npm run build` before committing.
- Small commits with clear messages. Push to `main` only when the build passes.
- Explain non-obvious code briefly; Puru must be able to explain every file.

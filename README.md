# Skillmasters Driving School – website

The website of **Skillmasters Driving School Ltd.**, a driving school in London, Ontario
(*"Mastering the road"*). MTO-approved Beginner Driver Education (BDE), private G2 and G lessons,
and road test packages, with online booking and payment.

- **Live (test address):** https://skillmasters-driving-school.pururana24.workers.dev
- **Domain at launch:** https://skillmastersdrivingschool.ca
- **Built by** Puru for the owner and instructor, Rahul.

> For anyone (or any AI assistant) working on the code, [`CLAUDE.md`](CLAUDE.md) holds the house rules
> and the non-obvious details. This README is the specification.

---

## Contents

1. [Status](#status)
2. [Pages and features](#pages-and-features)
3. [Tech stack](#tech-stack)
4. [Getting started](#getting-started)
5. [Project structure](#project-structure)
6. [Changing content](#changing-content)
7. [How it works](#how-it-works)
8. [Configuration and deployment](#configuration-and-deployment)
9. [Brand](#brand)
10. [Content rules](#content-rules)
11. [Launch checklist](#launch-checklist)

---

## Status

| Area | Status |
| --- | --- |
| All pages (Home, About, BDE, Lessons, Pricing, Reviews, Blog, G1 test, Contact, Checkout, Legal, 404) | Built and live |
| Real Google reviews, real student and car photos | Live |
| SEO (structured data, sitemap, social image), security headers + CSP, PWA + offline page | Live |
| Contact form → email | Built; switched off until Resend + Turnstile keys are set |
| Online payments (Stripe Checkout + webhook) | Built; switched off until Stripe keys are set |
| Booking the first lesson (Cal.com) | Waiting for Rahul's Cal.com account |
| Six blog articles, legal policies | Drafts waiting for Rahul's review |

Until a service is configured its form shows the phone, WhatsApp and email instead. It never
pretends a message was sent or a card was charged.

**Quality (Lighthouse, mobile):** Accessibility, Best Practices and SEO 100 on every page;
Performance 95–99. `npm audit`: 0 vulnerabilities. `npm run check`: 0 errors.

---

## Pages and features

| Route | What's on it |
| --- | --- |
| `/` | Hero with the real car photo and licence badge · trust strip · who we serve · 3-question **package finder** · packages with real bundle savings · why Skillmasters · **pass wall** (scrolling student photos + Google reviews) · FAQ · guides teaser · CTA |
| `/about` | Rahul's story · instructor facts · areas served with a schematic map |
| `/bde-program` | Licence journey (G1 → BDE → G2 → G) drawn as a road · G1 requirements · what BDE includes · 3 BDE packages · BDE FAQ |
| `/lessons` | 4 lesson packages · what you practise for G2 vs full G · the dual-brake car |
| `/pricing` | BDE packages · comparison table · lesson packages · payment, validity and cancellation rules |
| `/reviews` | Google rating · pass wall · real Google reviews · "Review us on Google" |
| `/blog`, `/blog/<slug>` | 6 guides (G1, BDE, G2 checklist, newcomers, winter, highway) + G1 test promo |
| `/g1-practice-test` | Interactive 6-question quiz with drawn signs, feedback and a score |
| `/contact` | Live "Open now / Closed" badge (Ontario time) · quick actions · message form · quick answers · socials |
| `/checkout` | 1 Package → 2 Details → 3 Review & pay (Stripe) with an order summary incl. 13% HST |
| `/checkout/success` | Confirms the payment with Stripe, then next steps (Cal.com scheduler to come) |
| `/legal` | Privacy Policy · Terms · Refund & Cancellation, as tabs (`#privacy`, `#terms`, `#refunds`) |
| `/offline` | Shown by the service worker with no connection: call / WhatsApp / email |
| any other address | Branded 404 page with links to the main pages |

**On every page:** a gold top bar, then a sticky header (menu button below 1280px), light/dark theme
toggle (light by default, choice remembered), footer with licence numbers, a floating WhatsApp button
on larger screens, and a Call / WhatsApp / Book bar on phones.

---

## Tech stack

| | |
| --- | --- |
| Framework | [Astro 7](https://astro.build): static pages, plus a few server endpoints for forms and payments |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (`@tailwindcss/vite`), theme tokens in `src/styles/global.css` |
| Hosting | [Cloudflare Workers](https://developers.cloudflare.com/workers/) (static assets + server routes) via `@astrojs/cloudflare` |
| Fonts | Self-hosted with Fontsource: Montserrat (headings), Inter (body) |
| Payments | [Stripe Checkout](https://docs.stripe.com/payments/checkout) (hosted page), called with `fetch` (no SDK) |
| Email | [Resend](https://resend.com) |
| Spam protection | [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) + Cloudflare rate limiting |
| Scheduling | [Cal.com](https://cal.com) (to come) |

Runtime dependencies are kept to the minimum above. Dev-only: `@astrojs/check`, `typescript`.

---

## Getting started

Requires **Node.js 22.23+**.

```bash
npm install
```

```bash
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at http://localhost:4321 (restart it if a brand-new page appears unstyled) |
| `npm run build` | Production build into `dist/`. **Must pass before every push.** |
| `npx astro preview --port 4322` | Serve the production build locally with the real headers, redirects, service worker and API routes. Stop with `npx astro preview stop`; see server logs with `npx astro preview logs`. |
| `npm run check` | Type-check everything (`astro check`) |
| `node scripts/make-og-image.mjs` | Regenerate `public/og-image.png`, the social preview card |
| `npm audit` | Check dependencies for known vulnerabilities (before releases) |

### Testing the forms locally

```bash
cp .dev.vars.example .dev.vars
```

```bash
cp .env.example .env
```

Both files contain Cloudflare's **public Turnstile test keys** (always pass) and
`EMAIL_DRY_RUN=true`, so emails are printed to the server log (`npx astro preview logs`) instead of
being sent. Both files are gitignored. To test payments, add your Stripe **test** keys to
`.dev.vars` (`STRIPE_SECRET_KEY=sk_test_…`, and the `whsec_…` printed by
`stripe listen --forward-to localhost:4322/api/stripe-webhook`). Never put live keys in these files.

---

## Project structure

```
src/
├── pages/                 one file per route (see "Pages and features")
│   ├── api/
│   │   ├── contact.ts           POST  contact form → email
│   │   ├── checkout.ts          POST  order → Stripe Checkout Session URL
│   │   ├── checkout-status.ts   GET   is this Stripe session paid? (no personal data)
│   │   └── stripe-webhook.ts    POST  Stripe → "order paid" email to the school
│   ├── blog/                    index + [slug] (articles come from src/content/blog)
│   ├── checkout/                index + success
│   └── 404.astro, about, bde-program, contact, g1-practice-test, index, legal, lessons, pricing, reviews
├── components/            Header, Footer, MobileBar, ThemeToggle, PageBanner, CtaBand, TickList,
│                          Hero, TrustStrip, WhoWeServe, PackageFinder, Packages, PackageCard,
│                          WhySkillmasters, PassWall, FAQ, BlogTeaser, BlogCard
├── layouts/BaseLayout.astro   <head>, SEO tags, structured data, theme script, service worker
├── content/
│   ├── blog/              6 Markdown articles (file name = URL)
│   └── legal/             privacy.md, terms.md, refunds.md
├── content.config.ts      the fields each blog / legal file must have
├── data/                  everything Rahul may want to change (see below) + schema.ts (JSON-LD)
├── lib/                   shared code: forms, checkout, contact, email, stripe, server-env, page-path
├── assets/images/         real/ (launch-ready) and sample/ (placeholders, marked SAMPLE)
├── styles/global.css      theme colours (light + dark), shared classes, article text styles
└── env.d.ts               type for the Cloudflare Workers module
public/                    _headers, robots.txt, manifest, icons, og-image.png, sw.js, offline.html
scripts/make-og-image.mjs  draws the social preview image
docs/                      design spec + the original mockup pages (HTML)
astro.config.mjs           site URL, clean URLs, sitemap filter, CSP, Cloudflare adapter
wrangler.jsonc             Cloudflare Worker: settings (vars) and rate limiters
```

---

## Changing content

Content never needs code changes. Edit the file, run `npm run build`, push.

| To change… | Edit |
| --- | --- |
| Phone, email, hours, areas, licence numbers, socials, nav, trust points | `src/data/site.ts` |
| Prices, bundles, what's included, ribbons, HST rate | `src/data/packages.json` |
| Google rating, reviews, pass-wall photos, review link | `src/data/reviews.json` |
| FAQ questions (Home, BDE) | `src/data/faq.json` |
| G1 practice test questions | `src/data/g1-quiz.json` |
| Blog articles | `src/content/blog/<slug>.md` (set `sample: false` to publish a reviewed draft) |
| Privacy / Terms / Refunds text | `src/content/legal/*.md` |
| Photos | `src/assets/images/real/` (blur licence plates and test slips first) |

Prices shown anywhere on the site (cards, finder, comparison table, checkout, structured data, page
descriptions) all come from `packages.json`, so they can't disagree.

---

## How it works

### Pages and URLs
- Every page is pre-built to static HTML (`build.format: 'file'`, so `/about` is `about.html`).
  Internal links never end in `/`. `/about/` and `/about.html` redirect to `/about`.
- `src/lib/page-path.ts` gives a page its clean URL for canonical links, breadcrumbs and the
  header's current-page highlight.
- Only the four `src/pages/api/*` routes run on the server.

### Prices and HST
- Amounts are calculated at build time (pages) and on the server (checkout) from `packages.json`.
  The browser never decides a price.
- `hstRate` (0.13) is the single HST setting: the checkout summary and the amount Stripe charges both
  use it. HST may only be charged once Rahul's GST/HST registration is in place.

### Contact form (`/api/contact`)
Checks run cheapest first, and nothing is sent unless all pass:
1. JSON body under 10 KB
2. Rate limit: 5 messages per minute per visitor
3. Honeypot field (bots get a fake "ok")
4. Server-side validation: phone digits, email format, allowed topics/areas/languages, lengths
5. Turnstile token verified with Cloudflare (fails closed)
6. Email to info@ via Resend, with Reply going to the student

### Checkout (`/api/checkout`, `/api/stripe-webhook`, `/api/checkout-status`)
1. The page sends the order. The server checks rate limit (10/min), fields and Turnstile, looks up
   the price, and creates a **Stripe Checkout Session**: one line for the package and one for HST.
2. The student pays on Stripe's page. The site never sees card numbers. Stripe emails the receipt.
3. Stripe calls the **webhook**. Its signature (HMAC-SHA256, 5-minute window) is verified, then the
   paid order (package, amount, student contact, preferred start) is emailed to the school. A failed
   email returns an error, so Stripe retries.
4. `/checkout/success` asks `/api/checkout-status` whether the session is paid, and only then shows
   "Payment received". That endpoint returns no personal data.

No licence numbers, dates of birth or licence expiry dates are collected or sent to Stripe.

### Security
- **CSP:** Astro generates a Content-Security-Policy `<meta>` on every page with hashes for each
  inline script and style. Only this site, plus Cloudflare Turnstile, may run scripts. Configured
  in `astro.config.mjs`.
- **Headers** (`public/_headers`): `frame-ancestors 'none'`, HSTS, `X-Frame-Options: DENY`,
  `nosniff`, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy.
- **Secrets** live only in Cloudflare (`wrangler secret put`) and in your local, gitignored `.dev.vars`.

### SEO
- Unique title, description and canonical URL per page; Open Graph and Twitter tags with a
  1200×630 brand image.
- Structured data (`src/data/schema.ts`): DrivingSchool / LocalBusiness on Home (no street address,
  no self-published rating), breadcrumbs on inner pages, Article on published blog posts.
- `robots.txt` + `sitemap-index.xml`. Draft blog posts, checkout pages and the 404 page are
  `noindex` and left out of the sitemap.

### PWA and offline
- `manifest.webmanifest` with lion icons (192, 512, maskable 512), apple-touch-icon and favicon.
- `public/sw.js`: pages network-first (visited pages saved for offline, newest 30), `/_astro/*` files
  cache-first, other files refreshed in the background. API calls and other sites are never cached.
  With no connection and no saved copy, `/offline` shows the phone number. Bump `VERSION` in
  `sw.js` to reset every visitor's cache.

### Accessibility and performance
- WCAG 2.2 AA: semantic HTML, labels on every field, visible focus, 44px tap targets, alt text,
  4.5:1 contrast in both themes. Quiz, tabs, FAQ and forms are keyboard-friendly, and their
  feedback is announced to screen readers.
- Motion (scroll slide-ups, scrolling pass wall, lane line) stops under `prefers-reduced-motion`;
  the pass wall also has a Pause button.
- Images are resized and converted to WebP at build time, at quality 70 for photos, and lazy-loaded
  below the fold. Very little JavaScript, all of it small page scripts.

---

## Configuration and deployment

Every push to `main` builds and deploys to Cloudflare Workers (about a minute).

**Settings** (`wrangler.jsonc` → `vars`, not secret):

| Name | Value |
| --- | --- |
| `CONTACT_TO` | `info@skillmastersdrivingschool.ca` (where form and order emails go) |
| `CONTACT_FROM` | `Skillmasters Website <website@skillmastersdrivingschool.ca>` |

**Secrets** (`npx wrangler secret put <NAME>`, never in code or git):

| Name | From | Used by |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile | contact, checkout |
| `RESEND_API_KEY` | Resend → API keys (sending access only) | contact, webhook |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (restricted key) | checkout, checkout-status |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks | webhook |

**Build variable** (Cloudflare build settings; public):
`PUBLIC_TURNSTILE_SITE_KEY`, the Turnstile site key. Without it the widget is left out.

**Rate limiters** (`wrangler.jsonc` → `ratelimits`): `CONTACT_RATE_LIMITER` (5/min),
`CHECKOUT_RATE_LIMITER` (10/min).

**Stripe webhook:** endpoint `https://<domain>/api/stripe-webhook`, events
`checkout.session.completed` and `checkout.session.async_payment_succeeded`.

---

## Brand

| Token | Light (default) | Dark |
| --- | --- | --- |
| Page background | `#FFFFFF` | `#0B0B0B` |
| Section band | `#FBF5EA` (cream) | `#141210` |
| Text | `#0B0B0B` | `#FBF5EA` |
| Accent (buttons) | `#E6A817` gold | `#E6A817` |
| Accent text | `#8A5F00` | `#E6A817` |
| Savings badge | `#0B7A45` | `#4ADE80` |

Rounded corners (16–28px), pill buttons, a dashed gold "lane line" motif, the lion logo on a cream
rounded square. Full spec: [`docs/design-spec.md`](docs/design-spec.md).

---

## Content rules

- Never invent stats, pass rates, student counts or reviews. Placeholders are marked **SAMPLE**
  (images) or **DRAFT** (articles) and replaced before launch.
- Struck-through prices are only the real "bought separately" totals: Canada's Competition Act
  forbids fake regular prices.
- Never publish Rahul's home address, his licence card, or students' personal data. Blur licence
  plates and road-test slips in photos.
- Reviews are real Google reviews, quoted word for word (first name + last initial). Never add
  reviews from the owner, staff, family or the site builder.
- BDE student details (licence number, date of birth, licence expiry) are never collected on the
  site, by email or in Stripe.

---

## Launch checklist

- [ ] Point `skillmastersdrivingschool.ca` at Cloudflare and connect it to the Worker
- [ ] Zoho email for info@ with SPF, DKIM and DMARC
- [ ] Resend domain verified; `RESEND_API_KEY` set
- [ ] Turnstile widget; `TURNSTILE_SECRET_KEY` + `PUBLIC_TURNSTILE_SITE_KEY` set; send a real test message
- [ ] Stripe activated; test payment with card 4242 4242 4242 4242; webhook set up; switch to live keys
- [ ] GST/HST number in place before charging HST; add it to Stripe, the order email and the footer
- [ ] Cal.com booking embedded on `/checkout/success`
- [ ] Rahul reviews and publishes the 6 blog articles and the legal policies
- [ ] Replace the Refresher SAMPLE photo; confirm G2/G and town for the pass-wall photos
- [ ] Run securityheaders.com and Lighthouse on the real domain

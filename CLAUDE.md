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

## Stack

- Astro 7 (static-first, islands only where interactive)
- Tailwind CSS v4 via `@tailwindcss/vite` (config lives in CSS with `@theme`)
- `@astrojs/sitemap`, `@astrojs/cloudflare` adapter, deployed on Cloudflare Workers
- Fonts self-hosted with Fontsource: Inter Variable (body), Montserrat 700/800 (headings)
- Later: Stripe Checkout (hosted page), Cal.com embed, Resend for emails, Cloudflare Turnstile

## Commands

- `npm run dev` – local dev server
- `npm run build` – production build (must pass before every push)
- `npm run preview` – preview the build
- Every push to `main` deploys to https://skillmasters-driving-school.pururana24.workers.dev

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
· `/g1-practice-test` · `/contact` · `/checkout` · `/checkout/success` · `/legal`

Home sections in order: header with gold top bar → hero (headline, real car photo, licence badge)
→ trust strip → who we serve (4 cards) → package finder quiz → packages → why Skillmasters
→ pass wall (auto-scrolling marquee, pauses on hover) → FAQ → blog teaser → gold CTA band → footer.
Floating WhatsApp button on desktop; Call / WhatsApp / Book bar fixed at the bottom on phones.

## Project structure

```
src/components/   Header, Footer, ThemeToggle, PackageCard, PackageFinder, PassWall, FAQ, MobileBar
src/layouts/      BaseLayout.astro (head, SEO, theme script, skip link)
src/pages/        routes above; src/pages/api/ for server endpoints (checkout, stripe-webhook, contact)
src/content/blog/ Markdown articles
src/data/         packages.json, reviews.json, faq.json, site.json (contact info, licence numbers)
public/           icons, manifest.webmanifest, _headers
```

Anything Rahul may change (prices, reviews, FAQ, contact info) must come from `src/data/`,
never hard-coded in components.

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
- Security headers in `public/_headers`: CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, frame-ancestors 'none'. Target A+ on securityheaders.com.
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

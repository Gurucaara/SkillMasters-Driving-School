# Skillmasters Website – Design Spec

Exported from the Design Spec doc, Nov 25, 2026. The approved mockup has 11 linked pages plus a shared header and footer, in a black, gold and cream brand built around the lion logo. The HTML of each mockup page is in `docs/mockup/`.

## Brand

| Token | Light theme (default) | Dark theme |
| --- | --- | --- |
| Background | White `#FFFFFF` | Black `#0B0B0B` |
| Section background | Cream `#FBF5EA` | `#141210` |
| Surface (cards) | White | `#17150F` |
| Lines / borders | `#EADFCB` | `#2E291F` |
| Text | `#141414` | `#F5EFE3` |
| Muted text | `#5A5348` | `#B8AE9C` |
| Accent (buttons, bars) | Gold `#E6A817` | Gold `#E6B33C` |
| Accent text on light | `#8A5F00` | `#F0C45A` |
| Good / savings | Green `#0B7A45` | `#4ADE80` |

- **Fonts:** Montserrat 700/800 for headings, Inter for body text
- **Logo:** gold/black/white lion head on a cream rounded square; full logo adds "SKILLMASTERS DRIVING SCHOOL LTD." and "MASTERING THE ROAD"
- **Headline accent:** gold gradient text (`#D99A00 → #9A6B00` light, `#F4D27A → #E6A817` dark)
- **Style:** rounded corners (16–28 px), pill buttons, soft shadows, a gold lane line motif
- **Theme switch:** sun/moon button in the header; light is the default

## Site map

Every page shares the same header and footer. All "Buy now" and "Book now" buttons lead to Checkout.

| Page | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Summary of everything, with links to each page |
| About | `/about` | Rahul's story, instructor facts, service area |
| BDE Program | `/bde-program` | Licence journey, BDE details, 3 BDE packages |
| G & G2 Lessons | `/lessons` | Lesson packs and what students practise |
| Pricing | `/pricing` | All prices plus BDE comparison table |
| Reviews | `/reviews` | Pass wall + Google reviews |
| Blog | `/blog` | 6 guide articles + G1 test promo |
| G1 Practice Test | `/g1-practice-test` | 6-question interactive quiz |
| Contact | `/contact` | Quick actions, message form, social links |
| Checkout | `/checkout` | Package → details → pay with Stripe → schedule lesson |
| Legal | `/legal` | Privacy, Terms, Refund & Cancellation tabs |

**Header nav:** Home · About · BDE Program · G & G2 Lessons · Pricing · Reviews · Blog · Contact, plus the theme toggle and a gold "Book now" button.

## Home page, top to bottom

1. **Header:** gold top bar ("MTO-approved BDE · Licence #L4H7 · Bundle & save up to $80", phone, Facebook and Instagram icons), then logo, nav, theme toggle, "Book now".
2. **Hero:** eyebrow "London, Ontario & surrounding areas"; headline "Learn to drive with confidence. Get road-ready with Skillmasters." (second sentence in gold gradient); buttons "Book a lesson →" and "Find my package"; facts 20 yrs · EN · HI · PA · 7 days. Right: square photo of the real Mazda in a gold frame, with floating badges "MTO Licence #L4H7" and "Dual-brake safety". An animated gold lane line runs along the bottom.
3. **Trust strip (black):** MTO-approved BDE course · Licensed & commercially insured · Dual-brake Mazda 3 · Home, school & work pickup.
4. **Who we serve:** 4 photo cards (Teens & New Drivers, Newcomers to Canada, Adults, Refresher Drivers), linking to the package finder.
5. **Package finder (black card):** 3 tap questions (licence G1/G2 → experience → need our car for the test?) with a progress bar; result card shows the matched package, price, reason and real saving, plus "Book this package".
6. **Packages (cream):** "Bundle up and save": 5 cards with prices, real strike-through "bought separately" totals and green SAVE badges; BDE + Road Test highlighted as "Most popular", Ultimate as "Best value". Below: single lesson $50 and road test package $150, plus a note explaining the savings.
7. **Why Skillmasters:** 5 gold-tick points (MTO-approved BDE, flexible scheduling, personalized teaching, three languages, pickup included) beside the real dual-brake photo.
8. **Pass wall (cream):** "Real students · Real passes" with a Google rating badge; row 1 = auto-scrolling student photos with "✓ Passed G2" badges; row 2 = Google review cards scrolling the other way. Both pause on hover.
9. **FAQ:** 5 expandable questions (G1 needed, BDE contents, pickup, cancellation, nervous drivers).
10. **Guides teaser:** G1 practice test card + 2 blog article cards.
11. **Gold CTA band:** "Ready to hit the road?" + "Book a lesson →".
12. **Footer.**

## Other pages

Each page opens with a black banner (breadcrumb, gold eyebrow, title, short intro, faint lion watermark) and ends with the gold CTA band.

| Page | Sections |
| --- | --- |
| **About** | "Why I started Skillmasters" story (Rahul's own words) with the car photo · instructor facts (20 yrs driving, 3 yrs teaching, licensed instructor #062254066, 3 languages) · service-area list + schematic map |
| **BDE Program** | Licence journey drawn as a road: G1 → BDE → G2 (after 8 months instead of 12) → G · G1 requirements · what BDE includes · 3 BDE package cards · BDE FAQ (licence #L4H7) |
| **G & G2 Lessons** | 4 lesson cards (single $50, 4-hr $180, 10-hr $450, road test $150) · G2 vs full G practice lists · dual-brake car photo |
| **Pricing** | BDE cards · comparison table (what each BDE package includes, savings) · lesson cards · info cards: secure Stripe payment, full payment + 12-month validity, cancellation rules |
| **Reviews** | Rating badge + "Review us on Google" · pass wall marquee · grid of 6 review cards |
| **Blog** | G1 test promo banner · 6 article cards: G1 guide, is BDE worth it, G2 checklist for London, newcomers, winter driving, highway prep |
| **G1 Practice Test** | 6 questions (stop sign, yield sign, zero BAC, school bus, 50 km/h, 4-year accompanying driver) with drawn signs, right/wrong feedback, score and "Explore BDE" |
| **Contact** | "Open now / Closed" badge (Ontario time) · 4 quick actions (Call, WhatsApp, Email, Book online) · message form with topic chips and preferred contact method · quick answers · areas served · Instagram / Facebook / Google buttons + 3×3 post grid |
| **Checkout** | Step chips: 1 Package → 2 Details → 3 Review & pay → 4 Schedule · order summary with 13% HST · "Pay securely with Stripe" · payment received → 14-day calendar with time slots → "You're booked!" with calendar buttons |
| **Legal** | Tabs: Privacy Policy · Terms of Service · Refund & Cancellation, marked as a draft for review |

## Shared components and interactions

- **Header:** gold top bar, then a sticky white bar with logo, nav, theme toggle and "Book now". On mobile it collapses to a menu button.
- **Footer (black):** logo and tagline, page links, contact details (phone, info@skillmastersdrivingschool.ca, hours 9–6), Facebook and Instagram icons, and the licence line (BDE #L4H7 · instructor #062254066). Privacy, Terms and Refunds sit in the bottom row.
- **WhatsApp float:** a green button in the bottom-right corner on every page.
- **Mobile action bar:** Call · WhatsApp · Book, fixed to the bottom of small screens.
- **Light/dark theme:** a toggle in the header. It follows the system setting by default and remembers the person's choice.
- **Package cards:** one pattern used on Home, BDE, Lessons and Pricing. Each card has the name, what's included, the price, the real "bought separately" total, a SAVE badge and a Book button.
- **Package finder:** three tap questions with a progress bar, ending in one recommended package.
- **Marquees:** the pass wall and review rows scroll continuously and pause on hover. With reduced motion turned on they stop and show as a static grid.
- **Motion:** the lane line in the hero, gentle fade-ins on scroll, and button hover lift. All of it is turned off under prefers-reduced-motion.
- **FAQ:** accordion items, one open at a time, keyboard-accessible.
- **Checkout flow:** step chips, an order summary with 13% HST, Stripe hosted payment, then a Cal.com-style scheduler and a confirmation screen.
- **Accessibility targets:** WCAG 2.2 AA contrast (gold text uses #8A5F00 on light backgrounds), visible focus rings, a skip link, and alt text on every photo.

## Content status: real vs sample, open items

| Item | Status | Notes |
| --- | --- | --- |
| Logo, brand colours | Real | From Rahul |
| Car photos (front, dual brake) | Real | Plate blurred, as Rahul asked |
| 3 pass-wall student photos | Real | Plates and licence slips blurred |
| Teens / Newcomers / Adults cards | Real | Student photos |
| Refresher card image | Sample | Canva AI image, tagged SAMPLE |
| Licence numbers (#L4H7, #062254066) | Real | Confirmed |
| Prices and bundle savings | Real | Confirmed unchanged; no inflated "was" prices |
| Payment, refund and cancellation rules | Real | Full payment; 24h reschedule; $50 late fee; 50% within 15 days; then non-refundable |
| Hours, email, service area | Real | 9–6; info@ address |
| Google reviews and 5.0 / 48 rating | Sample | Must be replaced with real reviews before launch |
| Blog covers, Instagram tiles | Sample | Canva images; IG grid becomes the live feed |
| Blog article bodies | Sample | Placeholder text, to be written |
| Legal pages | Draft | Needs Rahul's review before launch |

**Open items before launch**

- Real Google reviews and the Google review link from his Business Profile
- Instagram feed connection (or a manually updated grid)
- Stripe and Cal.com accounts live, with the real packages set up
- Original of the photo marked "AI-generated content" (left out for now)
- Blog articles written, and the legal text reviewed
- Zoho email and DNS (SPF, DKIM, DMARC) in place for info@

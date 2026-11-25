// Central business details used by the layout, header, footer and mobile bar.
// Facts come from CLAUDE.md ("Business facts"). Change them here, never in components.

const phoneDigits = '2049795184';

export const site = {
  name: 'Skillmasters Driving School Ltd.',
  shortName: 'Skillmasters',
  tagline: 'Mastering the road',
  description:
    'MTO-approved BDE and private driving lessons across London, St. Thomas, Thorndale and Dorchester.',

  phone: {
    display: '204-979-5184',
    href: `tel:+1${phoneDigits}`,
  },
  whatsapp: `https://wa.me/1${phoneDigits}`,
  email: 'info@skillmastersdrivingschool.ca',

  hours: '9 am – 6 pm, 7 days',
  pickupNote: 'Pickup only, no office',
  areas: ['London', 'St. Thomas', 'Thorndale', 'Dorchester'],
  // Pickup note per area (About page). Keep in the same order as `areas`.
  areaPickup: {
    London: 'home, school or work pickup',
    'St. Thomas': 'pickup in London for St. Thomas students',
    Thorndale: 'home and school pickup',
    Dorchester: 'home and school pickup',
  } as Record<string, string>,
  regionShort: 'London, ON & area',
  languages: ['English', 'Hindi', 'Punjabi'],
  languageCodes: ['EN', 'HI', 'PA'],
  experience: { drivingYears: 20, teachingYears: 3 },

  licences: {
    bde: 'L4H7', // MTO BDE Course Provider Licence
    instructor: '062254066', // Driving Instructor Licence (Rahul)
  },

  socials: {
    facebook: 'https://www.facebook.com/profile.php?id=61560786427720',
    instagram: 'https://www.instagram.com/skillmastersdrivingschool/',
  },

  // Black trust strip under the home hero.
  trustPoints: [
    'MTO-approved BDE course',
    'Licensed & commercially insured',
    'Dual-brake Mazda 3',
    'Home, school & work pickup',
  ],

  // Gold top bar message. "Up to $80" = BDE Ultimate saving in packages.json.
  topBar: 'MTO-approved BDE · Licence #L4H7 · Bundle & save up to $80',
};

// Header nav, in the order from docs/design-spec.md.
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'BDE Program', href: '/bde-program' },
  { label: 'G & G2 Lessons', href: '/lessons' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// Footer "Useful links" column (from docs/mockup/Footer.dc.html).
export const footerLinks = [
  { label: 'About us', href: '/about' },
  { label: 'BDE Program', href: '/bde-program' },
  { label: 'G & G2 Lessons', href: '/lessons' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Free G1 practice test', href: '/g1-practice-test' },
  { label: 'Blog', href: '/blog' },
];

export const legalLinks = [
  { label: 'Privacy Policy', href: '/legal#privacy' },
  { label: 'Refund & Cancellation', href: '/legal#refunds' },
  { label: 'Terms', href: '/legal#terms' },
];

// Every "Book now" / "Buy now" button leads to checkout.
export const cta = { label: 'Book now', href: '/checkout' };

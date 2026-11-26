// Structured data (JSON-LD) for search engines, built from site.ts and packages.json so it
// always matches the page. See https://schema.org and Google's "Local business" guidelines.
//
// Deliberately left out:
// - a street address (Rahul's home address is never published; London, ON only),
// - aggregateRating/reviews: Google ignores ratings a business publishes about itself and
//   may treat them as spam, so reviews stay on Google itself.
import { site } from './site';
import { packages, checkoutHref } from './packages';

const SITE_URL = 'https://skillmastersdrivingschool.ca';
const abs = (path: string) => new URL(path, SITE_URL).href;
const schoolId = abs('/#school');

export function drivingSchoolSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['DrivingSchool', 'LocalBusiness'],
    '@id': schoolId,
    name: site.name,
    alternateName: 'Skillmasters Driving School',
    slogan: site.tagline,
    description: `${site.description} MTO BDE Course Provider Licence #${site.licences.bde}.`,
    url: abs('/'),
    logo: abs('/icons/icon-512.png'),
    image: abs('/og-image.png'),
    telephone: '+1-204-979-5184',
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    areaServed: site.areas.map((name) => ({
      '@type': 'City',
      name: `${name}, Ontario`,
    })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: `$${Math.min(...packages.map((p) => p.price))}–$${Math.max(...packages.map((p) => p.price))}`,
    currenciesAccepted: 'CAD',
    knowsLanguage: ['en', 'hi', 'pa'],
    sameAs: [site.socials.facebook, site.socials.instagram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Driving lessons and BDE packages',
      itemListElement: packages.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        price: p.price.toFixed(2),
        priceCurrency: 'CAD',
        url: abs(checkoutHref(p.id)),
        itemOffered: { '@type': 'Service', name: p.name, description: p.includes.join(', ') },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Skillmasters Driving School',
    url: abs('/'),
    publisher: { '@id': schoolId },
    inLanguage: 'en-CA',
  };
}

/** Breadcrumb trail, e.g. [{ name: 'Blog', path: '/blog' }, { name: 'Is BDE worth it?', path: '/blog/is-bde-worth-it' }]. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path.length > 1 ? item.path.replace(/\/$/, '') : item.path),
    })),
  };
}

export function articleSchema(post: { title: string; description: string; path: string; published: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published.toISOString(),
    author: { '@type': 'Person', name: 'Rahul', jobTitle: 'Licensed driving instructor' },
    publisher: { '@id': schoolId },
    mainEntityOfPage: abs(post.path),
    image: abs('/og-image.png'),
    inLanguage: 'en-CA',
  };
}

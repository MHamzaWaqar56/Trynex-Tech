import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trynex.com';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-300-1234567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Chichawatni',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    sameAs: [
      'https://twitter.com/trynextech',
      'https://linkedin.com/company/trynextech',
      'https://github.com/trynextech',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceSchema({ name, description, url }: { name: string; description: string; url: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({
  title,
  description,
  author,
  datePublished,
  url,
}: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    datePublished,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

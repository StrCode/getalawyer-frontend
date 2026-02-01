// SEO Utilities for Lawyer Search

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: Record<string, unknown>;
}

export function generateSearchPageSEO(params?: {
  query?: string;
  specializations?: Array<string>;
  location?: string;
}): SEOMetadata {
  const { query, specializations, location } = params || {};
  
  let title = 'Find a Lawyer';
  let description = 'Search and connect with qualified lawyers across the country. Browse by specialization, experience, and location.';
  
  if (query) {
    title = `${query} Lawyers - Find Legal Help`;
    description = `Find experienced ${query} lawyers. Browse profiles, compare qualifications, and connect with the right attorney for your legal needs.`;
  } else if (specializations?.length) {
    const specText = specializations.join(', ');
    title = `${specText} Lawyers - Legal Services`;
    description = `Find qualified ${specText} lawyers. Compare experience, credentials, and client reviews to find the perfect legal representation.`;
  }
  
  if (location) {
    title = `${title} in ${location}`;
    description = `${description} Located in ${location}.`;
  }

  const keywords = [
    'find lawyer',
    'legal services',
    'attorney search',
    'legal help',
    query,
    ...(specializations || []),
    location,
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    canonical: '/search-lawyer',
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogImage: '/getalawyer-logo.jpg',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: '/getalawyer-logo.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/search-lawyer`,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: typeof window !== 'undefined' ? window.location.origin : '',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Find a Lawyer',
            item: `${typeof window !== 'undefined' ? window.location.origin : ''}/search-lawyer`,
          },
        ],
      },
    },
  };
}

export function generateLawyerProfileSEO(lawyer: {
  name: string;
  bio?: string;
  yearsOfExperience: number;
  state: string;
  country: string;
  specializations: Array<{ name: string }>;
  barLicenseNumber: string;
  barAssociation: string;
  profileImage?: string;
}): SEOMetadata {
  const specializations = lawyer.specializations.map(s => s.name).join(', ');
  const title = `${lawyer.name} - ${specializations} Lawyer`;
  const description = lawyer.bio 
    ? lawyer.bio.slice(0, 155) + (lawyer.bio.length > 155 ? '...' : '')
    : `${lawyer.name} is an experienced lawyer specializing in ${specializations} with ${lawyer.yearsOfExperience} years of experience in ${lawyer.state}, ${lawyer.country}.`;

  const keywords = [
    lawyer.name,
    ...lawyer.specializations.map(s => s.name),
    `${lawyer.state} lawyer`,
    `${lawyer.country} attorney`,
    'legal services',
    'attorney',
  ].join(', ');

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogType: 'profile',
    ogImage: lawyer.profileImage || '/getalawyer-logo.jpg',
    twitterCard: 'summary',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: lawyer.profileImage || '/getalawyer-logo.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Attorney',
      name: lawyer.name,
      description: lawyer.bio,
      image: lawyer.profileImage,
      address: {
        '@type': 'PostalAddress',
        addressRegion: lawyer.state,
        addressCountry: lawyer.country,
      },
      knowsAbout: lawyer.specializations.map(s => s.name),
      memberOf: {
        '@type': 'Organization',
        name: lawyer.barAssociation,
      },
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Bar License',
        recognizedBy: {
          '@type': 'Organization',
          name: lawyer.barAssociation,
        },
      },
      yearsOfExperience: lawyer.yearsOfExperience,
    },
  };
}

export function generateSearchResultsSEO(results: {
  total: number;
  query?: string;
  specializations?: Array<string>;
}): Record<string, unknown> {
  const { total, query, specializations } = results;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query ? `Search results for "${query}"` : 'Lawyer Search Results',
    description: `Found ${total} lawyers${query ? ` matching "${query}"` : ''}`,
    numberOfItems: total,
    about: specializations?.map(spec => ({
      '@type': 'Thing',
      name: spec,
    })),
  };
}

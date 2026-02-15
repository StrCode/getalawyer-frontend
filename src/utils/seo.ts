// SEO Utilities for Lawyer Search

import { SEO_CONSTANTS } from '@/constants/seo';

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
  robots?: string;
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
    title: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    description,
    keywords,
    canonical: '/search-lawyer',
    ogTitle: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    ogDescription: description,
    ogType: 'website',
    ogImage: SEO_CONSTANTS.DEFAULT_IMAGE,
    twitterCard: 'summary_large_image',
    twitterTitle: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    twitterDescription: description,
    twitterImage: SEO_CONSTANTS.DEFAULT_IMAGE,
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
  const title = `${lawyer.name} - ${specializations} Lawyer | ${SEO_CONSTANTS.SITE_NAME}`;
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

  const profileImage = lawyer.profileImage || SEO_CONSTANTS.DEFAULT_IMAGE;
  const twitterCard = lawyer.profileImage ? SEO_CONSTANTS.DEFAULT_TWITTER_CARD : 'summary';

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogType: 'profile',
    ogImage: profileImage,
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: profileImage,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Attorney',
      name: lawyer.name,
      description: lawyer.bio,
      image: profileImage,
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

// Helper function to ensure description is within bounds
function normalizeDescription(description: string): string {
  if (description.length > SEO_CONSTANTS.DESCRIPTION_MAX_LENGTH) {
    return description.slice(0, 157) + '...';
  }
  return description;
}

// Helper function to strip query parameters from canonical URLs
function getCanonicalPath(path: string): string {
  return path.split('?')[0];
}

// Generate SEO metadata for static pages
export function generateStaticPageSEO(config: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  includeOG?: boolean;
  includeTwitter?: boolean;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}): SEOMetadata {
  const {
    title,
    description,
    path,
    keywords,
    includeOG = true,
    includeTwitter = true,
    ogImage = SEO_CONSTANTS.DEFAULT_IMAGE,
    structuredData,
  } = config;

  const normalizedDescription = normalizeDescription(description);
  const canonicalPath = getCanonicalPath(path);
  const fullTitle = `${title} | ${SEO_CONSTANTS.SITE_NAME}`;
  
  // Determine Twitter card type based on image
  const twitterCard = ogImage === SEO_CONSTANTS.DEFAULT_IMAGE 
    ? 'summary' 
    : SEO_CONSTANTS.DEFAULT_TWITTER_CARD;

  const metadata: SEOMetadata = {
    title: fullTitle,
    description: normalizedDescription,
    keywords,
    canonical: canonicalPath,
  };

  if (includeOG) {
    metadata.ogTitle = fullTitle;
    metadata.ogDescription = normalizedDescription;
    metadata.ogImage = ogImage;
    metadata.ogType = SEO_CONSTANTS.DEFAULT_OG_TYPE;
  }

  if (includeTwitter) {
    metadata.twitterCard = twitterCard;
    metadata.twitterTitle = fullTitle;
    metadata.twitterDescription = normalizedDescription;
    metadata.twitterImage = ogImage;
  }

  if (structuredData) {
    metadata.structuredData = structuredData;
  }

  return metadata;
}

// Generate SEO metadata for protected pages (with noindex)
export function generateProtectedPageSEO(config: {
  title: string;
  description: string;
  path: string;
}): SEOMetadata {
  const { title, description, path } = config;
  const normalizedDescription = normalizeDescription(description);
  const canonicalPath = getCanonicalPath(path);

  return {
    title: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    description: normalizedDescription,
    canonical: canonicalPath,
    robots: 'noindex, nofollow',
  };
}

// Generate SEO metadata for authentication pages
export function generateAuthPageSEO(config: {
  title: string;
  description: string;
  path: string;
}): SEOMetadata {
  const { title, description, path } = config;
  const normalizedDescription = normalizeDescription(description);
  const canonicalPath = getCanonicalPath(path);
  const fullTitle = `${title} | ${SEO_CONSTANTS.SITE_NAME}`;

  return {
    title: fullTitle,
    description: normalizedDescription,
    canonical: canonicalPath,
    ogTitle: fullTitle,
    ogDescription: normalizedDescription,
    ogImage: SEO_CONSTANTS.DEFAULT_IMAGE,
    ogType: SEO_CONSTANTS.DEFAULT_OG_TYPE,
    twitterCard: 'summary',
    twitterTitle: fullTitle,
    twitterDescription: normalizedDescription,
    twitterImage: SEO_CONSTANTS.DEFAULT_IMAGE,
  };
}

// Generate SEO metadata for onboarding pages
export function generateOnboardingPageSEO(config: {
  step: string;
  description: string;
  path: string;
  currentStep?: number;
  totalSteps?: number;
}): SEOMetadata {
  const { step, description, path, currentStep, totalSteps } = config;
  const normalizedDescription = normalizeDescription(description);
  const canonicalPath = getCanonicalPath(path);
  
  let title = `Setup - ${step}`;
  if (currentStep && totalSteps) {
    title = `Setup - ${step} (${currentStep}/${totalSteps})`;
  }

  return {
    title: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    description: normalizedDescription,
    canonical: canonicalPath,
    robots: 'noindex, nofollow',
  };
}

// Generate SEO metadata for home page
export function generateHomePageSEO(): SEOMetadata {
  const title = 'Find Your Perfect Lawyer';
  const description = 'Connect with qualified lawyers across the country. Search by specialization, location, and experience to find the right legal representation for your needs.';
  const keywords = 'find lawyer, legal services, attorney search, qualified lawyers, legal representation';

  return {
    title: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    description,
    keywords,
    canonical: '/',
    ogTitle: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    ogDescription: description,
    ogImage: SEO_CONSTANTS.DEFAULT_IMAGE,
    ogType: SEO_CONSTANTS.DEFAULT_OG_TYPE,
    twitterCard: 'summary',
    twitterTitle: `${title} | ${SEO_CONSTANTS.SITE_NAME}`,
    twitterDescription: description,
    twitterImage: SEO_CONSTANTS.DEFAULT_IMAGE,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SEO_CONSTANTS.SITE_NAME,
      description,
      url: typeof window !== 'undefined' ? window.location.origin : '',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : ''}/search-lawyer?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  };
}

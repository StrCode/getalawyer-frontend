import { useEffect } from 'react';
import type { SEOMetadata } from '@/utils/seo';

interface SEOHeadProps {
  metadata: SEOMetadata;
}

export function SEOHead({ metadata }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', metadata.description);
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords);
    }
    if (metadata.robots) {
      updateMetaTag('robots', metadata.robots);
    }

    // Open Graph tags
    if (metadata.ogTitle) {
      updateMetaTag('og:title', metadata.ogTitle, true);
    }
    if (metadata.ogDescription) {
      updateMetaTag('og:description', metadata.ogDescription, true);
    }
    if (metadata.ogImage) {
      updateMetaTag('og:image', metadata.ogImage, true);
    }
    if (metadata.ogType) {
      updateMetaTag('og:type', metadata.ogType, true);
    }
    updateMetaTag('og:url', window.location.href, true);

    // Twitter Card tags
    if (metadata.twitterCard) {
      updateMetaTag('twitter:card', metadata.twitterCard);
    }
    if (metadata.twitterTitle) {
      updateMetaTag('twitter:title', metadata.twitterTitle);
    }
    if (metadata.twitterDescription) {
      updateMetaTag('twitter:description', metadata.twitterDescription);
    }
    if (metadata.twitterImage) {
      updateMetaTag('twitter:image', metadata.twitterImage);
    }

    // Canonical URL
    if (metadata.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `${window.location.origin}${metadata.canonical}`;
    }

    // Structured Data (JSON-LD)
    if (metadata.structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(metadata.structuredData);
    }
  }, [metadata]);

  return null;
}

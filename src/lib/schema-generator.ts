/**
 * Automatic Schema.org Markup Generator
 * Generates appropriate structured data based on page type and content
 */

import { detectPageType } from './seo-automation';
import { BRAND_AUTHOR } from './constants';

export interface SchemaConfig {
  type: 'Article' | 'Course' | 'FinancialProduct' | 'SoftwareApplication' | 'WebPage' | 'Organization' | 'FAQPage';
  data?: any;
}

export interface PageContent {
  title: string;
  description: string;
  url: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  content?: string;
  faq?: Array<{ question: string; answer: string }>;
}

/**
 * Generate Article schema for blog posts
 */
function generateArticleSchema(content: PageContent): SchemaConfig {
  return {
    type: 'Article',
    data: {
      headline: content.title,
      description: content.description,
      author: {
        '@type': 'Person',
        name: BRAND_AUTHOR
      },
      publisher: {
        '@type': 'Organization',
        name: 'Sentinel DeFi',
         url: 'https://www.sentineldefi.com',
         logo: {
           '@type': 'ImageObject',
           url: 'https://www.sentineldefi.com/favicon-32x32.png'
           url: 'https://www.sentineldefi.com/favicon-sentinel-defi.png'
         }
      },
      datePublished: content.publishedDate || new Date().toISOString(),
      dateModified: content.modifiedDate || new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': content.url
      },
      articleSection: content.category || 'DeFi Education',
      keywords: content.tags?.join(', ') || 'DeFi, cryptocurrency, blockchain, education',
      about: {
        '@type': 'Thing',
        name: 'Decentralized Finance',
        description: 'Educational content about DeFi protocols and strategies'
      }
    }
  };
}

/**
 * Generate Course schema for educational content
 */
function generateCourseSchema(content: PageContent): SchemaConfig {
  return {
    type: 'Course',
    data: {
      name: content.title,
      description: content.description,
      provider: {
        '@type': 'Organization',
         name: 'Sentinel DeFi',
         url: 'https://www.sentineldefi.com'
      },
      offers: [
        {
          '@type': 'Offer',
          price: content.price?.toString() || '0',
          priceCurrency: content.currency || 'USD',
          availability: 'https://schema.org/InStock',
          url: content.url,
          validFrom: new Date().toISOString(),
          priceValidUntil: '2025-12-31',
          seller: {
             '@type': 'Organization',
             name: 'Sentinel DeFi',
             url: 'https://www.sentineldefi.com'
          }
        }
      ],
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: 'online',
          instructor: {
            '@type': 'Person',
            name: 'Sentinel DeFi Team'
          },
          startDate: new Date().toISOString().split('T')[0],
          courseSchedule: {
            '@type': 'Schedule',
            scheduleTimezone: 'UTC',
            repeatFrequency: 'P1D',
            byDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }
        }
      ],
      coursePrerequisites: 'No prior experience required',
      educationalLevel: 'Beginner to Advanced',
      inLanguage: 'en-US',
      isAccessibleForFree: (content.price || 0) === 0,
      teaches: [
        'DeFi fundamentals',
        'Yield farming strategies',
        'Risk management',
        'Portfolio optimization'
      ],
      audience: {
        '@type': 'EducationalAudience',
        audienceType: 'adult learner'
      }
    }
  };
}

/**
 * Generate Product schema for store items and tools
 */
function generateProductSchema(content: PageContent): SchemaConfig {
  const isDigitalProduct = content.url.includes('/store/') || content.title.toLowerCase().includes('ebook') || content.title.toLowerCase().includes('template');
  
  return {
    type: isDigitalProduct ? 'SoftwareApplication' : 'FinancialProduct',
    data: {
      name: content.title,
      description: content.description,
      category: content.category || 'DeFi Tools',
      offers: {
        '@type': 'Offer',
        price: content.price?.toString() || '0',
        priceCurrency: content.currency || 'USD',
        availability: 'https://schema.org/InStock',
        url: content.url,
        seller: {
           '@type': 'Organization',
           name: 'Sentinel DeFi',
           url: 'https://www.sentineldefi.com'
        }
      },
      brand: {
        '@type': 'Brand',
        name: 'Sentinel DeFi'
      },
      ...(isDigitalProduct ? {
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web Browser',
        softwareVersion: '1.0',
        downloadUrl: content.url
      } : {
        serviceType: 'Financial Education Tool',
        areaServed: 'Worldwide',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: content.url
        }
      })
    }
  };
}

/**
 * Generate WebPage schema for general pages
 */
function generateWebPageSchema(content: PageContent): SchemaConfig {
  return {
    type: 'WebPage',
    data: {
      name: content.title,
      description: content.description,
      url: content.url,
      inLanguage: 'en-US',
      isPartOf: {
         '@type': 'WebSite',
         name: 'Sentinel DeFi',
         url: 'https://www.sentineldefi.com'
      },
      about: {
        '@type': 'Thing',
        name: 'DeFi Education',
        description: 'Educational resources for decentralized finance'
      },
      keywords: content.tags?.join(', ') || 'DeFi, education, cryptocurrency, blockchain',
      lastReviewed: new Date().toISOString(),
      mainContentOfPage: {
        '@type': 'WebPageElement',
        cssSelector: 'main'
      }
    }
  };
}

/**
 * Generate FAQ schema if FAQ content is present
 */
function generateFAQSchema(faq: Array<{ question: string; answer: string }>): SchemaConfig {
  return {
    type: 'FAQPage',
    data: {
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    }
  };
}

/**
 * Auto-generate appropriate schema based on page content
 */
export function generateSchema(content: PageContent): {
  schema: SchemaConfig;
  faqSchema?: SchemaConfig;
} {
  const pageType = detectPageType(content.url, content.title);
  
  let schema: SchemaConfig;
  
  switch (pageType) {
    case 'article':
      schema = generateArticleSchema(content);
      break;
    case 'course':
      schema = generateCourseSchema(content);
      break;
    case 'product':
      schema = generateProductSchema(content);
      break;
    case 'homepage':
      schema = {
        type: 'Organization',
        data: {
          name: 'Sentinel DeFi',
           url: 'https://www.sentineldefi.com',
           logo: 'https://www.sentineldefi.com/favicon-32x32.png',
           logo: 'https://www.sentineldefi.com/favicon-sentinel-defi.png',
          description: 'DeFi education platform for financial consciousness and decentralized finance mastery',
          foundingDate: '2024',
          sameAs: [
            'https://twitter.com/sentineldefi'
          ],
          areaServed: 'Worldwide',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'DeFi Education Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Course',
                  name: 'DeFi Education Courses'
                }
              }
            ]
          }
        }
      };
      break;
    default:
      schema = generateWebPageSchema(content);
  }

  const result: { schema: SchemaConfig; faqSchema?: SchemaConfig } = { schema };
  
  // Add FAQ schema if FAQ content exists
  if (content.faq && content.faq.length > 0) {
    result.faqSchema = generateFAQSchema(content.faq);
  }

  return result;
}

/**
 * Generate schema markup for common DeFi-related content
 */
export function generateDeFiSpecificSchema(content: PageContent): SchemaConfig[] {
  const schemas: SchemaConfig[] = [];
  
  // Add FinancialProduct schema for DeFi-related content
  if (content.title.toLowerCase().includes('defi') || 
      content.description.toLowerCase().includes('yield') ||
      content.url.includes('calculator')) {
    
    schemas.push({
      type: 'FinancialProduct',
      data: {
        name: `DeFi ${content.title}`,
        description: content.description,
        category: 'Decentralized Finance',
        provider: {
          '@type': 'Organization',
          name: 'Sentinel DeFi'
        },
        serviceType: 'Educational Resource',
        areaServed: 'Worldwide'
      }
    });
  }

  return schemas;
}
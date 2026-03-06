/**
 * SEO Automation Hook
 * Automatically handles SEO optimization for any page
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  generateSEOConfig, 
  validateSEO, 
  generateValidationReport,
  type SEOConfig,
  type SEOValidationResult 
} from '@/lib/seo-automation';
import { generateSchema, type PageContent, type SchemaConfig } from '@/lib/schema-generator';

export interface SEOAutomationOptions {
  title: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  price?: number;
  category?: string;
  tags?: string[];
  faq?: Array<{ question: string; answer: string }>;
  autoOptimize?: boolean;
  skipValidation?: boolean;
}

export interface SEOAutomationResult {
  seoConfig: SEOConfig;
  schema: SchemaConfig;
  faqSchema?: SchemaConfig;
  validation: SEOValidationResult;
  report: {
    status: 'pass' | 'warning' | 'fail';
    summary: string;
    details: string[];
    recommendations: string[];
  };
  isLoading: boolean;
  errors: string[];
}

/**
 * Main SEO automation hook
 */
export function useSEOAutomation(options: SEOAutomationOptions): SEOAutomationResult {
  const location = useLocation();
  const [result, setResult] = useState<SEOAutomationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function processSEO() {
      try {
        setIsLoading(true);
        setErrors([]);

        // Build full URL
        const fullUrl = `https://www.sentineldefi.online${location.pathname}`;
        
        // Generate automatic SEO config
        const seoConfig = generateSEOConfig(
          options.title,
          fullUrl,
          undefined, // content
          options.description
        );

        // Prepare page content for schema generation
        const pageContent: PageContent = {
          title: options.title,
          description: seoConfig.description,
          url: fullUrl,
          author: options.author,
          publishedDate: options.publishedDate,
          price: options.price,
          category: options.category,
          tags: options.tags,
          faq: options.faq
        };

        // Generate schema markup
        const { schema, faqSchema } = generateSchema(pageContent);

        // Validate SEO if not skipped
        let validation: SEOValidationResult = {
          isValid: true,
          issues: [],
          fixes: [],
          pageType: seoConfig.pageType || 'page'
        };

        if (!options.skipValidation) {
          validation = validateSEO(seoConfig);
        }

        // Generate post-publish report
        const report = generateValidationReport(seoConfig);

        setResult({
          seoConfig,
          schema,
          faqSchema,
          validation,
          report,
          isLoading: false,
          errors: []
        });


      } catch (error) {
        console.error('SEO Automation Error:', error);
        setErrors([error instanceof Error ? error.message : 'Unknown SEO automation error']);
      } finally {
        setIsLoading(false);
      }
    }

    processSEO();
  }, [location.pathname, options.title, options.description, options.price]);

  return result || {
    seoConfig: {
      title: options.title,
      description: options.description || '',
      keywords: '',
      url: `https://www.sentineldefi.online${location.pathname}`
    },
    schema: { type: 'WebPage', data: {} },
    validation: {
      isValid: false,
      issues: ['Loading...'],
      fixes: [],
      pageType: 'page'
    },
    report: {
      status: 'warning',
      summary: 'Loading SEO automation...',
      details: [],
      recommendations: []
    },
    isLoading,
    errors
  };
}

/**
 * Hook for blog post SEO automation
 */
export function useBlogSEOAutomation(options: {
  title: string;
  excerpt?: string;
  author?: string;
  publishedDate: string;
  category: string;
  tags: string[];
  content?: string;
}) {
  return useSEOAutomation({
    title: options.title,
    description: options.excerpt,
    author: options.author,
    publishedDate: options.publishedDate,
    category: options.category,
    tags: options.tags,
    autoOptimize: true
  });
}

/**
 * Hook for course SEO automation
 */
export function useCourseSEOAutomation(options: {
  title: string;
  description?: string;
  price?: number;
  level?: string;
  duration?: string;
  topics?: string[];
}) {
  return useSEOAutomation({
    title: options.title,
    description: options.description,
    price: options.price,
    category: 'DeFi Course',
    tags: [
      'DeFi course',
      'crypto education',
      'blockchain learning',
      ...(options.topics || []),
      options.level || 'beginner'
    ],
    autoOptimize: true
  });
}

/**
 * Hook for product/store SEO automation
 */
export function useProductSEOAutomation(options: {
  title: string;
  description?: string;
  price: number;
  category: string;
  features?: string[];
}) {
  return useSEOAutomation({
    title: options.title,
    description: options.description,
    price: options.price,
    category: options.category,
    tags: [
      'DeFi tool',
      'crypto product',
      'financial calculator',
      ...(options.features || [])
    ],
    autoOptimize: true
  });
}

/**
 * Real-time SEO monitoring
 */
export function useSEOMonitoring() {
  const [issues, setIssues] = useState<string[]>([]);
  const [score, setScore] = useState<number>(100);

  useEffect(() => {
    // Monitor page for SEO issues
    const checkSEO = () => {
      const foundIssues: string[] = [];
      let currentScore = 100;

      // Check for multiple H1s
      const h1Elements = document.querySelectorAll('h1');
      if (h1Elements.length === 0) {
        foundIssues.push('No H1 tag found');
        currentScore -= 20;
      } else if (h1Elements.length > 1) {
        foundIssues.push(`${h1Elements.length} H1 tags found (should be 1)`);
        currentScore -= 15;
      }

      // Check meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        foundIssues.push('Missing meta description');
        currentScore -= 25;
      } else {
        const content = metaDescription.getAttribute('content') || '';
        if (content.length < 140 || content.length > 155) {
          foundIssues.push('Meta description not optimal length (140-155 chars)');
          currentScore -= 10;
        }
      }

      // Check canonical tag
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        foundIssues.push('Missing canonical tag');
        currentScore -= 15;
      }

      // Check for schema markup
      const schemas = document.querySelectorAll('script[type="application/ld+json"]');
      if (schemas.length === 0) {
        foundIssues.push('No structured data found');
        currentScore -= 20;
      }

      setIssues(foundIssues);
      setScore(Math.max(0, currentScore));
    };

    // Initial check
    checkSEO();

    // Set up observer for DOM changes
    const observer = new MutationObserver(checkSEO);
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return { issues, score };
}
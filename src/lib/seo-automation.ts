/**
 * SEO Automation System for Sentinel DeFi
 * Automatically validates and optimizes SEO for all pages
 */

export interface SEOValidationResult {
  isValid: boolean;
  issues: string[];
  fixes: string[];
  pageType: 'article' | 'course' | 'product' | 'page' | 'homepage';
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  url: string;
  type?: string;
  pageType?: 'article' | 'course' | 'product' | 'page' | 'homepage';
}

/**
 * Automatically detect page type based on URL and content
 */
export function detectPageType(url: string, title?: string): 'article' | 'course' | 'product' | 'page' | 'homepage' {
  const path = new URL(url).pathname.toLowerCase();
  
  if (path === '/' || path === '/index') return 'homepage';
  if (path.includes('/blog/') || path.includes('/articles/')) return 'article';
  if (path.includes('/course') || path.includes('/tutorial')) return 'course';
  if (path.includes('/store/') || path.includes('/product/')) return 'product';
  
  // Detect by title patterns
  if (title?.toLowerCase().includes('course') || title?.toLowerCase().includes('tutorial')) return 'course';
  if (title?.toLowerCase().includes('product') || title?.toLowerCase().includes('guide')) return 'product';
  
  return 'page';
}

/**
 * Validate and optimize meta description
 */
export function optimizeMetaDescription(description: string, keywords: string[]): string {
  if (!description) {
    return `Discover comprehensive DeFi education and tools at Sentinel DeFi. Learn ${keywords.slice(0, 2).join(', ')} with expert guidance and practical strategies.`;
  }

  // Check length (140-155 characters optimal)
  if (description.length < 140) {
    // Try to expand naturally with keywords
    const missingKeywords = keywords.filter(keyword => 
      !description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (missingKeywords.length > 0 && description.length < 130) {
      description += ` ${missingKeywords[0]} strategies included.`;
    }
  }

  if (description.length > 155) {
    // Trim to 155 characters at word boundary
    description = description.substring(0, 152).trim();
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > 130) {
      description = description.substring(0, lastSpace) + '...';
    }
  }

  return description;
}

/**
 * Generate automatic keywords based on page type and content
 */
export function generateKeywords(pageType: string, title: string, url: string): string[] {
  const baseKeywords = ['DeFi', 'decentralized finance', 'cryptocurrency', 'Sentinel DeFi'];
  
  const typeKeywords = {
    article: ['DeFi blog', 'crypto insights', 'blockchain analysis', 'DeFi news'],
    course: ['DeFi course', 'crypto education', 'DeFi training', 'blockchain learning'],
    product: ['DeFi tools', 'crypto calculator', 'DeFi guide', 'financial product'],
    page: ['DeFi education', 'financial consciousness', 'crypto guidance'],
    homepage: ['DeFi platform', 'crypto education hub', 'financial sovereignty']
  };

  // Extract keywords from title
  const titleKeywords = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3);

  // Extract from URL
  const urlKeywords = url.split('/')
    .filter(segment => segment.length > 3)
    .map(segment => segment.replace(/-/g, ' '))
    .slice(0, 2);

  return [
    ...baseKeywords,
    ...typeKeywords[pageType] || typeKeywords.page,
    ...titleKeywords,
    ...urlKeywords
  ].slice(0, 10);
}

/**
 * Validate H1 structure in HTML content
 */
export function validateH1Structure(htmlContent: string): { isValid: boolean; h1Count: number; fixes: string[] } {
  const h1Matches = htmlContent.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h1Count = h1Matches.length;
  
  const fixes: string[] = [];
  
  if (h1Count === 0) {
    fixes.push('Add exactly one H1 tag as the main page heading');
  } else if (h1Count > 1) {
    fixes.push(`Convert ${h1Count - 1} extra H1 tags to H2 or H3 tags`);
  }

  return {
    isValid: h1Count === 1,
    h1Count,
    fixes
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalURL(currentUrl: string): string {
  try {
    const url = new URL(currentUrl);
    // Remove query parameters and fragments for canonical
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return currentUrl;
  }
}

/**
 * Comprehensive SEO validation
 */
export function validateSEO(config: SEOConfig, htmlContent?: string): SEOValidationResult {
  const issues: string[] = [];
  const fixes: string[] = [];
  
  // Validate title
  if (!config.title) {
    issues.push('Missing page title');
    fixes.push('Add a descriptive title (50-60 characters)');
  } else if (config.title.length > 60) {
    issues.push('Title too long (over 60 characters)');
    fixes.push('Shorten title to under 60 characters');
  }

  // Validate description
  if (!config.description) {
    issues.push('Missing meta description');
    fixes.push('Add meta description (140-155 characters)');
  } else if (config.description.length < 140 || config.description.length > 155) {
    issues.push('Meta description not optimal length (140-155 characters)');
    fixes.push('Adjust meta description length to 140-155 characters');
  }

  // Validate H1 structure if HTML provided
  if (htmlContent) {
    const h1Validation = validateH1Structure(htmlContent);
    if (!h1Validation.isValid) {
      issues.push(`Invalid H1 structure: found ${h1Validation.h1Count} H1 tags`);
      fixes.push(...h1Validation.fixes);
    }
  }

  // Validate URL structure
  if (!config.url.includes('sentineldefi.online')) {
    issues.push('URL should include domain for canonical reference');
    fixes.push('Ensure URL includes full domain');
  }

  const pageType = config.pageType || detectPageType(config.url, config.title);
  
  return {
    isValid: issues.length === 0,
    issues,
    fixes,
    pageType
  };
}

/**
 * Auto-generate SEO config for a new page
 */
export function generateSEOConfig(
  title: string,
  url: string,
  content?: string,
  customDescription?: string
): SEOConfig {
  const pageType = detectPageType(url, title);
  const keywords = generateKeywords(pageType, title, url);
  const description = customDescription || optimizeMetaDescription(
    customDescription || '',
    keywords
  );

  return {
    title: title.includes('Sentinel DeFi') ? title : `${title} | Sentinel DeFi`,
    description: optimizeMetaDescription(description, keywords),
    keywords: keywords.join(', '),
    url: generateCanonicalURL(url),
    type: pageType === 'homepage' ? 'website' : 'webpage',
    pageType
  };
}

/**
 * Post-publish validation report
 */
export function generateValidationReport(config: SEOConfig, htmlContent?: string): {
  status: 'pass' | 'warning' | 'fail';
  summary: string;
  details: string[];
  recommendations: string[];
} {
  const validation = validateSEO(config, htmlContent);
  
  let status: 'pass' | 'warning' | 'fail' = 'pass';
  if (validation.issues.length > 2) status = 'fail';
  else if (validation.issues.length > 0) status = 'warning';

  const summary = status === 'pass' 
    ? '✅ SEO optimization complete - ready for indexing'
    : status === 'warning'
    ? '⚠️ Minor SEO issues detected - page will index but could be improved'
    : '❌ Critical SEO issues found - fix before publishing';

  const recommendations = [
    'Submit sitemap to Google Search Console',
    'Monitor indexing status in 24-48 hours',
    'Check page performance in PageSpeed Insights',
    'Verify structured data with Google Rich Results Test'
  ];

  return {
    status,
    summary,
    details: validation.issues,
    recommendations
  };
}
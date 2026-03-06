import { Helmet } from "react-helmet-async";

// Legacy SEO component - Consider using SEOAutomation for new pages
// This component is maintained for backwards compatibility

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  schema?: {
    type: 'Article' | 'Course' | 'FinancialProduct' | 'SoftwareApplication' | 'WebPage' | 'Organization' | 'FAQPage';
    data?: any;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const SEO = ({
  title = "Decentralized DeFi Education & Wealth Tools | Sentinel DeFi",
  description = "Transform your financial future with comprehensive DeFi education. Learn decentralized finance, yield farming, blockchain investing, and cryptocurrency strategies from beginner to advanced levels.",
  keywords = "DeFi education, decentralized finance, yield farming, blockchain investing, cryptocurrency courses, financial consciousness, DeFi beginner guide, crypto education, smart contracts, liquidity pools",
  image = `${window.location.origin}/social-share-sentinel-defi.jpg`,
  url = "https://www.sentineldefi.online",
  type = "website",
  article,
  schema,
  faq
}: SEOProps) => {
  const siteTitle = "Sentinel DeFi";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  // Generate schema markup based on type
  const generateSchema = () => {
    if (!schema) return null;

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": schema.type,
      name: title,
      description: description,
      url: url,
      image: image,
      publisher: {
        "@type": "Organization",
        name: "Sentinel DeFi",
        url: "https://www.sentineldefi.online",
        logo: {
          "@type": "ImageObject",
          url: "https://www.sentineldefi.online/favicon-sentinel-defi.png"
        }
      },
      ...schema.data
    };

    // Add Course-specific schema enhancements
    if (schema.type === 'Course') {
      // Add proper offers object
      if (schema.data?.offers) {
        baseSchema.offers = {
          "@type": "Offer",
          price: schema.data.offers.price || "0",
          priceCurrency: schema.data.offers.priceCurrency || "USD",
          availability: "https://schema.org/InStock",
          url: url,
          validFrom: new Date().toISOString(),
          seller: {
            "@type": "Organization",
            name: "Sentinel DeFi",
            url: "https://www.sentineldefi.online"
          }
        };
      }

      // Add proper hasCourseInstance object
      if (schema.data?.hasCourseInstance) {
        baseSchema.hasCourseInstance = {
          "@type": "CourseInstance",
          courseMode: "online",
          instructor: {
            "@type": "Person",
            name: "Sentinel DeFi Team"
          },
          startDate: new Date().toISOString().split('T')[0], // Today's date
          endDate: "2025-12-31", // Self-paced courses available through end of year
          courseSchedule: {
            "@type": "Schedule",
            scheduleTimezone: "UTC",
            repeatFrequency: "P1D",
            byDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          }
        };
      }

      // Add course-specific properties
      baseSchema.coursePrerequisites = schema.data?.coursePrerequisites || "No prior experience required";
      baseSchema.educationalLevel = schema.data?.educationalLevel || "Beginner to Advanced";
      baseSchema.inLanguage = "en-US";
      baseSchema.isAccessibleForFree = schema.data?.offers?.price === "0" || schema.data?.offers?.price === 0;
    }

    return baseSchema;
  };

  // Generate FAQ schema
  const generateFAQSchema = () => {
    if (!faq || faq.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    };
  };

  const schemaMarkup = generateSchema();
  const faqMarkup = generateFAQSchema();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Canonical URL is handled by Layout component */}
      
      {/* AI Crawler Optimization */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@sentineldefi" />
      <meta name="twitter:site" content="@sentineldefi" />

      {/* Article-specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Schema.org Structured Data */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      {/* FAQ Schema */}
      {faqMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqMarkup) }}
        />
      )}
    </Helmet>
  );
};

export default SEO;

/**
 * BLOG POST TEMPLATE
 * ==================
 * Use this exact format for ALL future blog posts.
 * Copy this file and modify the content while keeping the structure identical.
 * 
 * Key Format Rules:
 * - Header Card inside container (not full-width hero)
 * - max-w-4xl container constraint
 * - bg-gradient-consciousness for header Card
 * - p-8 padding on both Cards
 * - font-consciousness for headings
 * - prose-lg with dark:prose-invert for article content
 * - Tags displayed in header (first 4 tags)
 * - Meta info: Author, Date, Read Time
 */

import { BlogSEOAutomation } from "@/components/SEOAutomation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import { BRAND_AUTHOR } from "@/lib/constants";

// Optional: Import additional icons for section headers
// import { TrendingDown, Shield, Brain, AlertTriangle } from "lucide-react";

const BlogPostTemplate = () => {
  // ==========================================
  // BLOG POST DATA - Modify these values
  // ==========================================
  const blogPost = {
    title: "Your Blog Title Here",
    excerpt: "A compelling 1-2 sentence description that appears in the header and SEO meta tags.",
    author: BRAND_AUTHOR,
    publishedDate: "2025-12-17", // Format: YYYY-MM-DD
    category: "Category Name", // e.g., "Investor Education", "DeFi Trends", "Security"
    // IMPORTANT: Tags should be 4-5 simple trending topics, NOT long-tail SEO phrases
    // Good: ["Crypto Psychology", "Self-Custody", "Risk Management", "FTX Collapse"]
    // Bad: ["why crypto investors lose money", "emotional trading mistakes crypto 2025"]
    tags: ["Trending Topic 1", "Trending Topic 2", "Trending Topic 3", "Trending Topic 4"],
    readTime: "8 min read",
  };

  return (
    <>
      {/* ==========================================
          SEO COMPONENT - Required for all blogs
          ========================================== */}
      <BlogSEOAutomation
        title={blogPost.title}
        excerpt={blogPost.excerpt}
        author={blogPost.author}
        publishedDate={blogPost.publishedDate}
        category={blogPost.category}
        tags={blogPost.tags}
      />

      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* ==========================================
              HEADER CARD - Keep this structure exact
              ========================================== */}
          <Card className="p-8 mb-8 bg-gradient-consciousness border-primary/20">
            {/* Tags Row */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                {/* Optional: Add icon before category */}
                {blogPost.category}
              </Badge>
              {blogPost.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title - Single H1 for SEO */}
            <h1 className="text-3xl md:text-4xl font-consciousness font-bold text-foreground mb-6">
              {blogPost.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-white/50 font-consciousness mb-6 leading-relaxed">
              {blogPost.excerpt}
            </p>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{BRAND_AUTHOR}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blogPost.publishedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>
          </Card>

          {/* ==========================================
              CONTENT CARD - Article body goes here
              ========================================== */}
          <Card className="p-8">
            <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-consciousness prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
              
              {/* ==========================================
                  ARTICLE CONTENT PATTERNS
                  Use these consistent patterns throughout
                  ========================================== */}

              {/* PATTERN: Introduction paragraph */}
              <div className="mb-12">
                <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                  Opening paragraph with <strong className="text-foreground">bold key statistics</strong> or important points.
                </p>
                <p className="text-foreground/90 text-lg leading-relaxed">
                  Second paragraph setting up the article structure.
                </p>
              </div>

              {/* PATTERN: Section with icon header */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    {/* <IconName className="w-6 h-6 text-primary" /> */}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0">Section Title</h2>
                </div>
                
                <p className="text-foreground/90 leading-relaxed mb-4">
                  Section content here.
                </p>
              </div>

              {/* PATTERN: Subsections with left border */}
              <div className="space-y-8">
                <div className="border-l-4 border-primary/50 pl-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Subsection Title</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    Subsection content here.
                  </p>
                </div>
              </div>

              {/* PATTERN: Info box with background */}
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Box Title</h3>
                <ul className="space-y-3 text-foreground/90">
                  <li><strong className="text-foreground">Item 1:</strong> Description here.</li>
                  <li><strong className="text-foreground">Item 2:</strong> Description here.</li>
                </ul>
              </div>

              {/* PATTERN: Grid of info cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Card Title</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    Card description text.
                  </p>
                </div>
              </div>

              {/* PATTERN: Highlighted quote/key point */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Key Point Title</h3>
                <p className="text-foreground/90 leading-relaxed">
                  Important emphasized content here.
                </p>
              </div>

              {/* PATTERN: Bullet list with arrows */}
              <ul className="space-y-3 text-foreground/90 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span>List item content</span>
                </li>
              </ul>

              {/* PATTERN: Educational CTA */}
              <div className="mb-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <h3 className="text-xl font-semibold text-foreground mb-3">Continue Your Education</h3>
                <p className="text-foreground/90 leading-relaxed">
                  CTA text with <a href="/tutorials" className="text-primary hover:underline">link to tutorials</a> or other resources.
                </p>
              </div>

              {/* PATTERN: Disclaimer - Required for all blogs */}
              <div className="border-t border-white/8 pt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Educational Disclaimer</h2>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  This content is provided for educational and informational purposes only. It does not constitute financial advice, investment advice, trading advice, or any other type of advice. You should not treat any of the content as such. The 3rdeyeadvisors Research Team does not recommend that any cryptocurrency, token, or investment strategy is suitable for any specific person.
                </p>
                <p className="text-foreground/70 text-sm leading-relaxed mt-4">
                  All investments involve risk, including the possible loss of principal. Past performance is not indicative of future results. Cryptocurrency markets are highly volatile and speculative. Always conduct your own research and consult with qualified financial professionals before making any investment decisions.
                </p>
              </div>

            </article>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BlogPostTemplate;

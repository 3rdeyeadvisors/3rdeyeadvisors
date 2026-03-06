import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, User, Share, BookOpen } from "lucide-react";
import { getBlogPost, getPublishedDate, type BlogPost } from "@/data/blogContent";
import { CommunityHub } from "@/components/community/CommunityHub";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SEO from "@/components/SEO";
import { BRAND_AUTHOR } from "@/lib/constants";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Volume2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  useEffect(() => {
    const foundPost = getBlogPost(slug || "");
    
    if (foundPost) {
      setPost(foundPost);
    } else {
      // Don't redirect - let the post render as 404 to avoid redirect status codes
      setPost(null);
    }
    
    setLoading(false);
  }, [slug, navigate]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DeFi Education":
      case "Education": 
        return "bg-awareness/20 text-awareness border-awareness/30";
      case "Security": 
        return "bg-primary/20 text-primary border-primary/30";
      case "Innovation": 
        return "bg-accent/20 text-accent border-accent/30";
      case "DeFi Tools":
      case "Tools": 
        return "bg-secondary/40 text-secondary-foreground border-secondary/30";
      case "Analysis": 
        return "bg-white/5 text-white border-white/8";
      case "Web3 Gaming":
        return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-500/30";
      case "DeFAI":
      case "DEFAI":
        return "bg-primary text-primary-foreground border-primary/60 shadow-sm";
      default: 
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/5 rounded w-1/4"></div>
            <div className="h-12 bg-white/5 rounded w-3/4"></div>
            <div className="h-6 bg-white/5 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded"></div>
              <div className="h-4 bg-white/5 rounded"></div>
              <div className="h-4 bg-white/5 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": "https://www.sentineldefi.online/social-share.jpg",
    "author": {
      "@type": "Person",
      "name": BRAND_AUTHOR
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sentinel DeFi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.sentineldefi.online/favicon-sentineldefi.png?v=4"
      }
    },
    "datePublished": getPublishedDate(post.date),
    "dateModified": getPublishedDate(post.date),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.sentineldefi.online/blog/${post.slug}`
    },
    "keywords": `${post.category.toLowerCase()}, DeFi, cryptocurrency, ${post.tags.join(', ')}`
  };

  return (
    <>
      <SEO 
        title={`${post.title} | Sentinel DeFi Blog`}
        description={post.excerpt}
        keywords={`${post.category.toLowerCase()}, DeFi, cryptocurrency, ${post.title.toLowerCase()}`}
        url={`https://www.sentineldefi.online/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.date,
          author: BRAND_AUTHOR,
          section: post.category,
          tags: [post.category, 'DeFi', 'Cryptocurrency']
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate("/blog")}
          className="mb-8 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <Card className="p-8 mb-8 mobile-typography-center">
          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge className={getCategoryColor(post.category)}>
              {post.category}
            </Badge>
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-consciousness font-bold text-white mb-6">
            {post.title}
          </h1>

          <button
            onClick={() => openAudio(post.content, post.title)}
            className="flex items-center gap-2 font-body text-sm text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-4 py-2 mt-4"
          >
            <Volume2 className="w-4 h-4" />
            Listen to this article
          </button>

          {/* Excerpt */}
          <p className="text-lg text-white/50 font-consciousness mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{BRAND_AUTHOR}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(getPublishedDate(post.date) + 'T12:00:00').toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-primary"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out this article: ${post.title}`;
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: url,
                  });
                } else {
                  navigator.clipboard.writeText(`${text}: ${url}`);
                  // You could add a toast notification here
                }
              }}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        {/* Article Content */}
        <Card className="p-8 mb-8">
          <div className="prose prose-lg max-w-none mobile-typography-center">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="text-3xl font-consciousness font-bold text-white mb-6 mt-8">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-consciousness font-bold text-white mb-4 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-consciousness font-semibold text-white mb-3 mt-6">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-consciousness font-semibold text-white mb-2 mt-4">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-white font-consciousness mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-white">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-white">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-white font-consciousness">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-primary">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-white/5 rounded-r">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-white/8">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-white/8 bg-white/5 p-3 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-white/8 p-3">
                    {children}
                  </td>
                )
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-6 mb-8 bg-gradient-consciousness border-primary/20">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-consciousness font-bold text-white mb-2">
              Ready to Put This Knowledge into Practice?
            </h3>
            <p className="text-white/50 mb-4">
              Explore our hands-on tutorials and interactive courses to master DeFi
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="cosmic" onClick={() => navigate("/courses")}>
                Browse Courses
              </Button>
              <Button variant="cosmic" onClick={() => navigate("/tutorials")}>
                Tutorials
              </Button>
            </div>
          </div>
        </Card>

        {/* Community Discussion */}
        <CommunityHub
          contentType="tutorial"
          contentId={`blog-${post.slug}`}
          title={post.title}
        />

        {/* Related Articles */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-consciousness font-bold text-white mb-4">
            Continue Reading
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start p-4 h-auto"
              onClick={() => navigate("/blog")}
            >
              <div className="text-left">
                <div className="font-semibold">Browse All Articles</div>
                <div className="text-sm text-white/50">
                  Discover more DeFi insights and guides
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start p-4 h-auto"
              onClick={() => navigate("/resources")}
            >
              <div className="text-left">
                <div className="font-semibold">DeFi Resources</div>
                <div className="text-sm text-white/50">
                  Tools, calculators, and utilities
                </div>
              </div>
            </Button>
          </div>
        </Card>
        </div>
      </div>
      {audioOpen && (
        <AudioPlayer
          text={audioText}
          title={audioTitle}
          onClose={closeAudio}
        />
      )}
    </>
  );
};

export default BlogPost;
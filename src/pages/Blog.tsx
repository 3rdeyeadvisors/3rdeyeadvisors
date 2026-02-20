import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { getBlogPosts, getBlogPostsByCategory, getBlogCategories } from "@/data/blogContent";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const posts = getBlogPostsByCategory(selectedCategory);
  
  // Helper to parse date strings as local dates to avoid timezone issues
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const featuredPosts = posts.filter(post => {
    const postDate = parseLocalDate(post.date);
    return !isNaN(postDate.getTime()) && postDate >= cutoff && post.featured === true;
  });
  
  const regularPosts = posts.filter(post => {
    const postDate = parseLocalDate(post.date);
    return !isNaN(postDate.getTime()) && (postDate < cutoff || post.featured !== true);
  });

  const categories = getBlogCategories();

  // Simplified sliding handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold && currentFeaturedIndex > 0) {
      setCurrentFeaturedIndex(currentFeaturedIndex - 1);
    } else if (translateX < -threshold && currentFeaturedIndex < featuredPosts.length - 1) {
      setCurrentFeaturedIndex(currentFeaturedIndex + 1);
    }
    setTranslateX(0);
  };

  const getCategoryStyle = (category: string) => {
    const isActive = category === selectedCategory;
    return isActive
      ? "bg-violet-600 border-violet-600 text-white"
      : "border-white/15 text-white/50 hover:border-violet-500/30 hover:text-white/80 bg-transparent";
  };

  return (
    <>
      <SEO 
        title="DeFi Blog: Cryptocurrency Articles & Blockchain Education"
        description="Expert DeFi blog with cryptocurrency analysis, yield farming insights, blockchain education, and DeFi security guides. Stay updated with the latest decentralized finance trends and strategies."
        keywords="DeFi blog, cryptocurrency articles, blockchain education, DeFi analysis, crypto news, yield farming insights, DeFi security, cryptocurrency trends, blockchain analysis"
        url="https://www.the3rdeyeadvisors.com/blog"
        schema={{
          type: 'WebPage',
          data: {
            mainEntity: {
              "@type": "Blog",
              name: "3rdeyeadvisors DeFi Blog",
              description: "Educational content about decentralized finance, cryptocurrency, and blockchain technology"
            }
          }
        }}
        faq={[
          {
            question: "What topics does your DeFi blog cover?",
            answer: "Our DeFi blog covers yield farming strategies, cryptocurrency analysis, blockchain technology insights, DeFi security best practices, market trends, and educational content for all skill levels."
          },
          {
            question: "How often do you publish new cryptocurrency articles?",
            answer: "We regularly publish new articles covering the latest DeFi developments, market analysis, and educational content. Our blog is updated with fresh insights on decentralized finance trends and opportunities."
          },
          {
            question: "Are your DeFi articles suitable for beginners?",
            answer: "Yes! Our blog features content for all levels, from beginner-friendly explanations of DeFi concepts to advanced analysis for experienced crypto investors. Each article is clearly marked by difficulty level."
          }
        ]}
      />
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Research"
          title="Insights and Analysis"
          subtitle="Deep dives into DeFi protocols, market analysis, and educational content written for people who want to actually understand what is happening."
        />

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              className={`font-body text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${getCategoryStyle(category)}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Debug Info */}
        {posts.length === 0 && (
          <div className="text-center p-8 bg-red-100 text-red-800 rounded">
            <p>No blog posts found! Debug info:</p>
            <p>Selected Category: {selectedCategory}</p>
            <p>Posts array length: {posts.length}</p>
          </div>
        )}
        

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <div className="mb-20">
            <h2 className="font-consciousness text-2xl font-bold text-white mb-8 text-center uppercase tracking-widest">Featured Insights</h2>
            <div className="w-full mx-auto">
              <Card 
                className="p-8 md:p-12 bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all cursor-grab active:cursor-grabbing select-none"
                ref={sliderRef}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
              >
                <div className="overflow-hidden">
                  <div 
                    className={`flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
                    style={{ 
                      transform: `translateX(${-currentFeaturedIndex * 100 + (isDragging ? (translateX / (sliderRef.current?.offsetWidth || 320)) * 100 : 0)}%)` 
                    }}
                  >
                    {featuredPosts.map((post) => (
                      <div key={post.id} className="w-full flex-shrink-0 flex flex-col">
                        {/* Badge */}
                        <div className="flex justify-center mb-8">
                          <Badge className="font-body text-[10px] uppercase tracking-widest px-3 py-1 bg-violet-600 text-white border-none rounded-full flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> FEATURED
                          </Badge>
                        </div>

                        {/* Content */}
                        <h3 className="font-consciousness text-2xl md:text-4xl font-bold text-white mb-6 text-center leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="font-body text-lg text-white/50 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                          {post.excerpt}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-center gap-8 text-[10px] font-body uppercase tracking-widest text-white/30 mb-10">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{parseLocalDate(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <Button 
                            className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-12 py-6 transition-all"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                          >
                            Read Article
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation bars */}
                {featuredPosts.length > 1 && (
                  <div className="flex mt-12 gap-2 max-w-xs mx-auto">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          index === currentFeaturedIndex 
                            ? "bg-violet-500"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <Card 
              key={post.id}
              className="p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-violet-500/30 transition-all group flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Badge className="mb-4 w-fit font-body text-[10px] uppercase tracking-widest px-2 py-0.5 border border-white/10 bg-white/5 text-white/40">
                {post.category}
              </Badge>
              
              <h3 className="font-consciousness text-base font-semibold text-white mb-3 group-hover:text-violet-300 transition-colors">
                {post.title}
              </h3>
              
              <p className="font-body text-sm text-white/50 mb-6 leading-relaxed flex-grow">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-[10px] font-body uppercase tracking-widest text-white/20 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{parseLocalDate(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <Button 
                className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-5 transition-all"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Blog;
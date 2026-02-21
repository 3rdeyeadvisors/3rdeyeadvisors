import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, LogIn, Search, Star } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { AuthModal } from "@/components/auth/AuthModal";
import PageHero from "@/components/PageHero";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import { ParticipantTracker } from "@/components/admin/ParticipantTracker";
import { usePresenceTracking } from "@/hooks/usePresenceTracking";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";
import { toast } from "sonner";
import { ANNUAL_BENEFITS } from "@/lib/constants";

const Courses = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const isPremiumMember = 
    subscription?.plan === 'annual' || 
    subscription?.plan === 'founding_33' ||
    subscription?.isFounder ||
    subscription?.isAdmin ||
    subscription?.isGrandfathered;

  // Track presence
  usePresenceTracking({
    contentType: 'course',
    contentId: 'courses-page',
    metadata: { activeFilter, searchQuery }
  });

  // Course data with early access dates
  // early_access_date: when annual subscribers can access
  // public_release_date: when all subscribers can access
  const rawCourses = [
    {
      id: 1,
      title: "DeFi Foundations: Understanding the New Financial System",
      description: "Learn why the traditional financial system leaves billions underserved and how decentralized finance offers a transparent alternative you control. Understand blockchain basics, explore key DeFi protocols like stablecoins and decentralized exchanges, and separate facts from hype. No prior crypto knowledge required to start your financial awakening journey.",
      category: "free",
      type: "course",
      duration: "2 hours",
      difficulty: "Beginner",
      rating: 4.8,
      students: 1234,
      modules: [
        "What is DeFi? (Simple explanation with comparisons to traditional banking)",
        "Why DeFi Exists (The problems it solves :  fees, middlemen, accessibility)",
        "The Blockchain Basics You Actually Need to Know (No tech overload)",
        "The Key Players (Stablecoins, DEXs, lending protocols :  explained simply)",
        "Risks and Myths (Separating facts from hype)"
      ],
      icon: BookOpen,
      offers: [],
      hasCourseInstance: true,
      early_access_date: null,
      public_release_date: null
    },
    {
      id: 2,
      title: "Staying Safe in DeFi: Wallets, Security, and Avoiding Scams",
      description: "Protect your digital assets from the scams, hacks, and costly mistakes that catch even experienced users off guard. Master wallet security fundamentals, learn to spot fake projects and phishing attacks, and build habits that safeguard your wealth. This course covers everything from seed phrase management to transaction verification.",
      category: "free",
      type: "course", 
      duration: "2.5 hours",
      difficulty: "Beginner",
      rating: 4.9,
      students: 987,
      modules: [
        "Choosing the Right Wallet (MetaMask, Trust Wallet, or Ledger?)",
        "Private Keys & Seed Phrases :  The Rule You Can't Break",
        "Spotting Scams and Fake Projects Before You Click",
        "Safe Transactions :  Sending, Receiving, and Testing Small First",
        "The Beginner's Checklist for DeFi Security"
      ],
      icon: BookOpen,
      offers: [],
      hasCourseInstance: true,
      early_access_date: null,
      public_release_date: null
    },
    {
      id: 3,
      title: "Earning with DeFi: Staking, Yield Farming, and Liquidity Pools Made Simple",
      description: "Discover how to generate passive income through staking, yield farming, and liquidity provision without relying on traditional banks or brokers. Learn the mechanics behind APY calculations, understand impermanent loss, and identify sustainable yield opportunities versus unsustainable token emissions. Start with beginner-friendly platforms and grow your strategy.",
      category: "free",
      type: "course",
      duration: "3 hours",
      difficulty: "Intermediate",
      rating: 4.7,
      students: 756,
      modules: [
        "How People Earn with DeFi (Overview)",
        "Staking vs Yield Farming :  Which is Better for You?",
        "What Are Liquidity Pools (Explained Without Confusion)",
        "How to Calculate Risk vs Reward Before You Invest",
        "Beginner-Friendly Platforms to Start With"
      ],
      icon: BookOpen,
      early_access_date: null,
      public_release_date: null
    },
    {
      id: 4,
      title: "Managing Your Own DeFi Portfolio: From Beginner to Confident User",
      description: "Build and manage a DeFi portfolio aligned with your personal financial goals, risk tolerance, and time horizon. Learn portfolio tracking tools, develop rebalancing strategies, and understand when to take profits versus reinvest. This course transforms scattered holdings into a coherent investment approach you fully control.",
      category: "free",
      type: "course",
      duration: "3.5 hours",
      difficulty: "Advanced",
      rating: 4.6,
      students: 543,
      modules: [
        "How to Build a Starter Portfolio (Even with $100)",
        "Tracking Your Investments (Best DeFi Portfolio Tools)",
        "When to Reinvest vs Take Profits",
        "Recognizing Market Trends Without Guessing",
        "Staying Consistent: The Long-Term DeFi Mindset"
      ],
      icon: BookOpen,
      early_access_date: null,
      public_release_date: null
    },
    {
      id: 5,
      title: "Understanding DeFi Vaults: Your Complete Guide to Managed Investing",
      description: "Access professional-grade investment strategies through DeFi vaults while maintaining full custody of your assets. Understand how vaults automate complex strategies, evaluate vault protocols like Enzyme and Yearn, and learn the security considerations before depositing. Includes a step-by-step guide to accessing the 3EA Vault.",
      category: "free",
      type: "course",
      duration: "2.5 hours",
      difficulty: "Intermediate",
      rating: 4.8,
      students: 412,
      modules: [
        "What Are DeFi Vaults? (Core Concepts and Key Terms)",
        "Major Vault Protocols Explained (Enzyme, Yearn, and More)",
        "Staying Safe with Vaults (Security and Red Flags)",
        "How to Choose the Right Vault for You",
        "Getting Access to the 3EA Vault (Step-by-Step Guide)"
      ],
      icon: BookOpen,
      early_access_date: null,
      public_release_date: null
    },
    {
      id: 6,
      title: "Tokenizing Real World Assets: From Traditional Finance to Blockchain",
      description: "Discover how blockchain technology is transforming real estate, treasuries, commodities, and infrastructure into tradeable digital tokens. Learn about fractional ownership, evaluate RWA protocols, and understand the regulatory landscape shaping the $30+ billion tokenization market. This course was created based on community voting through our Platform Roadmap.",
      category: "free",
      type: "course",
      duration: "2.5 hours",
      difficulty: "Intermediate",
      rating: 4.9,
      students: 0,
      modules: [
        "What is Asset Tokenization? (Core Concepts and Key Terms)",
        "Types of Real World Assets Being Tokenized (Treasuries, Real Estate, Commodities)",
        "How RWA Tokenization Actually Works (Smart Contracts, SPVs, Oracles)",
        "Evaluating RWA Investment Opportunities (Due Diligence and Risk Assessment)",
        "The Future of Tokenization and Getting Started (Market Trends and Safe Practices)"
      ],
      icon: BookOpen,
      early_access_date: "2026-01-31T00:00:00.000Z",
      public_release_date: "2026-02-07T00:00:00.000Z"
    }
  ];

  // Process courses to determine access based on subscription tier
  const courses = useMemo(() => {
    const now = new Date();
    
    return rawCourses.map(course => {
      // If no early access date, course is public to all
      if (!course.early_access_date) {
        return { ...course, isEarlyAccess: false, isLocked: false };
      }
      
      const earlyAccessDate = new Date(course.early_access_date);
      const publicReleaseDate = course.public_release_date 
        ? new Date(course.public_release_date)
        : new Date(earlyAccessDate.getTime() + (ANNUAL_BENEFITS.earlyAccessDays * 24 * 60 * 60 * 1000));
      
      // Course not yet available to anyone
      if (now < earlyAccessDate) {
        return {
          ...course,
          isEarlyAccess: false,
          isLocked: true,
          public_release_date: earlyAccessDate.toISOString()
        };
      }
      
      // In early access window (premium members only)
      if (now >= earlyAccessDate && now < publicReleaseDate) {
        return {
          ...course,
          isEarlyAccess: true,
          isLocked: !isPremiumMember,
          public_release_date: publicReleaseDate.toISOString()
        };
      }
      
      // Past public release date: available to all
      return { ...course, isEarlyAccess: false, isLocked: false };
    });
  }, [isPremiumMember]);

  const filters = [
    { id: "all", label: "All Courses" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" }
  ];

  const getFilteredCourses = () => {
    let filtered = courses;
    
    // Filter by difficulty
    if (activeFilter !== "all") {
      filtered = filtered.filter(course => 
        course.difficulty?.toLowerCase() === activeFilter
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  const handleStartCourse = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    // Reset filters on refresh
    setSearchQuery("");
    setActiveFilter("all");
    toast.success("Courses refreshed!");
  }, []);

  const { isRefreshing, pullDistance, isTriggered } = usePullToRefresh({
    onRefresh: handleRefresh
  });

  return (
    <>
      <SEO 
        title="DeFi Courses & Cryptocurrency Education: Learn Blockchain Investing"
        description="Comprehensive DeFi courses from beginner to advanced. Learn yield farming, staking, DeFi protocols, and passive income strategies. Free and paid courses available for cryptocurrency education."
        keywords="DeFi courses, cryptocurrency education, blockchain courses, yield farming course, DeFi beginner guide, crypto passive income, DeFi training, blockchain investing course"
        url="https://www.the3rdeyeadvisors.com/courses"
        schema={{
          type: 'Course',
          data: {
            provider: {
              "@type": "Organization",
               name: "3rdeyeadvisors",
               url: "https://www.the3rdeyeadvisors.com"
            },
            educationalLevel: "Beginner to Advanced",
            teaches: [
              "Decentralized Finance (DeFi)",
              "Yield Farming Strategies",
              "Cryptocurrency Investing",
              "Blockchain Technology",
              "Financial Independence"
            ],
            offers: {
              price: "0",
              priceCurrency: "USD"
            },
            hasCourseInstance: true,
            coursePrerequisites: "No prior experience required",
            timeRequired: "2 to 8 hours per course"
          }
        }}
        faq={[
          {
            question: "What DeFi courses do you offer?",
            answer: "We offer comprehensive DeFi courses ranging from beginner foundations to advanced protocol analysis. Topics include yield farming, staking, portfolio management, risk assessment, and safe DeFi practices."
          },
          {
            question: "Are your cryptocurrency courses suitable for beginners?",
            answer: "Yes! Our courses start with the absolute basics of blockchain and cryptocurrency, requiring no prior knowledge. We guide you step-by-step from understanding what DeFi is to implementing advanced strategies."
          },
          {
            question: "How can I earn passive income through DeFi?",
            answer: "Our courses teach multiple DeFi passive income strategies including yield farming (5 to 50% APY), liquidity providing, staking rewards, and DeFi lending protocols. Learn to safely navigate opportunities while managing risks."
          },
          {
            question: "Do you offer free DeFi education?",
            answer: "Yes, we provide free foundational courses covering DeFi basics, wallet setup, and essential security practices. Premium courses dive deeper into advanced strategies and portfolio management techniques."
          }
        ]}
      />
      <PullToRefreshIndicator 
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
      />
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Education"
          title="Master DeFi From the Ground Up"
          subtitle="Five structured courses that take you from complete beginner to confident DeFi participant. Start anywhere. Go at your own pace."
        />

        <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
          <div className="flex justify-center mb-8 -mt-4">
            <ParticipantTracker contentType="course" contentId="courses-page" />
          </div>
          <div className="flex justify-center mb-12">
            {!user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="font-body text-xs uppercase tracking-widest border-white/10 hover:border-violet-500/30 bg-white/5 px-6 py-6 rounded-xl flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Track Progress</span>
              </Button>
            ) : (
              <div className="text-center">
                <p className="font-body text-sm text-emerald-400 mb-2">Welcome back! Your progress is being tracked.</p>
                {isPremiumMember && (
                  <div className="flex items-center justify-center gap-2 text-violet-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-body uppercase tracking-widest">Premium Member: Early Access Enabled</span>
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-consciousness text-sm sm:text-base min-h-[48px]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`font-body text-xs uppercase tracking-widest px-6 py-2 rounded-full border transition-all ${
                activeFilter === filter.id
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "border-white/15 text-white/50 hover:border-violet-500/30 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onStartCourse={handleStartCourse}
                onAuthRequired={handleAuthRequired}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-consciousness font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground font-consciousness mb-4">
              Try adjusting your search or filter criteria
            </p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="font-consciousness"
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
        </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      </div>
    </>
  );
};

export default Courses;
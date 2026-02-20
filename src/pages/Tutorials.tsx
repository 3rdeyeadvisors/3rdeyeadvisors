import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Shield, TrendingUp, Calculator, AlertTriangle, Wallet, ArrowLeftRight, PieChart, Target, CheckCircle, BarChart3, Image, Users, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ParticipantTracker } from "@/components/admin/ParticipantTracker";
import { usePresenceTracking } from "@/hooks/usePresenceTracking";

const Tutorials = () => {
  // Read tab from URL parameter
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'immediate';
  const [selectedCategory, setSelectedCategory] = useState(initialTab);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Track presence
  usePresenceTracking({
    contentType: 'tutorial',
    contentId: 'tutorials-page',
    metadata: { selectedCategory }
  });

  useEffect(() => {
    // Load completed tutorials from localStorage
    const completed = localStorage.getItem('completedTutorials');
    if (completed) {
      setCompletedTutorials(JSON.parse(completed));
    }
  }, []);

  const videoCategories = {
    immediate: {
      title: "Immediate Impact",
      description: "Critical skills to protect yourself before you invest a single dollar",
      icon: Target,
      videos: [
        {
          id: "wallet-setup",
          title: "Wallet Setup & Security",
          description: "Complete guide to setting up MetaMask and securing your crypto wallet",
          duration: "8 min",
          difficulty: "Beginner",
          course: "Courses 1 & 2",
          steps: 6,
          icon: Wallet,
          priority: "High"
        },
        {
          id: "first-dex-swap",
          title: "Your First DEX Swap",
          description: "Step-by-step tutorial for making your first decentralized exchange trade",
          duration: "12 min",
          difficulty: "Beginner",
          course: "Course 1",
          steps: 8,
          icon: ArrowLeftRight,
          priority: "High"
        },
        {
          id: "defi-calculators",
          title: "Using DeFi Calculators",
          description: "Master the platform's yield and impermanent loss calculators",
          duration: "6 min",
          difficulty: "Beginner",
          course: "Platform Tools",
          steps: 4,
          icon: Calculator,
          priority: "High"
        },
        {
          id: "spotting-scams",
          title: "Spotting Scam Websites",
          description: "Visual guide to identifying and avoiding DeFi scams",
          duration: "10 min",
          difficulty: "Beginner",
          course: "Course 2",
          steps: 7,
          icon: AlertTriangle,
          priority: "Critical"
        }
      ]
    },
    practical: {
      title: "Practical DeFi Actions",
      description: "Real steps to grow your portfolio without relying on middlemen",
      icon: TrendingUp,
      videos: [
        {
          id: "yield-farming",
          title: "Yield Farming Step-by-Step",
          description: "Complete walkthrough of yield farming strategies and execution",
          duration: "15 min",
          difficulty: "Intermediate",
          course: "Course 3",
          steps: 10,
          icon: TrendingUp,
          priority: "Medium"
        },
        {
          id: "liquidity-pools",
          title: "Liquidity Pool Basics",
          description: "Understanding and participating in liquidity pools safely",
          duration: "12 min",
          difficulty: "Intermediate",
          course: "Course 3",
          steps: 8,
          icon: TrendingUp,
          priority: "Medium"
        },
        {
          id: "portfolio-tracking",
          title: "Portfolio Tracking Setup",
          description: "Set up comprehensive DeFi portfolio tracking and monitoring",
          duration: "9 min",
          difficulty: "Beginner",
          course: "Course 4",
          steps: 6,
          icon: PieChart,
          priority: "Medium"
        },
        {
          id: "risk-assessment",
          title: "Risk Assessment Walkthrough",
          description: "Practical guide to evaluating DeFi protocol risks",
          duration: "14 min",
          difficulty: "Advanced",
          course: "Course 4",
          steps: 9,
          icon: Shield,
          priority: "Medium"
        }
      ]
    },
    advanced: {
      title: "Advanced Topics",
      description: "Advanced tools for maximizing opportunities and minimizing risk",
      icon: BarChart3,
      videos: [
        {
          id: "chart-reading",
          title: "Chart Reading & Technical Analysis",
          description: "Master chart patterns, indicators, and technical analysis for DeFi trading",
          duration: "12 min",
          difficulty: "Intermediate",
          course: "Advanced Skills",
          steps: 6,
          icon: BarChart3,
          priority: "Medium"
        },
        {
          id: "nft-defi",
          title: "NFT & DeFi Integration",
          description: "Explore NFT lending, staking, and DeFi opportunities in the NFT space",
          duration: "11 min",
          difficulty: "Intermediate",
          course: "Advanced Skills",
          steps: 6,
          icon: Image,
          priority: "Medium"
        },
        {
          id: "dao-participation",
          title: "DAO Participation & Governance",
          description: "Learn how to participate in DAOs, vote on proposals, and shape protocol futures",
          duration: "10 min",
          difficulty: "Intermediate",
          course: "Advanced Skills",
          steps: 6,
          icon: Users,
          priority: "Medium"
        }
      ]
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-destructive/90";
      case "High": return "bg-accent/90";
      case "Medium": return "bg-primary/90";
      default: return "bg-muted-foreground/90";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "Intermediate": return "text-violet-400 border-violet-500/30 bg-violet-500/10";
      case "Advanced": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      default: return "text-white/40 border-white/15 bg-white/5";
    }
  };

  // Calculate total tutorials and completed count
  const totalTutorials = Object.values(videoCategories).reduce(
    (total, category) => total + category.videos.length,
    0
  );
  const completedCount = completedTutorials.length;
  const progressPercentage = (completedCount / totalTutorials) * 100;

  return (
    <>
      <SEO 
        title="DeFi Tutorials"
        description="Step-by-step tutorials covering DeFi, cryptocurrency, and blockchain education. Learn wallet setup, DEX trading, yield farming, and more."
        keywords="DeFi tutorials, crypto guides, blockchain education, DeFi how-to"
        url="https://the3rdeyeadvisors.com/tutorials"
        type="website"
      />
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Hands-On Learning"
          title="Learn by Doing"
          subtitle="Twelve hands-on tutorials that walk you through real DeFi actions. Follow along step by step and leave knowing exactly what you did and why."
        />

        <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
          <div className="flex justify-center mb-12 -mt-4">
            <ParticipantTracker contentType="tutorial" contentId="tutorials-page" />
          </div>

          {/* Progress Summary */}
          <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="font-consciousness text-lg font-bold text-white">Your Progress</h3>
                </div>
                <Badge className="font-body text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
                  {completedCount} of {totalTutorials} completed
                </Badge>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-violet-600 transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="font-body text-sm text-white/50">
                {completedCount === 0 && "Start your DeFi learning journey today!"}
                {completedCount > 0 && completedCount < totalTutorials && `Keep going! ${totalTutorials - completedCount} tutorial${totalTutorials - completedCount === 1 ? '' : 's'} remaining.`}
                {completedCount === totalTutorials && "Congratulations! You have completed all tutorials!"}
              </p>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
            <TabsList className="flex flex-wrap gap-3 w-full p-2 bg-white/5 rounded-2xl border border-white/8 justify-center mb-12">
              {Object.entries(videoCategories).map(([key, category]) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key} 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-body transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(videoCategories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <div className="mb-8">
                  <h2 className="font-consciousness text-2xl font-bold text-white mb-2">{category.title}</h2>
                  <p className="font-body text-white/50">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.videos.map((video) => {
                    const VideoIcon = video.icon;
                    const isCompleted = completedTutorials.includes(video.id);
                    return (
                      <Card key={video.id} className="relative bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group flex flex-col">
                        {/* Hover Gradient Border */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <CardHeader className="p-6 pb-4">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                              <VideoIcon className="h-5 w-5" />
                            </div>
                            {isCompleted && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-body text-[10px] uppercase tracking-widest px-2 py-0.5">
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="font-consciousness text-base font-bold text-white group-hover:text-violet-300 transition-colors mb-3">
                            {video.title}
                          </CardTitle>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${getDifficultyColor(video.difficulty)}`}>
                              {video.difficulty}
                            </Badge>
                            <Badge className="font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                              {video.priority}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                          <CardDescription className="font-body text-sm text-white/50 leading-relaxed mb-6">
                            {video.description}
                          </CardDescription>

                          <div className="flex items-center justify-between text-[10px] font-body uppercase tracking-widest text-white/30 mb-6">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {video.duration}</span>
                            <span>{video.steps} steps</span>
                          </div>

                          <Button 
                            className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all mt-auto"
                            onClick={() => {
                              const tutorialRoutes: { [key: string]: string } = {
                                "wallet-setup": "/tutorials/wallet-setup",
                                "first-dex-swap": "/tutorials/first-dex-swap",
                                "defi-calculators": "/tutorials/defi-calculators",
                                "spotting-scams": "/tutorials/spotting-scams",
                                "yield-farming": "/tutorials/advanced-defi-protocols",
                                "liquidity-pools": "/tutorials/liquidity-pools",
                                "portfolio-tracking": "/tutorials/portfolio-tracking",
                                "risk-assessment": "/tutorials/risk-assessment",
                                "chart-reading": "/tutorials/chart-reading",
                                "nft-defi": "/tutorials/nft-defi",
                                "dao-participation": "/tutorials/dao-participation"
                              };
                              const route = tutorialRoutes[video.id];
                              if (route) {
                                navigate(route);
                              } else {
                                toast({
                                  title: "Tutorial Not Available",
                                  description: "This tutorial is being prepared. Explore other tutorials in the meantime.",
                                });
                              }
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isCompleted ? "Review Tutorial" : "Start Tutorial"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Tutorials;
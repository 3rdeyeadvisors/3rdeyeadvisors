import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Shield, TrendingUp, Calculator, AlertTriangle, Wallet, ArrowLeftRight, PieChart, Target, CheckCircle, BarChart3, Image, Users } from "lucide-react";
import SEO from "@/components/SEO";
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
      case "Beginner": return "text-awareness bg-awareness/20";
      case "Intermediate": return "text-accent bg-accent/20";
      case "Advanced": return "text-primary-glow bg-primary/20";
      default: return "text-muted-foreground bg-muted/20";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-6 sm:px-8 py-12 md:py-16 lg:py-20">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Tutorials
              </h1>
              <ParticipantTracker contentType="tutorial" contentId="tutorials-page" />
            </div>
            <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
              Practical guides to protect your wealth, spot scams, and navigate DeFi with confidence
            </p>
          </div>

          {/* Progress Summary */}
          <Card className="mb-8 md:mb-10 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-awareness" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Your Progress</h3>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                  {completedCount} of {totalTutorials} completed
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-3" />
              <p className="text-sm text-foreground/70">
                {completedCount === 0 && "Start your DeFi learning journey today!"}
                {completedCount > 0 && completedCount < totalTutorials && `Keep going! ${totalTutorials - completedCount} tutorial${totalTutorials - completedCount === 1 ? '' : 's'} remaining.`}
                {completedCount === totalTutorials && "Congratulations! You have completed all tutorials!"}
              </p>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8 md:mb-10">
            <TabsList className="flex flex-wrap gap-2 w-full p-2 bg-card/60 rounded-lg border border-border justify-center mb-8 md:mb-10">
              {Object.entries(videoCategories).map(([key, category]) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key} 
                    className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-2 rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span>{category.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(videoCategories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">{category.title}</h2>
                  <p className="text-sm sm:text-base text-foreground/70">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {category.videos.map((video) => {
                    const VideoIcon = video.icon;
                    const isCompleted = completedTutorials.includes(video.id);
                    return (
                      <Card key={video.id} className={`group hover:shadow-cosmic transition-all duration-cosmic border bg-card/80 backdrop-blur-sm hover:bg-card h-full flex flex-col ${isCompleted ? 'border-awareness/50' : 'border-border/50 hover:border-primary/30'}`}>
                        <CardHeader className="pb-4">
                          {/* Icon and completion status row */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                              <VideoIcon className="h-6 w-6 text-primary" />
                            </div>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-awareness" />
                            )}
                          </div>
                          
                          {/* Title */}
                          <CardTitle className="text-lg text-card-foreground group-hover:text-primary transition-colors mb-3 text-left">
                            {video.title}
                          </CardTitle>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {isCompleted && (
                              <Badge variant="outline" className="text-xs font-medium bg-awareness/20 text-awareness border-awareness/30">
                                Completed
                              </Badge>
                            )}
                            <Badge 
                              variant="secondary" 
                              className={`text-xs font-medium ${getPriorityColor(video.priority)} text-foreground border-0`}
                            >
                              {video.priority}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${getDifficultyColor(video.difficulty)} border-0`}
                            >
                              {video.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 flex-1 flex flex-col">
                          <CardDescription className="mb-4 text-sm text-muted-foreground text-left">
                            {video.description}
                          </CardDescription>

                          <div className="flex items-center justify-between text-sm text-muted-foreground/80 mb-4 font-system flex-wrap gap-2">
                            <span>{video.duration}</span>
                            <span>{video.steps} steps</span>
                            <span className="text-primary/80 w-full sm:w-auto text-left sm:text-right">{video.course}</span>
                          </div>

                          <Button 
                            className="mt-auto w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all hover:shadow-cosmic border-primary/30"
                            variant="outline"
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
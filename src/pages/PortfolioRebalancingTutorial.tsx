import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Shield, 
  AlertTriangle,
  CheckCircle,
  Target,
  RefreshCw,
  Volume2,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Calculator,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const PortfolioRebalancingTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  const totalSteps = 5;

  // Collect all tutorial text content into one string for audio
  const getTutorialText = () => {
    return steps.map(step =>
      `${step.title}. ${step.content.overview || ''}`
    ).join(' ');
  };
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      id: 1,
      title: "Rebalancing Fundamentals",
      icon: BarChart3,
      duration: "4 min",
      content: {
        overview: "Understand why and when to rebalance your DeFi portfolio for optimal performance.",
        whyRebalance: {
          definition: "Systematically adjusting portfolio allocations back to target weights",
          purpose: "Maintain desired risk profile and capture market inefficiencies",
          benefits: ["Risk control", "Profit taking", "Disciplined investing", "Compound growth"]
        },
        rebalancingTriggers: [
          {
            trigger: "Time-Based",
            frequency: "Monthly/Quarterly",
            description: "Rebalance on fixed schedule regardless of performance",
            pros: ["Simple", "Disciplined", "Predictable"],
            cons: ["May miss opportunities", "Ignores market conditions"],
            bestFor: "Conservative investors, busy schedules"
          },
          {
            trigger: "Threshold-Based",
            frequency: "When deviation >5 to 10%",
            description: "Rebalance when allocations drift beyond target ranges",
            pros: ["Responsive", "Captures volatility", "Flexible"],
            cons: ["More complex", "Potential overtrading"],
            bestFor: "Active investors, volatile markets"
          },
          {
            trigger: "Hybrid Approach",
            frequency: "Monthly check + 10% threshold",
            description: "Combine time and threshold triggers",
            pros: ["Balanced approach", "Captures both benefits"],
            cons: ["Most complex to implement"],
            bestFor: "Sophisticated investors"
          }
        ],
        portfolioTypes: [
          {
            type: "Conservative DeFi",
            allocation: "60% Stablecoins, 30% ETH/BTC, 10% Blue-chip DeFi",
            rebalanceFreq: "Quarterly",
            riskLevel: "Low",
            targetAPY: "5 to 12%"
          },
          {
            type: "Balanced DeFi",
            allocation: "40% Stablecoins, 40% Major crypto, 20% DeFi protocols",
            rebalanceFreq: "Monthly",
            riskLevel: "Medium",
            targetAPY: "8 to 20%"
          },
          {
            type: "Aggressive DeFi",
            allocation: "20% Stablecoins, 30% Major crypto, 50% DeFi strategies",
            rebalanceFreq: "Bi-weekly",
            riskLevel: "High",
            targetAPY: "15 to 50%"
          }
        ]
      }
    },
    {
      id: 2,
      title: "Rebalancing Strategies",
      icon: Target,
      duration: "5 min",
      content: {
        overview: "Learn different rebalancing approaches and when to use each strategy.",
        strategies: [
          {
            strategy: "Equal Weight Rebalancing",
            description: "Maintain equal allocation across all positions",
            example: "4 tokens = 25% each, rebalance back to 25% when drift occurs",
            advantages: ["Simple to implement", "Diversification benefits", "Momentum capture"],
            disadvantages: ["May overweight poor performers", "Ignores fundamentals"],
            gasEfficiency: "Medium",
            bestMarkets: "Sideways/choppy markets"
          },
          {
            strategy: "Market Cap Weighted",
            description: "Weight allocations based on market capitalization",
            example: "ETH 40%, BTC 30%, others by market cap",
            advantages: ["Follows market consensus", "Natural momentum", "Lower turnover"],
            disadvantages: ["Concentration risk", "Bubble risk", "Less diversification"],
            gasEfficiency: "High",
            bestMarkets: "Bull markets with clear leaders"
          },
          {
            strategy: "Constant Proportion (CPPI)",
            description: "Dynamically adjust risk based on portfolio value",
            example: "Risk budget = (Portfolio Value - Floor) × Multiplier",
            advantages: ["Risk control", "Downside protection", "Upside participation"],
            disadvantages: ["Complex implementation", "May miss rallies"],
            gasEfficiency: "Low",
            bestMarkets: "Volatile markets with trend changes"
          },
          {
            strategy: "Volatility-Based",
            description: "Allocate inversely to volatility (lower vol = higher weight)",
            example: "Lower volatile assets get higher allocation",
            advantages: ["Risk-adjusted returns", "Stability", "Smooth performance"],
            disadvantages: ["May miss explosive growth", "Complex calculation"],
            gasEfficiency: "Medium",
            bestMarkets: "High volatility environments"
          }
        ],
        taxConsiderations: [
          {
            consideration: "Tax Loss Harvesting",
            description: "Realize losses to offset gains during rebalancing",
            implementation: "Prioritize selling losers before winners",
            timing: "End of tax year",
            benefit: "Reduce tax liability"
          },
          {
            consideration: "Long-term vs Short-term",
            description: "Consider holding periods for tax treatment",
            implementation: "Hold positions >1 year when possible",
            timing: "Throughout the year",
            benefit: "Lower capital gains rates"
          },
          {
            consideration: "Wash Sale Rules",
            description: "Avoid repurchasing identical assets within 30 days",
            implementation: "Use similar but different assets",
            timing: "When realizing losses",
            benefit: "Maintain tax loss benefits"
          }
        ],
        costOptimization: [
          {
            method: "Batch Transactions",
            description: "Combine multiple rebalancing trades",
            gasSavings: "50 to 80%",
            tools: ["1inch", "Paraswap", "Zapper"]
          },
          {
            method: "Use Cash Flows",
            description: "Direct new deposits to underweight assets",
            gasSavings: "100% (no trades needed)",
            tools: ["Dollar-cost averaging", "Salary allocation"]
          },
          {
            method: "Layer 2 Execution",
            description: "Execute frequent rebalancing on cheaper chains",
            gasSavings: "90 to 99%",
            tools: ["Polygon", "Arbitrum", "Optimism"]
          }
        ]
      }
    },
    {
      id: 3,
      title: "Implementation Process",
      icon: RefreshCw,
      duration: "6 min",
      content: {
        overview: "Step-by-step process for executing portfolio rebalancing safely and efficiently.",
        preparationPhase: [
          {
            step: "Portfolio Analysis",
            description: "Assess current allocations vs targets",
            tools: ["Zapper", "DeBank", "Zerion", "Custom spreadsheets"],
            timeRequired: "15 to 30 minutes",
            actions: [
              "Export current portfolio data",
              "Calculate actual vs target allocations",
              "Identify largest deviations",
              "Assess overall portfolio health"
            ]
          },
          {
            step: "Market Assessment",
            description: "Evaluate current market conditions",
            tools: ["CoinGecko", "DeFiPulse", "Fear & Greed Index"],
            timeRequired: "10 to 15 minutes",
            actions: [
              "Check overall market sentiment",
              "Review individual asset performance",
              "Assess gas fee environment",
              "Check for major news/events"
            ]
          },
          {
            step: "Gas Optimization",
            description: "Plan transactions for minimal costs",
            tools: ["ETH Gas Station", "GasNow", "Blocknative"],
            timeRequired: "5 to 10 minutes",
            actions: [
              "Check current gas prices",
              "Identify optimal transaction timing",
              "Plan transaction batching",
              "Consider L2 alternatives"
            ]
          }
        ],
        executionPhase: [
          {
            phase: "Pre-execution Checks",
            duration: "5 minutes",
            checklist: [
              "Verify all wallet connections",
              "Confirm sufficient gas tokens",
              "Review slippage settings",
              "Check for active approvals",
              "Backup transaction parameters"
            ]
          },
          {
            phase: "Trade Execution",
            duration: "15 to 45 minutes",
            process: [
              "Start with largest deviations",
              "Execute sells before buys",
              "Monitor slippage carefully",
              "Batch compatible transactions",
              "Save all transaction hashes"
            ]
          },
          {
            phase: "Verification",
            duration: "10 minutes",
            validation: [
              "Confirm all transactions succeeded",
              "Verify new portfolio allocations",
              "Check for dust amounts",
              "Update portfolio tracking",
              "Document any issues"
            ]
          }
        ],
        troubleshooting: [
          {
            issue: "High Slippage",
            causes: ["Low liquidity", "Large trade size", "Volatile markets"],
            solutions: [
              "Split large trades into smaller chunks",
              "Use limit orders when available",
              "Try different DEXes",
              "Wait for better market conditions"
            ]
          },
          {
            issue: "Failed Transactions",
            causes: ["Insufficient gas", "Price movement", "Contract issues"],
            solutions: [
              "Increase gas price",
              "Refresh price quotes",
              "Check contract status",
              "Try alternative routes"
            ]
          },
          {
            issue: "Partial Fills",
            causes: ["MEV attacks", "Liquidity constraints", "Timing issues"],
            solutions: [
              "Use MEV protection",
              "Adjust slippage tolerance",
              "Complete remaining trades",
              "Consider different timing"
            ]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Advanced Techniques",
      icon: Zap,
      duration: "5 min",
      content: {
        overview: "Sophisticated rebalancing techniques for experienced DeFi investors.",
        advancedMethods: [
          {
            technique: "Dynamic Rebalancing",
            description: "Adjust rebalancing frequency based on market volatility",
            implementation: "Increase frequency during high volatility periods",
            complexity: "High",
            benefits: ["Better risk management", "Improved returns", "Adaptive approach"],
            requirements: ["Volatility tracking", "Automated systems", "Gas optimization"]
          },
          {
            technique: "Options-Based Rebalancing",
            description: "Use options to synthetically rebalance without selling",
            implementation: "Buy/sell options to adjust delta exposure",
            complexity: "Very High",
            benefits: ["Tax efficiency", "Lower costs", "Instant adjustment"],
            requirements: ["Options knowledge", "Liquid markets", "Margin accounts"]
          },
          {
            technique: "Cross-Chain Rebalancing",
            description: "Rebalance across multiple blockchain networks",
            implementation: "Move assets between chains for optimal allocation",
            complexity: "High",
            benefits: ["Better opportunities", "Cost optimization", "Diversification"],
            requirements: ["Bridge knowledge", "Multi-chain tracking", "Security awareness"]
          },
          {
            technique: "Yield-Aware Rebalancing",
            description: "Consider yield opportunities in allocation decisions",
            implementation: "Overweight assets with attractive yield opportunities",
            complexity: "Medium",
            benefits: ["Enhanced returns", "Opportunity capture", "Efficient capital use"],
            requirements: ["Yield tracking", "Risk assessment", "Regular monitoring"]
          }
        ],
        automationTools: [
          {
            tool: "DeFiSaver Automation",
            features: ["Automated rebalancing", "Health factor protection", "Custom triggers"],
            costs: "Gas + small protocol fee",
            complexity: "Medium",
            reliability: "High"
          },
          {
            tool: "Gelato Network",
            features: ["Custom automation", "Cross-chain execution", "Flexible triggers"],
            costs: "Gas + execution fee",
            complexity: "High",
            reliability: "High"
          },
          {
            tool: "Yearn Strategies",
            features: ["Professional management", "Automated optimization", "Gas efficiency"],
            costs: "Management + performance fees",
            complexity: "Low",
            reliability: "High"
          },
          {
            tool: "Custom Smart Contracts",
            features: ["Full customization", "Optimal efficiency", "Complete control"],
            costs: "Development + gas",
            complexity: "Very High",
            reliability: "Variable"
          }
        ],
        riskMitigation: [
          {
            risk: "Execution Risk",
            description: "Risk of poor execution during rebalancing",
            mitigation: ["Use limit orders", "Monitor markets", "Split large trades"],
            monitoring: "Real-time price tracking during execution"
          },
          {
            risk: "Timing Risk",
            description: "Risk of rebalancing at poor market timing",
            mitigation: ["Systematic approach", "Avoid emotion", "Dollar-cost average"],
            monitoring: "Performance attribution analysis"
          },
          {
            risk: "Gas Cost Risk",
            description: "High gas costs eating into returns",
            mitigation: ["Gas optimization", "L2 usage", "Batch transactions"],
            monitoring: "Gas cost tracking vs returns"
          }
        ]
      }
    },
    {
      id: 5,
      title: "Performance Monitoring",
      icon: TrendingUp,
      duration: "4 min",
      content: {
        overview: "Track and analyze the effectiveness of your rebalancing strategy.",
        keyMetrics: [
          {
            metric: "Rebalancing Alpha",
            description: "Excess return attributed to rebalancing",
            calculation: "Portfolio Return - Buy & Hold Return",
            target: "Positive over rolling 12-month periods",
            interpretation: "Higher values indicate effective rebalancing"
          },
          {
            metric: "Turnover Rate",
            description: "Frequency of portfolio changes",
            calculation: "Sum of |Trades| / Average Portfolio Value",
            target: "10 to 50% annually depending on strategy",
            interpretation: "Balance between responsiveness and costs"
          },
          {
            metric: "Sharpe Ratio",
            description: "Risk-adjusted returns",
            calculation: "(Return - Risk-Free Rate) / Standard Deviation",
            target: "Greater than 1.0 for good performance",
            interpretation: "Higher values indicate better risk-adjusted performance"
          },
          {
            metric: "Maximum Drawdown",
            description: "Largest peak-to-trough decline",
            calculation: "Max((Peak - Trough) / Peak)",
            target: "Less than 20% for moderate risk strategies",
            interpretation: "Lower values indicate better downside protection"
          }
        ],
        benchmarking: [
          {
            benchmark: "Buy & Hold",
            description: "Static allocation without rebalancing",
            useCase: "Measure rebalancing effectiveness",
            calculation: "Same initial allocation held constant"
          },
          {
            benchmark: "Market Cap Weighted",
            description: "Follow market cap changes passively",
            useCase: "Compare to passive indexing",
            calculation: "Weight by market capitalization"
          },
          {
            benchmark: "DeFi Indices",
            description: "Compare to established DeFi index funds",
            useCase: "Relative performance assessment",
            calculation: "Track DeFi Pulse Index or similar"
          }
        ],
        reviewProcess: [
          {
            frequency: "Monthly",
            focus: "Tactical adjustments",
            activities: [
              "Review allocation drift",
              "Assess market conditions",
              "Execute rebalancing if needed",
              "Track performance metrics",
              "Document lessons learned"
            ]
          },
          {
            frequency: "Quarterly",
            focus: "Strategic review",
            activities: [
              "Comprehensive performance analysis",
              "Benchmark comparison",
              "Strategy effectiveness assessment",
              "Risk profile evaluation",
              "Potential strategy adjustments"
            ]
          },
          {
            frequency: "Annually",
            focus: "Full strategy review",
            activities: [
              "Complete performance attribution",
              "Tax optimization review",
              "Strategy comparison analysis",
              "Risk tolerance reassessment",
              "Major strategy changes if needed"
            ]
          }
        ],
        optimizationSignals: [
          {
            signal: "Consistent Underperformance",
            threshold: "3+ months below benchmark",
            action: "Review strategy parameters and market fit"
          },
          {
            signal: "Excessive Trading Costs",
            threshold: "Gas costs >2% of portfolio annually",
            action: "Optimize execution or reduce frequency"
          },
          {
            signal: "High Volatility",
            threshold: "Portfolio volatility >150% of benchmark",
            action: "Consider risk reduction or different approach"
          },
          {
            signal: "Missed Opportunities",
            threshold: "Frequent late rebalancing",
            action: "Improve monitoring or automate execution"
          }
        ]
      }
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to progress through the tutorial", variant: "destructive" });
      return;
    }
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Save completion to localStorage
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes('portfolio-rebalancing')) {
        completed.push('portfolio-rebalancing');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "Excellent! You've learned portfolio rebalancing strategies.",
      });
      setTimeout(() => {
        window.location.href = "/tutorials?tab=practical";
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to navigate the tutorial", variant: "destructive" });
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to track your progress", variant: "destructive" });
      return;
    }
    setCompletedSteps(prev => [...prev, currentStep]);
    toast({
      title: "Step completed!",
      description: `You've completed step ${currentStep}: ${currentStepData?.title}`,
    });
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 mobile-typography-center">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/tutorials?tab=practical">
            <Button variant="ghost" className="gap-2 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4" />
              Back to Practical DeFi Actions
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Portfolio Rebalancing Techniques</h1>
              <p className="text-white/50">Master systematic portfolio optimization strategies</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex justify-end mb-4 px-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'Portfolio Rebalancing Tutorial')}
            className="flex items-center gap-2 font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-3 py-2"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen to this tutorial
          </button>
        </div>

        {/* Sign-in Alert Banner */}
        {!user && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>Sign in to track your progress and interact with tutorial steps</span>
              <Button size="sm" onClick={() => navigate('/auth')} className="shrink-0">
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const completed = isStepCompleted(step.id);
            const current = step.id === currentStep;
            
            return (
              <Button
                key={step.id}
                variant={current ? "default" : completed ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  if (!user) {
                    toast({ title: "Sign in required", description: "Please sign in to navigate the tutorial", variant: "destructive" });
                    return;
                  }
                  setCurrentStep(step.id);
                }}
                disabled={!user && step.id !== 1}
                className={`flex items-center gap-2 ${completed ? "bg-success/10 text-success hover:bg-success/20 border-success" : ""}`}
              >
                <StepIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
                {completed && <CheckCircle className="h-3 w-3" />}
              </Button>
            );
          })}
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <Card className="mb-8">
            <CardHeader className="p-3 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <currentStepData.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-xl">{currentStepData.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Estimated time: {currentStepData.duration}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={isStepCompleted(currentStep) ? "default" : "secondary"} className="w-fit text-xs">
                  {isStepCompleted(currentStep) ? "Completed" : "In Progress"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
              <p className="text-white/50 text-sm md:text-base">{currentStepData.content.overview}</p>

              {/* Render Step-Specific Content */}
              {currentStep === 1 && currentStepData.content.whyRebalance && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <strong>Why Rebalance?</strong> {currentStepData.content.whyRebalance.purpose}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {currentStepData.content.rebalancingTriggers.map((trigger, idx) => (
                      <Card key={idx}>
                        <CardHeader className="p-3 md:p-6">
                          <CardTitle className="text-sm md:text-base">{trigger.trigger}</CardTitle>
                          <CardDescription className="text-xs">{trigger.frequency}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs md:text-sm p-3 md:p-6 pt-0">
                          <p>{trigger.description}</p>
                          <p className="text-xs text-white/50">Best for: {trigger.bestFor}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Portfolio Types</h4>
                    {currentStepData.content.portfolioTypes.map((portfolio, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-3 md:pt-4 p-3 md:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h5 className="font-semibold text-sm md:text-base">{portfolio.type}</h5>
                            <Badge className="w-fit text-xs" variant={portfolio.riskLevel === "Low" ? "default" : portfolio.riskLevel === "Medium" ? "secondary" : "destructive"}>
                              {portfolio.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-white/50 mb-2">{portfolio.allocation}</p>
                          <div className="flex flex-wrap gap-2 md:gap-4 text-xs">
                            <span>Frequency: {portfolio.rebalanceFreq}</span>
                            <span>Target: {portfolio.targetAPY}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && currentStepData.content.strategies && (
                <div className="space-y-4">
                  {currentStepData.content.strategies.map((strategy, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base">{strategy.strategy}</CardTitle>
                        <CardDescription>{strategy.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="italic">Example: {strategy.example}</p>
                        <div className="grid md:grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="font-semibold text-xs mb-1">Advantages:</p>
                            <ul className="text-xs space-y-1 text-white/50">
                              {strategy.advantages.map((adv, i) => <li key={i}>• {adv}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-xs mb-1">Disadvantages:</p>
                            <ul className="text-xs space-y-1 text-white/50">
                              {strategy.disadvantages.map((dis, i) => <li key={i}>• {dis}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs pt-2 border-t">
                          <Badge variant="outline">Gas: {strategy.gasEfficiency}</Badge>
                          <span className="text-white/50">{strategy.bestMarkets}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 3 && currentStepData.content.preparationPhase && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Preparation Phase</h4>
                  {currentStepData.content.preparationPhase.map((phase, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {phase.step}
                        </CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex gap-2 text-xs text-white/50">
                          <Clock className="h-3 w-3" />
                          {phase.timeRequired}
                        </div>
                        <ul className="space-y-1 text-xs">
                          {phase.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}

                  <h4 className="font-semibold mt-6">Troubleshooting Common Issues</h4>
                  {currentStepData.content.troubleshooting.map((issue, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-awareness" />
                          {issue.issue}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-xs text-white/50">Causes: {issue.causes.join(", ")}</p>
                        <div>
                          <p className="text-xs font-semibold mb-1">Solutions:</p>
                          <ul className="space-y-1 text-xs">
                            {issue.solutions.map((sol, i) => <li key={i}>• {sol}</li>)}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 4 && currentStepData.content.advancedMethods && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Advanced Rebalancing Techniques</h4>
                  {currentStepData.content.advancedMethods.map((method, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{method.technique}</CardTitle>
                          <Badge variant="secondary">{method.complexity}</Badge>
                        </div>
                        <CardDescription>{method.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-xs">Implementation: {method.implementation}</p>
                        <div>
                          <p className="text-xs font-semibold mb-1">Benefits:</p>
                          <div className="flex flex-wrap gap-2">
                            {method.benefits.map((benefit, i) => (
                              <Badge key={i} variant="outline">{benefit}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <h4 className="font-semibold mt-6">Automation Tools</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentStepData.content.automationTools.map((tool, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-sm">{tool.tool}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <p><strong>Cost:</strong> {tool.costs}</p>
                          <p><strong>Complexity:</strong> {tool.complexity}</p>
                          <p><strong>Reliability:</strong> {tool.reliability}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && currentStepData.content.keyMetrics && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Key Performance Metrics</h4>
                  {currentStepData.content.keyMetrics.map((metric, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          {metric.metric}
                        </CardTitle>
                        <CardDescription>{metric.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p className="text-xs"><strong>Calculation:</strong> {metric.calculation}</p>
                        <p className="text-xs"><strong>Target:</strong> {metric.target}</p>
                        <p className="text-xs text-white/50">{metric.interpretation}</p>
                      </CardContent>
                    </Card>
                  ))}

                  <h4 className="font-semibold mt-6">Benchmarking</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {currentStepData.content.benchmarking.map((benchmark, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-sm">{benchmark.benchmark}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                          <p>{benchmark.description}</p>
                          <p className="text-white/50">{benchmark.useCase}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {!isStepCompleted(currentStep) && (
                    <Button
                      variant="secondary"
                      onClick={handleStepComplete}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                  >
                    {currentStep === totalSteps ? "Finish Tutorial" : "Next Step"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {completedSteps.length === totalSteps && (
          <Card className="bg-awareness/10 border-awareness/20">
            <CardHeader>
              <CardTitle className="text-awareness flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Portfolio Rebalancing Mastery Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                You now understand systematic portfolio rebalancing and can optimize your DeFi investments effectively!
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/tutorials">Back to Tutorials</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/courses">Continue Learning</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {audioOpen && (
        <AudioPlayer
          text={audioText}
          title={audioTitle}
          onClose={closeAudio}
        />
      )}
    </div>
  );
};

export default PortfolioRebalancingTutorial;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  ArrowRight,
  Droplets,
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Shield,
  Calculator,
  Zap,
  Target,
  Lock,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const LiquidityPoolBasicsTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  const totalSteps = 8;

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
      title: "What Are Liquidity Pools?",
      icon: Droplets,
      duration: "3 min",
      content: {
        overview: "Liquidity pools are the backbone of DeFi trading. Learn how they enable decentralized exchanges to function without traditional order books.",
        definition: {
          simple: "A liquidity pool is a collection of tokens locked in a smart contract that traders can swap against.",
          technical: "Automated Market Maker (AMM) pools use mathematical formulas to price assets and enable instant swaps without counterparties.",
          analogy: "Think of it like a community fund where everyone deposits money, and anyone can exchange currencies instantly at rates determined by supply and demand."
        },
        keyComponents: [
          {
            component: "Token Pairs",
            description: "Pools always contain two tokens (e.g., ETH/USDC)",
            example: "50% ETH + 50% USDC by value"
          },
          {
            component: "Liquidity Providers (LPs)",
            description: "Users who deposit tokens into the pool",
            example: "You deposit $1000 ETH + $1000 USDC"
          },
          {
            component: "LP Tokens",
            description: "Receipt tokens representing your share of the pool",
            example: "Receive LP tokens = proof of your deposit"
          },
          {
            component: "Trading Fees",
            description: "Fees collected from traders (typically 0.3%)",
            example: "Every swap pays 0.3% to LPs"
          }
        ],
        howItWorks: {
          step1: "Users deposit equal value of both tokens",
          step2: "Smart contract mints LP tokens representing your share",
          step3: "Traders swap tokens directly with the pool",
          step4: "Trading fees accumulate in the pool",
          step5: "LPs earn proportional fees on all trades",
          step6: "Withdraw anytime by burning LP tokens"
        }
      }
    },
    {
      id: 2,
      title: "Pool Mathematics & Pricing",
      icon: Calculator,
      duration: "4 min",
      content: {
        overview: "Understanding how AMMs price assets is crucial for liquidity provision.",
        constantProduct: {
          formula: "x × y = k (constant)",
          meaning: "Token A amount × Token B amount = constant value",
          example: "1000 ETH × 2,000,000 USDC = 2,000,000,000 (k)"
        },
        priceCalculation: [
          {
            scenario: "Initial Pool State",
            ethAmount: "1000 ETH",
            usdcAmount: "2,000,000 USDC",
            ethPrice: "$2,000 per ETH",
            calculation: "Price = USDC / ETH = 2,000,000 / 1,000"
          },
          {
            scenario: "After Someone Buys 10 ETH",
            ethAmount: "990 ETH",
            usdcAmount: "2,020,202 USDC",
            ethPrice: "$2,040.61 per ETH",
            calculation: "Price increased due to reduced ETH supply"
          }
        ],
        slippage: {
          definition: "Price impact from your trade size",
          smallTrade: "Buying 1 ETH = 0.1% slippage (minimal impact)",
          largeTrade: "Buying 100 ETH = 10%+ slippage (major impact)",
          rule: "Bigger trades = higher slippage = worse prices"
        }
      }
    },
    {
      id: 3,
      title: "Impermanent Loss Explained",
      icon: AlertTriangle,
      duration: "5 min",
      content: {
        overview: "Impermanent loss is the #1 risk for liquidity providers. Understanding it is critical before depositing funds.",
        whatIsIt: {
          simple: "Loss compared to just holding your tokens",
          technical: "Opportunity cost from price divergence between pool tokens",
          whenHappens: "When token prices move in opposite directions"
        },
        examples: [
          {
            scenario: "No Price Change",
            initial: "Deposit: 1 ETH ($2,000) + 2,000 USDC",
            final: "Withdraw: 1 ETH ($2,000) + 2,000 USDC",
            holdValue: "$4,000",
            poolValue: "$4,000 + fees",
            result: "✅ Profit from fees, no IL"
          },
          {
            scenario: "ETH Doubles (+100%)",
            initial: "Deposit: 1 ETH ($2,000) + 2,000 USDC",
            final: "Withdraw: 0.707 ETH ($2,828) + 2,828 USDC",
            holdValue: "$6,000 (1 ETH at $4,000 + 2,000 USDC)",
            poolValue: "$5,656 + fees",
            result: "⚠️ 5.7% IL ($344 loss vs holding)"
          },
          {
            scenario: "ETH Triples (+200%)",
            initial: "Deposit: 1 ETH ($2,000) + 2,000 USDC",
            final: "Withdraw: 0.577 ETH ($3,464) + 3,464 USDC",
            holdValue: "$8,000 (1 ETH at $6,000 + 2,000 USDC)",
            poolValue: "$6,928 + fees",
            result: "⚠️ 13.4% IL ($1,072 loss vs holding)"
          }
        ],
        ilByPriceChange: [
          { priceChange: "1.25x", ilPercent: "0.6%" },
          { priceChange: "1.5x", ilPercent: "2.0%" },
          { priceChange: "2x", ilPercent: "5.7%" },
          { priceChange: "3x", ilPercent: "13.4%" },
          { priceChange: "5x", ilPercent: "25.5%" }
        ],
        mitigation: [
          "Provide liquidity to stable pairs (stablecoin pairs have minimal IL)",
          "Choose pools with high trading volume (fees offset IL faster)",
          "Use correlated pairs (ETH/wBTC moves together)",
          "Accept IL if APY exceeds expected price divergence",
          "Monitor positions and exit if divergence accelerates"
        ]
      }
    },
    {
      id: 4,
      title: "Choosing the Right Pool",
      icon: Target,
      duration: "4 min",
      content: {
        overview: "Not all pools are equal. Learn to evaluate and select pools that match your risk tolerance and goals.",
        poolCategories: [
          {
            category: "Stablecoin Pools",
            examples: "USDC/USDT, DAI/USDC",
            ilRisk: "Minimal ( 0 to 0.1%)",
            apyRange: "5 to 15%",
            bestFor: "Risk-averse, stable income",
            considerations: ["Very low IL", "Lower APY", "High stability", "Great for beginners"]
          },
          {
            category: "Correlated Asset Pools",
            examples: "ETH/wBTC, ETH/stETH",
            ilRisk: "Low (1 to 5%)",
            apyRange: "10 to 25%",
            bestFor: "Moderate risk tolerance",
            considerations: ["Assets move together", "Reduced IL", "Moderate APY", "Good balance"]
          },
          {
            category: "Volatile Pairs",
            examples: "ETH/USDC, MATIC/USDT",
            ilRisk: "High (10 to 50%+)",
            apyRange: "20 to 100%+",
            bestFor: "High risk tolerance, active management",
            considerations: ["High IL potential", "High APY", "Requires monitoring", "Best for trending markets"]
          },
          {
            category: "Exotic/New Token Pools",
            examples: "NewToken/ETH",
            ilRisk: "Extreme (50 to 100%+)",
            apyRange: "50 to 1000%+",
            bestFor: "Speculators, very high risk appetite",
            considerations: ["Extreme IL risk", "Massive APY potential", "High rug risk", "Only with money you can lose"]
          }
        ],
        evaluationCriteria: [
          {
            criterion: "Total Value Locked (TVL)",
            importance: "High",
            whatToLookFor: "Higher TVL = more liquidity, less slippage",
            redFlag: "TVL < $100k (may be illiquid)"
          },
          {
            criterion: "24h Volume",
            importance: "High",
            whatToLookFor: "CRITICAL: 24h Volume >= TVL. Ratio > 1.0 is ideal.",
            redFlag: "Volume < TVL = Fees often won't offset Impermanent Loss"
          },
          {
            criterion: "APY/APR",
            importance: "Medium",
            whatToLookFor: "Realistic returns (15 to 50% for established pairs)",
            redFlag: "APY > 500% often unsustainable"
          },
          {
            criterion: "Pool Age",
            importance: "Medium",
            whatToLookFor: "Established pools (3+ months) are safer",
            redFlag: "Brand new pools may be scams"
          }
        ]
      }
    },
    {
      id: 5,
      title: "Step-by-Step: Adding Liquidity",
      icon: Zap,
      duration: "5 min",
      content: {
        overview: "Complete walkthrough of depositing into a liquidity pool on Uniswap (similar process for all DEXs).",
        prerequisites: [
          "Wallet with sufficient tokens for both sides of the pair",
          "Extra ETH for gas fees (~$5 to 50 depending on network)",
          "Pool research completed (TVL, APY, IL risk assessed)"
        ],
        steps: [
          {
            step: 1,
            action: "Connect Wallet",
            details: "Visit Uniswap.org → Click 'Pool' tab → Connect MetaMask",
            time: "30 seconds"
          },
          {
            step: 2,
            action: "Select Token Pair",
            details: "Click 'New Position' → Choose tokens (e.g., ETH/USDC) → Select fee tier",
            feeTiers: [
              { tier: "0.05%", bestFor: "Stablecoin pairs" },
              { tier: "0.3%", bestFor: "Most common pairs (default)" },
              { tier: "1%", bestFor: "Exotic/volatile pairs" }
            ],
            time: "1 minute"
          },
          {
            step: 3,
            action: "Set Price Range (V3 only)",
            details: "Full range (simple) or concentrated range (advanced)",
            options: [
              {
                option: "Full Range",
                description: "Liquidity active at all prices",
                pros: "Set and forget, no management",
                cons: "Lower capital efficiency"
              },
              {
                option: "Concentrated Range",
                description: "Liquidity only within specific price range",
                pros: "10 to 50x higher fees in range",
                cons: "Goes inactive outside range, needs monitoring"
              }
            ],
            recommendation: "Start with full range until you understand V3 mechanics",
            time: "2 minutes"
          },
          {
            step: 4,
            action: "Enter Deposit Amounts",
            details: "Enter amount for one token, other auto-calculates to maintain 50/50 ratio",
            example: "Enter 1 ETH → Auto-fills ~$2,000 USDC (at current price)",
            time: "30 seconds"
          },
          {
            step: 5,
            action: "Approve Tokens",
            details: "Two approval transactions (one per token) if first time",
            gasNote: "Each approval costs gas (~$5 to 20)",
            tip: "Approve 'unlimited' to avoid future approval fees",
            time: "2 to 3 minutes"
          },
          {
            step: 6,
            action: "Confirm Deposit",
            details: "Review summary → Click 'Add Liquidity' → Confirm in wallet",
            whatHappens: [
              "Tokens transferred to pool contract",
              "LP tokens (or NFT position for V3) minted to your wallet",
              "Position now earning fees on all trades"
            ],
            time: "1 to 2 minutes"
          },
          {
            step: 7,
            action: "Verify Position",
            details: "Pool tab shows your position, current value, and fees earned",
            tracking: "Check daily/weekly to monitor IL and fee accumulation",
            time: "1 minute"
          }
        ],
        totalTime: "10 to 15 minutes",
        totalGasCost: "$15 to 100 (depends on network congestion)"
      }
    },
    {
      id: 6,
      title: "Managing Your Position",
      icon: TrendingUp,
      duration: "3 min",
      content: {
        overview: "Active management strategies to maximize returns and minimize losses.",
        monitoringMetrics: [
          {
            metric: "Fees Earned",
            frequency: "Check weekly",
            goodSign: "Fees > 0.5% of position per week",
            action: "If fees low, consider switching to higher volume pool"
          },
          {
            metric: "Impermanent Loss",
            frequency: "Check daily for volatile pairs",
            goodSign: "IL < fees earned",
            action: "If IL > 10% and growing, consider exiting"
          },
          {
            metric: "Pool TVL",
            frequency: "Check monthly",
            goodSign: "TVL stable or growing",
            action: "If TVL dropping >50%, research why (possible exit)"
          }
        ],
        whenToExit: [
          "Fees earned exceed IL by comfortable margin (take profits)",
          "IL growing rapidly (>15%) with no signs of price reversal",
          "Pool TVL declining significantly (liquidity crisis)",
          "Better opportunities available elsewhere",
          "Need capital for other purposes"
        ],
        exitProcess: [
          {
            step: "Navigate to Position",
            details: "DEX → Pool tab → Select your position"
          },
          {
            step: "Remove Liquidity",
            details: "Click 'Remove Liquidity' → Choose percentage (25%, 50%, 100%)"
          },
          {
            step: "Confirm Transaction",
            details: "Approve in wallet → LP tokens burned → Both tokens returned"
          }
        ],
        partialWithdrawals: "Can remove 25% or 50% to take profits while keeping position active"
      }
    },
    {
      id: 7,
      title: "Advanced Strategies",
      icon: Shield,
      duration: "4 min",
      content: {
        overview: "Advanced techniques to optimize returns and manage risk.",
        strategies: [
          {
            strategy: "Yield Farming on LP Tokens",
            description: "Stake your LP tokens in yield farms for additional rewards",
            example: "Provide ETH/USDC → Receive LP tokens → Stake LP tokens → Earn pool fees + farm rewards",
            apyBoost: "+20 to 100% APY",
            risk: "Smart contract risk from farm contract",
            platforms: "SushiSwap, PancakeSwap, Curve"
          },
          {
            strategy: "Range Orders (Uniswap V3)",
            description: "Tight ranges act like limit orders while earning fees",
            example: "Set range $1,950 to 2,050 for ETH → Acts like sell order at $2,050 while earning fees",
            apyBoost: "5 to 20x fees in range",
            risk: "Position goes inactive outside range",
            bestFor: "Trading + LP hybrid approach"
          },
          {
            strategy: "Stablecoin Arbitrage",
            description: "Provide liquidity to multiple stablecoin pools across chains",
            example: "USDC/USDT on Ethereum + Polygon + Arbitrum",
            apyBoost: "Lower risk, diversified income",
            risk: "Bridge risks, gas costs",
            bestFor: "Risk-averse farmers"
          },
          {
            strategy: "Rebalancing Pools",
            description: "Periodic rebalancing reduces IL and locks profits",
            example: "Every 2 weeks: exit position → rebalance 50/50 → re-enter",
            benefit: "Reduces accumulated IL",
            cost: "Gas fees + temporary loss of fee earning",
            bestFor: "Large positions in volatile pairs"
          }
        ],
        riskManagement: [
          "Never deploy more than 10 to 30% of portfolio to a single pool",
          "Diversify across multiple pools and protocols",
          "Keep emergency reserves for unexpected IL",
          "Use stop-loss mentally: exit if IL exceeds X%",
          "Research protocol security audits before depositing"
        ]
      }
    },
    {
      id: 8,
      title: "Common Mistakes & Best Practices",
      icon: CheckCircle,
      duration: "3 min",
      content: {
        overview: "Learn from others' mistakes and follow proven best practices.",
        commonMistakes: [
          {
            mistake: "Ignoring Impermanent Loss",
            consequence: "Realizing 20%+ losses when prices diverge",
            lesson: "Always calculate potential IL before entering"
          },
          {
            mistake: "Chasing High APY",
            consequence: "Losing principal to rug pulls or IL",
            lesson: "Sustainable APY is 15 to 50% for established pairs; 500%+ is usually a trap"
          },
          {
            mistake: "Entering Volatile Pairs in Trending Markets",
            consequence: "Massive IL as one token pumps",
            lesson: "LPs perform best in ranging/sideways markets"
          },
          {
            mistake: "Not Accounting for Gas Fees",
            consequence: "Spending $100 in gas to earn $50 in fees",
            lesson: "Calculate breakeven: need enough capital to make gas worthwhile"
          },
          {
            mistake: "Providing Liquidity on Launch Day",
            consequence: "Extreme IL as price discovers itself",
            lesson: "Wait 1 to 2 weeks for price to stabilize"
          },
          {
            mistake: "Using Concentrated Ranges Without Monitoring",
            consequence: "Position goes inactive, earning zero fees",
            lesson: "Full range for passive LPs; concentrated only if actively managing"
          }
        ],
        bestPractices: [
          {
            practice: "Start Small",
            details: "Test with small amounts ($100 to 500) to understand mechanics",
            timeframe: "First 1 to 2 months"
          },
          {
            practice: "Diversify Across Pool Types",
            details: "Mix stablecoin pools (safety) + volatile pairs (growth)",
            allocation: "60% stable, 30% correlated, 10% volatile"
          },
          {
            practice: "Set Performance Benchmarks",
            details: "Exit if not meeting targets: fees > IL, APY > holding returns",
            review: "Monthly performance reviews"
          },
          {
            practice: "Use Layer 2s",
            details: "Polygon, Arbitrum, Optimism for lower gas costs",
            benefit: "Makes smaller positions profitable"
          },
          {
            practice: "Compound Fees Regularly",
            details: "Claim and reinvest fees to maximize returns",
            frequency: "When fees > gas costs (usually monthly)"
          }
        ],
        finalChecklist: [
          "✅ Understand IL and accept the risk",
          "✅ Pool has good TVL and volume",
          "✅ APY is realistic and sustainable",
          "✅ Protocol is audited and reputable",
          "✅ You have monitoring plan",
          "✅ Gas fees are reasonable vs position size",
          "✅ You have exit strategy"
        ]
      }
    }
  ];

  const handleNext = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to progress through the tutorial", variant: "destructive" });
      return;
    }
    if (currentStep < totalSteps) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to navigate the tutorial", variant: "destructive" });
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to complete the tutorial", variant: "destructive" });
      return;
    }
    const allCompleted = [...completedSteps, currentStep];
    setCompletedSteps(allCompleted);
    
    // Save to localStorage
    const existingCompleted = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
    if (!existingCompleted.includes('liquidity-pools')) {
      localStorage.setItem('completedTutorials', JSON.stringify([...existingCompleted, 'liquidity-pools']));
    }
    
    toast({
      title: "Tutorial Complete! 🎉",
      description: "You now understand liquidity pool basics. Ready to provide liquidity?",
    });
    
    // Redirect back to Practical DeFi Actions tab
    window.location.href = "/tutorials?tab=practical";
  };

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tutorials?tab=practical">
            <Button variant="ghost" className="mb-4 hover:bg-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practical DeFi Actions
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 md:gap-4 mb-4 flex-col sm:flex-row text-center sm:text-left">
            <div className="p-2 md:p-3 rounded-xl bg-primary/10">
              <Droplets className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Liquidity Pool Basics</h1>
              <p className="text-sm md:text-base text-white/50">Understanding and participating in liquidity pools safely</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-white/50">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-primary font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex justify-end mb-4 px-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'Liquidity Pool Basics Tutorial')}
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

        {/* Current Step Card */}
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="border-b border-white/8 bg-gradient-to-br from-card via-card to-primary/5 p-3 md:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
                    <StepIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-base md:text-xl break-words">{currentStepData.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                      <Badge variant="outline" className="text-[10px] md:text-xs">
                        {currentStepData.duration}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <Alert className="border-accent/50 bg-accent/5">
              <AlertDescription className="text-sm leading-relaxed">
                {currentStepData.content.overview}
              </AlertDescription>
            </Alert>

            {/* Render step-specific content */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">What Is a Liquidity Pool?</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-white/50 leading-relaxed">
                      <strong>Simple:</strong> {currentStepData.content.definition.simple}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      <strong>Technical:</strong> {currentStepData.content.definition.technical}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      <strong>Analogy:</strong> {currentStepData.content.definition.analogy}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Key Components</h3>
                  <div className="grid gap-3">
                    {currentStepData.content.keyComponents.map((comp, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">{comp.component}</h4>
                        <p className="text-sm text-white/50 mb-2">{comp.description}</p>
                        <p className="text-xs text-primary font-mono">{comp.example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">How It Works</h3>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <ol className="space-y-2">
                      {Object.entries(currentStepData.content.howItWorks).map(([key, value], idx) => (
                        <li key={key} className="text-sm text-white/50 flex gap-2">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span>{value}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Constant Product Formula</h3>
                  <div className="bg-primary/10 rounded-lg p-6 text-center overflow-x-auto">
                    <p className="text-2xl font-mono font-bold text-primary mb-2 whitespace-nowrap">
                      {currentStepData.content.constantProduct.formula}
                    </p>
                    <p className="text-sm text-white/50 mb-2">
                      {currentStepData.content.constantProduct.meaning}
                    </p>
                    <p className="text-xs text-white/50 font-mono">
                      Example: {currentStepData.content.constantProduct.example}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Price Calculation Examples</h3>
                  <div className="space-y-3">
                    {currentStepData.content.priceCalculation.map((calc, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-3">{calc.scenario}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-white/50">ETH:</span>
                            <span className="ml-2 font-mono text-foreground">{calc.ethAmount}</span>
                          </div>
                          <div>
                            <span className="text-white/50">USDC:</span>
                            <span className="ml-2 font-mono text-foreground">{calc.usdcAmount}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-white/50">ETH Price:</span>
                            <span className="ml-2 font-bold text-primary">{calc.ethPrice}</span>
                          </div>
                          <div className="col-span-2 text-xs text-white/50 italic mt-2">
                            {calc.calculation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Understanding Slippage</h3>
                  <Alert className="border-destructive/50 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">{currentStepData.content.slippage.definition}</p>
                      <ul className="space-y-1 text-sm">
                        <li>• {currentStepData.content.slippage.smallTrade}</li>
                        <li>• {currentStepData.content.slippage.largeTrade}</li>
                        <li className="font-medium text-destructive">⚠️ {currentStepData.content.slippage.rule}</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <Alert className="border-destructive/50 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">{currentStepData.content.whatIsIt.simple}</p>
                    <p className="text-sm">{currentStepData.content.whatIsIt.technical}</p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Real Examples</h3>
                  <div className="space-y-3">
                    {currentStepData.content.examples.map((example, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          {example.scenario}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-white/50">Initial:</span> <span className="ml-2">{example.initial}</span></p>
                          <p><span className="text-white/50">Final:</span> <span className="ml-2">{example.final}</span></p>
                          <p><span className="text-white/50">If You Just Held:</span> <span className="ml-2 font-bold">{example.holdValue}</span></p>
                          <p><span className="text-white/50">Pool Value:</span> <span className="ml-2">{example.poolValue}</span></p>
                          <p className="font-medium pt-2 border-t border-white/8">{example.result}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">IL by Price Change</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="space-y-2">
                      {currentStepData.content.ilByPriceChange.map((row, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-white/50">{row.priceChange}</span>
                          <span className="font-mono text-destructive font-medium">{row.ilPercent} loss</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">How to Mitigate IL</h3>
                  <ul className="space-y-2">
                    {currentStepData.content.mitigation.map((tip, idx) => (
                      <li key={idx} className="text-sm text-white/50 flex gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Pool Categories</h3>
                  <div className="space-y-3">
                    {currentStepData.content.poolCategories.map((cat, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-foreground">{cat.category}</h4>
                          <Badge variant="outline">{cat.apyRange} APY</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-white/50">Examples:</span> <span className="ml-2 font-mono">{cat.examples}</span></p>
                          <p><span className="text-white/50">IL Risk:</span> <span className="ml-2">{cat.ilRisk}</span></p>
                          <p><span className="text-white/50">Best For:</span> <span className="ml-2">{cat.bestFor}</span></p>
                          <div className="pt-2 border-t border-white/8">
                            <ul className="space-y-1">
                              {cat.considerations.map((point, pidx) => (
                                <li key={pidx} className="text-white/50">• {point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Pool Evaluation Criteria</h3>
                  <div className="space-y-2">
                    {currentStepData.content.evaluationCriteria.map((crit, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground text-sm">{crit.criterion}</h4>
                          <Badge variant={crit.importance === "High" ? "default" : "secondary"} className="text-xs">
                            {crit.importance}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50 mb-1">✅ {crit.whatToLookFor}</p>
                        <p className="text-xs text-destructive">🚩 {crit.redFlag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Prerequisites</h3>
                  <ul className="space-y-2">
                    {currentStepData.content.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="text-sm text-white/50 flex gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  {currentStepData.content.steps.map((step, idx) => (
                    <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{step.action}</h4>
                            <Badge variant="outline" className="text-xs">{step.time}</Badge>
                          </div>
                          <p className="text-sm text-white/50">{step.details}</p>
                          
                          {step.feeTiers && (
                            <div className="bg-white/5 rounded p-2 mt-2">
                              <p className="text-xs font-medium text-foreground mb-1">Fee Tiers:</p>
                              {step.feeTiers.map((tier, tidx) => (
                                <p key={tidx} className="text-xs text-white/50">
                                  • {tier.tier}: {tier.bestFor}
                                </p>
                              ))}
                            </div>
                          )}

                          {step.options && (
                            <div className="space-y-2 mt-2">
                              {step.options.map((opt, oidx) => (
                                <div key={oidx} className="bg-white/5 rounded p-2">
                                  <p className="text-xs font-medium text-foreground">{opt.option}</p>
                                  <p className="text-xs text-white/50">{opt.description}</p>
                                  <p className="text-xs text-primary">✅ {opt.pros}</p>
                                  <p className="text-xs text-destructive">⚠️ {opt.cons}</p>
                                </div>
                              ))}
                              {step.recommendation && (
                                <Alert className="mt-2">
                                  <AlertDescription className="text-xs">
                                    💡 {step.recommendation}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}

                          {step.example && (
                            <p className="text-xs text-primary font-mono mt-2">Example: {step.example}</p>
                          )}

                          {step.gasNote && (
                            <p className="text-xs text-white/50 mt-2">⚡ {step.gasNote}</p>
                          )}

                          {step.tip && (
                            <p className="text-xs text-accent mt-2">💡 Tip: {step.tip}</p>
                          )}

                          {step.whatHappens && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-foreground mb-1">What happens:</p>
                              <ul className="space-y-1">
                                {step.whatHappens.map((item, widx) => (
                                  <li key={widx} className="text-xs text-white/50">• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.tracking && (
                            <p className="text-xs text-white/50 mt-2">📊 {step.tracking}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Alert className="border-primary/50 bg-primary/5">
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Total Time: {currentStepData.content.totalTime}</p>
                    <p className="text-sm">Total Gas Cost: {currentStepData.content.totalGasCost}</p>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Monitoring Metrics</h3>
                  <div className="space-y-3">
                    {currentStepData.content.monitoringMetrics.map((metric, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{metric.metric}</h4>
                          <Badge variant="outline" className="text-xs">{metric.frequency}</Badge>
                        </div>
                        <p className="text-sm text-primary mb-1">✅ {metric.goodSign}</p>
                        <p className="text-sm text-white/50">→ {metric.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">When to Exit</h3>
                  <ul className="space-y-2">
                    {currentStepData.content.whenToExit.map((reason, idx) => (
                      <li key={idx} className="text-sm text-white/50 flex gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Exit Process</h3>
                  <div className="space-y-2">
                    {currentStepData.content.exitProcess.map((step, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <h4 className="font-medium text-foreground text-sm mb-1">{step.step}</h4>
                        <p className="text-xs text-white/50">{step.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    💡 <strong>Partial Withdrawals:</strong> {currentStepData.content.partialWithdrawals}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Advanced Strategies</h3>
                  <div className="space-y-3">
                    {currentStepData.content.strategies.map((strategy, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">{strategy.strategy}</h4>
                        <p className="text-sm text-white/50 mb-3">{strategy.description}</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-white/50">Example:</span> <span className="ml-2">{strategy.example}</span></p>
                          <p><span className="text-primary">APY Boost:</span> <span className="ml-2 font-medium">{strategy.apyBoost}</span></p>
                          <p><span className="text-destructive">Risk:</span> <span className="ml-2">{strategy.risk}</span></p>
                          {strategy.platforms && (
                            <p><span className="text-white/50">Platforms:</span> <span className="ml-2">{strategy.platforms}</span></p>
                          )}
                          {strategy.bestFor && (
                            <p><span className="text-accent">Best For:</span> <span className="ml-2">{strategy.bestFor}</span></p>
                          )}
                          {strategy.benefit && (
                            <p><span className="text-primary">Benefit:</span> <span className="ml-2">{strategy.benefit}</span></p>
                          )}
                          {strategy.cost && (
                            <p><span className="text-white/50">Cost:</span> <span className="ml-2">{strategy.cost}</span></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Risk Management</h3>
                  <Alert className="border-destructive/50 bg-destructive/5">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="space-y-1 text-sm">
                        {currentStepData.content.riskManagement.map((rule, idx) => (
                          <li key={idx}>• {rule}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Common Mistakes</h3>
                  <div className="space-y-3">
                    {currentStepData.content.commonMistakes.map((mistake, idx) => (
                      <div key={idx} className="bg-card border border-white/8 rounded-lg p-4">
                        <h4 className="font-medium text-destructive mb-2">❌ {mistake.mistake}</h4>
                        <p className="text-sm text-white/50 mb-2">
                          <strong>Consequence:</strong> {mistake.consequence}
                        </p>
                        <p className="text-sm text-primary">
                          <strong>Lesson:</strong> {mistake.lesson}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">Best Practices</h3>
                  <div className="space-y-2">
                    {currentStepData.content.bestPractices.map((practice, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <h4 className="font-medium text-foreground text-sm mb-1">✅ {practice.practice}</h4>
                        <p className="text-xs text-white/50 mb-1">{practice.details}</p>
                        {practice.timeframe && (
                          <Badge variant="outline" className="text-xs">{practice.timeframe}</Badge>
                        )}
                        {practice.allocation && (
                          <Badge variant="outline" className="text-xs ml-2">{practice.allocation}</Badge>
                        )}
                        {practice.review && (
                          <Badge variant="outline" className="text-xs ml-2">{practice.review}</Badge>
                        )}
                        {practice.benefit && (
                          <Badge variant="outline" className="text-xs ml-2">{practice.benefit}</Badge>
                        )}
                        {practice.frequency && (
                          <Badge variant="outline" className="text-xs ml-2">{practice.frequency}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-primary/50 bg-primary/5">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Final Checklist Before Providing Liquidity:</p>
                    <ul className="space-y-1 text-sm">
                      {currentStepData.content.finalChecklist.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-6 border-t border-white/8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {currentStep === totalSteps ? (
                <Button 
                  onClick={handleComplete}
                  className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Tutorial
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="gap-2 w-full sm:w-auto"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
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

export default LiquidityPoolBasicsTutorial;

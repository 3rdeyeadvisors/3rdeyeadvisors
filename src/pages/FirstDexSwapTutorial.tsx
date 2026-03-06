import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyTakeaway } from "@/components/course/KeyTakeaway";
import { DidYouKnow } from "@/components/course/DidYouKnow";
import { StepBlock } from "@/components/course/StepBlock";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import dexSwapHero from "@/assets/tutorials/dex-swap-hero.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowLeftRight, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe,
  Search,
  Wallet,
  Fuel,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw,
  Lock,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const FirstDexSwapTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedDex, setSelectedDex] = useState("uniswap");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  const totalSteps = 8;

  // Collect all tutorial text content into one string for audio
  const getTutorialText = () => {
    return steps.map(step =>
      `${step.title}. ${step.content.overview || ''} ${
        Array.isArray(step.content.instructions)
          ? step.content.instructions.join(' ')
          : ''
      }`
    ).join(' ');
  };
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      id: 1,
      title: "Choose Your DEX",
      icon: Globe,
      duration: "2 min",
      content: {
        overview: "Select a reputable decentralized exchange. We'll use Uniswap for this tutorial.",
        dexOptions: [
          {
            name: "Uniswap",
            network: "Ethereum/Polygon",
            fees: "0.3%",
            difficulty: "Beginner",
            pros: ["Most popular", "High liquidity", "User-friendly"],
            cons: ["Can have high gas fees on Ethereum"],
            recommended: true,
            url: "app.uniswap.org"
          },
          {
            name: "SushiSwap", 
            network: "Multi-chain",
            fees: "0.25%",
            difficulty: "Beginner",
            pros: ["Lower fees", "Multi-chain", "Good for smaller amounts"],
            cons: ["Less liquidity than Uniswap"],
            recommended: false,
            url: "app.sushi.com"
          },
          {
            name: "PancakeSwap",
            network: "BNB Chain",
            fees: "0.25%", 
            difficulty: "Beginner",
            pros: ["Very low fees", "Fast transactions", "Great for beginners"],
            cons: ["Only on BNB Chain", "Different tokens"],
            recommended: false,
            url: "pancakeswap.finance"
          }
        ]
      }
    },
    {
      id: 2,
      title: "Connect Your Wallet",
      icon: Wallet,
      duration: "1 min",
      content: {
        overview: "Safely connect your MetaMask wallet to the DEX.",
        instructions: [
          "Navigate to app.uniswap.org (always check the URL!)",
          "Click 'Connect Wallet' in the top right corner",
          "Select 'MetaMask' from the wallet options",
          "Review the connection request in MetaMask popup",
          "Click 'Connect' to approve the connection",
          "Verify your wallet address appears in the interface"
        ],
        safetyChecks: [
          "Verify the URL is exactly 'app.uniswap.org'",
          "Check for the secure lock icon in your browser",
          "Never enter your seed phrase on any website",
          "Only connect when you intend to trade"
        ]
      }
    },
    {
      id: 3,
      title: "Check Your Network",
      icon: Globe,
      duration: "1 min",
      content: {
        overview: "Ensure you're on the right network for lower fees and the tokens you want.",
        networkOptions: [
          {
            name: "Ethereum Mainnet",
            symbol: "ETH",
            fees: "High ($5 to 50+)",
            speed: "15 seconds",
            pros: ["Most tokens available", "Highest liquidity"],
            cons: ["Very expensive for small trades"],
            recommended: false
          },
          {
            name: "Polygon",
            symbol: "MATIC", 
            fees: "Very Low ($0.01 to 0.10)",
            speed: "2 seconds",
            pros: ["Almost free trades", "Fast", "Many tokens"],
            cons: ["Need MATIC for gas", "Bridging required"],
            recommended: true
          }
        ],
        switchInstructions: [
          "Click the network name in MetaMask (top of popup)",
          "Select 'Polygon Mainnet' from the dropdown",
          "Wait for the network to switch",
          "Refresh the Uniswap page if needed",
          "Verify Uniswap shows 'Polygon' network"
        ]
      }
    },
    {
      id: 4,
      title: "Get Some Native Token",
      icon: Fuel,
      duration: "3 min",
      content: {
        overview: "You need native tokens (MATIC on Polygon) to pay for transaction fees.",
        requirements: {
          polygon: {
            token: "MATIC",
            amount: "0.1 to 1 MATIC",
            cost: "$0.05 to $0.50",
            purpose: "Gas fees for transactions"
          }
        },
        howToGet: [
          {
            method: "Bridge from Ethereum",
            steps: [
              "Use the official Polygon bridge (wallet.polygon.technology)",
              "Connect your MetaMask wallet", 
              "Send a small amount of ETH to get MATIC",
              "Wait 7 to 8 minutes for the bridge to complete"
            ],
            cost: "Ethereum gas fee (~$5 to 20)",
            time: "7 to 8 minutes"
          },
          {
            method: "Buy directly on exchange",
            steps: [
              "Buy MATIC on Coinbase, Binance, or other exchange",
              "Withdraw to your MetaMask address on Polygon network",
              "Double-check you're withdrawing on Polygon network"
            ],
            cost: "Exchange withdrawal fee (~$1 to 3)",
            time: "5 to 10 minutes"
          },
          {
            method: "Use a faucet (free)",
            steps: [
              "Visit a Polygon faucet website",
              "Enter your wallet address",
              "Complete any required verification",
              "Receive small amount of free MATIC"
            ],
            cost: "Free",
            time: "1 to 2 minutes"
          }
        ]
      }
    },
    {
      id: 5,
      title: "Choose Your Trade",
      icon: ArrowLeftRight,
      duration: "2 min", 
      content: {
        overview: "Select the tokens you want to swap. Start small for your first trade!",
        tradeExample: {
          from: "USDC",
          to: "WETH", 
          amount: "10 USDC",
          estimatedReceive: "~0.003 WETH",
          fees: "~0.03 USDC (0.3%)"
        },
        beginnerTips: [
          "Start with stablecoins (USDC, USDT) for predictable values",
          "Trade small amounts first ($10 to 50) to learn",
          "Avoid obscure tokens with very low liquidity",
          "Check token addresses to avoid fake tokens"
        ],
        tokenSelection: [
          "Click 'Select token' dropdown",
          "Search for token name or paste contract address",
          "Verify token details match what you expect",
          "Check liquidity (higher is better)",
          "Choose reputable tokens for first trades"
        ]
      }
    },
    {
      id: 6,
      title: "Review Transaction Details",
      icon: Search,
      duration: "3 min",
      content: {
        overview: "Carefully check all details before confirming. This step prevents costly mistakes!",
        reviewChecklist: [
          {
            item: "Token Amounts",
            description: "Verify you're trading the right amount",
            redFlag: "Amount much larger than intended"
          },
          {
            item: "Token Addresses", 
            description: "Confirm tokens are real, not fake copies",
            redFlag: "Unknown or suspicious token addresses"
          },
          {
            item: "Exchange Rate",
            description: "Compare to other exchanges (should be similar)",
            redFlag: "Rate much worse than expected"
          },
          {
            item: "Price Impact",
            description: "Should be <1% for liquid pairs",
            redFlag: "High price impact (>3%)"
          },
          {
            item: "Minimum Received",
            description: "Lowest amount you'll get if price moves",
            redFlag: "Much lower than expected"
          },
          {
            item: "Network Fees",
            description: "Gas cost in native token (MATIC)",
            redFlag: "Unusually high gas fees"
          }
        ],
        settingsToCheck: [
          {
            setting: "Slippage Tolerance",
            recommended: "0.5% to 1%",
            description: "How much price can change during trade"
          },
          {
            setting: "Transaction Deadline", 
            recommended: "20 minutes",
            description: "How long before trade expires"
          }
        ]
      }
    },
    {
      id: 7,
      title: "Execute the Swap",
      icon: RefreshCw,
      duration: "2 min",
      content: {
        overview: "Complete your first DEX swap! Follow each step carefully.",
        executionSteps: [
          {
            step: "Click 'Swap' button",
            description: "This opens the confirmation dialog",
            tip: "Double-check amounts one more time"
          },
          {
            step: "Review Uniswap popup",
            description: "Final confirmation of trade details",
            tip: "Look for any warnings or unusual information"
          },
          {
            step: "Click 'Confirm Swap'",
            description: "This sends request to MetaMask",
            tip: "MetaMask popup will appear"
          },
          {
            step: "Review MetaMask popup",
            description: "Check gas fee and transaction details",
            tip: "Gas fee should match what Uniswap showed"
          },
          {
            step: "Click 'Confirm' in MetaMask",
            description: "Transaction is sent to blockchain",
            tip: "You'll see pending transaction notification"
          },
          {
            step: "Wait for confirmation",
            description: "Usually 1 to 3 minutes on Polygon",
            tip: "Don't close browser or disconnect wallet"
          }
        ],
        troubleshooting: [
          {
            problem: "Transaction failed",
            solutions: ["Check gas balance", "Reduce slippage", "Try again later"]
          },
          {
            problem: "MetaMask not responding",
            solutions: ["Refresh page", "Disconnect/reconnect wallet", "Check browser extensions"]
          },
          {
            problem: "Price impact too high",
            solutions: ["Trade smaller amount", "Use different token pair", "Check liquidity"]
          }
        ]
      }
    },
    {
      id: 8,
      title: "Verify & Secure",
      icon: CheckCircle,
      duration: "2 min",
      content: {
        overview: "Confirm your trade was successful and secure your tokens.",
        verificationSteps: [
          "Check your wallet balance for new tokens",
          "Verify transaction on Polygonscan.com", 
          "Take a screenshot for your records",
          "Disconnect wallet from DEX when done",
          "Consider moving large amounts to cold storage"
        ],
        transactionExplorer: {
          name: "Polygonscan",
          url: "polygonscan.com",
          whatToCheck: [
            "Transaction status (Success/Failed)",
            "Gas fees paid",
            "Tokens transferred",
            "Block confirmation number"
          ]
        },
        securityPractices: [
          {
            practice: "Disconnect Wallet",
            reason: "Reduces risk if site is compromised later",
            how: "Click wallet icon → Disconnect"
          },
          {
            practice: "Monitor Approvals",
            reason: "DEX now has permission to spend your tokens",
            how: "Use revoke.cash to check/revoke approvals"
          },
          {
            practice: "Record Transactions",
            reason: "Important for taxes and tracking",
            how: "Save transaction hash and screenshot"
          }
        ],
        congratulationsMessage: "🎉 Congratulations! You've completed your first DEX swap. You're now part of the DeFi revolution!"
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
      if (!completed.includes('first-dex-swap')) {
        completed.push('first-dex-swap');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "Excellent work! You've mastered DEX swapping.",
      });
      setTimeout(() => {
        window.location.href = "/tutorials?tab=immediate";
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
    <>
      <SEO 
        title="First DEX Swap Tutorial: Uniswap Trading Guide"
        description="Complete beginner's guide to your first decentralized exchange swap. Learn to trade safely on Uniswap with step-by-step instructions for DeFi trading."
        keywords="DEX swap tutorial, Uniswap guide, decentralized exchange trading, DeFi trading tutorial, first crypto swap, Polygon DEX tutorial"
        url="https://www.sentineldefi.online/tutorials/first-dex-swap"
        schema={{
          type: 'Course',
          data: {
            offers: {
              price: "0",
              priceCurrency: "USD"
            },
            hasCourseInstance: true,
            coursePrerequisites: "MetaMask wallet setup required",
            educationalLevel: "Beginner",
            teaches: [
              "DEX selection and verification",
              "Safe wallet connection",
              "Network switching (Polygon)",
              "Gas fee management",
              "Transaction review and execution",
              "Post-trade security practices"
            ],
            timeRequired: "PT20M",
            courseCode: "DEX-SWAP-101"
          }
        }}
        faq={[
          {
            question: "How do I make my first DEX swap safely?",
            answer: "Follow our 8-step tutorial: Choose a reputable DEX (like Uniswap), connect your MetaMask wallet, switch to Polygon network for low fees, get native tokens for gas, select your trade carefully, review all details, execute the swap, and verify the transaction."
          },
          {
            question: "What network should I use for my first DEX trade?",
            answer: "We recommend Polygon network for beginners because of very low gas fees ($0.01 to 0.10), fast transactions (2 seconds), and wide token availability. You'll need a small amount of MATIC for gas fees."
          },
          {
            question: "How much should I trade for my first DEX swap?",
            answer: "Start small with $10 to 50 for your first trade. This lets you learn the process without significant risk. Use stablecoins like USDC for predictable values, and always verify token addresses to avoid fake tokens."
          }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 mobile-typography-center">
        {/* Back to Tutorials Button */}
        <div className="mb-6">
          <Link to="/tutorials">
            <Button variant="ghost" className="gap-2 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
              Back to Tutorials
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={dexSwapHero} 
            alt="Decentralized exchange interface showing token swap functionality and liquidity pools" 
            className="w-full h-48 md:h-64 object-cover"
            width={1200}
            height={400}
            loading="eager"
          />
        </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="p-2 rounded-lg bg-primary/10">
                <ArrowLeftRight className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Your First DEX Swap</h1>
                <p className="text-sm md:text-base text-white/50">Step-by-step guide to safe decentralized trading</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

        <div className="flex justify-end mb-4 px-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'First DEX Swap Tutorial')}
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
                className={`flex items-center gap-2 ${completed ? "bg-awareness/10 text-awareness hover:bg-awareness/20 border-awareness" : ""}`}
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
                      <currentStepData.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center sm:text-left">
                      <CardTitle className="text-base md:text-xl break-words">{currentStepData.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Estimated time: {currentStepData.duration}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isStepCompleted(currentStep) ? "default" : "secondary"} className="w-fit text-xs mx-auto sm:mx-0">
                    {isStepCompleted(currentStep) ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
              <p className="text-sm md:text-base text-white/50 text-center sm:text-left">{currentStepData.content.overview}</p>

              {/* Step 1: Choose DEX */}
              {currentStep === 1 && (
                <div className="space-y-4 md:space-y-6">
                  <KeyTakeaway>
                    Over $1.8 trillion in DEX volume was traded in 2024. Uniswap alone processed over $600 billion, making it the most trusted DEX for beginners and professionals alike.
                  </KeyTakeaway>

                  <DidYouKnow fact="Modern DEXs use 'automated market makers' (AMMs) instead of traditional order books, allowing you to trade 24/7 without waiting for a buyer or seller." />

                  <div className="grid gap-3 md:gap-4">
                  {currentStepData.content.dexOptions?.map((dex, index) => (
                    <Card key={index} className={`${dex.recommended ? "border-primary bg-primary/5" : ""}`}>
                      <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                        <div className="flex flex-col gap-2 text-center sm:text-left md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="text-base md:text-lg break-words">{dex.name}</CardTitle>
                            <CardDescription className="text-xs md:text-sm break-words">{dex.network} • {dex.fees} fees</CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center sm:justify-start">
                            <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">{dex.difficulty}</Badge>
                            {dex.recommended && <Badge className="text-[10px] md:text-xs whitespace-nowrap">Recommended</Badge>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-2 md:mb-3">
                          <div className="text-center sm:text-left">
                            <h4 className="font-medium text-success mb-1.5 md:mb-2 text-xs md:text-sm">Pros:</h4>
                            <ul className="text-xs md:text-sm space-y-0.5 md:space-y-1">
                              {dex.pros.map((pro, i) => (
                                <li key={i} className="flex items-center gap-1.5 md:gap-2 justify-center sm:justify-start">
                                  <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-success flex-shrink-0" />
                                  <span className="break-words text-left">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-center sm:text-left">
                            <h4 className="font-medium text-awareness mb-1.5 md:mb-2 text-xs md:text-sm">Cons:</h4>
                            <ul className="text-xs md:text-sm space-y-0.5 md:space-y-1">
                              {dex.cons.map((con, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-awareness" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Globe className="h-4 w-4" />
                          <code className="bg-white/5 px-2 py-1 rounded">{dex.url}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                </div>
              )}

              {/* Step 2: Connect Wallet */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <KeyTakeaway title="Safety First">
                    Always verify the URL before connecting your wallet. Scammers create fake DEX sites that look identical to the real ones. Bookmark official DEX sites.
                  </KeyTakeaway>

                  <StepBlock 
                    title="Connection Steps:"
                    steps={currentStepData.content.instructions || []}
                  />

                  <Alert className="border-awareness bg-awareness/10">
                    <Shield className="h-4 w-4 text-awareness" />
                    <AlertDescription className="text-foreground">
                      <div className="space-y-2">
                        <p className="font-medium">Security Checklist:</p>
                        <ul className="space-y-1 text-sm">
                          {currentStepData.content.safetyChecks?.map((check, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-awareness mt-0.5 flex-shrink-0" />
                              <span>{check}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 3: Network Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {currentStepData.content.networkOptions?.map((network, index) => (
                      <Card key={index} className={`${network.recommended ? "border-primary bg-primary/5" : ""}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{network.name}</CardTitle>
                              <CardDescription>Gas fees: {network.fees} • Speed: {network.speed}</CardDescription>
                            </div>
                            {network.recommended && <Badge>Recommended for beginners</Badge>}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-success mb-2">Pros:</h4>
                              <ul className="text-sm space-y-1">
                                {network.pros.map((pro, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-success" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-awareness mb-2">Cons:</h4>
                              <ul className="text-sm space-y-1">
                                {network.cons.map((con, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3 text-awareness" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-foreground">How to Switch Networks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm">
                        {currentStepData.content.switchInstructions?.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Get Native Token */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <Card className="bg-accent/10 border-accent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Fuel className="h-5 w-5" />
                        Gas Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Token needed:</p>
                          <p className="text-accent">{currentStepData.content.requirements?.polygon.token}</p>
                        </div>
                        <div>
                          <p className="font-medium">Amount needed:</p>
                          <p className="text-accent">{currentStepData.content.requirements?.polygon.amount}</p>
                        </div>
                        <div>
                          <p className="font-medium">Approximate cost:</p>
                          <p className="text-accent">{currentStepData.content.requirements?.polygon.cost}</p>
                        </div>
                        <div>
                          <p className="font-medium">Used for:</p>
                          <p className="text-accent">{currentStepData.content.requirements?.polygon.purpose}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <h3 className="font-semibold">How to Get MATIC:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.howToGet?.map((method, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{method.method}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">Cost: {method.cost}</Badge>
                                <Badge variant="outline">Time: {method.time}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ol className="space-y-1 text-sm">
                              {method.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                                    {i + 1}
                                  </Badge>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Choose Trade */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <Card className="bg-success/10 border-success">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-foreground">Example Trade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">From:</p>
                          <p className="text-success">{currentStepData.content.tradeExample?.amount}</p>
                        </div>
                        <div>
                          <p className="font-medium">To:</p>
                          <p className="text-success">{currentStepData.content.tradeExample?.estimatedReceive}</p>
                        </div>
                        <div>
                          <p className="font-medium">Trading Fee:</p>
                          <p className="text-success">{currentStepData.content.tradeExample?.fees}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Token Selection Process:</h3>
                    <ol className="space-y-2">
                      {currentStepData.content.tokenSelection?.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-primary">Beginner Tips:</h4>
                    {currentStepData.content.beginnerTips?.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Review Transaction */}
              {currentStep === 6 && (
                <div className="space-y-4">
                <Alert className="border-destructive/20 bg-destructive/10">
                  <Eye className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                      <strong>CRITICAL:</strong> Always review these details carefully. Once confirmed, transactions cannot be reversed!
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Pre-Transaction Checklist:</h3>
                    <div className="space-y-3">
                      {currentStepData.content.reviewChecklist?.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.item}</h4>
                              <CheckCircle className="h-4 w-4 text-awareness" />
                            </div>
                            <p className="text-sm text-white/50 mb-2">{item.description}</p>
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Red flag: {item.redFlag}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Settings to Verify:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.settingsToCheck?.map((setting, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{setting.setting}</h4>
                              <Badge variant="outline">{setting.recommended}</Badge>
                            </div>
                            <p className="text-sm text-white/50">{setting.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Execute Swap */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Execution Process:</h3>
                    <div className="space-y-3">
                      {currentStepData.content.executionSteps?.map((step, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <h4 className="font-medium">{step.step}</h4>
                                <p className="text-sm text-white/50">{step.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary ml-9">
                              <TrendingUp className="h-3 w-3" />
                              <span>Tip: {step.tip}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Common Issues & Solutions:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.troubleshooting?.map((issue, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium text-destructive mb-2">{issue.problem}</h4>
                            <ul className="space-y-1 text-sm">
                              {issue.solutions.map((solution, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-awareness" />
                                  {solution}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Verify & Secure */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Post-Transaction Verification:</h3>
                    <ol className="space-y-2">
                      {currentStepData.content.verificationSteps?.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Transaction Explorer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">
                        Visit <code className="bg-white/5 text-white/50 px-2 py-1 rounded">{currentStepData.content.transactionExplorer?.url}</code> to verify your transaction.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium">What to check:</h4>
                        <ul className="space-y-1 text-sm">
                          {currentStepData.content.transactionExplorer?.whatToCheck.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Security Best Practices:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.securityPractices?.map((practice, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{practice.practice}</h4>
                            <p className="text-sm text-white/50 mb-2">{practice.reason}</p>
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <TrendingUp className="h-3 w-3" />
                              <span>How: {practice.how}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="bg-awareness/10 border-awareness/20">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-awareness mb-2">
                        {currentStepData.content.congratulationsMessage}
                      </h3>
                      <p className="text-foreground">
                        You now know how to safely trade on decentralized exchanges. Practice with small amounts and always prioritize security!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Bottom Navigation - Removed, using StepNavigation component at top */}
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {completedSteps.length === totalSteps && (
          <Card className="bg-awareness/10 border-awareness/20">
            <CardHeader>
              <CardTitle className="text-awareness flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Congratulations! First DEX Swap Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                You've successfully completed your first decentralized exchange trade! 
                You're now ready to explore the exciting world of DeFi trading.
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

export default FirstDexSwapTutorial;
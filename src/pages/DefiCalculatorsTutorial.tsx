import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft,
  ArrowRight,
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
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
import { Volume2 } from 'lucide-react';

const DefiCalculatorsTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Example calculator states
  const [yieldInputs, setYieldInputs] = useState({
    principal: 1000,
    apy: 15,
    compoundPeriod: 12,
    timeframe: 365
  });
  
  const [ilInputs, setIlInputs] = useState({
    tokenA: 1000,
    tokenB: 1000,
    priceChangeA: 0,
    priceChangeB: 50
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  const totalSteps = 4;

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
      title: "Understanding DeFi Calculators",
      icon: Calculator,
      duration: "3 min",
      content: {
        overview: "Learn what DeFi calculators do and why they're essential for smart investing.",
        calculatorTypes: [
          {
            name: "Yield Farming Calculator",
            purpose: "Calculate potential returns from liquidity provision",
            when: "Before providing liquidity to pools",
            helps: "Estimate APY, compound returns, and optimal strategies",
            difficulty: "Beginner",
            icon: TrendingUp
          },
          {
            name: "Impermanent Loss Calculator", 
            purpose: "Estimate loss from token price divergence",
            when: "Before entering LP positions",
            helps: "Understand risks vs rewards in volatile pairs",
            difficulty: "Intermediate",
            icon: AlertTriangle
          },
          {
            name: "Portfolio Tracker",
            purpose: "Monitor your DeFi investments in real-time",
            when: "After making investments",
            helps: "Track performance and make informed decisions",
            difficulty: "Beginner", 
            icon: PieChart
          }
        ],
        whyImportant: [
          "Avoid costly mistakes by understanding potential outcomes",
          "Compare different DeFi strategies objectively",
          "Make informed decisions with real numbers",
          "Optimize your returns through better planning",
          "Understand risks before committing capital"
        ]
      }
    },
    {
      id: 2,
      title: "Yield Farming Calculator",
      icon: TrendingUp,
      duration: "4 min",
      content: {
        overview: "Master the yield farming calculator to estimate your potential DeFi returns.",
        inputs: [
          {
            name: "Principal Amount",
            description: "Initial investment amount in USD",
            example: "$1,000",
            tips: "Start with amounts you're comfortable risking"
          },
          {
            name: "Annual Percentage Yield (APY)",
            description: "Expected yearly return percentage",
            example: "15%",
            tips: "Check multiple sources for realistic APY estimates"
          },
          {
            name: "Compound Period",
            description: "How often rewards are claimed and reinvested",
            example: "Daily (365), Weekly (52), Monthly (12)",
            tips: "More frequent compounding = higher returns"
          },
          {
            name: "Time Horizon",
            description: "How long you plan to keep funds invested",
            example: "30 days, 90 days, 1 year",
            tips: "Consider gas costs for short-term positions"
          }
        ],
        interpretingResults: [
          {
            metric: "Final Amount",
            meaning: "Total value after the time period",
            goodExample: "$1,150 after 1 year on $1,000",
            badExample: "Amount less than principal (loss)"
          },
          {
            metric: "Total Return",
            meaning: "Absolute profit/loss in USD",
            goodExample: "$150 profit",
            badExample: "Negative return (loss)"
          },
          {
            metric: "Effective APY",
            meaning: "Actual yearly return including compounding",
            goodExample: "15.87% (higher than quoted 15%)",
            badExample: "Much lower than expected APY"
          }
        ]
      }
    },
    {
      id: 3,
      title: "Impermanent Loss Calculator",
      icon: AlertTriangle,
      duration: "5 min",
      content: {
        overview: "Learn to calculate and understand impermanent loss: the hidden risk in liquidity providing.",
        whatIsIL: {
          definition: "The temporary loss of funds when providing liquidity to volatile trading pairs",
          occurs: "When token prices diverge significantly from initial ratio",
          reversible: "Loss becomes permanent only when you withdraw at unfavorable prices",
          formula: "IL = 2 × √(Price_Ratio) / (1 + Price_Ratio) - 1"
        },
        inputs: [
          {
            name: "Token A Amount",
            description: "Initial amount of first token (e.g., ETH)",
            example: "$1,000 worth of ETH",
            tips: "Use USD value for easier comparison"
          },
          {
            name: "Token B Amount", 
            description: "Initial amount of second token (e.g., USDC)",
            example: "$1,000 worth of USDC",
            tips: "50/50 split is most common for LP positions"
          },
          {
            name: "Token A Price Change",
            description: "Percentage change in Token A price",
            example: "ETH price increases 50%",
            tips: "Use negative values for price decreases"
          },
          {
            name: "Token B Price Change",
            description: "Percentage change in Token B price", 
            example: "USDC stays stable (0% change)",
            tips: "Stablecoins typically don't change much"
          }
        ],
        ilScenarios: [
          {
            scenario: "No Price Change",
            tokenA: "0%",
            tokenB: "0%",
            il: "0%",
            meaning: "No impermanent loss: perfect scenario"
          },
          {
            scenario: "Moderate Divergence",
            tokenA: "+25%",
            tokenB: "0%",
            il: "-0.6%",
            meaning: "Small loss, likely covered by fees"
          },
          {
            scenario: "Significant Divergence",
            tokenA: "+100%",
            tokenB: "0%",
            il: "-5.7%",
            meaning: "Notable loss, need high APY to compensate"
          },
          {
            scenario: "Extreme Divergence",
            tokenA: "+400%",
            tokenB: "0%",
            il: "-20%",
            meaning: "Major loss, very risky scenario"
          }
        ]
      }
    },
    {
      id: 4,
      title: "Making Smart Decisions",
      icon: Target,
      duration: "3 min",
      content: {
        overview: "Use calculator results to make informed DeFi investment decisions.",
        decisionFramework: [
          {
            question: "Is the potential reward worth the risk?",
            considerations: [
              "APY should significantly exceed potential IL",
              "Consider your risk tolerance",
              "Factor in transaction costs and gas fees",
              "Think about opportunity cost of other investments"
            ]
          },
          {
            question: "How long should I stay in the position?",
            considerations: [
              "Longer periods generally reduce IL impact",
              "More time to collect trading fees",
              "Gas costs amortized over longer time",
              "Monitor market conditions and exit if needed"
            ]
          },
          {
            question: "Which pools are best for my strategy?",
            considerations: [
              "Stable pairs (USDC/USDT) = low IL, low APY",
              "Correlated pairs (ETH/WBTC) = medium IL, medium APY", 
              "Volatile pairs (ETH/DOGE) = high IL, high APY",
              "Choose based on your risk preference"
            ]
          }
        ],
        bestPractices: [
          {
            practice: "Start Small",
            reason: "Learn with amounts you can afford to lose",
            action: "Begin with $100 to 500 positions"
          },
          {
            practice: "Diversify",
            reason: "Don't put all funds in one pool or protocol",
            action: "Spread across 3 to 5 different strategies"
          },
          {
            practice: "Monitor Regularly",
            reason: "Market conditions change rapidly in DeFi",
            action: "Check positions weekly, be ready to exit"
          },
          {
            practice: "Factor All Costs",
            reason: "Gas fees can eat into profits significantly",
            action: "Calculate break-even including all costs"
          },
          {
            practice: "Stay Informed",
            reason: "New risks and opportunities emerge constantly",
            action: "Follow protocol updates, security audits"
          }
        ],
        redFlags: [
          "APY significantly higher than market rates",
          "New protocols without established track records",
          "Tokens with extreme price volatility",
          "Pools with very low liquidity",
          "Smart contracts without proper audits"
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
      if (!completed.includes('defi-calculators')) {
        completed.push('defi-calculators');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "Great job! You now know how to use DeFi calculators effectively.",
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

  // Calculator functions
  const calculateYieldFarming = () => {
    const { principal, apy, compoundPeriod, timeframe } = yieldInputs;
    const periodsPerYear = compoundPeriod;
    const yearsInvested = timeframe / 365;
    const finalAmount = principal * Math.pow(1 + (apy / 100) / periodsPerYear, periodsPerYear * yearsInvested);
    const totalReturn = finalAmount - principal;
    const effectiveAPY = Math.pow(finalAmount / principal, 1 / yearsInvested) - 1;
    
    return {
      finalAmount: finalAmount.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      effectiveAPY: (effectiveAPY * 100).toFixed(2)
    };
  };

  const calculateImpermanentLoss = () => {
    const { tokenA, tokenB, priceChangeA, priceChangeB } = ilInputs;
    const priceRatioA = 1 + (priceChangeA / 100);
    const priceRatioB = 1 + (priceChangeB / 100);
    const priceRatio = priceRatioA / priceRatioB;
    
    const lpValue = 2 * Math.sqrt(priceRatio) / (1 + priceRatio);
    const holdValue = 1;
    const il = (lpValue - holdValue) * 100;
    
    const initialValue = tokenA + tokenB;
    const ilAmount = (initialValue * il) / 100;
    
    return {
      ilPercentage: il.toFixed(2),
      ilAmount: ilAmount.toFixed(2),
      finalLpValue: (initialValue * lpValue).toFixed(2),
      finalHoldValue: (tokenA * priceRatioA + tokenB * priceRatioB).toFixed(2)
    };
  };

  const yieldResults = calculateYieldFarming();
  const ilResults = calculateImpermanentLoss();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Using DeFi Calculators</h1>
              <p className="text-white/50">Master the tools for smart DeFi investing</p>
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
            onClick={() => openAudio(getTutorialText(), 'DeFi Calculators Tutorial')}
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
                className={`flex items-center gap-2 ${completed ? "bg-awareness/20 text-awareness hover:bg-awareness/30" : ""}`}
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
            <CardHeader>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <currentStepData.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="leading-tight">{currentStepData.title}</CardTitle>
              </div>
              <CardDescription className="mb-3">
                Estimated time: {currentStepData.duration}
              </CardDescription>
              <Badge 
                variant={isStepCompleted(currentStep) ? "default" : "secondary"}
                className="w-fit"
              >
                {isStepCompleted(currentStep) ? "Completed" : "In Progress"}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-white/50">{currentStepData.content.overview}</p>

              {/* Step 1: Understanding Calculators */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {currentStepData.content.calculatorTypes?.map((calc, index) => {
                      const CalcIcon = calc.icon;
                      return (
                        <Card key={index}>
                          <CardHeader className="pb-3 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                <CalcIcon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-lg leading-tight">{calc.name}</CardTitle>
                            </div>
                            <Badge variant="outline" className="w-fit">{calc.difficulty}</Badge>
                            <CardDescription>{calc.purpose}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="font-medium mb-1">When to use:</p>
                                <p className="text-white/50">{calc.when}</p>
                              </div>
                              <div>
                                <p className="font-medium mb-1">How it helps:</p>
                                <p className="text-white/50">{calc.helps}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary">Why DeFi Calculators Matter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {currentStepData.content.whyImportant?.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Yield Farming Calculator */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Interactive Calculator */}
                  <Card className="bg-awareness/10 border-awareness/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 rounded-lg bg-awareness/10 flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-awareness" />
                        </div>
                        <CardTitle className="text-lg text-awareness leading-tight self-center my-0">Interactive Yield Calculator</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="principal">Principal Amount ($)</Label>
                            <Input
                              id="principal"
                              type="number"
                              value={yieldInputs.principal}
                              onChange={(e) => setYieldInputs({...yieldInputs, principal: Number(e.target.value)})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="apy">APY (%)</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setYieldInputs({...yieldInputs, apy: Math.max(1, yieldInputs.apy - 0.5)})}
                                  className="h-8 w-8 p-0"
                                >
                                  -
                                </Button>
                                <div className="flex-1 text-center">
                                  <Input
                                    id="apy"
                                    type="number"
                                    value={yieldInputs.apy}
                                    onChange={(e) => setYieldInputs({...yieldInputs, apy: Number(e.target.value)})}
                                    min={1}
                                    max={100}
                                    step={0.5}
                                    className="text-center"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setYieldInputs({...yieldInputs, apy: Math.min(100, yieldInputs.apy + 0.5)})}
                                  className="h-8 w-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                              <div className="text-center text-sm font-medium text-primary">
                                {yieldInputs.apy}% APY
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="compound">Compound Period (times/year)</Label>
                            <Input
                              id="compound"
                              type="number"
                              value={yieldInputs.compoundPeriod}
                              onChange={(e) => setYieldInputs({...yieldInputs, compoundPeriod: Number(e.target.value)})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeframe">Time Horizon (days)</Label>
                            <Input
                              id="timeframe"
                              type="number"
                              value={yieldInputs.timeframe}
                              onChange={(e) => setYieldInputs({...yieldInputs, timeframe: Number(e.target.value)})}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Results:</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                              <span className="font-medium">Final Amount:</span>
                              <span className="text-awareness font-bold">${yieldResults.finalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                              <span className="font-medium">Total Return:</span>
                              <span className="text-awareness font-bold">${yieldResults.totalReturn}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                              <span className="font-medium">Effective APY:</span>
                              <span className="text-awareness font-bold">{yieldResults.effectiveAPY}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Input Explanations */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Understanding the Inputs:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.inputs?.map((input, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{input.name}</h4>
                            <p className="text-sm text-white/50 mb-2">{input.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-primary">Example: {input.example}</span>
                              <span className="text-awareness">💡 {input.tips}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Results Interpretation */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Interpreting Results:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.interpretingResults?.map((result, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{result.metric}</h4>
                            <p className="text-sm text-white/50 mb-2">{result.meaning}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-awareness" />
                                <span className="text-awareness">Good: {result.goodExample}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">Bad: {result.badExample}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Impermanent Loss Calculator */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* IL Explanation */}
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <CardTitle className="text-lg text-destructive leading-tight">What is Impermanent Loss?</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p><strong>Definition:</strong> {currentStepData.content.whatIsIL?.definition}</p>
                      <p><strong>When it occurs:</strong> {currentStepData.content.whatIsIL?.occurs}</p>
                      <p><strong>Is it reversible?</strong> {currentStepData.content.whatIsIL?.reversible}</p>
                    </CardContent>
                  </Card>

                  {/* Interactive IL Calculator */}
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <CardTitle className="text-lg text-destructive leading-tight self-center my-0">Interactive Impermanent Loss Calculator</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="tokenA">Token A Amount ($)</Label>
                            <Input
                              id="tokenA"
                              type="number"
                              value={ilInputs.tokenA}
                              onChange={(e) => setIlInputs({...ilInputs, tokenA: Number(e.target.value)})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="tokenB">Token B Amount ($)</Label>
                            <Input
                              id="tokenB"
                              type="number"
                              value={ilInputs.tokenB}
                              onChange={(e) => setIlInputs({...ilInputs, tokenB: Number(e.target.value)})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="priceChangeA">Token A Price Change (%)</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIlInputs({...ilInputs, priceChangeA: Math.max(-50, ilInputs.priceChangeA - 1)})}
                                  className="h-8 w-8 p-0"
                                >
                                  -
                                </Button>
                                <div className="flex-1 text-center">
                                  <Input
                                    id="priceChangeA"
                                    type="number"
                                    value={ilInputs.priceChangeA}
                                    onChange={(e) => setIlInputs({...ilInputs, priceChangeA: Number(e.target.value)})}
                                    min={-50}
                                    max={200}
                                    step={1}
                                    className="text-center"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIlInputs({...ilInputs, priceChangeA: Math.min(200, ilInputs.priceChangeA + 1)})}
                                  className="h-8 w-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                              <div className="text-center text-sm font-medium text-primary">
                                {ilInputs.priceChangeA > 0 ? '+' : ''}{ilInputs.priceChangeA}%
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="priceChangeB">Token B Price Change (%)</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIlInputs({...ilInputs, priceChangeB: Math.max(-50, ilInputs.priceChangeB - 1)})}
                                  className="h-8 w-8 p-0"
                                >
                                  -
                                </Button>
                                <div className="flex-1 text-center">
                                  <Input
                                    id="priceChangeB"
                                    type="number"
                                    value={ilInputs.priceChangeB}
                                    onChange={(e) => setIlInputs({...ilInputs, priceChangeB: Number(e.target.value)})}
                                    min={-50}
                                    max={200}
                                    step={1}
                                    className="text-center"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIlInputs({...ilInputs, priceChangeB: Math.min(200, ilInputs.priceChangeB + 1)})}
                                  className="h-8 w-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                              <div className="text-center text-sm font-medium text-primary">
                                {ilInputs.priceChangeB > 0 ? '+' : ''}{ilInputs.priceChangeB}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Impermanent Loss Results:</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                              <span className="font-medium">IL Percentage:</span>
                              <span className={`font-bold ${Number(ilResults.ilPercentage) < 0 ? 'text-destructive' : 'text-success'}`}>
                                {ilResults.ilPercentage}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                              <span className="font-medium">IL Amount:</span>
                              <span className={`font-bold ${Number(ilResults.ilAmount) < 0 ? 'text-destructive' : 'text-success'}`}>
                                ${ilResults.ilAmount}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                              <span className="font-medium">LP Position Value:</span>
                              <span className="font-bold text-accent">${ilResults.finalLpValue}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                              <span className="font-medium">Hold Value:</span>
                              <span className="font-bold text-success">${ilResults.finalHoldValue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* IL Scenarios */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Common IL Scenarios:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.ilScenarios?.map((scenario, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="font-medium">{scenario.scenario}</h4>
                              <Badge 
                                variant={Number(scenario.il.replace('%', '')) === 0 ? "default" : Number(scenario.il.replace('%', '')) > -3 ? "secondary" : "destructive"}
                                className="whitespace-nowrap"
                              >
                                {scenario.il} IL
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-white/50">Token A:</span> {scenario.tokenA}
                              </div>
                              <div>
                                <span className="text-white/50">Token B:</span> {scenario.tokenB}
                              </div>
                            </div>
                            <p className="text-sm text-white/50">{scenario.meaning}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Making Smart Decisions */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Decision Framework */}
                  <div className="space-y-4">
                    {currentStepData.content.decisionFramework?.map((framework, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-primary">{framework.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {framework.considerations.map((consideration, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{consideration}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Best Practices */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">DeFi Investment Best Practices:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.bestPractices?.map((practice, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2 text-success">{practice.practice}</h4>
                            <p className="text-sm text-white/50 mb-2">{practice.reason}</p>
                            <div className="flex items-center gap-2 text-sm text-accent">
                              <Target className="h-3 w-3" />
                              <span>Action: {practice.action}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Red Flags */}
                  <Alert className="border-destructive/20 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      <div className="space-y-2">
                        <p className="font-medium">Red Flags to Avoid:</p>
                        <ul className="space-y-1 text-sm">
                          {currentStepData.content.redFlags?.map((flag, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step Navigation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {!isStepCompleted(currentStep) && (
                    <Button
                      variant="secondary"
                      onClick={handleStepComplete}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    className="w-full sm:w-auto"
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
          <Card className="bg-awareness/10 border-awareness/20 mt-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-awareness/10 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-awareness" />
                </div>
                <CardTitle className="text-awareness">Congratulations! Calculator Mastery Complete</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                You now know how to use DeFi calculators to make informed investment decisions! 
                You can estimate returns, calculate risks, and choose strategies wisely.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/tutorials">Back to Tutorials</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/courses">Apply Your Knowledge</Link>
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

export default DefiCalculatorsTutorial;
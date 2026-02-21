import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyTakeaway } from "@/components/course/KeyTakeaway";
import { DidYouKnow } from "@/components/course/DidYouKnow";
import { StepBlock } from "@/components/course/StepBlock";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import scamHero from "@/assets/tutorials/scam-detection-hero.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  Eye,
  Globe,
  Clock,
  Unlock,
  Search,
  Copy,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  Key,
  Zap,
  Lock,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const SpottingScamsTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedScamType, setSelectedScamType] = useState("phishing");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  const totalSteps = 7;

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
      title: "Common DeFi Scam Types",
      icon: AlertTriangle,
      duration: "3 min",
      content: {
        overview: "Learn about the most common scams targeting DeFi users and how they operate.",
        scamTypes: [
          {
            name: "Phishing Websites",
            description: "Fake websites that look identical to real DeFi platforms",
            goal: "Steal your seed phrase or private keys",
            frequency: "Very Common",
            danger: "Critical",
            example: "uniiswap.org instead of app.uniswap.org"
          },
          {
            name: "Fake Token Approvals",
            description: "Malicious contracts requesting unlimited token permissions",
            goal: "Drain your wallet of approved tokens",
            frequency: "Common",
            danger: "High",
            example: "Pop-up asking to 'approve' tokens for fake rewards"
          },
          {
            name: "Rug Pull Projects",
            description: "New projects that disappear with investor funds",
            goal: "Steal invested money",
            frequency: "Common",
            danger: "High",
            example: "New DeFi project with unrealistic APY promises"
          },
          {
            name: "Social Engineering",
            description: "Scammers impersonating support or influencers",
            goal: "Trick you into sharing sensitive information",
            frequency: "Very Common",
            danger: "Critical",
            example: "Fake support asking for your seed phrase"
          },
          {
            name: "MEV/Sandwich Bots",
            description: "Bots that manipulate transaction ordering",
            goal: "Extract value from your transactions",
            frequency: "Automated",
            danger: "Medium",
            example: "Your trade gets worse price due to bot manipulation"
          }
        ]
      }
    },
    {
      id: 2,
      title: "URL & Website Verification",
      icon: Globe,
      duration: "4 min",
      content: {
        overview: "Master the art of identifying legitimate websites from sophisticated fakes.",
        urlChecks: [
          {
            check: "Exact Domain Match",
            legitimate: "app.uniswap.org",
            scam: "app.uniiswap.org (extra 'i')",
            howToCheck: "Type URL manually, never click links from messages"
          },
          {
            check: "HTTPS & SSL Certificate",
            legitimate: "Green lock icon, valid certificate",
            scam: "No lock icon, certificate warnings",
            howToCheck: "Click the lock icon to verify certificate details"
          },
          {
            check: "Official Domain Extensions",
            legitimate: ".org, .com from official sources",
            scam: ".net, .io, unusual extensions for well-known sites",
            howToCheck: "Check official social media for correct URLs"
          },
          {
            check: "No URL Shorteners",
            legitimate: "Full domain visible",
            scam: "bit.ly, tinyurl, suspicious redirects",
            howToCheck: "Never use shortened URLs for financial sites"
          }
        ],
        visualInspection: [
          {
            element: "Logo Quality",
            legitimate: "High-resolution, consistent branding",
            scam: "Blurry, slightly off colors, poor quality",
            tip: "Compare side-by-side with known legitimate site"
          },
          {
            element: "Grammar & Spelling",
            legitimate: "Professional writing, no errors",
            scam: "Typos, awkward phrasing, translation errors",
            tip: "Legitimate platforms invest in quality content"
          },
          {
            element: "Layout & Design",
            legitimate: "Polished, consistent with official site",
            scam: "Slightly off alignment, missing elements",
            tip: "Use screenshots of real site for comparison"
          },
          {
            element: "Contact Information",
            legitimate: "Professional support channels",
            scam: "Only Telegram/Discord, no official support",
            tip: "Check official website for support methods"
          }
        ]
      }
    },
    {
      id: 3,
      title: "Transaction Red Flags",
      icon: Zap,
      duration: "4 min",
      content: {
        overview: "Identify dangerous transaction requests before signing them.",
        dangerousRequests: [
          {
            type: "Unlimited Approvals",
            description: "Requesting permission to spend unlimited tokens",
            redFlag: "Amount shows as 'Unlimited' or huge number",
            safe: "Limited approval for exact amount needed",
            action: "Always set custom lower limits"
          },
          {
            type: "Unknown Contracts",
            description: "Interacting with unverified smart contracts",
            redFlag: "Contract address not on official website",
            safe: "Contract verified on Etherscan/Polygonscan",
            action: "Only use contracts from official sources"
          },
          {
            type: "Urgent Pressure",
            description: "Claiming limited time offers or immediate action needed",
            redFlag: "Must act now or lose opportunity",
            safe: "Legitimate projects don't create false urgency",
            action: "Take time to research, never rush"
          },
          {
            type: "Unexpected Transactions",
            description: "Wallet prompts appearing without your action",
            redFlag: "Transaction popup without clicking anything",
            safe: "Transactions only when you initiate them",
            action: "Immediately reject unexpected prompts"
          }
        ],
        transactionAnalysis: [
          {
            step: "Check Transaction Details",
            what: "Review recipient address, amount, gas fees",
            redFlag: "Unknown recipient, unexpected amounts",
            tool: "MetaMask transaction preview"
          },
          {
            step: "Verify Contract Function",
            what: "Understand what the transaction actually does",
            redFlag: "'Transfer ownership', 'Approve all'",
            tool: "Etherscan contract interaction tab"
          },
          {
            step: "Cross-Reference Official Docs",
            what: "Compare with official protocol documentation",
            redFlag: "Function not mentioned in official docs",
            tool: "Protocol's official documentation"
          },
          {
            step: "Check Gas Fees",
            what: "Verify gas fees are reasonable for the action",
            redFlag: "Extremely high or unusually low gas",
            tool: "Gas tracker websites"
          }
        ]
      }
    },
    {
      id: 4,
      title: "Social Engineering Tactics",
      icon: MessageSquare,
      duration: "4 min",
      content: {
        overview: "Recognize and defend against social engineering attacks targeting DeFi users.",
        commonTactics: [
          {
            tactic: "Fake Support Contacts",
            scenario: "Someone claiming to be from MetaMask/Uniswap support",
            approach: "Direct messages offering help with wallet issues",
            goal: "Get your seed phrase or private keys",
            defense: "Real support NEVER asks for private information"
          },
          {
            tactic: "Impersonation Attacks",
            scenario: "Fake accounts of crypto influencers or founders",
            approach: "Offering exclusive investment opportunities",
            goal: "Get you to send crypto or connect wallet to scam",
            defense: "Verify accounts through official channels"
          },
          {
            tactic: "Urgency & FOMO",
            scenario: "Limited time offers or exclusive access",
            approach: "Must act immediately or miss opportunity",
            goal: "Prevent you from researching or thinking clearly",
            defense: "Legitimate opportunities don't require instant action"
          },
          {
            tactic: "Fake Airdrops",
            scenario: "Claims you won tokens and need to claim them",
            approach: "Connect wallet to receive 'free' tokens",
            goal: "Drain wallet through malicious contract approval",
            defense: "Research airdrops through official channels only"
          },
          {
            tactic: "Technical Intimidation",
            scenario: "Complex technical explanations to confuse you",
            approach: "Overwhelming technical jargon and urgency",
            goal: "Make you feel you must trust their expertise",
            defense: "If you don't understand, don't proceed"
          }
        ],
        platforms: [
          {
            platform: "Discord",
            risks: ["Fake admin accounts", "DM scams", "Fake announcement channels"],
            safety: "Only trust verified roles, ignore DMs from strangers"
          },
          {
            platform: "Telegram",
            risks: ["Fake groups", "Admin impersonators", "Pump & dump schemes"],
            safety: "Verify group authenticity, beware of investment advice"
          },
          {
            platform: "Twitter/X",
            risks: ["Fake verified accounts", "Copy-cat usernames", "Fake giveaways"],
            safety: "Check follower counts, engagement patterns, verification"
          },
          {
            platform: "Email",
            risks: ["Phishing links", "Fake security alerts", "Urgent action requests"],
            safety: "Never click links, go directly to official websites"
          }
        ]
      }
    },
    {
      id: 5,
      title: "Wallet Security Checks",
      icon: Shield,
      duration: "3 min",
      content: {
        overview: "Implement security practices to protect your wallet from compromise.",
        securityLayers: [
          {
            layer: "Browser Security",
            checks: [
              "Use dedicated browser for DeFi activities",
              "Keep browser updated to latest version",
              "Use reputable ad blockers",
              "Clear cache/cookies regularly",
              "Disable auto-fill for sensitive sites"
            ],
            tools: ["Brave Browser", "Chrome with DeFi profile", "uBlock Origin"]
          },
          {
            layer: "Wallet Security",
            checks: [
              "Keep MetaMask updated",
              "Use hardware wallet for large amounts",
              "Regular seed phrase backup verification",
              "Monitor wallet permissions regularly",
              "Use different wallets for different purposes"
            ],
            tools: ["Ledger", "Trezor", "revoke.cash", "Multiple MetaMask accounts"]
          },
          {
            layer: "Network Security",
            checks: [
              "Use secure internet connection",
              "Avoid public WiFi for DeFi",
              "Consider VPN for additional privacy",
              "Verify SSL certificates",
              "Monitor for man-in-the-middle attacks"
            ],
            tools: ["VPN services", "SSL verification", "Network monitoring"]
          }
        ],
        regularMaintenance: [
          {
            frequency: "Daily",
            tasks: ["Check wallet for unexpected transactions", "Verify current connected sites"],
            time: "2 minutes"
          },
          {
            frequency: "Weekly", 
            tasks: ["Review token approvals", "Update security software", "Backup important data"],
            time: "10 minutes"
          },
          {
            frequency: "Monthly",
            tasks: ["Test seed phrase backup", "Review security practices", "Update passwords"],
            time: "30 minutes"
          }
        ]
      }
    },
    {
      id: 6,
      title: "Research & Verification",
      icon: Search,
      duration: "5 min",
      content: {
        overview: "Learn to research and verify DeFi projects before investing.",
        researchChecklist: [
          {
            category: "Team & Background",
            checks: [
              "Are team members publicly known?",
              "Do they have relevant experience?",
              "Are LinkedIn profiles real and established?",
              "Have they worked on other successful projects?",
              "Are they responsive to community questions?"
            ],
            redFlags: ["Anonymous teams", "Fake LinkedIn profiles", "No prior experience"],
            tools: ["LinkedIn", "GitHub", "Team member social media"]
          },
          {
            category: "Smart Contract Security",
            checks: [
              "Has the code been audited by reputable firms?",
              "Is the contract code open source and verified?",
              "Are there any critical vulnerabilities?",
              "Is the contract upgradeable (potential risk)?",
              "Has it been tested on testnet extensively?"
            ],
            redFlags: ["No audit", "Closed source", "Recent critical bugs"],
            tools: ["CertiK", "ConsenSys Diligence", "Etherscan", "GitHub"]
          },
          {
            category: "Tokenomics & Economics",
            checks: [
              "Is the token distribution fair?",
              "Are there excessive team/founder allocations?",
              "What is the inflation/emission schedule?",
              "How are rewards funded sustainably?",
              "Is there a clear value proposition?"
            ],
            redFlags: ["90%+ team allocation", "Unsustainable rewards", "No utility"],
            tools: ["Token distribution docs", "Whitepaper", "Economic analysis"]
          },
          {
            category: "Community & Adoption",
            checks: [
              "Is there genuine community engagement?",
              "Are social media followers organic?",
              "Is there real usage and TVL growth?",
              "Are partnerships legitimate?",
              "Is development activity consistent?"
            ],
            redFlags: ["Bought followers", "No real usage", "Fake partnerships"],
            tools: ["DeFiPulse", "GitHub activity", "Social media analysis"]
          }
        ],
        verificationTools: [
          {
            tool: "DefiPulse/DefiLlama",
            purpose: "Check Total Value Locked (TVL) and rankings",
            url: "defillama.com",
            usage: "Verify project legitimacy and size"
          },
          {
            tool: "CoinGecko/CoinMarketCap",
            purpose: "Token information and market data",
            url: "coingecko.com",
            usage: "Check token details, market cap, liquidity"
          },
          {
            tool: "Etherscan/Polygonscan",
            purpose: "Contract verification and transaction history",
            url: "etherscan.io",
            usage: "Verify contracts, check transaction patterns"
          },
          {
            tool: "CertiK/Immunefi",
            purpose: "Security audits and bug bounty programs",
            url: "certik.com",
            usage: "Check audit reports and security status"
          }
        ]
      }
    },
    {
      id: 7,
      title: "Emergency Response Plan",
      icon: AlertTriangle,
      duration: "3 min",
      content: {
        overview: "Know what to do if you suspect you've been scammed or compromised.",
        immediateActions: [
          {
            action: "Disconnect Wallet",
            steps: [
              "Open MetaMask",
              "Click the three dots menu",
              "Select 'Connected sites'", 
              "Disconnect from all suspicious sites",
              "Close browser completely"
            ],
            timeframe: "Immediately"
          },
          {
            action: "Revoke Token Approvals",
            steps: [
              "Go to revoke.cash",
              "Connect your wallet",
              "Review all active approvals",
              "Revoke any suspicious or unlimited approvals",
              "Pay gas fees to revoke on-chain"
            ],
            timeframe: "Within 5 minutes"
          },
          {
            action: "Move Assets to Safety",
            steps: [
              "Create new clean wallet",
              "Send remaining assets to new wallet",
              "Use highest gas to prioritize transactions",
              "Don't use compromised wallet again",
              "Monitor for any unauthorized transactions"
            ],
            timeframe: "Within 15 minutes"
          },
          {
            action: "Document Everything",
            steps: [
              "Screenshot all transactions",
              "Save wallet addresses involved",
              "Note exact time and date",
              "Record what you clicked/approved",
              "Gather evidence for potential investigation"
            ],
            timeframe: "Within 1 hour"
          }
        ],
        preventionStrategy: [
          {
            level: "Basic Protection",
            measures: [
              "Never share seed phrase with anyone",
              "Always verify URLs manually",
              "Use bookmark for frequently used sites",
              "Keep software updated",
              "Use strong unique passwords"
            ]
          },
          {
            level: "Advanced Protection", 
            measures: [
              "Use hardware wallet for large amounts",
              "Separate hot/cold wallet strategy",
              "Regular security audits of approvals",
              "Multi-sig wallets for substantial funds",
              "Professional security practices"
            ]
          }
        ],
        recoveryOptions: [
          {
            scenario: "Seed Phrase Compromised",
            recovery: "Create new wallet, transfer assets immediately",
            prevention: "Never enter seed phrase on any website"
          },
          {
            scenario: "Unauthorized Approvals",
            recovery: "Revoke approvals, monitor wallet closely",
            prevention: "Review all transaction details carefully"
          },
          {
            scenario: "Phishing Attack",
            recovery: "New wallet, report to authorities if significant loss",
            prevention: "Always verify URLs, use bookmarks"
          },
          {
            scenario: "Social Engineering",
            recovery: "Secure all accounts, change passwords",
            prevention: "Never trust unsolicited contact about crypto"
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
      if (!completed.includes('spotting-scams')) {
        completed.push('spotting-scams');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "You're now equipped to spot and avoid DeFi scams. Stay safe!",
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

  const getDangerColor = (danger: string) => {
    switch (danger) {
      case "Critical": return "text-destructive bg-destructive/10 border-destructive/50";
      case "High": return "text-destructive bg-destructive/10 border-destructive/30";
      case "Medium": return "text-accent bg-accent/10 border-accent/30";
      default: return "text-white/50 bg-white/5 border-white/8";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 mobile-typography-center">
        {/* Hero Image */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <img 
            src={scamHero} 
            alt="Cybersecurity shield protecting against cryptocurrency scams, phishing, and fraud" 
            className="w-full h-48 md:h-64 object-cover"
            width={1200}
            height={400}
            loading="eager"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Spotting DeFi Scams</h1>
              <p className="text-white/50">Essential security skills for safe DeFi navigation</p>
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

        <div className="flex justify-end mb-4 px-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'Spotting DeFi Scams Tutorial')}
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
        </div>

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
                className={`flex items-center gap-2 rounded-full px-4 ${completed ? "bg-awareness/20 text-awareness hover:bg-awareness/30" : ""}`}
              >
                <StepIcon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
                {completed && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
              </Button>
            );
          })}
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <Card className="mb-8">
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <currentStepData.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="text-center sm:text-left">
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
              </div>
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <p className="text-white/50 text-sm md:text-base">{currentStepData.content.overview}</p>

              {/* Step 1: Common Scam Types */}
              {currentStep === 1 && (
                <div className="space-y-3 md:space-y-4">
                  <KeyTakeaway title="Critical Statistics">
                    Over $4.6 billion was stolen through crypto scams in 2024. The vast majority could have been prevented with proper verification and security awareness.
                  </KeyTakeaway>

                  <DidYouKnow fact="Phishing websites are the #1 scam method. Scammers created over 500 fake MetaMask sites in 2024 to 2025 by slightly changing URLs (like 'metamasc.io' or 'metamask.com')!" />

                  <Alert className="border-destructive/50 bg-destructive/10 p-3 md:p-4">
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive mx-auto sm:mx-0" />
                    <AlertDescription className="text-foreground text-xs md:text-sm text-center sm:text-left">
                      <strong className="text-destructive">Critical Warning:</strong> DeFi scams cost users billions annually. Learning to identify them is essential for your financial safety.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-3 md:gap-4">
                    {currentStepData.content.scamTypes?.map((scam, index) => (
                      <Card key={index} className={`border-l-4 ${getDangerColor(scam.danger)}`}>
                        <CardHeader className="pb-2 md:pb-3">
                          <div className="flex flex-col gap-2 text-center sm:text-left">
                            <div className="min-w-0">
                              <CardTitle className="text-base md:text-lg break-words mb-1">{scam.name}</CardTitle>
                              <CardDescription className="break-words text-sm">{scam.description}</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                              <Badge variant={scam.frequency === "Very Common" ? "destructive" : "secondary"} className="whitespace-nowrap text-xs">
                                {scam.frequency}
                              </Badge>
                              <Badge variant={scam.danger === "Critical" ? "destructive" : scam.danger === "High" ? "default" : "secondary"} className="whitespace-nowrap text-xs">
                                {scam.danger} Risk
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2 md:pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-center sm:text-left">
                            <div className="min-w-0">
                              <p className="font-medium mb-0.5 text-xs md:text-sm">Scammer's goal:</p>
                              <p className="text-white/50 break-words text-xs md:text-sm">{scam.goal}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium mb-0.5 text-xs md:text-sm">Example:</p>
                              <p className="text-destructive break-words text-xs md:text-sm">{scam.example}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: URL & Website Verification */}
              {currentStep === 2 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">URL Security Checks:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.urlChecks?.map((check, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-2 text-sm md:text-base">{check.check}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4 text-sm">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                  <CheckCircle className="h-3 w-3 text-awareness flex-shrink-0" />
                                  <span className="font-medium text-awareness text-xs md:text-sm">Legitimate:</span>
                                </div>
                                <p className="text-foreground bg-awareness/10 p-1.5 md:p-2 rounded font-mono text-[10px] md:text-xs break-all">
                                  {check.legitimate}
                                </p>
                              </div>
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                  <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                                  <span className="font-medium text-destructive text-xs md:text-sm">Scam:</span>
                                </div>
                                <p className="text-foreground bg-destructive/10 p-1.5 md:p-2 rounded font-mono text-[10px] md:text-xs break-all">
                                  {check.scam}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 md:mt-3 p-1.5 md:p-2 bg-primary/10 rounded">
                              <p className="text-xs md:text-sm text-primary break-words">
                                <strong>How to check:</strong> {check.howToCheck}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Visual Inspection Checklist:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.visualInspection?.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-1.5 text-sm md:text-base">{item.element}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm mb-2">
                              <div className="min-w-0">
                                <span className="font-medium text-awareness">✓ Legitimate: </span>
                                <span className="break-words">{item.legitimate}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-destructive">✗ Scam: </span>
                                <span className="break-words">{item.scam}</span>
                              </div>
                            </div>
                            <div className="p-1.5 md:p-2 bg-accent/10 rounded">
                              <p className="text-xs md:text-sm text-foreground break-words">
                                <strong className="text-accent">💡 Tip:</strong> {item.tip}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Transaction Red Flags */}
              {currentStep === 3 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold">Dangerous Transaction Types:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.dangerousRequests?.map((request, index) => (
                        <Card key={index} className="border-l-4 border-destructive/50">
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-1 text-sm md:text-base text-destructive">{request.type}</h4>
                            <p className="text-xs md:text-sm text-white/50 mb-2 break-words">{request.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 mb-0.5 justify-center sm:justify-start">
                                  <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                                  <span className="font-medium text-destructive text-xs">Red Flag:</span>
                                </div>
                                <p className="text-foreground break-words">{request.redFlag}</p>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 mb-0.5 justify-center sm:justify-start">
                                  <CheckCircle className="h-3 w-3 text-awareness flex-shrink-0" />
                                  <span className="font-medium text-awareness text-xs">Safe:</span>
                                </div>
                                <p className="text-foreground break-words">{request.safe}</p>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 mb-0.5 justify-center sm:justify-start">
                                  <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                                  <span className="font-medium text-primary text-xs">Action:</span>
                                </div>
                                <p className="text-foreground break-words">{request.action}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base text-center sm:text-left">Transaction Analysis Steps:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.transactionAnalysis?.map((analysis, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                              <Badge variant="outline" className="text-[10px] md:text-xs min-w-5 h-5 md:min-w-6 md:h-6 flex items-center justify-center flex-shrink-0">
                                {index + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium mb-1 text-sm md:text-base break-words">{analysis.step}</h4>
                                <p className="text-xs md:text-sm text-white/50 mb-1.5 break-words">{analysis.what}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                                  <div className="min-w-0">
                                    <span className="font-medium text-destructive">⚠️ Red Flag: </span>
                                    <span className="break-words">{analysis.redFlag}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-medium text-accent">🔧 Tool: </span>
                                    <span className="break-words">{analysis.tool}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Social Engineering */}
              {currentStep === 4 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold">Common Social Engineering Tactics:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.commonTactics?.map((tactic, index) => (
                        <Card key={index} className="border-l-4 border-awareness">
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-1.5 text-sm md:text-base text-awareness break-words">{tactic.tactic}</h4>
                            <div className="space-y-2 text-xs md:text-sm">
                              <div className="min-w-0">
                                <span className="font-medium">Scenario: </span>
                                <span className="text-white/50 break-words">{tactic.scenario}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium">Approach: </span>
                                <span className="text-white/50 break-words">{tactic.approach}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-destructive">Goal: </span>
                                <span className="text-destructive break-words">{tactic.goal}</span>
                              </div>
                              <div className="p-1.5 md:p-2 bg-success/10 rounded">
                                <span className="font-medium text-success text-xs md:text-sm">🛡️ Defense: </span>
                                <span className="text-success break-words">{tactic.defense}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Platform-Specific Risks:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.platforms?.map((platform, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-2 text-sm md:text-base break-words">{platform.platform}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs md:text-sm">
                              <div className="min-w-0">
                                <span className="font-medium text-destructive mb-1.5 block text-xs">Common Risks:</span>
                                <ul className="space-y-0.5">
                                  {platform.risks.map((risk, i) => (
                                    <li key={i} className="flex items-start gap-1.5 justify-center sm:justify-start">
                                      <AlertTriangle className="h-2.5 w-2.5 text-destructive mt-0.5 flex-shrink-0" />
                                      <span className="break-words">{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-success mb-1.5 block text-xs">Safety Tips:</span>
                                <p className="text-white/50 break-words">{platform.safety}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Wallet Security */}
              {currentStep === 5 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold">Multi-Layer Security Approach:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.securityLayers?.map((layer, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 text-center sm:text-left">
                            <CardTitle className="text-base md:text-lg flex items-start gap-2 justify-center sm:justify-start">
                              <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="break-words">{layer.layer}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 md:p-6 pt-0 text-center sm:text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              <div className="min-w-0">
                                <h4 className="font-medium mb-1.5 text-xs md:text-sm">Security Checks:</h4>
                                <ul className="space-y-0.5 md:space-y-1 text-xs md:text-sm">
                                  {layer.checks.map((check, i) => (
                                    <li key={i} className="flex items-start gap-1.5 justify-center sm:justify-start">
                                      <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-awareness mt-0.5 flex-shrink-0" />
                                      <span className="break-words text-left">{check}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium mb-1.5 text-xs md:text-sm">Recommended Tools:</h4>
                                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                                  {layer.tools.map((tool, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Regular Security Maintenance:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.regularMaintenance?.map((maintenance, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 md:gap-2 mb-2">
                              <h4 className="font-medium text-sm md:text-base">{maintenance.frequency}</h4>
                              <Badge variant="outline" className="w-fit text-xs mx-auto sm:mx-0">{maintenance.time}</Badge>
                            </div>
                            <ul className="space-y-0.5 md:space-y-1 text-xs md:text-sm">
                              {maintenance.tasks.map((task, i) => (
                                <li key={i} className="flex items-start gap-1.5 justify-center sm:justify-start">
                                  <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="break-words">{task}</span>
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

              {/* Step 6: Research & Verification */}
              {currentStep === 6 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold">Project Research Framework:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.researchChecklist?.map((category, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 text-center sm:text-left">
                            <CardTitle className="text-base md:text-lg break-words">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 md:p-6 pt-0 text-center sm:text-left">
                            <div className="space-y-3 md:space-y-4">
                              <div className="min-w-0">
                                <h4 className="font-medium mb-1.5 text-xs md:text-sm">Key Questions:</h4>
                                <ul className="space-y-0.5 md:space-y-1 text-xs md:text-sm">
                                  {category.checks.map((check, i) => (
                                    <li key={i} className="flex items-start gap-1.5 justify-center sm:justify-start">
                                      <Search className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary mt-0.5 flex-shrink-0" />
                                      <span className="break-words text-left">{check}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                <div className="min-w-0">
                                  <h4 className="font-medium text-destructive mb-1.5 text-xs md:text-sm">Red Flags:</h4>
                                  <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                    {category.redFlags.map((flag, i) => (
                                      <Badge key={i} variant="destructive" className="text-[10px] md:text-xs">
                                        {flag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-medium text-primary mb-1.5 text-xs md:text-sm">Research Tools:</h4>
                                  <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                    {category.tools.map((tool, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] md:text-xs">
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Essential Verification Tools:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.verificationTools?.map((tool, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <div className="flex flex-col gap-1.5 mb-1.5 md:mb-2">
                              <h4 className="font-medium break-words text-sm md:text-base">{tool.tool}</h4>
                              <Badge variant="outline" className="w-fit text-[10px] md:text-xs break-all mx-auto sm:mx-0">{tool.url}</Badge>
                            </div>
                            <p className="text-xs md:text-sm text-white/50 mb-1.5 md:mb-2 break-words">{tool.purpose}</p>
                            <div className="flex items-start gap-1.5 text-xs md:text-sm text-primary justify-center sm:justify-start">
                              <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0 mt-0.5" />
                              <span className="break-words">Usage: {tool.usage}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Emergency Response */}
              {currentStep === 7 && (
              <div className="space-y-4 md:space-y-6">
                <Alert className="border-destructive/20 bg-destructive/10 p-3 md:p-4">
                  <AlertTriangle className="h-4 w-4 text-destructive mx-auto sm:mx-0" />
                  <AlertDescription className="text-destructive text-xs md:text-sm text-center sm:text-left">
                      <strong>Emergency Protocol:</strong> If you suspect compromise, act immediately. Every second counts.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Immediate Response Actions:</h3>
                    <div className="grid gap-3 md:gap-4">
                      {currentStepData.content.immediateActions?.map((action, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 text-center sm:text-left">
                            <div className="flex flex-col gap-1.5">
                              <CardTitle className="text-base md:text-lg text-destructive break-words">{action.action}</CardTitle>
                              <Badge variant="destructive" className="w-fit whitespace-nowrap text-xs mx-auto sm:mx-0">{action.timeframe}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 md:p-6 pt-0 text-center sm:text-left">
                            <ol className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                              {action.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 justify-center sm:justify-start">
                                  <Badge variant="outline" className="text-[10px] md:text-xs min-w-5 h-5 md:min-w-6 md:h-6 flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                  </Badge>
                                  <span className="break-words text-left">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Prevention Strategies:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.preventionStrategy?.map((strategy, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 text-center sm:text-left">
                            <CardTitle className="text-base md:text-lg text-awareness">{strategy.level}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 md:p-6 pt-0 text-center sm:text-left">
                            <ul className="space-y-0.5 md:space-y-1 text-xs md:text-sm">
                              {strategy.measures.map((measure, i) => (
                                <li key={i} className="flex items-start gap-1.5 justify-center sm:justify-start">
                                  <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 text-awareness mt-0.5 flex-shrink-0" />
                                  <span className="break-words text-left">{measure}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h3 className="font-semibold text-sm md:text-base">Recovery Scenarios:</h3>
                    <div className="grid gap-2.5 md:gap-3">
                      {currentStepData.content.recoveryOptions?.map((option, index) => (
                        <Card key={index}>
                          <CardContent className="p-3 md:p-4 text-center sm:text-left">
                            <h4 className="font-medium mb-1.5 text-sm md:text-base text-destructive break-words">{option.scenario}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              <div className="min-w-0">
                                <span className="font-medium text-primary">Recovery: </span>
                                <span className="break-words">{option.recovery}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-awareness">Prevention: </span>
                                <span className="break-words">{option.prevention}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation */}
              <div className="flex flex-col gap-3 pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex-1 min-h-[44px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="flex-1 min-h-[44px]"
                  >
                    <span className="hidden sm:inline">{currentStep === totalSteps ? "Finish Tutorial" : "Next Step"}</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {!isStepCompleted(currentStep) && (
                  <Button
                    variant="secondary"
                    onClick={handleStepComplete}
                    className="w-full min-h-[44px]"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {completedSteps.length === totalSteps && (
          <Card className="bg-awareness/10 border-awareness/20">
            <CardHeader>
              <CardTitle className="text-awareness flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Congratulations! Scam Detection Mastery Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                You now have the essential skills to identify and avoid DeFi scams! 
                Stay vigilant, trust your instincts, and always prioritize security over profit.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/tutorials">Back to Tutorials</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/courses">Continue Learning DeFi</Link>
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

export default SpottingScamsTutorial;
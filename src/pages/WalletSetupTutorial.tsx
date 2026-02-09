import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  ArrowRight, 
  Wallet, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Eye, 
  EyeOff,
  Download,
  Lock,
  Key,
  Globe,
  Smartphone,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CommunityHub } from "@/components/community/CommunityHub";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { KeyTakeaway } from "@/components/course/KeyTakeaway";
import { DidYouKnow } from "@/components/course/DidYouKnow";
import { StepBlock } from "@/components/course/StepBlock";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import walletHeroImage from "@/assets/tutorials/wallet-setup-hero.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopOnlyNotice } from "@/components/DesktopOnlyNotice";

const WalletSetupTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      id: 1,
      title: "Choose Your Wallet",
      icon: Wallet,
      duration: "2 min",
      content: {
        overview: "Select the right wallet for your DeFi journey. We recommend MetaMask for beginners.",
        walletOptions: [
          {
            name: "MetaMask",
            type: "Browser Extension",
            difficulty: "Beginner",
            pros: ["Most popular", "Great DeFi support", "User-friendly"],
            cons: ["Browser-based only", "Hot wallet"],
            recommended: true
          },
          {
            name: "Trust Wallet",
            type: "Mobile App",
            difficulty: "Beginner", 
            pros: ["Mobile-first", "Built-in DApp browser", "Multi-chain"],
            cons: ["Less DeFi integration", "Mobile only"],
            recommended: false
          },
          {
            name: "Ledger",
            type: "Hardware",
            difficulty: "Advanced",
            pros: ["Maximum security", "Cold storage", "Professional grade"],
            cons: ["Costs money", "Complex setup", "Physical device"],
            recommended: false
          }
        ]
      }
    },
    {
      id: 2,
      title: "Download & Install",
      icon: Download,
      duration: "1 min",
      content: {
        overview: "Get MetaMask from the official source only. Never download from third-party sites.",
        instructions: [
          "Go to metamask.io (verify the URL carefully)",
          "Click 'Download' button",
          "Select your browser (Chrome, Firefox, Brave, Edge)",
          "Install the extension from your browser's official store",
          "Pin the extension to your browser toolbar"
        ],
        warnings: [
          "Only download from metamask.io or official browser stores",
          "Check the URL carefully - scammers create fake sites",
          "Verify the extension has millions of users and good ratings"
        ]
      }
    },
    {
      id: 3,
      title: "Create Your Wallet",
      icon: Key,
      duration: "3 min",
      content: {
        overview: "Set up your new wallet with a strong password and secure seed phrase.",
        instructions: [
          "Click the MetaMask extension icon",
          "Select 'Create a new wallet'",
          "Accept or decline usage analytics (your choice)",
          "Create a strong password (8+ characters, mixed case, numbers, symbols)",
          "Read and accept the Terms of Service",
          "Click 'Create new wallet'"
        ],
        passwordTips: [
          "Use a unique password not used elsewhere",
          "Consider using a password manager",
          "Make it at least 12 characters long",
          "Include uppercase, lowercase, numbers, and symbols"
        ]
      }
    },
    {
      id: 4,
      title: "Secure Your Seed Phrase",
      icon: Shield,
      duration: "5 min",
      content: {
        overview: "Your seed phrase is the master key to your wallet. Treat it like your life savings.",
        seedPhrase: [
          "abandon", "ability", "able", "about", "above", "absent", 
          "absorb", "abstract", "absurd", "abuse", "access", "accident"
        ],
        instructions: [
          "Write down your 12-word seed phrase on paper",
          "Write it down again on a second piece of paper", 
          "Store both copies in different secure locations",
          "Never type it into any device or app",
          "Never take a photo of it",
          "Never store it digitally anywhere"
        ],
        storageOptions: [
          { method: "Physical Paper", security: "Good", notes: "Write clearly, use quality paper" },
          { method: "Metal Backup", security: "Excellent", notes: "Fire/water resistant, lasts forever" },
          { method: "Safety Deposit Box", security: "Excellent", notes: "Bank security, requires access" },
          { method: "Home Safe", security: "Good", notes: "Fire-rated safe, accessible" }
        ]
      }
    },
    {
      id: 5,
      title: "Verify Your Setup",
      icon: CheckCircle,
      duration: "2 min", 
      content: {
        overview: "Test your wallet and confirm your seed phrase backup is correct.",
        instructions: [
          "Click 'Confirm seed phrase' in MetaMask",
          "Select the words in the correct order",
          "Complete the verification successfully",
          "Your wallet is now created and secured!",
          "Add the Polygon network for DeFi access"
        ],
        networkSetup: {
          name: "Add Polygon Network",
          steps: [
            "Click the network dropdown (shows 'Ethereum Mainnet')",
            "Click 'Add network' at the bottom",
            "Search for 'Polygon' and click 'Add'",
            "Approve the network addition"
          ]
        }
      }
    },
    {
      id: 6,
      title: "Security Best Practices", 
      icon: Lock,
      duration: "3 min",
      content: {
        overview: "Essential security practices to keep your wallet safe long-term.",
        practices: [
          {
            title: "Phishing Protection",
            description: "Always check URLs carefully. Bookmark metamask.io and DeFi sites.",
            importance: "Critical"
          },
          {
            title: "Transaction Review",
            description: "Always read transaction details before signing. Check amounts and recipients.",
            importance: "Critical" 
          },
          {
            title: "Regular Backups",
            description: "Test your seed phrase backup periodically to ensure it works.",
            importance: "High"
          },
          {
            title: "Software Updates",
            description: "Keep MetaMask and your browser updated to the latest versions.",
            importance: "High"
          },
          {
            title: "Separate Wallets",
            description: "Consider using different wallets for large amounts vs daily trading.",
            importance: "Medium"
          }
        ],
        redFlags: [
          "Anyone asking for your seed phrase",
          "Urgent messages about 'validating' your wallet",
          "Unexpected transaction prompts",
          "Websites asking you to 'reconnect' your wallet",
          "Support that contacts you first"
        ]
      }
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to progress through the tutorial",
        variant: "destructive"
      });
      return;
    }
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, show completion toast and navigate back to tutorials
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Save completion to localStorage
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes('wallet-setup')) {
        completed.push('wallet-setup');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast({
        title: "Tutorial Complete! 🎉",
        description: "Great job! You've completed the Wallet Setup tutorial.",
      });
      setTimeout(() => {
        window.location.href = "/tutorials?tab=immediate";
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to navigate the tutorial",
        variant: "destructive"
      });
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress",
        variant: "destructive"
      });
      return;
    }
    setCompletedSteps(prev => [...prev, currentStep]);
    toast({
      title: "Step completed!",
      description: `You've completed step ${currentStep}: ${currentStepData?.title}`,
    });
  };

  const handleStepChange = (stepId: number) => {
    if (!user && stepId !== 1) {
      toast({
        title: "Sign in required",
        description: "Please sign in to navigate the tutorial",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(stepId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);

  return (
    <>
      <SEO 
        title="DeFi Wallet Setup Tutorial - MetaMask Security Guide"
        description="Complete step-by-step guide to setting up MetaMask wallet safely. Learn wallet security, seed phrase protection, and DeFi best practices for beginners."
        keywords="MetaMask setup, DeFi wallet security, cryptocurrency wallet tutorial, seed phrase backup, blockchain wallet guide, DeFi security"
        url="https://www.the3rdeyeadvisors.com/tutorials/wallet-setup"
        schema={{
          type: 'Course',
          data: {
            offers: {
              price: "0",
              priceCurrency: "USD"
            },
            hasCourseInstance: true,
            coursePrerequisites: "No prior experience required",
            educationalLevel: "Beginner",
            teaches: [
              "MetaMask wallet setup",
              "Seed phrase security",
              "DeFi wallet best practices",
              "Cryptocurrency wallet safety",
              "Blockchain security fundamentals"
            ],
            timeRequired: "PT15M",
            courseCode: "WALLET-SETUP-101"
          }
        }}
        faq={[
          {
            question: "How do I set up a MetaMask wallet safely?",
            answer: "Follow our 6-step tutorial: Choose MetaMask, download from official sources, create with strong password, secure your seed phrase, verify setup, and implement security practices. Always write down your seed phrase on paper."
          },
          {
            question: "What is a seed phrase and why is it important?",
            answer: "A seed phrase is a 12-word backup that controls your entire wallet. It's the master key to your cryptocurrency. Never share it, store it digitally, or take photos. Write it on paper and store in secure locations."
          },
          {
            question: "Is MetaMask safe for DeFi?",
            answer: "MetaMask is widely trusted for DeFi when used properly. Follow security practices: verify URLs, review transactions carefully, keep software updated, and never share your seed phrase or private keys."
          }
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Authentication Notice */}
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

        {/* Tutorial Header with Back Button */}
        <TutorialHeader
          title="Wallet Setup & Security"
          icon={Wallet}
          difficulty="Beginner"
          duration="15 min"
          currentStep={currentStep}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
        />

        {/* Hero Image */}
        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden">
          <img 
            src={walletHeroImage} 
            alt="Cryptocurrency wallet setup with blockchain technology" 
            className="w-full h-48 md:h-64 object-cover"
            width={1200}
            height={400}
            loading="eager"
          />
        </div>

        {/* Desktop Only Notice for Mobile Users */}
        {isMobile && <DesktopOnlyNotice feature="interactive tutorial steps and wallet setup guidance" />}

        {/* Step Navigation */}
        <div className="mb-6 md:mb-8">
          <StepNavigation
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={handleStepChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onMarkComplete={handleStepComplete}
            isAuthenticated={!!user}
          />
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
                  <Badge 
                    variant={isStepCompleted(currentStep) ? "default" : "secondary"}
                    className="w-fit text-xs mx-auto sm:mx-0"
                  >
                    {isStepCompleted(currentStep) ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
              <p className="text-sm md:text-base text-muted-foreground text-center sm:text-left">{currentStepData.content.overview}</p>

              {/* Step 1: Choose Wallet */}
              {currentStep === 1 && (
                <div className="space-y-4 md:space-y-6">
                  <KeyTakeaway>
                    MetaMask is the most popular wallet for DeFi in 2025, with over 30 million active users worldwide. It's beginner-friendly, secure when used properly, and supported by virtually all DeFi platforms.
                  </KeyTakeaway>

                  <DidYouKnow fact="MetaMask now supports over 100 different blockchain networks, making it one of the most versatile wallets available." />

                  <div className="grid gap-3 md:gap-4">
                    {currentStepData.content.walletOptions?.map((wallet, index) => (
                      <Card key={index} className={`${wallet.recommended ? "border-primary bg-primary/5" : ""}`}>
                        <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                          <div className="flex flex-col gap-2 md:gap-3 text-center sm:text-left">
                            <div className="flex-1">
                              <CardTitle className="text-base md:text-lg break-words">{wallet.name}</CardTitle>
                              <CardDescription className="text-xs md:text-sm break-words">{wallet.type}</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center sm:justify-start">
                              <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">{wallet.difficulty}</Badge>
                              {wallet.recommended && <Badge className="text-[10px] md:text-xs whitespace-nowrap">Recommended</Badge>}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                            <div className="text-center sm:text-left">
                              <h4 className="font-medium text-awareness mb-1.5 md:mb-2 text-xs md:text-sm">Pros:</h4>
                              <ul className="text-xs md:text-sm space-y-0.5 md:space-y-1">
                                {wallet.pros.map((pro, i) => (
                                  <li key={i} className="flex items-center gap-1.5 md:gap-2 justify-center sm:justify-start">
                                    <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-awareness flex-shrink-0" />
                                    <span className="break-words">{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-center sm:text-left">
                              <h4 className="font-medium text-destructive mb-1.5 md:mb-2 text-xs md:text-sm">Cons:</h4>
                              <ul className="text-xs md:text-sm space-y-0.5 md:space-y-1">
                                {wallet.cons.map((con, i) => (
                                  <li key={i} className="flex items-center gap-1.5 md:gap-2 justify-center sm:justify-start">
                                    <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-destructive flex-shrink-0" />
                                    <span className="break-words">{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Download */}
              {currentStep === 2 && (
                <div className="space-y-3 md:space-y-4">
                  <Alert className="border-destructive/50 bg-destructive/10 p-3 md:p-4">
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive mx-auto sm:mx-0" />
                    <AlertDescription className="text-foreground text-xs md:text-sm text-center sm:text-left">
                      <strong>Security Warning:</strong> Only download MetaMask from official sources to avoid scams.
                    </AlertDescription>
                  </Alert>

                  <DidYouKnow fact="In 2024-2025, scammers created over 500 fake MetaMask websites. Always verify you're on the official metamask.io domain!" />

                  <StepBlock 
                    title="Installation Steps:"
                    steps={currentStepData.content.instructions || []}
                  />

                  <div className="space-y-1.5 md:space-y-2 text-center sm:text-left">
                    <h4 className="font-medium text-destructive text-xs md:text-sm">Critical Warnings:</h4>
                    {currentStepData.content.warnings?.map((warning, index) => (
                      <div key={index} className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm justify-center sm:justify-start">
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="break-words text-left">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Create Wallet */}
              {currentStep === 3 && (
                <div className="space-y-3 md:space-y-4">
                  <KeyTakeaway title="Password Best Practice">
                    Use a unique password with at least 16 characters. Consider a password manager like Bitwarden or 1Password to generate and store it securely.
                  </KeyTakeaway>

                  <StepBlock 
                    title="Setup Steps:"
                    steps={currentStepData.content.instructions || []}
                  />

                  <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="pb-2 md:pb-3 p-3 md:p-6 text-center sm:text-left">
                      <CardTitle className="text-base md:text-lg text-primary">Password Security Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                      <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                        {currentStepData.content.passwordTips?.map((tip, index) => (
                          <li key={index} className="flex items-start gap-1.5 md:gap-2 justify-center sm:justify-start">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-foreground break-words text-left">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Seed Phrase */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <Shield className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-foreground">
                      <strong className="text-destructive">CRITICAL:</strong> Your seed phrase is the master key to your wallet. If someone gets it, they own your crypto forever.
                    </AlertDescription>
                  </Alert>

                  <DidYouKnow fact="Over $4.2 billion in cryptocurrency was stolen in 2024, with 67% of thefts caused by compromised seed phrases. Never share yours with anyone!" />

                  {/* Example Seed Phrase */}
                  <Card className="border-2 border-dashed border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Example Seed Phrase</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                        >
                          {showSeedPhrase ? (
                            <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                          ) : (
                            <><Eye className="h-4 w-4 mr-2" /> Show</>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showSeedPhrase ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                          {currentStepData.content.seedPhrase?.map((word, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded min-w-0">
                              <Badge variant="outline" className="text-xs min-w-6 w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span className="text-sm font-mono text-foreground truncate flex-1">{word}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Click "Show" to reveal the example seed phrase
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Storage Instructions */}
                  <StepBlock 
                    title="Backup Instructions:"
                    steps={currentStepData.content.instructions || []}
                  />

                  {/* Storage Options */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Storage Options:</h3>
                    <div className="grid gap-3">
                      {currentStepData.content.storageOptions?.map((option, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h4 className="font-medium flex-1">{option.method}</h4>
                              <Badge 
                                variant={
                                  option.security === "Excellent" ? "default" : 
                                  option.security === "Good" ? "secondary" : "outline"
                                }
                                className="whitespace-nowrap w-fit"
                              >
                                {option.security}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{option.notes}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Verification */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <KeyTakeaway>
                    Adding the Polygon network allows you to use DeFi with much lower fees than Ethereum mainnet. Often just cents instead of dollars per transaction.
                  </KeyTakeaway>

                  <StepBlock 
                    title="Verification Steps:"
                    steps={currentStepData.content.instructions || []}
                  />

                  <Card className="bg-awareness/10 border-awareness/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-awareness flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {currentStepData.content.networkSetup?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StepBlock steps={currentStepData.content.networkSetup?.steps || []} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 6: Security Practices */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <KeyTakeaway title="Security is Your Responsibility">
                    Unlike banks, there's no "forgot password" button in crypto. You are your own bank, which means you're responsible for security. These practices will keep your funds safe.
                  </KeyTakeaway>

                  <DidYouKnow fact="Hardware wallets like Ledger or Trezor provide military-grade security for amounts over $10,000, but MetaMask is perfectly safe for everyday DeFi when following these best practices." />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Essential Security Practices:</h3>
                    <div className="grid gap-4">
                      {currentStepData.content.practices?.map((practice, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h4 className="font-medium flex-1">{practice.title}</h4>
                              <Badge 
                                variant={
                                  practice.importance === "Critical" ? "destructive" : 
                                  practice.importance === "High" ? "default" : "secondary"
                                }
                                className="whitespace-nowrap w-fit"
                              >
                                {practice.importance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{practice.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-foreground">
                      <div className="space-y-2">
                        <p className="font-medium text-destructive">Red Flags - Never Trust:</p>
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

              {/* Step Completion - Removed, using StepNavigation component instead */}
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {completedSteps.length === totalSteps && (
          <Card className="bg-awareness/10 border-awareness/20">
            <CardHeader>
              <CardTitle className="text-awareness flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Congratulations! Wallet Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">
                You've successfully set up your MetaMask wallet with proper security measures. 
                You're now ready to safely explore DeFi!
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/tutorials">Back to Tutorials</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/courses">Start DeFi Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Hub */}
        <CommunityHub 
          contentType="tutorial"
          contentId="wallet-setup"
          title="Wallet Setup & Security Tutorial"
        />
      </div>
      </div>
    </>
  );
};

export default WalletSetupTutorial;
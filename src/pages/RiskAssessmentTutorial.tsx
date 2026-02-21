import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, AlertTriangle, Shield, TrendingDown, Users, ArrowLeft, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyTakeaway } from "@/components/course/KeyTakeaway";
import { DidYouKnow } from "@/components/course/DidYouKnow";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Volume2 } from 'lucide-react';

const RiskAssessmentTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  // Collect all tutorial text content into one string for audio
  const getTutorialText = () => {
    return steps.map(step =>
      `${step.title}. ${step.description || ''}`
    ).join(' ');
  };

  const steps = [
    {
      title: "Understanding Risk Types",
      description: "Learn about different types of risks in DeFi",
      content: (
        <div className="space-y-3 md:space-y-4">
          <KeyTakeaway title="2025 Critical Data">
            The largest DeFi hack in 2024 was $231 million from WazirX. Over 60% of DeFi exploits could have been prevented with proper audits and risk assessment.
          </KeyTakeaway>

          <DidYouKnow fact="Protocols with multiple independent audits from firms like Trail of Bits, CertiK, and OpenZeppelin have a 95% lower hack rate than unaudited protocols." />

          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">Types of DeFi Risks</h3>
          <div className="grid gap-2.5 md:gap-4">
            <Card className="p-3 md:p-4 border-destructive/20 text-center sm:text-left">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 justify-center sm:justify-start">
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-destructive flex-shrink-0" />
                <h4 className="font-semibold text-sm md:text-base">Market Risk</h4>
              </div>
              <p className="text-xs md:text-sm text-white/50 break-words">Price volatility, impermanent loss, liquidity risks</p>
            </Card>
            <Card className="p-3 md:p-4 border-awareness/20 text-center sm:text-left">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 justify-center sm:justify-start">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-awareness flex-shrink-0" />
                <h4 className="font-semibold text-sm md:text-base">Smart Contract Risk</h4>
              </div>
              <p className="text-xs md:text-sm text-white/50 break-words">Code vulnerabilities, bugs, exploits</p>
            </Card>
            <Card className="p-3 md:p-4 border-accent/20 text-center sm:text-left">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 justify-center sm:justify-start">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
                <h4 className="font-semibold text-sm md:text-base">Counterparty Risk</h4>
              </div>
              <p className="text-xs md:text-sm text-white/50 break-words">Protocol governance, admin keys, centralization</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Risk Assessment Framework",
      description: "Create a systematic approach to evaluating risks",
      content: (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">Risk Assessment Matrix</h3>
          <div className="space-y-2.5 md:space-y-3">
            <div className="border rounded p-3 text-center sm:text-left">
              <h4 className="font-semibold text-xs md:text-sm mb-2">1. Protocol Maturity</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center sm:justify-start">
                <Badge variant="destructive" className="text-[10px] md:text-xs whitespace-nowrap">New (&lt;6 months)</Badge>
                <Badge variant="secondary" className="text-[10px] md:text-xs whitespace-nowrap">Established (6 to 24 months)</Badge>
                <Badge variant="default" className="text-[10px] md:text-xs whitespace-nowrap">Mature (&gt;2 years)</Badge>
              </div>
            </div>
            <div className="border rounded p-3 text-center sm:text-left">
              <h4 className="font-semibold text-xs md:text-sm mb-2">2. TVL (Total Value Locked)</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center sm:justify-start">
                <Badge variant="destructive" className="text-[10px] md:text-xs whitespace-nowrap">&lt;$10M</Badge>
                <Badge variant="secondary" className="text-[10px] md:text-xs whitespace-nowrap">$10M-$100M</Badge>
                <Badge variant="default" className="text-[10px] md:text-xs whitespace-nowrap">&gt;$100M</Badge>
              </div>
            </div>
            <div className="border rounded p-3 text-center sm:text-left">
              <h4 className="font-semibold text-xs md:text-sm mb-2">3. Audit Status</h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center sm:justify-start">
                <Badge variant="destructive" className="text-[10px] md:text-xs whitespace-nowrap">No audits</Badge>
                <Badge variant="secondary" className="text-[10px] md:text-xs whitespace-nowrap">1 to 2 audits</Badge>
                <Badge variant="default" className="text-[10px] md:text-xs whitespace-nowrap">Multiple audits</Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Due Diligence Checklist",
      description: "Essential checks before investing in any DeFi protocol",
      content: (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">Pre-Investment Checklist</h3>
          <div className="space-y-1.5 md:space-y-2">
            {[
              "Check if the protocol has been audited",
              "Review the team and their track record",
              "Understand the tokenomics and incentive structure",
              "Assess the total value locked (TVL)",
              "Read the documentation and whitepaper",
              "Check for any past security incidents",
              "Evaluate the governance model",
              "Test with small amounts first"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 md:p-2.5 border rounded text-center sm:text-left justify-center sm:justify-start">
                <Circle className="w-3 h-3 md:w-4 md:h-4 text-white/50 flex-shrink-0" />
                <span className="text-xs md:text-sm break-words">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Risk Mitigation Strategies",
      description: "Learn how to minimize and manage risks",
      content: (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">Risk Management Techniques</h3>
          <div className="grid gap-2.5 md:gap-4">
            <Card className="p-3 md:p-4 text-center sm:text-left">
              <h4 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base">Diversification</h4>
              <p className="text-xs md:text-sm text-white/50 break-words">Spread investments across multiple protocols and asset types</p>
            </Card>
            <Card className="p-3 md:p-4 text-center sm:text-left">
              <h4 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base">Position Sizing</h4>
              <p className="text-xs md:text-sm text-white/50 break-words">Never invest more than you can afford to lose</p>
            </Card>
            <Card className="p-3 md:p-4 text-center sm:text-left">
              <h4 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base">Dollar-Cost Averaging</h4>
              <p className="text-xs md:text-sm text-white/50 break-words">Enter positions gradually over time</p>
            </Card>
            <Card className="p-3 md:p-4 text-center sm:text-left">
              <h4 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base">Stop Losses</h4>
              <p className="text-xs md:text-sm text-white/50 break-words">Set clear exit criteria for losing positions</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Red Flags and Warning Signs",
      description: "Identify potentially dangerous protocols",
      content: (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">Critical Warning Signs</h3>
          <div className="space-y-2.5 md:space-y-3">
            {[
              {
                flag: "Anonymous team with no track record",
                severity: "high"
              },
              {
                flag: "Unrealistic yield promises (>100% APY)",
                severity: "high"
              },
              {
                flag: "No code audits or security reviews",
                severity: "high"
              },
              {
                flag: "Centralized admin keys without timelock",
                severity: "medium"
              },
              {
                flag: "Poor documentation or unclear mechanics",
                severity: "medium"
              },
              {
                flag: "Low liquidity or small TVL",
                severity: "low"
              }
            ].map((item, index) => (
              <div key={index} className={`p-2.5 md:p-3 border rounded flex flex-col sm:flex-row items-center gap-2 md:gap-3 text-center sm:text-left ${
                item.severity === 'high' ? 'border-destructive bg-destructive/10' :
                item.severity === 'medium' ? 'border-awareness bg-awareness/10' :
                'border-accent bg-accent/10'
              }`}>
                <AlertTriangle className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${
                  item.severity === 'high' ? 'text-destructive' :
                  item.severity === 'medium' ? 'text-awareness' :
                  'text-accent'
                }`} />
                <span className="text-xs md:text-sm break-words flex-1">{item.flag}</span>
                <Badge variant={item.severity === 'high' ? 'destructive' : 'secondary'} className="w-fit text-[10px] md:text-xs whitespace-nowrap">
                  {item.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    if (!user) {
      toast.error("Sign in required", { description: "Please sign in to track your progress" });
      return;
    }
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      toast.success(`Step ${stepIndex + 1} completed!`);
    }
  };

  const handleStepChange = (index: number) => {
    if (!user && index !== 0) {
      toast.error("Sign in required", { description: "Please sign in to navigate tutorial steps" });
      return;
    }
    setCurrentStep(index);
  };

  const handleNext = () => {
    if (!user) {
      toast.error("Sign in required", { description: "Please sign in to progress through the tutorial" });
      return;
    }
    if (currentStep === steps.length - 1) {
      handleStepComplete(currentStep);
      
      // Save completion to localStorage
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes('risk-assessment')) {
        completed.push('risk-assessment');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast.success("Tutorial Complete! 🎉 You've mastered DeFi risk assessment.");
      setTimeout(() => {
        window.location.href = "/tutorials?tab=practical";
      }, 1500);
    } else {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast.error("Sign in required", { description: "Please sign in to navigate the tutorial" });
      return;
    }
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 mobile-typography-center">
        {/* Back to Tutorials Button */}
        <div className="mb-6">
          <Link to="/tutorials?tab=practical">
            <Button variant="ghost" className="gap-2 hover:bg-white/5 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Practical DeFi Actions</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3 mb-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Risk Assessment in Action</h1>
              <p className="text-sm md:text-base text-white/50">Learn to evaluate and manage DeFi risks systematically</p>
            </div>
            <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 text-xs">Medium Priority</Badge>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs md:text-sm mb-2">
            <span>Progress</span>
            <span>{completedSteps.length}/{steps.length} steps completed</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'Risk Assessment Tutorial')}
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

        <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg text-center sm:text-left">Tutorial Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 md:p-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-2.5 md:p-3 rounded cursor-pointer transition-colors text-center sm:text-left ${
                      currentStep === index ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      {completedSteps.includes(index) ? (
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-awareness flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      )}
                      <span className="text-xs md:text-sm font-medium break-words">{step.title}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="p-3 md:p-6 text-center sm:text-left">
                <CardTitle className="text-base md:text-xl">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                {steps[currentStep].content}
                
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="min-h-[44px]"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleStepComplete(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                      className="flex-1 sm:flex-none min-h-[44px] text-xs md:text-sm"
                    >
                      {completedSteps.includes(currentStep) ? 'Completed' : 'Mark Complete'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentStep === steps.length - 1) {
                          handleStepComplete(currentStep);
                          
                          // Save completion to localStorage
                          const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
                          if (!completed.includes('risk-assessment')) {
                            completed.push('risk-assessment');
                            localStorage.setItem('completedTutorials', JSON.stringify(completed));
                          }
                          
                          toast.success("Tutorial Complete! 🎉 You've mastered DeFi risk assessment.");
                          setTimeout(() => {
                            window.location.href = "/tutorials?tab=practical";
                          }, 1500);
                        } else {
                          setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                        }
                      }}
                      className="flex-1 sm:flex-none min-h-[44px] text-xs md:text-sm"
                    >
                      {currentStep === steps.length - 1 ? 'Finish Tutorial' : 'Next'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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

export default RiskAssessmentTutorial;
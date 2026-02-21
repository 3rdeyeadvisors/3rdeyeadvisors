import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, Vote, Coins, FileText, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Volume2 } from 'lucide-react';

const DaoParticipationTutorial = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();

  // Collect all tutorial text content into one string for audio
  const getTutorialText = () => {
    return steps.map(step =>
      `${step.title}. ${step.description || ''}`
    ).join(' ');
  };

  const steps = [
    {
      id: 1,
      title: "Understanding DAOs",
      icon: Users,
      duration: "5 min",
      description: "Learn the fundamentals of Decentralized Autonomous Organizations",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What is a DAO?</h3>
          <Card className="p-4 bg-primary/10 border-primary/20">
            <p className="text-sm text-foreground">
              A DAO (Decentralized Autonomous Organization) is an organization represented by rules encoded as smart contracts on the blockchain, controlled by its members rather than a central authority.
            </p>
          </Card>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-awareness" />
                <h4 className="font-semibold">Decentralized Governance</h4>
              </div>
              <p className="text-sm text-white/50">No single entity controls decisions; power is distributed among token holders</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Transparent Operations</h4>
              </div>
              <p className="text-sm text-white/50">All activities and decisions are recorded on the blockchain</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-accent" />
                <h4 className="font-semibold">Token-Based Voting</h4>
              </div>
              <p className="text-sm text-white/50">Governance tokens represent voting power and membership rights</p>
            </Card>
          </div>
          
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">Types of DAOs</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">Protocol DAOs</h5>
                <p className="text-xs text-white/50">Govern DeFi protocols</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">Investment DAOs</h5>
                <p className="text-xs text-white/50">Collective investment funds</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">Service DAOs</h5>
                <p className="text-xs text-white/50">Provide services to Web3</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">Social DAOs</h5>
                <p className="text-xs text-white/50">Community-focused</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Getting Governance Tokens",
      icon: Coins,
      duration: "4 min",
      description: "Acquire tokens to participate in DAO governance",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How to Get Governance Tokens</h3>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Purchase on Exchanges</h4>
              <p className="text-sm text-white/50 mb-2">Buy tokens directly from centralized or decentralized exchanges</p>
              <ul className="text-xs space-y-1">
                <li>• Check major exchanges like Coinbase, Binance</li>
                <li>• Use DEXs like Uniswap, SushiSwap</li>
                <li>• Compare prices across platforms</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Participate in Protocol</h4>
              <p className="text-sm text-white/50 mb-2">Earn tokens through active participation</p>
              <ul className="text-xs space-y-1">
                <li>• Provide liquidity to earn tokens</li>
                <li>• Use the protocol's services</li>
                <li>• Participate in incentive programs</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Airdrops</h4>
              <p className="text-sm text-white/50 mb-2">Receive free tokens for early participation</p>
              <ul className="text-xs space-y-1">
                <li>• Follow project announcements</li>
                <li>• Meet eligibility criteria</li>
                <li>• Claim within specified timeframes</li>
              </ul>
            </Card>
          </div>
          
          <Card className="p-4 bg-accent/10 border-accent/20">
            <h4 className="font-semibold text-accent mb-2">⚠️ Important Considerations</h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Research the project thoroughly before investing</li>
              <li>• Understand the token's utility and value accrual</li>
              <li>• Consider the minimum tokens needed for meaningful participation</li>
              <li>• Factor in gas costs for voting and claiming</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 3,
      title: "Understanding Proposals",
      icon: FileText,
      duration: "6 min",
      description: "Learn how to read and evaluate governance proposals",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Anatomy of a DAO Proposal</h3>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Proposal Components</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Title & Summary</h5>
                <p className="text-xs text-white/50">Brief description of what's being proposed</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Background & Motivation</h5>
                <p className="text-xs text-white/50">Why this change is needed</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Specification</h5>
                <p className="text-xs text-white/50">Technical details of the implementation</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Impact Analysis</h5>
                <p className="text-xs text-white/50">Expected effects on the protocol and users</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Types of Proposals</h4>
            <div className="grid gap-3">
              <div className="p-3 bg-awareness/10 border border-awareness/20 rounded">
                <h5 className="font-medium text-sm text-awareness">Parameter Changes</h5>
                <p className="text-xs text-foreground">Adjust protocol settings like fees, rates, limits</p>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded">
                <h5 className="font-medium text-sm text-primary">Treasury Management</h5>
                <p className="text-xs text-foreground">Allocate funds for development, partnerships, grants</p>
              </div>
              <div className="p-3 bg-accent/10 border border-accent/20 rounded">
                <h5 className="font-medium text-sm text-accent">Protocol Upgrades</h5>
                <p className="text-xs text-foreground">Add new features or fix security issues</p>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                <h5 className="font-medium text-sm text-destructive">Emergency Actions</h5>
                <p className="text-xs text-foreground">Respond to urgent security threats</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Evaluation Checklist</h4>
            <ul className="text-sm space-y-1">
              <li>• Does the proposal align with the DAO's mission?</li>
              <li>• Are the benefits clearly articulated?</li>
              <li>• What are the potential risks and downsides?</li>
              <li>• Is the implementation plan realistic?</li>
              <li>• Who benefits from this proposal?</li>
              <li>• Are there alternative solutions?</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 4,
      title: "Voting Process",
      icon: Vote,
      duration: "5 min",
      description: "Learn how to cast votes and understand voting mechanisms",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How DAO Voting Works</h3>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Vote className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Voting Power</h4>
              </div>
              <p className="text-sm text-white/50 mb-2">Your voting power is typically proportional to your token holdings</p>
              <ul className="text-xs space-y-1">
                <li>• 1 token = 1 vote (most common)</li>
                <li>• Some DAOs use quadratic voting</li>
                <li>• Delegation allows you to assign voting power</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Voting Options</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm font-medium">For/Yes</span>
                  <Badge variant="default" className="bg-awareness">Support</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm font-medium">Against/No</span>
                  <Badge variant="destructive">Oppose</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm font-medium">Abstain</span>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Voting Platforms</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Snapshot</h5>
                <p className="text-xs text-white/50">Off-chain voting (gas-free)</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Tally</h5>
                <p className="text-xs text-white/50">On-chain governance dashboard</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Governor Alpha/Bravo</h5>
                <p className="text-xs text-white/50">On-chain voting contracts</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Commonwealth</h5>
                <p className="text-xs text-white/50">Discussion & voting platform</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-awareness/10 border-awareness/20">
            <h4 className="font-semibold text-awareness mb-2">Best Voting Practices</h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Read the full proposal and discussion</li>
              <li>• Consider long-term effects, not just short-term gains</li>
              <li>• Vote based on your conviction, not following others</li>
              <li>• Participate in discussions before voting</li>
              <li>• Don't sell tokens immediately after voting</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 5,
      title: "Active Participation",
      icon: Users,
      duration: "4 min",
      description: "Engage meaningfully in DAO communities and discussions",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Beyond Voting: Active Participation</h3>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Community Engagement</h4>
              <div className="space-y-2">
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Discord/Forum Participation</h5>
                  <p className="text-xs text-white/50">Join discussions, ask questions, share insights</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Working Groups</h5>
                  <p className="text-xs text-white/50">Contribute to specific initiatives and projects</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Proposal Writing</h5>
                  <p className="text-xs text-white/50">Draft and submit your own proposals</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Contributing Skills</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded">
                  <h5 className="font-medium text-sm text-primary">Technical</h5>
                  <ul className="text-xs text-foreground mt-1 space-y-1">
                    <li>• Smart contract development</li>
                    <li>• Frontend/backend development</li>
                    <li>• Security auditing</li>
                  </ul>
                </div>
                <div className="p-3 bg-awareness/10 border border-awareness/20 rounded">
                  <h5 className="font-medium text-sm text-awareness">Non-Technical</h5>
                  <ul className="text-xs text-foreground mt-1 space-y-1">
                    <li>• Community management</li>
                    <li>• Marketing and content</li>
                    <li>• Legal and compliance</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Leadership Opportunities</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Committee Member</h5>
                <p className="text-xs text-white/50">Join governance, treasury, or technical committees</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Delegate</h5>
                <p className="text-xs text-white/50">Receive delegated voting power from others</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Steward/Guardian</h5>
                <p className="text-xs text-white/50">Take on formal leadership roles</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Building Reputation</h4>
            <ul className="text-sm space-y-2">
              <li>• <strong>Consistency:</strong> Regular, thoughtful participation</li>
              <li>• <strong>Quality contributions:</strong> Well-researched posts and proposals</li>
              <li>• <strong>Collaboration:</strong> Work well with others, build relationships</li>
              <li>• <strong>Long-term thinking:</strong> Focus on sustainable growth</li>
              <li>• <strong>Transparency:</strong> Be open about your interests and motivations</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 6,
      title: "DAO Security and Best Practices",
      icon: Shield,
      duration: "4 min",
      description: "Protect yourself and contribute to DAO security",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">DAO Security Considerations</h3>
          
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <h4 className="font-semibold text-destructive mb-2">Common DAO Risks</h4>
            <div className="space-y-2">
              <div className="p-2 border border-destructive/30 rounded">
                <h5 className="font-medium text-sm text-destructive">Governance Attacks</h5>
                <p className="text-xs text-foreground/80">Malicious actors gaining control through token accumulation</p>
              </div>
              <div className="p-2 border border-destructive/30 rounded">
                <h5 className="font-medium text-sm text-destructive">Smart Contract Bugs</h5>
                <p className="text-xs text-foreground/80">Vulnerabilities in governance contracts</p>
              </div>
              <div className="p-2 border border-destructive/30 rounded">
                <h5 className="font-medium text-sm text-destructive">Low Participation</h5>
                <p className="text-xs text-foreground/80">Small minorities making decisions for everyone</p>
              </div>
              <div className="p-2 border border-destructive/30 rounded">
                <h5 className="font-medium text-sm text-destructive">Centralization Risks</h5>
                <p className="text-xs text-foreground/80">Power concentration in few hands</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Personal Security</h4>
            <ul className="text-sm space-y-2">
              <li>• <strong>Wallet security:</strong> Use hardware wallets for governance tokens</li>
              <li>• <strong>Private keys:</strong> Never share or store online</li>
              <li>• <strong>Phishing protection:</strong> Verify official links and contracts</li>
              <li>• <strong>Delegation safety:</strong> Research delegates thoroughly</li>
              <li>• <strong>Transaction verification:</strong> Double-check all governance transactions</li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Due Diligence Framework</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Technical Assessment</h5>
                <ul className="text-xs space-y-1">
                  <li>• Are smart contracts audited?</li>
                  <li>• Is the code open source?</li>
                  <li>• Are there timelocks on critical functions?</li>
                </ul>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Governance Structure</h5>
                <ul className="text-xs space-y-1">
                  <li>• What's the quorum requirement?</li>
                  <li>• How long are voting periods?</li>
                  <li>• Are there checks and balances?</li>
                </ul>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Community Health</h5>
                <ul className="text-xs space-y-1">
                  <li>• Is participation diverse?</li>
                  <li>• Are discussions constructive?</li>
                  <li>• Is there transparency in operations?</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-success/10 border-success">
            <h4 className="font-semibold text-foreground mb-2">Best Practices</h4>
            <ul className="text-sm text-white/50 space-y-1">
              <li>• Start with smaller, established DAOs to learn</li>
              <li>• Diversify across multiple DAOs to reduce risk</li>
              <li>• Stay informed about governance developments</li>
              <li>• Participate in security discussions and audits</li>
              <li>• Report suspicious activities to the community</li>
              <li>• Maintain a long-term perspective on governance</li>
            </ul>
          </Card>
        </div>
      )
    }
  ];

  const totalSteps = steps.length;

  const handleNext = () => {
    if (!user) {
      toast.error('Please sign in to progress through the tutorial');
      return;
    }
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => [...prev, currentStep]);
      
      const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
      if (!completed.includes('dao-participation')) {
        completed.push('dao-participation');
        localStorage.setItem('completedTutorials', JSON.stringify(completed));
      }
      
      toast.success('Tutorial Complete!', {
        description: 'You now understand how to participate in DAOs.'
      });
      setTimeout(() => window.location.href = '/tutorials', 2000);
    }
  };

  const handlePrevious = () => {
    if (!user) {
      toast.error('Please sign in to navigate the tutorial');
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (stepId: number) => {
    if (!user) {
      toast.error('Please sign in to navigate the tutorial');
      return;
    }
    setCurrentStep(stepId);
  };

  const handleStepComplete = () => {
    if (!user) {
      toast.error('Please sign in to track your progress');
      return;
    }
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
      toast.success('Step Completed!');
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
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

        <TutorialHeader
          title="DAO Participation Guide"
          icon={Users}
          difficulty="Intermediate"
          duration="28 min"
          currentStep={currentStep}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
        />

        <div className="flex justify-end mb-4 px-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'DAO Participation Tutorial')}
            className="flex items-center gap-2 font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-3 py-2"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen to this tutorial
          </button>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-6 tutorial-content-area">
            {steps[currentStep - 1]?.content}
          </CardContent>
        </Card>

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

export default DaoParticipationTutorial;
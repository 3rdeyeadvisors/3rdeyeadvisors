import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, Image, Coins, Lock, ArrowLeft, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from "@/hooks/use-mobile";
import { TutorialHeader } from "@/components/course/TutorialHeader";
import { StepNavigation } from "@/components/course/StepNavigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Volume2 } from 'lucide-react';

const NftDefiTutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isMobile = useIsMobile();
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
      title: "NFT Fundamentals",
      description: "Understanding NFTs and their unique properties",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What Makes NFTs Special?</h3>
          <div className="grid gap-4">
            <Card className="p-4 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Image className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Non-Fungible</h4>
              </div>
              <p className="text-sm text-white/50">Each NFT is unique and cannot be replaced by another identical item</p>
            </Card>
            <Card className="p-4 border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-accent" />
                <h4 className="font-semibold">Blockchain Verified</h4>
              </div>
              <p className="text-sm text-white/50">Ownership and authenticity are verified on the blockchain</p>
            </Card>
            <Card className="p-4 border-awareness/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-awareness" />
                <h4 className="font-semibold">Programmable</h4>
              </div>
              <p className="text-sm text-white/50">Smart contracts can add utility and functionality</p>
            </Card>
          </div>
          
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-2">Common NFT Standards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">ERC-721</h5>
                <p className="text-xs text-white/50">Individual unique tokens</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <h5 className="font-medium text-sm">ERC-1155</h5>
                <p className="text-xs text-white/50">Semi-fungible tokens</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "NFT Lending and Borrowing",
      description: "Use NFTs as collateral for loans",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">NFT-Collateralized Lending</h3>
          
          <Card className="p-4 bg-accent/10 border-accent">
            <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
            <ol className="text-sm text-white/50 space-y-1">
              <li>1. Deposit your NFT as collateral</li>
              <li>2. Receive a loan in cryptocurrency (usually ETH or stablecoins)</li>
              <li>3. Pay interest over the loan period</li>
              <li>4. Repay the loan to get your NFT back</li>
              <li>5. If you default, the lender keeps your NFT</li>
            </ol>
          </Card>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Popular NFT Lending Platforms</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">BendDAO</span>
                  <Badge variant="outline">Ethereum</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">NFTfi</span>
                  <Badge variant="outline">P2P Lending</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">Arcade</span>
                  <Badge variant="outline">Institutional</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Key Considerations</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Loan-to-Value (LTV):</strong> Usually 30 to 50% of NFT floor price</li>
                <li>• <strong>Interest rates:</strong> Typically higher than traditional DeFi</li>
                <li>• <strong>Liquidation risk:</strong> NFT can be sold if you default</li>
                <li>• <strong>Floor price volatility:</strong> NFT values can change rapidly</li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "NFT Yield Farming",
      description: "Earn rewards by staking or providing NFT liquidity",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generating Yield from NFTs</h3>
          
          <div className="grid gap-4">
            <Card className="p-4 border-success/20">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-success" />
                <h4 className="font-semibold">NFT Staking</h4>
              </div>
              <p className="text-sm text-white/50 mb-2">Lock your NFTs to earn token rewards</p>
              <ul className="text-xs space-y-1">
                <li>• Keep ownership while earning passive income</li>
                <li>• Rewards often paid in project tokens</li>
                <li>• May require holding for minimum periods</li>
              </ul>
            </Card>
            
            <Card className="p-4 border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-accent" />
                <h4 className="font-semibold">Liquidity Mining</h4>
              </div>
              <p className="text-sm text-white/50 mb-2">Provide NFT liquidity to earn trading fees</p>
              <ul className="text-xs space-y-1">
                <li>• Deposit NFTs into liquidity pools</li>
                <li>• Earn from trading fees and incentives</li>
                <li>• Risk of impermanent loss equivalent</li>
              </ul>
            </Card>
            
            <Card className="p-4 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Fractionalized Ownership</h4>
              </div>
              <p className="text-sm text-white/50 mb-2">Own fractions of expensive NFTs</p>
              <ul className="text-xs space-y-1">
                <li>• Split expensive NFTs into tradeable tokens</li>
                <li>• Lower barrier to entry</li>
                <li>• Share in potential appreciation</li>
              </ul>
            </Card>
          </div>
          
          <Card className="p-4 bg-awareness/10 border-awareness">
            <h4 className="font-semibold text-foreground mb-2">⚠️ Yield Farming Risks</h4>
            <ul className="text-sm text-white/50 space-y-1">
              <li>• Smart contract vulnerabilities</li>
              <li>• Token price volatility</li>
              <li>• Liquidity risks when unstaking</li>
              <li>• Regulatory uncertainty</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      title: "NFT Marketplaces and Trading",
      description: "Navigate NFT markets and trading strategies",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">NFT Trading Strategies</h3>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Major NFT Marketplaces</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">OpenSea</span>
                    <p className="text-xs text-white/50">Largest NFT marketplace</p>
                  </div>
                  <Badge variant="outline">2.5% fee</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">LooksRare</span>
                    <p className="text-xs text-white/50">Rewards for trading</p>
                  </div>
                  <Badge variant="outline">2% fee</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">X2Y2</span>
                    <p className="text-xs text-white/50">Lower fees</p>
                  </div>
                  <Badge variant="outline">0.5% fee</Badge>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Trading Strategies</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <h5 className="font-medium text-sm">Floor Sweeping</h5>
                  <p className="text-xs text-white/50">Buy multiple NFTs at floor price</p>
                </div>
                <div className="p-3 border rounded">
                  <h5 className="font-medium text-sm">Trait Sniping</h5>
                  <p className="text-xs text-white/50">Target undervalued rare traits</p>
                </div>
                <div className="p-3 border rounded">
                  <h5 className="font-medium text-sm">Flip Trading</h5>
                  <p className="text-xs text-white/50">Quick buy and sell for profit</p>
                </div>
                <div className="p-3 border rounded">
                  <h5 className="font-medium text-sm">Long-term Holding</h5>
                  <p className="text-xs text-white/50">Accumulate blue-chip collections</p>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Analysis Tools</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>Rarity tools:</strong> Understand trait rarity and value</li>
              <li>• <strong>Floor tracking:</strong> Monitor price movements</li>
              <li>• <strong>Volume analysis:</strong> Track trading activity</li>
              <li>• <strong>Whale watching:</strong> Follow large holders</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      title: "Gaming and Metaverse NFTs",
      description: "Explore utility NFTs in gaming and virtual worlds",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Utility-Driven NFTs</h3>
          
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Gaming NFTs</h4>
              <div className="space-y-2">
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">In-Game Assets</h5>
                  <p className="text-xs text-white/50">Weapons, characters, skins that you truly own</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Play-to-Earn</h5>
                  <p className="text-xs text-white/50">Earn NFTs and tokens by playing games</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Cross-Game Utility</h5>
                  <p className="text-xs text-white/50">Use NFTs across multiple games/platforms</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Virtual Real Estate</h4>
              <div className="space-y-2">
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Land Ownership</h5>
                  <p className="text-xs text-white/50">Own virtual plots in metaverse worlds</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Development Rights</h5>
                  <p className="text-xs text-white/50">Build experiences on your land</p>
                </div>
                <div className="p-2 border rounded">
                  <h5 className="font-medium text-sm">Rental Income</h5>
                  <p className="text-xs text-white/50">Lease land to other users/brands</p>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Popular Gaming Ecosystems</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Axie Infinity</h5>
                <p className="text-xs text-white/50">Pet battling game</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">The Sandbox</h5>
                <p className="text-xs text-white/50">Voxel metaverse</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Decentraland</h5>
                <p className="text-xs text-white/50">Virtual world platform</p>
              </div>
              <div className="p-3 border rounded">
                <h5 className="font-medium text-sm">Gods Unchained</h5>
                <p className="text-xs text-white/50">Trading card game</p>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      title: "Risk Management for NFT-DeFi",
      description: "Protect yourself in the volatile NFT market",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">NFT-Specific Risks</h3>
          
          <div className="space-y-4">
            <Card className="p-4 bg-destructive/10 border-destructive">
              <h4 className="font-semibold text-foreground mb-2">Major Risk Categories</h4>
              <div className="space-y-2">
                <div className="p-2 border border-destructive/30 rounded">
                  <h5 className="font-medium text-sm text-destructive">Liquidity Risk</h5>
                  <p className="text-xs text-white/50">NFTs can become illiquid quickly</p>
                </div>
                <div className="p-2 border border-destructive/30 rounded">
                  <h5 className="font-medium text-sm text-destructive">Volatility Risk</h5>
                  <p className="text-xs text-white/50">Prices can swing dramatically</p>
                </div>
                <div className="p-2 border border-destructive/30 rounded">
                  <h5 className="font-medium text-sm text-destructive">Technical Risk</h5>
                  <p className="text-xs text-white/50">Smart contract bugs and exploits</p>
                </div>
                <div className="p-2 border border-destructive/30 rounded">
                  <h5 className="font-medium text-sm text-destructive">Regulatory Risk</h5>
                  <p className="text-xs text-white/50">Uncertain legal framework</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Risk Mitigation Strategies</h4>
              <ul className="text-sm space-y-2">
                <li>• <strong>Diversification:</strong> Don't put all funds in NFTs</li>
                <li>• <strong>Blue-chip focus:</strong> Stick to established collections</li>
                <li>• <strong>Due diligence:</strong> Research team, roadmap, utility</li>
                <li>• <strong>Start small:</strong> Test platforms with small amounts</li>
                <li>• <strong>Monitor markets:</strong> Stay updated on trends and news</li>
                <li>• <strong>Secure storage:</strong> Use hardware wallets for valuable NFTs</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Portfolio Allocation Guidelines</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Conservative investor</span>
                  <Badge variant="outline">2 to 5% in NFTs</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Moderate investor</span>
                  <Badge variant="outline">5 to 10% in NFTs</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Aggressive investor</span>
                  <Badge variant="outline">10 to 20% in NFTs</Badge>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4 bg-awareness/10 border-awareness/20">
            <h4 className="font-semibold text-awareness mb-2">Best Practices</h4>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Never invest more than you can afford to lose</li>
              <li>• Keep detailed records for tax purposes</li>
              <li>• Stay informed about market trends and developments</li>
              <li>• Build relationships in the NFT community</li>
              <li>• Consider the long-term utility, not just speculation</li>
            </ul>
          </Card>
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

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 mobile-typography-center">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tutorials')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tutorials
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">NFT & DeFi Integration</h1>
            <p className="text-white/50">Discover how NFTs and DeFi protocols work together</p>
          </div>
          <Badge variant="secondary">Medium Priority</Badge>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{completedSteps.length}/{steps.length} steps completed</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => openAudio(getTutorialText(), 'NFT & DeFi Integration Tutorial')}
            className="flex items-center gap-2 font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-3 py-2"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen to this tutorial
          </button>
        </div>
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

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tutorial Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    currentStep === index ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5'
                  }`}
                  onClick={() => handleStepChange(index)}
                >
                  <div className="flex items-center gap-2">
                  {completedSteps.includes(index) ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {steps[currentStep].content}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!user) {
                      toast.error("Sign in required", { description: "Please sign in to navigate the tutorial" });
                      return;
                    }
                    setCurrentStep(Math.max(0, currentStep - 1));
                  }}
                  disabled={currentStep === 0 || !user}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleStepComplete(currentStep)}
                    disabled={completedSteps.includes(currentStep)}
                    className="w-full sm:w-auto"
                  >
                    {completedSteps.includes(currentStep) ? 'Completed' : 'Mark Complete'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast.error("Sign in required", { description: "Please sign in to progress through the tutorial" });
                        return;
                      }
                      if (currentStep === steps.length - 1) {
                        handleStepComplete(currentStep);
                        
                        // Save completion to localStorage
                        const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
                        if (!completed.includes('nft-defi')) {
                          completed.push('nft-defi');
                          localStorage.setItem('completedTutorials', JSON.stringify(completed));
                        }
                        
                        toast.success("Tutorial Complete! 🎉 You're ready to explore NFT-DeFi opportunities.");
                        setTimeout(() => {
                          navigate('/tutorials?tab=advanced');
                        }, 1500);
                      } else {
                        setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                      }
                    }}
                    disabled={!user}
                  >
                    {currentStep === steps.length - 1 ? 'Finish Tutorial' : 'Next'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default NftDefiTutorial;
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Wallet,
  Link2,
  ArrowRight,
  Eye,
  CheckCircle2,
  ExternalLink,
  Clock,
  MinusCircle,
  AlertTriangle,
  DollarSign,
  Volume2
} from "lucide-react";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const ENZYME_VAULT_URL = "https://app.enzyme.finance/vault/0x8b668add6fba7c01444353c0dfdef222a816cd9f";
const ENZYME_REDEEM_URL = "https://app.enzyme.finance/vault/0x8b668add6fba7c01444353c0dfdef222a816cd9f/redeem";

const VaultWithdrawalTutorial = () => {
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();
  return (
    <>
      <SEO 
        title="How to Withdraw from the 3EA Vault | Tutorial"
        description="Step-by-step guide to redeeming your vault shares and withdrawing funds from the 3EA Enzyme Vault."
      />

      <div className="container max-w-3xl px-4 py-8 md:py-12 space-y-6 md:space-y-8">
        {/* Back Navigation */}
        <Link to="/vault-access" className="inline-flex items-center gap-2 text-white/50 hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Vault Access
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <Badge variant="outline" className="mb-2">
            <Wallet className="h-3 w-3 mr-1" />
            Tutorial
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">How to Withdraw from the 3EA Vault</h1>
          <p className="text-base md:text-lg text-white/50">
            A complete guide to redeeming your vault shares and getting your funds back.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => openAudio("How to Withdraw from the 3EA Vault. A complete guide to redeeming your vault shares and getting your funds back.", 'Vault Withdrawal Tutorial')}
              className="flex items-center gap-2 font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-3 py-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen to this tutorial
            </button>
          </div>
        </div>

        <Separator />

        {/* Important Note */}
        <Alert variant="default" className="bg-amber-500/5 border-amber-500/20">
          <div className="flex gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Good to know:</strong> Withdrawals are processed instantly on the blockchain. You'll receive the current value of your vault shares based on the vault's net asset value (NAV).
            </p>
          </div>
        </Alert>

        {/* Step 1: Connect to Enzyme */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                1
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Link2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Connect to the Enzyme Vault</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Link your wallet to view your shares</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Navigate to the 3EA vault on Enzyme Finance and connect the same wallet you used to deposit.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click the button below to open the 3EA Vault on Enzyme Finance</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Connect Wallet"</strong> in the top-right corner</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Select <strong>"MetaMask"</strong> and approve the connection</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your vault share balance should be visible on the vault page</p>
              </div>
            </div>

            <Button asChild className="gap-2 w-full sm:w-auto">
              <a href={ENZYME_VAULT_URL} target="_blank" rel="noopener noreferrer">
                Open 3EA Vault on Enzyme
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Check Your Share Value */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                2
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Check Your Share Value</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">See how much your shares are worth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Before withdrawing, review the current value of your vault shares.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">On the vault page, look for your <strong>"Share Balance"</strong> or <strong>"Your Position"</strong></p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">The value shown is based on the vault's current NAV (Net Asset Value)</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your shares may be worth more or less than your original deposit depending on vault performance</p>
              </div>
            </div>

            <Alert variant="default" className="bg-white/5">
              <div className="flex gap-3">
                <DollarSign className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Note:</strong> The vault's value fluctuates based on market conditions and the performance of the DeFi strategies being used.
                </p>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 3: Initiate Withdrawal */}
        <Card className="border-primary/30">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                3
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MinusCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Initiate Your Withdrawal</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Redeem your vault shares for the underlying assets</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Click the Redeem button to start the withdrawal process.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">On the vault page, find and click the <strong>"Redeem"</strong> or <strong>"Withdraw"</strong> button</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Enter the number of shares you want to redeem (or click "Max" for all shares)</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Review the estimated value you'll receive in the denomination asset (ETH)</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Redeem"</strong> or <strong>"Confirm"</strong> to proceed</p>
              </div>
            </div>

            <Button asChild className="gap-2 w-full sm:w-auto">
              <a href={ENZYME_REDEEM_URL} target="_blank" rel="noopener noreferrer">
                Go to Redeem Page
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 4: Confirm Transaction */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                4
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Confirm the Transaction</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Approve the withdrawal in MetaMask</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              MetaMask will pop up asking you to confirm the redemption transaction.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Review the transaction details in the MetaMask popup</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Check the gas fee :  you'll need enough ETH to cover this</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Confirm"</strong> to submit the transaction</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Wait for the transaction to be confirmed on the blockchain (usually 1 to 3 minutes)</p>
              </div>
            </div>

            <Alert variant="default" className="bg-white/5">
              <div className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Tip:</strong> Gas fees are lower during off-peak hours. Check <a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline">etherscan.io/gastracker</a> for current prices.
                </p>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 5: Verify Funds Received */}
        <Card className="border-primary/30">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                5
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Wallet className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Verify Funds in Your Wallet</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Check that your withdrawal was successful</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Once the transaction is confirmed, your funds will appear in your MetaMask wallet.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Open MetaMask and check your ETH balance</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your balance should have increased by the redeemed amount (minus gas fees)</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your vault share balance on Enzyme should be reduced or zero</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">You can view the transaction on <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline">Etherscan</a> for full details</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 md:pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm md:text-base">Withdrawal Complete!</p>
                <p className="text-xs md:text-sm text-white/50">
                  Your funds are now back in your wallet. You can re-deposit at any time as long as you still hold the access NFT.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/vault-deposit-guide" className="text-sm text-primary hover:underline text-center">
            ← View Deposit Guide
          </Link>
          <Link to="/contact" className="text-sm text-primary hover:underline text-center">
            Need Help? Contact Us
          </Link>
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

export default VaultWithdrawalTutorial;

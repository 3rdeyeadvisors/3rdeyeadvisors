import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Wallet,
  Download,
  Shield,
  Link2,
  ArrowRight,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import AudioPlayer from '@/components/audio/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Volume2 } from 'lucide-react';

const ENZYME_VAULT_URL = "https://app.enzyme.finance/vault/0x8b668add6fba7c01444353c0dfdef222a816cd9f";
const VAULT_TOKEN_ADDRESS = "0x8b668add6fba7c01444353c0dfdef222a816cd9f";
const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";
const THIRDWEB_NFT_URL = "https://thirdweb.com/ethereum/0x91AE8ec3d88E871679F826c1D6c5B008f105506c";

const VaultDepositTutorial = () => {
  const { isOpen: audioOpen, audioText, audioTitle, openAudio, closeAudio } = useAudioPlayer();
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <>
      <SEO 
        title="How to Deposit into the Sentinel DeFi Vault | Tutorial"
        description="Step-by-step guide to depositing into the Sentinel DeFi Enzyme Vault using MetaMask. Learn how to connect, deposit, and view your vault tokens."
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">How to Deposit into the Sentinel DeFi Vault</h1>
          <p className="text-base md:text-lg text-white/50">
            A complete guide to depositing into our Enzyme vault and viewing your vault tokens in MetaMask.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => openAudio("How to Deposit into the Sentinel DeFi Vault. A complete guide to depositing into our Enzyme vault and viewing your vault tokens in MetaMask.", 'Vault Deposit Tutorial')}
              className="flex items-center gap-2 font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl px-3 py-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen to this tutorial
            </button>
          </div>
        </div>

        <Separator />

        {/* Step 1: Install MetaMask */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                1
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Download className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Install MetaMask</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Set up your wallet if you haven't already</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              MetaMask is a browser extension wallet that lets you interact with Ethereum dApps like Enzyme Finance.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Go to <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline">metamask.io/download</a> and install the browser extension</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Create a new wallet or import an existing one using your seed phrase</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base"><strong>Important:</strong> Write down your 12-word recovery phrase and store it securely offline</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Make sure you're connected to <strong>Ethereum Mainnet</strong> (select from the network dropdown at the top)</p>
              </div>
            </div>

            <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
              <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                Download MetaMask
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Fund Your Wallet */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                2
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <PlusCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Fund Your Wallet</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Add ETH for the NFT purchase and gas fees</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              You'll need ETH in your wallet to purchase the NFT and pay for gas fees on all transactions.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Transfer ETH from an exchange (Coinbase, Kraken, etc.) to your MetaMask wallet address</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your wallet address is shown at the top of MetaMask :  click to copy it</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Include extra ETH for gas fees (typically $5 to 20 depending on network congestion)</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Wait for the transfer to complete (usually 5 to 15 minutes)</p>
              </div>
            </div>

            <Alert variant="default" className="bg-white/5">
              <div className="flex gap-3">
                <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Tip:</strong> Gas fees are lower during off-peak hours (weekends, early mornings UTC). Check <a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline">etherscan.io/gastracker</a> for current gas prices.
                </p>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 3: Get the Access NFT */}
        <Card className="border-primary/30">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                3
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Get the Sentinel Earth Access NFT</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Your membership key to the vault</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              The Sentinel Earth Access NFT is required to deposit into the vault. Without it, you won't be able to access the vault even if you connect your wallet.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Visit the Thirdweb page and connect your MetaMask wallet</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Buy"</strong> to purchase the NFT with ETH from your wallet</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Confirm the transaction in MetaMask and wait for it to complete</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">The NFT will appear in your wallet once the transaction is confirmed</p>
              </div>
            </div>

            <Button asChild className="gap-2 w-full sm:w-auto">
              <a href={THIRDWEB_NFT_URL} target="_blank" rel="noopener noreferrer">
                Get Your Access NFT
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 4: Wait for Whitelisting */}
        <Card className="border-amber-500/30">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm md:text-base shrink-0">
                4
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Wait for Whitelisting</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Your wallet needs to be added to the vault's whitelist</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              After purchasing the NFT, your wallet address needs to be whitelisted on the Enzyme vault. This is a manual process that can take up to 7 days.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Wait up to <strong>7 days</strong> after your NFT purchase for whitelisting</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Check the vault periodically by connecting your wallet to Enzyme</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">If the <strong>"Deposit"</strong> button is available and clickable, you're whitelisted!</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">If you see an error or the button is disabled, check back in a day or two</p>
              </div>
            </div>

            <Alert variant="default" className="bg-amber-500/5 border-amber-500/20">
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Be patient:</strong> Whitelisting happens in batches. If it's been more than 7 days, contact us through the <Link to="/contact" className="text-primary hover:underline inline">contact page</Link>.
                </p>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 5: Connect to Enzyme */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                5
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Link2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Connect to the Enzyme Vault</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Link your wallet to the Sentinel DeFi vault</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Navigate to our vault on Enzyme Finance and connect your MetaMask wallet.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click the button below to open the Sentinel DeFi Vault on Enzyme Finance</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Connect Wallet"</strong> in the top-right corner of the Enzyme page</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Select <strong>"MetaMask"</strong> from the wallet options</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">MetaMask will pop up :  click <strong>"Connect"</strong> to approve the connection</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Your wallet address should now appear in the top-right corner</p>
              </div>
            </div>

            <Button asChild className="gap-2 w-full sm:w-auto">
              <a href={ENZYME_VAULT_URL} target="_blank" rel="noopener noreferrer">
                Open Sentinel DeFi Vault on Enzyme
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 6: Make Your Deposit */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                6
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>Make Your Deposit</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Deposit ETH into the vault</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Once connected, you can deposit ETH into the vault to receive vault shares.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">On the vault page, look for the <strong>"Deposit"</strong> or <strong>"Buy Shares"</strong> button</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Enter the amount of ETH you want to deposit</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Review the transaction details, including the estimated vault shares you'll receive</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Deposit"</strong> or <strong>"Confirm"</strong></p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">MetaMask will pop up showing the transaction :  review the gas fee and click <strong>"Confirm"</strong></p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Wait for the transaction to be confirmed on the blockchain (usually 1 to 3 minutes)</p>
              </div>
            </div>

            <Alert variant="default" className="bg-white/5">
              <Shield className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Once deposited, your funds are managed by the vault strategy. 
                You can withdraw at any time by redeeming your vault shares.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 7: View Vault Tokens in MetaMask */}
        <Card className="border-primary/30">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-bold text-sm md:text-base shrink-0">
                7
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  <span>View Vault Tokens in MetaMask</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">Add your vault shares to MetaMask</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-white/50">
              Your vault shares are ERC-20 tokens. To see them in MetaMask, you need to manually add the token.
            </p>

            {/* Token Address Box */}
            <div className="bg-white/5 rounded-lg p-3 md:p-4 space-y-2">
              <p className="text-xs md:text-sm font-medium">Vault Token Contract Address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] md:text-sm bg-black rounded px-2 md:px-3 py-2 overflow-x-auto break-all">
                  {VAULT_TOKEN_ADDRESS}
                </code>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="shrink-0 h-8 w-8 md:h-10 md:w-10"
                  onClick={() => copyToClipboard(VAULT_TOKEN_ADDRESS, "Token address")}
                >
                  <Copy className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Open MetaMask and make sure you're on <strong>Ethereum Mainnet</strong></p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Scroll down and click <strong>"Import tokens"</strong> at the bottom</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Select the <strong>"Custom token"</strong> tab</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Paste the vault token address (copied above) into the <strong>"Token contract address"</strong> field</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">MetaMask will auto-fill the token symbol and decimals</p>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm md:text-base">Click <strong>"Add custom token"</strong> and then <strong>"Import tokens"</strong></p>
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <AlertTitle className="text-sm md:text-base">Success!</AlertTitle>
              <AlertDescription className="text-sm">
                Your vault shares will now appear in your MetaMask token list. The balance reflects your share of the vault's total value.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-500 shrink-0" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs md:text-sm p-4 pt-0 md:p-6 md:pt-0">
            <p>• <strong>Whitelisting:</strong> After purchasing your NFT, allow up to 7 days for your wallet to be whitelisted.</p>
            <p>• <strong>Non-custodial:</strong> You always maintain control of your funds. Withdraw anytime by redeeming shares.</p>
            <p>• <strong>Gas fees:</strong> All Ethereum transactions require gas. Keep some ETH in your wallet for future transactions.</p>
            <p>• <strong>Vault value:</strong> Your share value fluctuates based on the vault's strategy performance.</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
            <a href={ENZYME_VAULT_URL} target="_blank" rel="noopener noreferrer">
              Start Depositing
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/vault-access">
              Back to Vault Access
            </Link>
          </Button>
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

export default VaultDepositTutorial;
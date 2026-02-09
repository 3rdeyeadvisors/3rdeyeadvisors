import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Lock,
  ExternalLink,
  Key,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";
import nftImage from "@/assets/nft/3ea-earth-access.png";

// External URLs
const THIRDWEB_NFT_URL = "https://thirdweb.com/ethereum/0x91AE8ec3d88E871679F826c1D6c5B008f105506c";
const ENZYME_VAULT_URL = "https://app.enzyme.finance/vault/0x8b668add6fba7c01444353c0dfdef222a816cd9f";

const VaultAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SEO 
        title="Vault Access | 3EA"
        description="Access the exclusive 3EA Enzyme Vault. NFT holders get access to managed DeFi strategies."
      />

      <div className="container max-w-4xl py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            <Lock className="h-3 w-3 mr-1" />
            NFT-Gated Access
          </Badge>
          <h1 className="text-4xl font-bold">3EA Enzyme Vault</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The 3EA Earth Access NFT is your private key to the vault. 
            Only NFT holders can deposit into this exclusive DeFi strategy.
          </p>
        </div>

        <Separator />

        {/* NFT Access Key Section */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Key className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Step 1: Get Your Access NFT</CardTitle>
            <CardDescription className="text-base">
              The 3EA Earth Access NFT acts as your membership key to the vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* NFT Preview */}
              <div className="w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border border-primary/20">
                <img 
                  src={nftImage} 
                  alt="3EA Earth Access NFT membership key"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Benefits */}
              <div className="flex-1 space-y-3">
                <h3 className="font-semibold">What you get:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span>Exclusive vault access membership</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                    <span>Managed DeFi strategies by 3EA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <span>Non-custodial – you control your funds</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button 
              asChild 
              size="lg" 
              className="w-full min-h-[48px] gap-2"
            >
              <a 
                href={THIRDWEB_NFT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Your Access NFT
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Purchase on Thirdweb with your wallet
            </p>
          </CardContent>
        </Card>

        {/* Vault Access Section */}
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Step 2: Access the Vault</CardTitle>
            <CardDescription className="text-base">
              Already own the NFT? Connect your wallet on Enzyme to deposit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Vault Details:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-medium">Enzyme Finance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strategy:</span>
                  <span className="font-medium">Managed DeFi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access:</span>
                  <span className="font-medium">NFT Holders Only</span>
                </div>
              </div>
            </div>

            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="w-full min-h-[48px] gap-2"
            >
              <a 
                href={ENZYME_VAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Enter the Enzyme Vault
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You'll connect your wallet directly on Enzyme's platform
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Link to="/vault-deposit-guide" className="text-sm text-primary hover:underline">
                Deposit Guide →
              </Link>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <Link to="/vault-withdrawal-guide" className="text-sm text-primary hover:underline">
                Withdrawal Guide →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-center">
              <strong>Important:</strong> After purchasing your NFT, please allow up to 7 days for your wallet to be whitelisted on the vault.
            </p>
          </CardContent>
        </Card>

        {/* Not signed in prompt */}
        {!user && (
          <Card className="border-muted">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to your 3EA account to track your vault activity and get updates.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/auth?redirect=/vault-access')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default VaultAccess;

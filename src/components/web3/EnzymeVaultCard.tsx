import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, Lock, Shield } from "lucide-react";
import { ENZYME_CONFIG, getEnzymeVaultUrl, getEnzymeDepositUrl, getEnzymeRedeemUrl } from "@/lib/enzyme";

interface EnzymeVaultCardProps {
  isWhitelisted?: boolean;
  walletAddress?: string;
}

export const EnzymeVaultCard = ({ isWhitelisted = false, walletAddress }: EnzymeVaultCardProps) => {
  const vaultUrl = getEnzymeVaultUrl();
  const depositUrl = getEnzymeDepositUrl();
  const redeemUrl = getEnzymeRedeemUrl();

  if (!isWhitelisted) {
    return (
      <Card className="border-white/8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-white/50" />
            Enzyme Vault Access
          </CardTitle>
          <CardDescription>
            Complete NFT verification to access the vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-white/50">
            <p>Verify your NFT ownership to unlock vault access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            3EA Enzyme Vault
          </CardTitle>
          <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
            <Shield className="h-3 w-3 mr-1" />
            Verified Access
          </Badge>
        </div>
        <CardDescription>
          Managed DeFi strategies powered by Enzyme Finance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vault Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-white/50 mb-1">Vault Address</p>
            <p className="font-mono text-xs truncate">
              {ENZYME_CONFIG.comptrollerProxy}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-white/50 mb-1">Network</p>
            <p className="font-medium">Ethereum Mainnet</p>
          </div>
        </div>

        {/* External Links */}
        <div className="space-y-3">
          <p className="text-sm text-white/50">
            Manage your vault position through Enzyme Finance's secure interface:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="default" 
              className="flex-1 min-h-[44px]"
              onClick={() => window.open(depositUrl, '_blank', 'noopener,noreferrer')}
            >
              Deposit
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 min-h-[44px]"
              onClick={() => window.open(redeemUrl, '_blank', 'noopener,noreferrer')}
            >
              Withdraw
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="w-full min-h-[44px]"
            onClick={() => window.open(vaultUrl, '_blank', 'noopener,noreferrer')}
          >
            View Full Vault Dashboard
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-warning/10 border border-warning/30 p-4">
          <p className="text-xs text-warning">
            <strong>External Service:</strong> Deposits and withdrawals are processed through Enzyme Finance's platform. 
            3EA does not custody your funds. Always verify you're on the official Enzyme Finance website.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnzymeVaultCard;

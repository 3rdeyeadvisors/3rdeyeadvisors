import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CryptoDisclaimerProps {
  onAccept: () => void;
  onDecline?: () => void;
}

export const CryptoDisclaimer = ({ onAccept, onDecline }: CryptoDisclaimerProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [understandsRisks, setUnderstandsRisks] = useState(false);

  const canProceed = acknowledged && understandsRisks;

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-amber-500">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Important Crypto & Investment Disclaimer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 text-sm">
          <div className="rounded-lg bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              External Wallet & Transactions
            </h4>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li>All transactions are processed through your external wallet (MetaMask, Coinbase, etc.)</li>
              <li>Purchases are made using cryptocurrency, not through this app's payment system</li>
              <li>You are solely responsible for managing your private keys and wallet security</li>
              <li>Blockchain transactions are irreversible: there are no refunds</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Third-Party Services
            </h4>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li>Interactions with third-party DeFi protocols are at your own risk</li>
              <li>Sentinel DeFi does not custody your funds: you maintain full control</li>
              <li>Smart contract risks exist with any DeFi protocol</li>
              <li>Always verify you are interacting with official protocol addresses</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Investment Risks
            </h4>
            <ul className="list-disc list-inside space-y-1 text-white/50">
              <li>Cryptocurrency investments are highly volatile and speculative</li>
              <li>Past performance does not guarantee future results</li>
              <li>You may lose some or all of your investment</li>
              <li>This is not financial advice: consult a professional advisor</li>
              <li>Only invest what you can afford to lose</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="acknowledge" 
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label htmlFor="acknowledge" className="text-sm leading-relaxed cursor-pointer">
              I acknowledge that all crypto transactions are processed externally through my own wallet 
              and are not facilitated by this app's payment system.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="risks" 
              checked={understandsRisks}
              onCheckedChange={(checked) => setUnderstandsRisks(checked === true)}
            />
            <Label htmlFor="risks" className="text-sm leading-relaxed cursor-pointer">
              I understand the risks associated with cryptocurrency investments and DeFi protocols, 
              including potential loss of funds.
            </Label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onDecline && (
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onDecline}>
              Cancel
            </Button>
          )}
          <Button 
            className="flex-1 min-h-[44px]" 
            disabled={!canProceed}
            onClick={onAccept}
          >
            I Understand, Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoDisclaimer;

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { PRICING, COMMISSION_RATES } from "@/lib/constants";

interface ReferralTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccepted: () => void;
}

const CURRENT_TERMS_VERSION = "v1.0";

export const ReferralTermsModal = ({ open, onOpenChange, onAccepted }: ReferralTermsModalProps) => {
  const { user } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    if (!user || !agreed) return;

    setAccepting(true);
    try {
      const { error } = await supabase
        .from("referral_terms_acceptance")
        .insert({
          user_id: user.id,
          terms_version: CURRENT_TERMS_VERSION,
        });

      if (error) {
        // Check if already accepted (unique constraint)
        if (error.code === "23505") {
          onAccepted();
          return;
        }
        throw error;
      }

      toast.success("Referral program terms accepted!");
      onAccepted();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("Failed to save acceptance. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Referral Program Terms
          </DialogTitle>
          <DialogDescription>
            Please review and accept the terms to participate in the referral program.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Commission Structure</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Non-subscribers & monthly subscribers: {Math.round(COMMISSION_RATES.monthly * 100)}% commission</li>
                <li>Annual subscribers: {Math.round(COMMISSION_RATES.annual * 100)}% commission (premium rate)</li>
                <li>Founding 33 members: {Math.round(COMMISSION_RATES.founding_33 * 100)}% commission (highest tier)</li>
                <li>Earn ${(PRICING.monthly.amount * COMMISSION_RATES.monthly).toFixed(2)} to ${(PRICING.annual.amount * COMMISSION_RATES.founding_33).toFixed(2)} per referral</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Payment Terms</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Commissions paid within 7 to 10 business days via crypto (USDC) or Zelle</li>
                <li>You must set up payout details in your account</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Program Rules</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>No self-referrals or fake accounts</li>
                <li>No spam or misleading promotions</li>
                <li>Violations result in forfeiture of commissions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Important Notices</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Commissions are paid within 7 to 10 business days</li>
                <li>You are responsible for taxes on earnings</li>
                <li>No guaranteed earnings : results vary</li>
                <li>Refunded subscriptions = deducted commissions</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-border">
              <Link 
                to="/referral-terms" 
                target="_blank"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Read full terms and conditions
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 py-4 border-t border-border">
          <Checkbox 
            id="agree-terms" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label 
            htmlFor="agree-terms" 
            className="text-sm text-foreground/80 leading-relaxed cursor-pointer"
          >
            I have read and agree to the{" "}
            <Link to="/referral-terms" target="_blank" className="text-primary hover:underline">
              Referral Program Terms & Conditions
            </Link>
            , including the commission structure, payment terms, and program rules.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={accepting}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!agreed || accepting}>
            {accepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralTermsModal;

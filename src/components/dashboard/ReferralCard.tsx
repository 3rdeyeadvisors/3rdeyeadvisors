import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Copy, Check, Gift, Share2, FileText, Shield, ChevronDown, DollarSign, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useReferralTerms } from "@/hooks/useReferralTerms";
import { ReferralTermsModal } from "@/components/referral/ReferralTermsModal";
import { ReferredUsersList } from "./ReferredUsersList";

interface ReferralStats {
  totalReferrals: number;
  bonusEntries: number;
  convertedReferrals: number;
  pendingCommissions: number;
  paidCommissions: number;
}

interface ActiveRaffle {
  id: string;
  title: string;
  end_date: string;
}

export const ReferralCard = () => {
  const { user } = useAuth();
  const { hasAcceptedTerms, loading: termsLoading, refreshTermsStatus, acceptance } = useReferralTerms();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ 
    totalReferrals: 0, 
    bonusEntries: 0,
    convertedReferrals: 0,
    pendingCommissions: 0,
    paidCommissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeRaffle, setActiveRaffle] = useState<ActiveRaffle | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  const referralLink = user ? `${window.location.origin}/auth?ref=${user.id}&tab=signup` : "";

  useEffect(() => {
    if (user) {
      loadReferralStats();
      loadActiveRaffle();
    }
  }, [user]);

  const loadActiveRaffle = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('id, title, end_date')
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (!error && data) {
        setActiveRaffle(data);
      }
    } catch (error) {
      console.error('Error loading active raffle:', error);
    }
  };

  const loadReferralStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Count referrals where current user is the referrer
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('id, bonus_awarded')
        .eq('referrer_id', user.id);

      if (error) throw error;

      // Get commission stats (converted referrals = actual paying customers)
      const { data: commissions } = await supabase
        .from('commissions')
        .select('commission_amount_cents, status')
        .eq('referrer_id', user.id);

      const totalReferrals = referrals?.length || 0;
      const bonusEntries = referrals?.filter(r => r.bonus_awarded).length || 0;
      const convertedReferrals = commissions?.length || 0;
      const pendingCommissions = commissions
        ?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.commission_amount_cents, 0) || 0;
      const paidCommissions = commissions
        ?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission_amount_cents, 0) || 0;

      setStats({ totalReferrals, bonusEntries, convertedReferrals, pendingCommissions, paidCommissions });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join 3rdeyeadvisors",
          text: "Learn DeFi with me! Sign up using my referral link and we both earn bonus raffle entries.",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled share, not an error
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    refreshTermsStatus();
  };

  if (!user) return null;

  // Show terms acceptance required state
  if (!termsLoading && !hasAcceptedTerms) {
    return (
      <>
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Invite Friends & Earn Rewards</h3>
                  <p className="text-sm text-white/50">
                    Accept the referral terms to get your unique link
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/8">
              <div className="flex items-center gap-3 flex-1">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  Review and accept our referral program terms to start earning commissions and bonus entries.
                </p>
              </div>
              <Button onClick={() => setShowTermsModal(true)} className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                View Terms
              </Button>
            </div>
          </div>
        </Card>

        <ReferralTermsModal
          open={showTermsModal}
          onOpenChange={setShowTermsModal}
          onAccepted={handleTermsAccepted}
        />
      </>
    );
  }

  return (
    <>
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Invite Friends & Earn Rewards</h3>
                <p className="text-sm text-white/50">
                  {activeRaffle 
                    ? `Share your referral link and earn bonus entries for "${activeRaffle.title}"`
                    : "Share your referral link: bonus entries will be awarded when a raffle is active"
                  }
                </p>
              </div>
            </div>
            
          </div>

          {/* Stats badges */}
          {!loading && stats.totalReferrals > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {stats.totalReferrals} Signup{stats.totalReferrals !== 1 ? 's' : ''}
              </Badge>
              {stats.convertedReferrals > 0 && (
                <Badge className="bg-awareness/20 text-awareness border-awareness/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {stats.convertedReferrals} Converted
                </Badge>
              )}
              {(stats.pendingCommissions > 0 || stats.paidCommissions > 0) && (
                <Badge className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${((stats.pendingCommissions + stats.paidCommissions) / 100).toFixed(2)} Earned
                </Badge>
              )}
              {stats.bonusEntries > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  +{stats.bonusEntries} bonus entries
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralLink}
                readOnly
                className="pr-10 bg-black/50 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-awareness" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={shareLink}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Expandable Referrals List */}
          {stats.totalReferrals > 0 && (
            <Collapsible open={showReferrals} onOpenChange={setShowReferrals}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-sm text-white/50 hover:text-foreground">
                  <span>View Your Referrals ({stats.totalReferrals})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showReferrals ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 border-t border-white/8 mt-2">
                <ReferredUsersList />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Terms accepted indicator */}
          {acceptance && (
            <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/8 pt-3">
              <Link to="/referral-terms" className="hover:text-primary transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3" />
                View Referral Terms
              </Link>
              <span>
                Terms accepted: {new Date(acceptance.accepted_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>

      <ReferralTermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccepted={handleTermsAccepted}
      />
    </>
  );
};

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useReferralTerms } from "@/hooks/useReferralTerms";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  DollarSign, Users, Copy, Share2, Check, Loader2, 
  Wallet, Mail, ArrowRight, Gift, Clock, CheckCircle2, Crown, FileText, Shield
} from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { PRICING, COMMISSIONS, COMMISSION_RATES } from "@/lib/constants";
import { ReferralTermsModal } from "@/components/referral/ReferralTermsModal";

interface Commission {
  id: string;
  plan_type: string;
  commission_amount_cents: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

interface Profile {
  payout_method: string | null;
  payout_details: string | null;
  payout_crypto_network: string | null;
}

const Earn = () => {
  const { user, session } = useAuth();
  const { subscription } = useSubscription();
  const { hasAcceptedTerms, loading: termsLoading, refreshTermsStatus, acceptance } = useReferralTerms();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Payout form state
  const [payoutMethod, setPayoutMethod] = useState<string>("");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("");

  const referralLink = user ? `${window.location.origin}/auth?ref=${user.id}` : "";

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch profile with payout info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("payout_method, payout_details, payout_crypto_network")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setPayoutMethod(profileData.payout_method || "");
        setPayoutDetails(profileData.payout_details || "");
        setCryptoNetwork(profileData.payout_crypto_network || "");
      }

      // Fetch commissions
      const { data: commissionData } = await supabase
        .from("commissions")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (commissionData) {
        setCommissions(commissionData);
      }

      // Fetch referral count
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);

      setReferralCount(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (!hasAcceptedTerms) {
      setShowTermsModal(true);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join 3rdeyeadvisors",
          text: "Learn DeFi with 3rdeyeadvisors: Start your free trial today!",
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    refreshTermsStatus();
  };

  const handleSavePayoutMethod = async () => {
    if (!user || !session) return;
    
    if (!payoutMethod) {
      toast.error("Please select a payout method");
      return;
    }
    
    if (!payoutDetails) {
      toast.error(payoutMethod === "crypto" ? "Please enter your wallet address" : "Please enter your Zelle email or phone");
      return;
    }
    
    if (payoutMethod === "crypto" && !cryptoNetwork) {
      toast.error("Please select a crypto network");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          payout_method: payoutMethod,
          payout_details: payoutDetails,
          payout_crypto_network: payoutMethod === "crypto" ? cryptoNetwork : null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Payout method saved!");
      setProfile({
        payout_method: payoutMethod,
        payout_details: payoutDetails,
        payout_crypto_network: payoutMethod === "crypto" ? cryptoNetwork : null,
      });
    } catch (error) {
      console.error("Error saving payout method:", error);
      toast.error("Failed to save payout method");
    } finally {
      setSaving(false);
    }
  };

  const pendingAmount = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.commission_amount_cents, 0);
  
  const paidAmount = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.commission_amount_cents, 0);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <SEO
        title="Earn with 3EA: Up to 60% Commission Program"
        description={`Earn up to 60% commission by sharing 3rdeyeadvisors. Refer friends and earn $${COMMISSIONS.monthly} to $${COMMISSIONS.annual} per subscription.`}
        keywords="referral program, earn crypto, affiliate program, defi education"
      />

      <div className="min-h-screen bg-background py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-5">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Referral Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5">
              Earn Up to 60% Commission
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Share 3rdeyeadvisors and earn ${COMMISSIONS.monthly} to ${COMMISSIONS.annual} per referral
            </p>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                  <p className="text-sm text-foreground/70">
                    Share your unique referral link with friends and followers
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Friend Subscribes</h3>
                  <p className="text-sm text-foreground/70">
                    They sign up, try the free trial, and subscribe
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. You Get Paid</h3>
                  <p className="text-sm text-foreground/70">
                    Earn {Math.round(COMMISSION_RATES.monthly * 100)}% to {Math.round(COMMISSION_RATES.annual * 100)}% commission paid in crypto or Zelle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Rates - Based on YOUR subscription */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Your Commission Rate
                {subscription?.plan === 'annual' && (
                  <Badge className="bg-primary gap-1">
                    <Crown className="w-3 h-3" />
                    Annual Subscriber
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {subscription?.plan === 'annual' 
                  ? "As an annual subscriber, you earn 60% on ALL referrals"
                  : "Upgrade to annual to unlock 60% commission on all referrals"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Current Rate Display */}
              <div className="mb-6 p-4 rounded-lg border-2 border-primary bg-primary/5 text-center">
                <p className="text-sm text-foreground/70 mb-1">Your Current Rate</p>
                <div className="text-4xl font-bold text-primary">
                  {subscription?.plan === 'annual' ? '60%' : '50%'}
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-medium">Monthly Referral</span>
                    <p className="text-sm text-foreground/60">{PRICING.monthly.display}/mo subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      ${subscription?.plan === 'annual' 
                        ? (PRICING.monthly.amount * 0.6).toFixed(2)
                        : (PRICING.monthly.amount * 0.5).toFixed(2)
                      }
                    </div>
                    <p className="text-xs text-foreground/60">per referral</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-medium">Annual Referral</span>
                    <p className="text-sm text-foreground/60">{PRICING.annual.display}/yr subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      ${subscription?.plan === 'annual' 
                        ? (PRICING.annual.amount * 0.6).toFixed(2)
                        : (PRICING.annual.amount * 0.5).toFixed(2)
                      }
                    </div>
                    <p className="text-xs text-foreground/60">per referral</p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA for non-annual subscribers */}
              {subscription?.plan !== 'annual' && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Upgrade to Annual for 60% Commission</p>
                      <p className="text-sm text-foreground/70 mt-1">
                        Annual subscribers earn 60% on all referrals instead of 50%. 
                        That's ${(PRICING.monthly.amount * 0.6).toFixed(2)} per monthly referral and 
                        ${(PRICING.annual.amount * 0.6).toFixed(2)} per annual referral.
                      </p>
                      <Link to="/subscription">
                        <Button size="sm" className="mt-3">
                          Upgrade Now <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authenticated User Section */}
          {user ? (
            <>
              {/* Referral Link - Terms Gate */}
              {!termsLoading && !hasAcceptedTerms ? (
                <Card className="mb-8 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Accept Referral Terms
                    </CardTitle>
                    <CardDescription>
                      Review and accept our referral program terms to get your unique link
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-foreground/80 flex-1">
                        Before you can share your referral link and earn commissions, please review 
                        and accept our referral program terms and conditions.
                      </p>
                      <Button onClick={() => setShowTermsModal(true)} className="w-full sm:w-auto">
                        <FileText className="w-4 h-4 mr-2" />
                        View Terms
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                    <CardDescription>Share this link to start earning</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        value={referralLink} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button onClick={handleCopyLink} variant="outline">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    {acceptance && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <Link to="/referral-terms" className="hover:text-primary transition-colors flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          View Referral Terms
                        </Link>
                        <span>
                          Terms accepted: {new Date(acceptance.accepted_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-6 h-6 text-foreground/70" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Total Referrals</p>
                        <p className="text-2xl font-bold">{referralCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Pending</p>
                        <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">Paid</p>
                        <p className="text-2xl font-bold">{formatCurrency(paidAmount)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payout Method */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payout Method</CardTitle>
                  <CardDescription>
                    Set up how you want to receive your commissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup 
                    value={payoutMethod} 
                    onValueChange={setPayoutMethod}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                      <Label
                        htmlFor="crypto"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Wallet className="mb-3 h-6 w-6" />
                        <span className="font-medium">Crypto</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="zelle" id="zelle" className="peer sr-only" />
                      <Label
                        htmlFor="zelle"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Mail className="mb-3 h-6 w-6" />
                        <span className="font-medium">Zelle</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {payoutMethod === "crypto" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="network">Network</Label>
                        <Select value={cryptoNetwork} onValueChange={setCryptoNetwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="base">Base</SelectItem>
                            <SelectItem value="arbitrum">Arbitrum</SelectItem>
                            <SelectItem value="optimism">Optimism</SelectItem>
                            <SelectItem value="solana">Solana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="wallet">Wallet Address</Label>
                        <Input
                          id="wallet"
                          placeholder="0x..."
                          value={payoutDetails}
                          onChange={(e) => setPayoutDetails(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {payoutMethod === "zelle" && (
                    <div>
                      <Label htmlFor="zelle-contact">Zelle Email or Phone</Label>
                      <Input
                        id="zelle-contact"
                        placeholder="email@example.com or (555) 123-4567"
                        value={payoutDetails}
                        onChange={(e) => setPayoutDetails(e.target.value)}
                      />
                    </div>
                  )}

                  {payoutMethod && (
                    <Button onClick={handleSavePayoutMethod} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Payout Method"
                      )}
                    </Button>
                  )}

                  <p className="text-sm text-foreground/60">
                    Need a different payout option? Contact us at{" "}
                    <a href="mailto:info@the3rdeyeadvisors.com" className="text-primary hover:underline">
                      info@the3rdeyeadvisors.com
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Commission History */}
              {commissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Commission History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {commissions.map((commission) => (
                        <div 
                          key={commission.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={commission.plan_type === "annual" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                                {commission.plan_type === "annual" ? "Annual" : "Monthly"}
                              </Badge>
                              <Badge 
                                variant={commission.status === "paid" ? "default" : "outline"}
                                className={`text-[10px] sm:text-xs ${commission.status === "paid" ? "bg-green-500" : ""}`}
                              >
                                {commission.status}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground/70 mt-1.5 break-words">
                              {formatDate(commission.created_at)}
                              {commission.paid_at && ` • Paid ${formatDate(commission.paid_at)}`}
                            </p>
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-primary self-start sm:self-center">
                            {formatCurrency(commission.commission_amount_cents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Sign In CTA */
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign in to Start Earning</h3>
                <p className="text-foreground/70 mb-6">
                  Create an account or sign in to get your unique referral link
                </p>
                <Button asChild>
                  <Link to="/auth">
                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Terms Summary */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="py-6">
              <h4 className="font-semibold mb-3">Program Terms Summary</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  One-time commission per referred user (first subscription only)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  Commission is created when the referred user pays their first subscription
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  Payouts are processed within 7 to 10 business days
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  You must have a valid payout method set up to receive payments
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-border">
                <Link to="/referral-terms" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Read full Referral Program Terms & Conditions
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReferralTermsModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onAccepted={handleTermsAccepted}
      />
    </>
  );
};

export default Earn;
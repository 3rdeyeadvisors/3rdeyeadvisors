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
  Wallet, Mail, ArrowRight, Gift, Clock, CheckCircle2, Crown, FileText, Shield, Zap
} from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
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

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Rewards"
          title="Earn While You Learn"
          subtitle="Complete courses, refer friends, and participate in the community. Every action builds your points balance and unlocks real rewards."
        />

        <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
          {/* Earn Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-violet-500/30 transition-all flex flex-col">
              <h3 className="font-consciousness text-lg font-bold text-white mb-2">Complete Courses</h3>
              <div className="font-consciousness text-4xl font-bold text-violet-400 mb-4">100 PTS</div>
              <p className="font-body text-sm text-white/50 mb-8 flex-grow">
                Master DeFi modules and pass quizzes to earn points. Points unlock platform badges and exclusive raffles.
              </p>
              <Button asChild className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all">
                <Link to="/courses">Start Learning</Link>
              </Button>
            </Card>

            <Card className="bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-violet-500/30 transition-all flex flex-col">
              <h3 className="font-consciousness text-lg font-bold text-white mb-2">Refer Friends</h3>
              <div className="font-consciousness text-4xl font-bold text-violet-400 mb-4">60% USD</div>
              <p className="font-body text-sm text-white/50 mb-8 flex-grow">
                Invite others to join the movement. Earn massive commissions on every successful subscription you refer.
              </p>
              <Button onClick={() => {
                const el = document.getElementById('referral-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all">
                Get Your Link
              </Button>
            </Card>

            <Card className="bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-violet-500/30 transition-all flex flex-col">
              <h3 className="font-consciousness text-lg font-bold text-white mb-2">Daily Presence</h3>
              <div className="font-consciousness text-4xl font-bold text-violet-400 mb-4">10 PTS</div>
              <p className="font-body text-sm text-white/50 mb-8 flex-grow">
                Stay active in the ecosystem. Earn daily points just for being part of the 3rdeyeadvisors community.
              </p>
              <Button asChild className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </Card>
          </div>

          {/* Commission Rates - Based on YOUR subscription */}
          <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl p-8" id="referral-section">
            <CardHeader className="p-0 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="font-consciousness text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    Your Commission Rate
                    {subscription?.plan === 'annual' && (
                      <Badge className="bg-violet-600 text-white font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 border-none">
                        <Crown className="w-3 h-3" />
                        Annual
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="font-body text-white/50">
                    {subscription?.plan === 'annual'
                      ? "As an annual subscriber, you earn 60% on all referrals"
                      : "Upgrade to annual to unlock 60% commission on all referrals"
                    }
                  </CardDescription>
                </div>
                {/* Current Rate Display */}
                <div className="flex flex-col items-end">
                  <span className="font-body text-[10px] uppercase tracking-widest text-white/30 mb-1">Your Rate</span>
                  <div className="font-consciousness text-5xl font-bold text-violet-400">
                    {subscription?.plan === 'annual' ? '60%' : '50%'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Earnings Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/8">
                  <div>
                    <span className="font-consciousness text-lg font-bold text-white">Monthly Referral</span>
                    <p className="font-body text-xs text-white/40 mt-1">{PRICING.monthly.display} subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="font-consciousness text-3xl font-bold text-violet-400">
                      ${subscription?.plan === 'annual' 
                        ? (PRICING.monthly.amount * 0.6).toFixed(2)
                        : (PRICING.monthly.amount * 0.5).toFixed(2)
                      }
                    </div>
                    <p className="font-body text-[10px] uppercase tracking-widest text-white/30">Earnings</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/8">
                  <div>
                    <span className="font-consciousness text-lg font-bold text-white">Annual Referral</span>
                    <p className="font-body text-xs text-white/40 mt-1">{PRICING.annual.display} subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="font-consciousness text-3xl font-bold text-violet-400">
                      ${subscription?.plan === 'annual' 
                        ? (PRICING.annual.amount * 0.6).toFixed(2)
                        : (PRICING.annual.amount * 0.5).toFixed(2)
                      }
                    </div>
                    <p className="font-body text-[10px] uppercase tracking-widest text-white/30">Earnings</p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA for non-annual subscribers */}
              {subscription?.plan !== 'annual' && (
                <div className="p-6 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mt-1">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-consciousness text-lg font-bold text-white mb-1">Upgrade to Annual for 60% Commission</p>
                      <p className="font-body text-sm text-white/50 leading-relaxed mb-6">
                        Annual subscribers earn 60% on all referrals instead of 50%. Maximize your earnings across the platform.
                      </p>
                      <Button asChild className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 transition-all">
                        <Link to="/subscription">Upgrade Now</Link>
                      </Button>
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
                <Card className="mb-12 bg-white/3 border border-violet-500/30 rounded-2xl p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="font-consciousness text-xl font-bold text-white mb-2 flex items-center gap-3">
                      <Shield className="w-5 h-5 text-violet-400" />
                      Accept Referral Terms
                    </CardTitle>
                    <CardDescription className="font-body text-white/50">
                      Review and accept our referral program terms to get your unique link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/8">
                      <p className="font-body text-sm text-white/60 flex-1">
                        Before you can share your referral link and earn commissions, please review 
                        and accept our referral program terms and conditions.
                      </p>
                      <Button onClick={() => setShowTermsModal(true)} className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 transition-all">
                        View Terms
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-consciousness text-xl font-bold text-white mb-1">Your Referral Link</h3>
                      <p className="font-body text-sm text-white/50">Share this link. Earn commission on every membership purchased through it. Forever.</p>
                    </div>
                  </div>

                  {/* Commission rates */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { tier: "Monthly Member", rate: "10%", color: "text-white/60" },
                      { tier: "Annual Member", rate: "20%", color: "text-violet-400" },
                      { tier: "Founding 33", rate: "70%", color: "text-amber-400" },
                    ].map((item) => (
                      <div key={item.tier} className="text-center p-3 bg-white/3 rounded-xl border border-white/8">
                        <p className={`font-consciousness text-2xl font-bold ${item.color} mb-1`}>{item.rate}</p>
                        <p className="font-body text-[10px] uppercase tracking-widest text-white/40">{item.tier}</p>
                      </div>
                    ))}
                  </div>

                  {/* Link display */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <span className="font-body text-sm text-white/60 flex-1 truncate">{referralLink}</span>
                      <button
                        onClick={handleCopyLink}
                        className="font-body text-xs text-violet-400 hover:text-violet-300 whitespace-nowrap transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <Button onClick={handleShare} className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all shadow-lg shadow-violet-900/20">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Link
                    </Button>
                  </div>

                  {acceptance && (
                    <div className="flex items-center justify-between font-body text-[10px] uppercase tracking-widest text-white/20 mt-6 pt-6 border-t border-white/5">
                      <Link to="/referral-terms" className="hover:text-violet-400 transition-colors flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Referral Terms
                      </Link>
                      <span>
                        Accepted: {new Date(acceptance.accepted_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: Users, label: 'Total Referrals', value: referralCount, color: 'text-white/40' },
                  { icon: Clock, label: 'Pending Payout', value: formatCurrency(pendingAmount), color: 'text-amber-400' },
                  { icon: CheckCircle2, label: 'Total Paid', value: formatCurrency(paidAmount), color: 'text-emerald-400' }
                ].map((stat, i) => (
                  <Card key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                        <p className="font-consciousness text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Payout Method */}
              <Card className="mb-12 bg-white/3 border border-white/8 rounded-2xl p-8">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="font-consciousness text-xl font-bold text-white mb-2">Payout Method</CardTitle>
                  <CardDescription className="font-body text-white/50">
                    Set up how you want to receive your commissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  <RadioGroup 
                    value={payoutMethod} 
                    onValueChange={setPayoutMethod}
                    className="grid grid-cols-2 gap-6"
                  >
                    <div>
                      <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                      <Label
                        htmlFor="crypto"
                        className="flex flex-col items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 hover:border-violet-500/30 transition-all peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-600/10 cursor-pointer"
                      >
                        <Wallet className="mb-3 h-6 w-6 text-violet-400" />
                        <span className="font-consciousness text-sm font-bold text-white">Crypto</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="zelle" id="zelle" className="peer sr-only" />
                      <Label
                        htmlFor="zelle"
                        className="flex flex-col items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 hover:border-violet-500/30 transition-all peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-600/10 cursor-pointer"
                      >
                        <Mail className="mb-3 h-6 w-6 text-violet-400" />
                        <span className="font-consciousness text-sm font-bold text-white">Zelle</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {payoutMethod === "crypto" && (
                    <div className="space-y-6">
                      <div>
                        <Label className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-2 block" htmlFor="network">Network</Label>
                        <Select value={cryptoNetwork} onValueChange={setCryptoNetwork}>
                          <SelectTrigger className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-6 text-white focus:ring-0 focus:border-violet-500/50">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/15">
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
                        <Label className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-2 block" htmlFor="wallet">Wallet Address</Label>
                        <input
                          id="wallet"
                          placeholder="0x..."
                          value={payoutDetails}
                          onChange={(e) => setPayoutDetails(e.target.value)}
                          className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors w-full"
                        />
                      </div>
                    </div>
                  )}

                  {payoutMethod === "zelle" && (
                    <div>
                      <Label className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-2 block" htmlFor="zelle-contact">Zelle Email or Phone</Label>
                      <input
                        id="zelle-contact"
                        placeholder="email@example.com or (555) 123-4567"
                        value={payoutDetails}
                        onChange={(e) => setPayoutDetails(e.target.value)}
                        className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors w-full"
                      />
                    </div>
                  )}

                  {payoutMethod && (
                    <Button onClick={handleSavePayoutMethod} disabled={saving} className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 transition-all">
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

                  <p className="font-body text-xs text-white/30 text-center">
                    Questions about payouts? Contact{" "}
                    <a href="mailto:info@the3rdeyeadvisors.com" className="text-violet-400 hover:underline">
                      info@the3rdeyeadvisors.com
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Commission History */}
              {commissions.length > 0 && (
                <Card className="bg-white/3 border border-white/8 rounded-2xl p-8">
                  <CardHeader className="p-0 mb-8">
                    <CardTitle className="font-consciousness text-xl font-bold text-white">Commission History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {commissions.map((commission) => (
                        <div 
                          key={commission.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white/5 rounded-2xl border border-white/8"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <Badge className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-none ${commission.plan_type === "annual" ? "bg-violet-600 text-white" : "bg-white/10 text-white/50"}`}>
                                {commission.plan_type === "annual" ? "Annual" : "Monthly"}
                              </Badge>
                              <Badge 
                                className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-none ${commission.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                              >
                                {commission.status}
                              </Badge>
                            </div>
                            <p className="font-body text-xs text-white/40">
                              {formatDate(commission.created_at)}
                              {commission.paid_at && ` • Paid ${formatDate(commission.paid_at)}`}
                            </p>
                          </div>
                          <div className="font-consciousness text-2xl font-bold text-violet-400">
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
            <Card className="bg-white/3 border border-white/8 rounded-2xl p-12">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mb-8">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="font-consciousness text-2xl font-bold text-white mb-4">Sign in to Start Earning</h3>
                <p className="font-body text-white/50 mb-10 max-w-sm mx-auto">
                  Create an account or sign in to get your unique referral link and start tracking your rewards.
                </p>
                <Button asChild className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-12 py-6 transition-all">
                  <Link to="/auth">
                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Terms Summary */}
          <Card className="mt-12 bg-white/3 border border-white/8 rounded-2xl p-8">
            <CardContent className="p-0">
              <h4 className="font-consciousness text-base font-bold text-white mb-6">Program Terms Summary</h4>
              <ul className="space-y-4">
                {[
                  "One-time commission per referred user (first subscription only)",
                  "Commission is created when the referred user pays their first subscription",
                  "Payouts are processed within 7 to 10 business days",
                  "You must have a valid payout method set up to receive payments"
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-3 font-body text-sm text-white/50">
                    <Check className="w-4 h-4 mt-0.5 text-violet-400 flex-shrink-0" />
                    {term}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-white/5">
                <Link to="/referral-terms" className="font-body text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-2">
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
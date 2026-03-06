import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  DollarSign, Users, Clock, CheckCircle2, Loader2, 
  Wallet, Mail, RefreshCw, Search
} from "lucide-react";

interface Commission {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  subscription_id: string;
  plan_type: string;
  subscription_amount_cents: number;
  commission_amount_cents: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  paid_at: string | null;
  referrer_profile?: {
    display_name: string | null;
    payout_method: string | null;
    payout_details: string | null;
    payout_crypto_network: string | null;
  };
  referrer_email?: string;
  referred_email?: string;
}

interface ProfileMap {
  [userId: string]: {
    display_name: string | null;
    payout_method: string | null;
    payout_details: string | null;
    payout_crypto_network: string | null;
  };
}

interface EmailMap {
  [userId: string]: string;
}

export const CommissionsManager = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [payoutNotes, setPayoutNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      // Fetch all commissions
      const { data: commissionsData, error } = await supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!commissionsData || commissionsData.length === 0) {
        setCommissions([]);
        return;
      }

      // Get unique user IDs (referrers and referred users)
      const referrerIds = [...new Set(commissionsData.map(c => c.referrer_id))];
      const referredIds = [...new Set(commissionsData.map(c => c.referred_user_id))];
      const allUserIds = [...new Set([...referrerIds, ...referredIds])];

      // Batch fetch all profiles in one query
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, payout_method, payout_details, payout_crypto_network")
        .in("user_id", referrerIds);

      // Batch fetch all emails using the RPC function
      const { data: emailsData } = await supabase.rpc("get_user_emails_with_profiles");

      // Create lookup maps for O(1) access
      const profileMap: ProfileMap = {};
      profilesData?.forEach(p => {
        profileMap[p.user_id] = {
          display_name: p.display_name,
          payout_method: p.payout_method,
          payout_details: p.payout_details,
          payout_crypto_network: p.payout_crypto_network,
        };
      });

      const emailMap: EmailMap = {};
      emailsData?.forEach((e: { user_id: string; email: string }) => {
        emailMap[e.user_id] = e.email;
      });

      // Enrich commissions with profile and email data
      const enrichedCommissions: Commission[] = commissionsData.map(commission => ({
        ...commission,
        referrer_profile: profileMap[commission.referrer_id] || undefined,
        referrer_email: emailMap[commission.referrer_id],
        referred_email: emailMap[commission.referred_user_id],
      }));

      setCommissions(enrichedCommissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      toast.error("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedCommission) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("commissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          admin_notes: payoutNotes || null,
        })
        .eq("id", selectedCommission.id);

      if (error) throw error;

      // Send notification email to referrer
      if (selectedCommission.referrer_email) {
        await supabase.functions.invoke("send-commission-notification", {
          body: {
            email: selectedCommission.referrer_email,
            amount: selectedCommission.commission_amount_cents / 100,
            status: "paid",
          },
        });
      }

      toast.success("Commission marked as paid");
      setSelectedCommission(null);
      setPayoutNotes("");
      fetchCommissions();
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error("Failed to update commission");
    } finally {
      setProcessing(false);
    }
  };

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

  const maskEmail = (email?: string) => {
    if (!email) return "N/A";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 3) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  const pendingCommissions = commissions.filter(c => c.status === "pending");
  const paidCommissions = commissions.filter(c => c.status === "paid");
  
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commission_amount_cents, 0);
  const totalPaidThisMonth = paidCommissions
    .filter(c => c.paid_at && new Date(c.paid_at).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + c.commission_amount_cents, 0);

  const filteredCommissions = (list: Commission[]) => {
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(c => 
      c.referrer_email?.toLowerCase().includes(term) ||
      c.referrer_profile?.display_name?.toLowerCase().includes(term) ||
      c.referred_email?.toLowerCase().includes(term)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-consciousness">Commission Management</h2>
        <Button onClick={fetchCommissions} variant="outline" size="sm" className="font-body">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white/3 border-white/8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Pending Payouts</p>
                <p className="text-2xl font-bold font-consciousness">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-muted-foreground font-body">{pendingCommissions.length} commissions</p>
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
                <p className="text-sm text-muted-foreground">Paid This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaidThisMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-bold">{commissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by referrer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingCommissions.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidCommissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredCommissions(pendingCommissions).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending commissions
              </CardContent>
            </Card>
          ) : (
            filteredCommissions(pendingCommissions).map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {commission.referrer_profile?.display_name || commission.referrer_email || "Unknown"}
                        </span>
                        <Badge variant={commission.plan_type === "annual" ? "default" : "secondary"}>
                          {commission.plan_type === "annual" ? "Annual (60%)" : "Monthly (50%)"}
                        </Badge>
                        {commission.referrer_profile?.payout_method && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {commission.referrer_profile.payout_method === "crypto" ? (
                              <Wallet className="w-3 h-3" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            {commission.referrer_profile.payout_method}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Referrer Email:</strong>{" "}
                          {commission.referrer_email || "N/A"}
                        </p>
                        <p>
                          <strong>Payout:</strong>{" "}
                          {commission.referrer_profile?.payout_details || "Not set"}
                          {commission.referrer_profile?.payout_crypto_network && 
                            ` (${commission.referrer_profile.payout_crypto_network})`}
                        </p>
                        <p>
                          <strong>Referred:</strong> {maskEmail(commission.referred_email)}
                        </p>
                        <p>
                          <strong>Created:</strong> {formatDate(commission.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(commission.commission_amount_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          from {formatCurrency(commission.subscription_amount_cents)}
                        </p>
                      </div>
                      <Button onClick={() => setSelectedCommission(commission)}>
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {filteredCommissions(paidCommissions).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No paid commissions
              </CardContent>
            </Card>
          ) : (
            filteredCommissions(paidCommissions).map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {commission.referrer_profile?.display_name || commission.referrer_email || "Unknown"}
                        </span>
                        <Badge variant={commission.plan_type === "annual" ? "default" : "secondary"}>
                          {commission.plan_type === "annual" ? "Annual (60%)" : "Monthly (50%)"}
                        </Badge>
                        <Badge className="bg-green-500">Paid</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          <strong>Paid:</strong> {commission.paid_at ? formatDate(commission.paid_at) : "N/A"}
                        </p>
                        {commission.admin_notes && (
                          <p><strong>Notes:</strong> {commission.admin_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-muted-foreground">
                        {formatCurrency(commission.commission_amount_cents)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Mark Paid Dialog */}
      <Dialog open={!!selectedCommission} onOpenChange={() => setSelectedCommission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Commission as Paid</DialogTitle>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Referrer:</strong> {selectedCommission.referrer_profile?.display_name || selectedCommission.referrer_email}</p>
                <p><strong>Referrer Email:</strong> {selectedCommission.referrer_email || "N/A"}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedCommission.commission_amount_cents)}</p>
                <p><strong>Payout Method:</strong> {selectedCommission.referrer_profile?.payout_method || "Not set"}</p>
                <p><strong>Payout Details:</strong> {selectedCommission.referrer_profile?.payout_details || "Not set"}</p>
                {selectedCommission.referrer_profile?.payout_crypto_network && (
                  <p><strong>Network:</strong> {selectedCommission.referrer_profile.payout_crypto_network}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Notes (optional)
                </label>
                <Textarea
                  placeholder="Transaction hash, notes, etc..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCommission(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Paid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


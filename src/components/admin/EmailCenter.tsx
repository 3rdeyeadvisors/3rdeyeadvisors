import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, AlertCircle, Trophy, Loader2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import NewsletterSender from "@/components/admin/NewsletterSender";
import { BroadcastPreview } from "@/components/admin/BroadcastPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ActiveRaffle {
  id: string;
  title: string;
  prize: string;
  prize_amount: number;
  start_date: string;
  end_date: string;
}

export function EmailCenter() {
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [sendingRaffleEmail, setSendingRaffleEmail] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeRaffle, setActiveRaffle] = useState<ActiveRaffle | null>(null);
  const { toast } = useToast();

  const formatRaffleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getRaffleEmailHTML = () => {
    const rafflePeriod = activeRaffle 
      ? `${formatRaffleDate(activeRaffle.start_date)} to ${formatRaffleDate(activeRaffle.end_date)}`
      : "Check website for current dates";
    
    const prizeAmount = activeRaffle?.prize_amount || 50;
    const prizeName = activeRaffle?.prize || "Bitcoin";

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px;">
                  <h1 style="color: #3B82F6; margin: 0 0 20px 0; font-family: Arial, sans-serif;">The Future Rewards Learning 🚀</h1>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: Arial, sans-serif; color: #333333;">
                    Hi there,
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: Arial, sans-serif; color: #333333;">
                    The future of finance is decentralized: and now, learning it pays.
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; font-family: Arial, sans-serif; color: #333333;">
                    <strong>Sentinel DeFi</strong> has officially launched the <strong>Learn-to-Earn Raffle</strong>, rewarding our community for learning and engaging in DeFi education.
                  </p>
                  
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #3B82F6; border-radius: 12px; margin: 30px 0;">
                    <tr>
                      <td style="padding: 30px; text-align: center;">
                        <h2 style="margin: 0 0 20px 0; color: #ffffff; font-family: Arial, sans-serif;">How to Enter</h2>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size: 16px; line-height: 2; color: #ffffff; font-family: Arial, sans-serif; text-align: left; padding: 0 20px;">
                              ✅ Follow us on <strong>Instagram</strong> @sentineldefi<br>
                              ✅ Follow us on <strong>X</strong> @sentineldefi<br>
                              ✅ Subscribe to the newsletter (you're already in! 🎉)<br>
                              ✅ Complete the <strong>DeFi Foundations</strong> and <strong>Staying Safe with DeFi</strong> courses<br>
                              ✅ Rate the courses and join the discussion
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                          <tr>
                            <td style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                              <p style="font-size: 18px; margin: 0; color: #ffffff; font-family: Arial, sans-serif;">💡 <strong>Bonus:</strong> Each referral link shared from your dashboard earns extra entries when someone signs up.</p>
                            </td>
                          </tr>
                        </table>
                        
                        <div style="font-size: 48px; font-weight: bold; margin: 20px 0; color: #ffffff;">🪙 $${prizeAmount}</div>
                        <p style="font-size: 20px; margin: 10px 0; color: #ffffff; font-family: Arial, sans-serif;">Prize: ${prizeName}</p>
                        <p style="font-size: 16px; margin: 10px 0; color: #ffffff; font-family: Arial, sans-serif;">🕒 Active Period: ${rafflePeriod}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <a href="https://www.sentineldefi.online/raffles" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 18px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; font-family: Arial, sans-serif;">Enter Raffle Now</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="font-size: 16px; line-height: 1.6; font-style: italic; text-align: center; color: #666666; margin: 0 0 40px 0; font-family: Arial, sans-serif;">
                    The more you learn, the more you earn: because awareness is the real currency.
                  </p>
                  
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e5e5; padding-top: 20px;">
                    <tr>
                      <td align="center">
                        <p style="font-size: 18px; font-weight: bold; color: #3B82F6; margin: 0 0 8px 0; font-family: Arial, sans-serif;">
                          Awareness is advantage.
                        </p>
                        <p style="font-size: 14px; color: #666666; margin: 0; font-family: Arial, sans-serif;">
                         : Sentinel DeFi
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  };

  useEffect(() => {
    loadEmailStats();
    loadActiveRaffle();
  }, []);

  const loadActiveRaffle = async () => {
    try {
      const { data, error } = await supabase
        .from("raffles")
        .select("id, title, prize, prize_amount, start_date, end_date")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setActiveRaffle(data);
      }
    } catch (error) {
    }
  };

  const loadEmailStats = async () => {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter(e => e.status === "sent").length || 0,
        failed: data?.filter(e => e.status === "failed").length || 0
      };

      setEmailStats(stats);
    } catch (error) {
      console.error("Error loading email stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRaffleAnnouncement = async () => {
    if (!activeRaffle) {
      toast({
        title: "No Active Raffle",
        description: "Create an active raffle before sending announcements.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Send raffle announcement to all subscribers?")) {
      return;
    }

    setSendingRaffleEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-raffle-announcement');

      if (error) throw error;

      toast({
        title: "Raffle Announcement Sent! 🎉",
        description: `Email sent to ${data.sent} subscribers`,
      });
    } catch (error: any) {
      console.error('Error sending raffle announcement:', error);
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingRaffleEmail(false);
    }
  };

  const resendFailedEmails = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-command', {
        body: { command: "resend all failed emails" }
      });

      if (error) throw error;

      toast({
        title: "Emails Resent",
        description: data.message || "Failed emails have been queued for resending",
      });

      loadEmailStats();
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <BroadcastPreview />
      
      <NewsletterSender />
      
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Raffle Announcement
          </CardTitle>
          <CardDescription>
            {activeRaffle 
              ? `Send announcement for: ${activeRaffle.title} ($${activeRaffle.prize_amount} ${activeRaffle.prize})`
              : "No active raffle. Create one first."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!activeRaffle && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                No active raffle found. Create an active raffle in the Raffle Manager before sending announcements.
              </p>
            </div>
          )}

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Raffle Announcement Email Preview</DialogTitle>
                <DialogDescription>
                  {activeRaffle 
                    ? `Preview for: ${activeRaffle.title}`
                    : "Using placeholder data. Create an active raffle for real dates."
                  }
                </DialogDescription>
              </DialogHeader>
              <div 
                className="border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: getRaffleEmailHTML() }}
              />
            </DialogContent>
          </Dialog>

          <Button 
            onClick={sendRaffleAnnouncement}
            disabled={sendingRaffleEmail || !activeRaffle}
            className="w-full"
            size="lg"
          >
            {sendingRaffleEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Raffle Announcement
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{emailStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4 text-green-500" />
              Successfully Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{emailStats.sent}</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{emailStats.failed}</p>
            {emailStats.failed > 0 && (
              <Button 
                onClick={resendFailedEmails}
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
              >
                Resend Failed
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>View detailed email history and logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = "/admin/email-logs"}
            variant="outline"
            className="w-full"
          >
            View Full Email Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

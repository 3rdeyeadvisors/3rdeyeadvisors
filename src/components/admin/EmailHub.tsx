import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Mail,
  Send,
  Eye,
  Loader2,
  AlertCircle,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BroadcastPreview } from "./BroadcastPreview";
import BroadcastTester from "./BroadcastTester";

const EmailTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("announcement");

  const sampleData = useMemo(() => ({
    name: "Alex Johnson",
    raffle_title: "Learn to Earn: Bitcoin Edition",
    prize: "Bitcoin",
    prize_amount: 50,
    entry_count: 5,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Complete DeFi courses, engage with our community, and earn entries to win Bitcoin!",
    winner_name: "Sarah Smith",
  }), []);

  const templates = useMemo(() => ({
    announcement: {
      title: "Raffle Announcement Email",
      subject: "🎟 Learn to Earn: Join Our $50 Bitcoin Raffle Now",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h1 style="color: #3B82F6; margin: 0 0 24px 0; font-size: 32px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                        The Future Rewards Learning 🚀
                      </h1>

                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937;">
                        Hi <strong>${sampleData.name}</strong>,
                      </p>

                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937;">
                        The future of finance is decentralized, and now, learning it pays.
                      </p>

                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937;">
                        <strong style="color: #3B82F6;">Sentinel DeFi</strong> has officially launched the <strong>Learn-to-Earn Raffle</strong>, rewarding our community for learning and engaging in DeFi education.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #3B82F6; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="margin: 0 0 24px 0; color: #ffffff; font-size: 24px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                              How to Enter
                            </h2>

                            <div style="text-align: left; margin: 0 0 30px 0;">
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Follow us on Instagram</strong> @sentineldefi
                              </p>
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Subscribe to the newsletter</strong> (you're already in! 🎉)
                              </p>
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Complete the DeFi Foundations</strong> and <strong>Staying Safe with DeFi</strong> courses
                              </p>
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Rate the courses</strong> and join the discussion
                              </p>
                            </div>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                              <tr>
                                <td style="padding: 24px; background-color: rgba(255,255,255,0.15); border-radius: 8px;">
                                  <p style="font-size: 16px; margin: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
                                    💡 <strong>Bonus:</strong> Each referral link shared from your dashboard earns extra entries when someone signs up.
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <div style="margin: 32px 0;">
                              <div style="font-size: 56px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">🪙 $${sampleData.prize_amount}</div>
                              <p style="font-size: 22px; margin: 8px 0; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                                Prize: ${sampleData.prize}
                              </p>
                              <p style="font-size: 16px; margin: 8px 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                                🕒 Active Period: November 10 to 23, 2025
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="padding: 40px 0 30px 0;">
                            <a href="https://www.sentineldefi.online/raffles" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 18px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Enter Raffle Now</a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 16px; line-height: 1.6; font-style: italic; text-align: center; color: #6b7280; margin: 0 0 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                        The more you learn, the more you earn: because awareness is the real currency.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 20px;">
                        <tr>
                          <td align="center">
                            <p style="font-size: 18px; font-weight: 700; color: #3B82F6; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                              Awareness is advantage.
                            </p>
                            <p style="font-size: 14px; color: #6b7280; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                             Sentinel DeFi
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
      `,
    },
    confirmation: {
      title: "Entry Confirmation Email",
      subject: "You're officially entered: Sentinel DeFi Learn-to-Earn Raffle 🎟",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6; margin-bottom: 20px;">You're In! 🎉</h1>

          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${sampleData.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            You've successfully joined our <strong>Learn-to-Earn Raffle</strong>. Welcome to the next evolution of financial consciousness.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Each step you took, including learning, sharing, and engaging, earns you energy in return. The system remembers. 🌐
          </p>

          <div style="background-color: #3B82F6; color: white; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 20px 0; color: white;">Your Entry Details</h2>
            <div style="font-size: 48px; font-weight: bold; margin: 20px 0;">🪙 $${sampleData.prize_amount}</div>
            <p style="font-size: 20px; margin: 10px 0;">Prize: ${sampleData.prize}</p>
            <p style="font-size: 18px; margin: 10px 0;">Your Entries: ${sampleData.entry_count}</p>
            <p style="font-size: 16px; margin: 10px 0;">⏰ Raffle Ends: ${new Date(sampleData.end_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6;">
            Stay tuned for updates, and keep sharing your referral link for extra entries!
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The Sentinel DeFi Team
            </p>
          </div>
        </div>
      `,
    },
    ended: {
      title: "Raffle Ended Notification",
      subject: `⏰ ${sampleData.raffle_title} Has Ended: Winner Coming Soon!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6; margin-bottom: 20px;">The Wait is Almost Over ⏰</h1>

          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${sampleData.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            The <strong>${sampleData.raffle_title}</strong> has officially ended. Thank you for participating and learning with us!
          </p>

          <div style="background-color: #3B82F6; color: white; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 20px 0; color: white;">Raffle Complete</h2>
            <div style="font-size: 48px; font-weight: bold; margin: 20px 0;">🪙 $${sampleData.prize_amount}</div>
            <p style="font-size: 20px; margin: 10px 0;">Prize: ${sampleData.prize}</p>
            <p style="font-size: 16px; margin: 20px 0; opacity: 0.9;">
              ${sampleData.description}
            </p>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">What's Next?</h3>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              🎯 We're currently verifying all entries and selecting the winner<br>
              📧 The winner will be announced via email soon<br>
              🌐 All results will be visible on our <a href="https://sentineldefi.online/raffle-history" style="color: #3B82F6; text-decoration: none;">Raffle History</a> page
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6;">
            Even if you don't win this time, your learning journey continues to pay dividends. Keep exploring DeFi with us!
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://sentineldefi.online/courses" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Continue Learning →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The Sentinel DeFi Team
            </p>
          </div>
        </div>
      `,
    },
    winner: {
      title: "Winner Announcement (Winner)",
      subject: `🎉 Congratulations! You Won the ${sampleData.raffle_title}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 72px; margin-bottom: 20px;">🎉🏆🎉</div>
            <h1 style="color: #3B82F6; margin: 0; font-size: 36px;">YOU WON!</h1>
          </div>

          <p style="font-size: 18px; line-height: 1.6; text-align: center;">
            Hi ${sampleData.name},
          </p>

          <p style="font-size: 18px; line-height: 1.6; text-align: center;">
            Congratulations! You've won the <strong>${sampleData.raffle_title}</strong>!
          </p>

          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 20px 0; color: white; font-size: 28px;">Your Prize</h2>
            <div style="font-size: 64px; font-weight: bold; margin: 20px 0;">🪙 $${sampleData.prize_amount}</div>
            <p style="font-size: 24px; margin: 10px 0; font-weight: bold;">${sampleData.prize}</p>
          </div>

          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 30px 0;">
            <h3 style="color: #92400E; margin-top: 0; font-size: 18px;">📬 Next Steps</h3>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0; color: #78350F;">
              Our team will contact you directly within 24 to 48 hours to arrange delivery of your prize. Please check your email inbox (and spam folder) for our message.
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 40px 0;">
            Thank you for being part of our Learn-to-Earn community. Your commitment to learning is what makes this possible!
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The Sentinel DeFi Team
            </p>
          </div>
        </div>
      `,
    },
    winnerOthers: {
      title: "Winner Announcement (Others)",
      subject: `🏆 ${sampleData.raffle_title} Winner Announced!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6; margin-bottom: 20px;">We Have a Winner! 🎉</h1>

          <p style="font-size: 16px; line-height: 1.6;">
            Hi ${sampleData.name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            The <strong>${sampleData.raffle_title}</strong> has concluded and we're excited to announce the winner!
          </p>

          <div style="background-color: #3B82F6; color: white; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="margin: 0 0 20px 0; color: white;">Winner</h2>
            <div style="font-size: 48px; margin: 20px 0;">🏆</div>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${sampleData.winner_name}</p>
            <p style="font-size: 20px; margin: 20px 0; opacity: 0.9;">Won $${sampleData.prize_amount} in ${sampleData.prize}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6;">
            While you didn't win this time, your learning journey continues to be valuable. Every course you complete, every discussion you join, builds your understanding of DeFi.
          </p>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #3B82F6; margin-top: 0;">Stay Tuned!</h3>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              🎟 More Learn-to-Earn raffles are coming<br>
              📚 Keep learning and earning entries<br>
              🔔 Follow us on <a href="https://instagram.com/sentineldefi" style="color: #3B82F6; text-decoration: none;">Instagram</a> for updates
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://sentineldefi.online/courses" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Continue Learning →
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The Sentinel DeFi Team
            </p>
          </div>
        </div>
      `,
    },
  }), [sampleData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Raffle Email Templates
        </CardTitle>
        <CardDescription>
          Review how emails will appear to recipients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="announcement">Launch</TabsTrigger>
            <TabsTrigger value="confirmation">Entry</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
            <TabsTrigger value="winner">Winner</TabsTrigger>
            <TabsTrigger value="winnerOthers">Others</TabsTrigger>
          </TabsList>

          {Object.entries(templates).map(([key, template]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold pt-4">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Subject: {template.subject}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(template.html);
                        win.document.close();
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-background/50 overflow-auto max-h-[600px]">
                <div
                  dangerouslySetInnerHTML={{ __html: template.html }}
                  className="email-preview bg-white rounded-lg mx-auto"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    padding: '20px',
                    minHeight: '400px',
                    maxWidth: '600px'
                  }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ActiveRaffle {
  id: string;
  title: string;
  prize: string;
  prize_amount: number;
  start_date: string;
  end_date: string;
}

export default function EmailHub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compose");

  // Compose State
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [singleEmail, setSingleEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Raffle State
  const [activeRaffle, setActiveRaffle] = useState<ActiveRaffle | null>(null);
  const [isSendingRaffle, setIsSendingRaffle] = useState(false);
  const [rafflePreviewOpen, setRafflePreviewOpen] = useState(false);

  // Stats State
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, failed: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Broadcasts Collapsible State
  const [testerOpen, setTesterOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "stats") {
      loadEmailStats();
    }
    if (activeTab === "compose") {
      loadActiveRaffle();
    }
  }, [activeTab]);

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
      console.error("Error loading active raffle:", error);
    }
  };

  const loadEmailStats = async () => {
    setLoadingStats(true);
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter((e) => e.status === "sent").length || 0,
        failed: data?.filter((e) => e.status === "failed").length || 0,
      };

      setEmailStats(stats);
    } catch (error) {
      console.error("Error loading email stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const resendFailedEmails = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-command", {
        body: { command: "resend all failed emails" },
      });

      if (error) throw error;

      toast({
        title: "Emails Resent",
        description: data.message || "Failed emails have been queued for resending",
      });

      loadEmailStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Resend Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!subject || !body) {
      toast({
        title: "Missing fields",
        description: "Subject and body are required",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === "single" && !singleEmail) {
      toast({
        title: "Email required",
        description: "Please provide a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      let recipients: string | string[] = recipientType;
      if (recipientType === "single") {
        recipients = [singleEmail];
      }

      const { data, error } = await supabase.functions.invoke("send-custom-email", {
        body: {
          recipients,
          subject,
          body,
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent! 📧",
        description: `Successfully sent to ${data.sent} recipients`,
      });

      // Clear form
      setSubject("");
      setBody("");
      setSingleEmail("");
      setRecipientType("all");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send email";
      console.error("Send error:", error);
      toast({
        title: "Send failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getSubjectColor = () => {
    if (subject.length >= 80) return "text-red-500";
    if (subject.length >= 60) return "text-yellow-500";
    return "text-muted-foreground";
  };

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
                    The future of finance is decentralized, and now, learning it pays.
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

    setIsSendingRaffle(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-raffle-announcement');

      if (error) throw error;

      toast({
        title: "Raffle Announcement Sent! 🎉",
        description: `Email sent to ${data.sent} subscribers`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send raffle announcement";
      console.error('Error sending raffle announcement:', error);
      toast({
        title: "Send Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSendingRaffle(false);
    }
  };

  const renderComposePreview = () => {
    const previewBody = body
      .split("\n\n")
      .map(
        (paragraph) =>
          `<p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">${paragraph.replace(
            /\n/g,
            "<br>"
          )}</p>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="padding: 48px 40px 32px 40px; text-align: center;">
                    <h1 style="color: #8B5CF6; font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">Sentinel DeFi</h1>
                    <p style="color: #9CA3AF; font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.5px;">CONSCIOUS DEFI EDUCATION</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="height: 1px; background: linear-gradient(to right, transparent, #E5E7EB, transparent);"></div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 40px 32px 40px;">
                    <h2 style="color: #111827; font-size: 22px; margin: 0 0 24px 0; font-weight: 600;">
                      ${subject || "Email Subject"}
                    </h2>
                    ${previewBody || '<p style="color: #9CA3AF;">Email body will appear here...</p>'}
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 0 40px 48px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-radius: 6px; background: #8B5CF6; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);">
                          <a href="https://sentineldefi.online" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Visit Sentinel DeFi</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px 32px 40px; background-color: #F9FAFB; border-radius: 0 0 8px 8px;">
                    <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 12px 0; line-height: 1.6; text-align: center;">
                      You're receiving this because you're part of the Sentinel DeFi community.
                    </p>
                    <p style="margin: 0; text-align: center;">
                      <a href="https://sentineldefi.online" style="color: #8B5CF6; text-decoration: none; font-size: 12px; font-weight: 600;">Visit Website</a>
                      <span style="color: #D1D5DB; margin: 0 8px;">|</span>
                      <a href="https://sentineldefi.online/contact" style="color: #8B5CF6; text-decoration: none; font-size: 12px; font-weight: 600;">Contact Us</a>
                    </p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Email Hub</h2>
        <p className="text-muted-foreground">
          Manage all outbound communications and email analytics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6 space-y-6">
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

              <Dialog open={rafflePreviewOpen} onOpenChange={setRafflePreviewOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Raffle Email
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
                disabled={isSendingRaffle || !activeRaffle}
                className="w-full"
                size="lg"
              >
                {isSendingRaffle ? (
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

          <Card>
            <CardHeader>
              <CardTitle>Free-form Email Composer</CardTitle>
              <CardDescription>
                Send a custom branded email to your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label htmlFor="subject">Subject Line</Label>
                  <span className={`text-xs ${getSubjectColor()}`}>
                    {subject.length} characters
                  </span>
                </div>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  value={recipientType}
                  onValueChange={setRecipientType}
                >
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="premium">Premium Members Only</SelectItem>
                    <SelectItem value="free">Free Members Only</SelectItem>
                    <SelectItem value="single">Single Email Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === "single" && (
                <div className="space-y-2">
                  <Label htmlFor="single-email">Recipient Email</Label>
                  <Input
                    id="single-email"
                    type="email"
                    placeholder="email@example.com"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="body">Email Body (Plain Text)</Label>
                <Textarea
                  id="body"
                  placeholder="Type your message here... Use double line breaks for new paragraphs."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Email Preview</DialogTitle>
                      <DialogDescription>
                        How your email will appear to recipients
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className="border rounded-lg bg-white overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: renderComposePreview() }}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="flex-1"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="mt-6 space-y-6">
          <BroadcastPreview />

          <Collapsible
            open={testerOpen}
            onOpenChange={setTesterOpen}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-medium">Advanced Tools</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {testerOpen ? "Hide Webhook Tester" : "Show Webhook Tester"}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${testerOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <BroadcastTester />
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="stats" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Total Emails (Last 100)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{emailStats.total}</p>
                )}
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
                {loadingStats ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold text-green-500">
                    {emailStats.sent}
                  </p>
                )}
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
                {loadingStats ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-red-500">
                      {emailStats.failed}
                    </p>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>
                View detailed email history and logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/admin/email-logs")}
                variant="outline"
                className="w-full"
              >
                View Full Email Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

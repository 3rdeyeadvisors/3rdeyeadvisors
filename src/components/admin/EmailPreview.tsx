import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Eye } from "lucide-react";

const EmailPreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("announcement");

  const sampleData = {
    name: "Alex Johnson",
    raffle_title: "Learn to Earn : Bitcoin Edition",
    prize: "Bitcoin",
    prize_amount: 50,
    entry_count: 5,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Complete DeFi courses, engage with our community, and earn entries to win Bitcoin!",
    winner_name: "Sarah Smith",
  };

  const templates = {
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
                        <strong style="color: #3B82F6;">3rdeyeadvisors</strong> has officially launched the <strong>Learn-to-Earn Raffle</strong>, rewarding our community for learning and engaging in DeFi education.
                      </p>
                      
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #3B82F6; border-radius: 12px; margin: 30px 0;">
                        <tr>
                          <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="margin: 0 0 24px 0; color: #ffffff; font-size: 24px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                              How to Enter
                            </h2>
                            
                            <div style="text-align: left; margin: 0 0 30px 0;">
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Follow us on Instagram</strong> @3rdeyeadvisors
                              </p>
                              <p style="font-size: 16px; line-height: 2; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 8px 0;">
                                ✅ <strong>Follow us on X (Twitter)</strong> @3rdeyeadvisors
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
                            <a href="https://the3rdeyeadvisors.com/raffles" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                              Join the Raffle Now →
                            </a>
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
                             3rdeyeadvisors
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
      subject: "You're officially entered: 3rdeyeadvisors Learn-to-Earn Raffle 🎟",
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
             The 3rdeyeadvisors Team
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Want more entries? Share your referral link from your <a href="https://the3rdeyeadvisors.com/raffles" style="color: #3B82F6; text-decoration: none;">raffle dashboard</a>.
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
              🌐 All results will be visible on our <a href="https://the3rdeyeadvisors.com/raffle-history" style="color: #3B82F6; text-decoration: none;">Raffle History</a> page
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Even if you don't win this time, your learning journey continues to pay dividends. Keep exploring DeFi with us!
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://the3rdeyeadvisors.com/courses" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Continue Learning →
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The 3rdeyeadvisors Team
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
             The 3rdeyeadvisors Team
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
              🔔 Follow us on <a href="https://instagram.com/3rdeyeadvisors" style="color: #3B82F6; text-decoration: none;">Instagram</a> and <a href="https://x.com/3rdeyeadvisors" style="color: #3B82F6; text-decoration: none;">X</a> for updates
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://the3rdeyeadvisors.com/courses" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Continue Learning →
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
             The 3rdeyeadvisors Team
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              View all past winners on our <a href="https://the3rdeyeadvisors.com/raffle-history" style="color: #3B82F6; text-decoration: none;">Raffle History</a> page.
            </p>
          </div>
        </div>
      `,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Email Preview</h2>
        <p className="text-muted-foreground">
          Preview all raffle email templates with sample data
        </p>
      </div>

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
                      <h3 className="text-lg font-semibold">{template.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Subject: {template.subject}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
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
                    className="email-preview bg-white rounded-lg shadow-cosmic mx-auto"
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

      <Card className="border-primary/20 bg-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">About Email Previews</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• These previews show sample data : actual emails will use real raffle information</li>
                <li>• Click "Open in New Tab" to see the full email layout in a new window</li>
                <li>• The dark background simulates how emails appear in preview panes</li>
                <li>• Email styling may vary slightly across different email clients</li>
                <li>• All emails are automatically sent when raffle status changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailPreview;

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RaffleEndedRequest {
  raffle_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { raffle_id }: RaffleEndedRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching raffle details for ended notification:", raffle_id);

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffle_id)
      .single();

    if (raffleError) throw raffleError;

    // Get all participants (unique users who entered)
    const { data: entries, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('user_id')
      .eq('raffle_id', raffle_id);

    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ message: "No participants found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(entries.map(e => e.user_id))];

    // Get user emails from auth.users via profiles
    const { data: users, error: usersError } = await supabase
      .rpc('get_user_emails_with_profiles');

    if (usersError) throw usersError;

    // Filter to only participants
    const participants = users.filter((u: any) => uniqueUserIds.includes(u.user_id));

    console.log(`Sending raffle ended notification to ${participants.length} participants...`);

    // Send emails in batches
    const emailPromises = participants.map((participant: any) => 
      resend.emails.send({
        from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
        to: [participant.email],
        subject: `⏰ ${raffle.title} Has Ended — Winner Coming Soon!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @media only screen and (max-width: 600px) {
                .container { padding: 24px 16px !important; }
                .header h1 { font-size: 24px !important; }
                .cta-button { padding: 16px 24px !important; font-size: 16px !important; }
                .prize-amount { font-size: 40px !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: hsl(222, 84%, 5%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: hsl(222, 84%, 5%);">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="max-width: 600px; width: 100%; background: linear-gradient(180deg, hsl(222, 47%, 11%), hsl(263, 70%, 10%)); border-radius: 16px; border: 1px solid hsl(217, 33%, 17%);">
                    <tr>
                      <td style="padding: 48px 40px;">
                        <!-- Header -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="header">
                          <tr>
                            <td align="center" style="padding-bottom: 24px;">
                              <h1 style="color: hsl(271, 91%, 65%); margin: 0; font-size: 28px; font-weight: 700;">
                                The Wait is Almost Over ⏰
                              </h1>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: hsl(0, 0%, 96%); text-align: center;">
                          Hi ${participant.display_name || 'there'},
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; color: hsl(0, 0%, 83%); text-align: center;">
                          The <strong style="color: hsl(217, 91%, 60%);">${raffle.title}</strong> has officially ended. Thank you for participating and learning with us!
                        </p>
                        
                        <!-- Prize Box -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(271, 91%, 65%), hsl(217, 91%, 60%)); border-radius: 12px; margin: 24px 0;">
                          <tr>
                            <td style="padding: 32px; text-align: center;">
                              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 700;">Raffle Complete</h2>
                              <div class="prize-amount" style="font-size: 48px; font-weight: 700; margin: 16px 0; color: #ffffff;">🪙 $${raffle.prize_amount}</div>
                              <p style="font-size: 18px; margin: 8px 0; color: #ffffff; font-weight: 600;">${raffle.prize}</p>
                              <p style="font-size: 14px; margin: 16px 0 0 0; opacity: 0.9; color: #ffffff;">
                                ${raffle.description}
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Next Steps Box -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: hsl(217, 33%, 17%); border-radius: 12px; margin: 24px 0; border: 1px solid hsl(217, 33%, 25%);">
                          <tr>
                            <td style="padding: 24px;">
                              <h3 style="color: hsl(217, 91%, 60%); margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">What's Next?</h3>
                              <p style="font-size: 16px; line-height: 1.8; margin: 0; color: hsl(0, 0%, 83%);">
                                🎯 We're verifying all entries and selecting the winner<br>
                                📧 The winner will be announced via email soon<br>
                                🌐 Results visible on <a href="https://sentineldefi.online/raffle-history" style="color: hsl(217, 91%, 60%); text-decoration: none; font-weight: 600;">Raffle History</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; color: hsl(0, 0%, 83%); text-align: center;">
                          Even if you don't win this time, your learning journey continues to pay dividends!
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding: 0 0 32px 0;">
                              <a href="https://sentineldefi.online/courses" class="cta-button" style="display: inline-block; background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: #ffffff; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; min-height: 44px; box-sizing: border-box;">
                                Continue Learning →
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Footer -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid hsl(217, 33%, 25%); padding-top: 24px;">
                          <tr>
                            <td align="center">
                              <p style="font-size: 18px; font-weight: 700; color: hsl(271, 91%, 65%); margin: 0 0 8px 0;">
                                Awareness is advantage.
                              </p>
                              <p style="font-size: 14px; color: hsl(0, 0%, 50%); margin: 0;">
                                — The Sentinel DeFi Team
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
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Raffle ended notification sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed: failed,
        total: participants.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-raffle-ended:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

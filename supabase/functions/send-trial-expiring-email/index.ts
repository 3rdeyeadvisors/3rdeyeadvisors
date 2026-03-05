import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Checking for expiring trials...");
    
    // Get trials expiring in 3 days or 1 day
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // Get trials that expire within the next 3 days
    const { data: expiringTrials, error: trialsError } = await supabase
      .from('user_trials')
      .select('user_id, trial_end')
      .is('converted_at', null)
      .gte('trial_end', now.toISOString())
      .lte('trial_end', threeDaysFromNow.toISOString());
    
    if (trialsError) throw trialsError;
    
    if (!expiringTrials || expiringTrials.length === 0) {
      console.log("No expiring trials found");
      return new Response(
        JSON.stringify({ success: true, message: "No expiring trials", emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Get user emails
    const { data: users, error: usersError } = await supabase
      .rpc('get_user_emails_with_profiles');
    
    if (usersError) throw usersError;
    
    // Check email logs to avoid duplicates
    const { data: sentEmails } = await supabase
      .from('email_logs')
      .select('recipient_email, metadata')
      .eq('email_type', 'trial_expiring')
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());
    
    const recentlySent = new Set(sentEmails?.map(e => e.recipient_email.toLowerCase()) || []);
    
    let emailsSent = 0;
    const errors: string[] = [];
    
    for (const trial of expiringTrials) {
      const user = users?.find((u: any) => u.user_id === trial.user_id);
      if (!user || recentlySent.has(user.email.toLowerCase())) continue;
      
      const trialEnd = new Date(trial.trial_end);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      // Only send for 1 day or 3 days remaining
      if (daysRemaining !== 1 && daysRemaining !== 3) continue;
      
      const urgencyText = daysRemaining === 1 ? "Tomorrow" : "in 3 Days";
      const urgencyEmoji = daysRemaining === 1 ? "⚠️" : "⏰";
      
      try {
        await resend.emails.send({
          from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
          to: [user.email],
          subject: `${urgencyEmoji} Your Free Trial Ends ${urgencyText}`,
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
                              <td align="center" style="padding-bottom: 32px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">${urgencyEmoji}</div>
                                <h1 style="color: hsl(217, 91%, 60%); margin: 0; font-size: 32px; font-weight: 700;">
                                  Your Trial Ends ${urgencyText}
                                </h1>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 18px; line-height: 1.6; text-align: center; margin: 0 0 16px 0; color: hsl(0, 0%, 96%);">
                            Hi <strong>${user.display_name || 'there'}</strong>,
                          </p>
                          
                          <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 32px 0; color: hsl(0, 0%, 83%);">
                            Your free trial of premium DeFi courses expires ${daysRemaining === 1 ? 'tomorrow' : 'in 3 days'}. Don't lose access to your learning progress!
                          </p>
                          
                          <!-- Countdown Box -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); border-radius: 12px; margin: 32px 0;">
                            <tr>
                              <td style="padding: 32px; text-align: center;">
                                <div style="font-size: 56px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">
                                  ${daysRemaining}
                                </div>
                                <p style="font-size: 18px; margin: 0; color: #ffffff; font-weight: 600;">
                                  Day${daysRemaining > 1 ? 's' : ''} Remaining
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Benefits Box -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: hsl(217, 33%, 17%); border-radius: 12px; margin: 32px 0; border: 1px solid hsl(217, 33%, 25%);">
                            <tr>
                              <td style="padding: 24px;">
                                <h3 style="color: hsl(217, 91%, 60%); margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">
                                  Keep Your Access To:
                                </h3>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px;">
                                      ✅ Advanced DeFi Courses & Strategies
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px;">
                                      ✅ Exclusive Community Discussions
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px;">
                                      ✅ Learn-to-Earn Raffle Entries
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px;">
                                      ✅ Course Completion Certificates
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- CTA Button -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" style="padding: 24px 0 32px 0;">
                                <a href="https://sentineldefi.com/subscription" class="cta-button" style="display: inline-block; background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: #ffffff; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; min-height: 44px; box-sizing: border-box;">
                                  Subscribe Now →
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 32px 0; color: hsl(0, 0%, 60%);">
                            Subscribe today and continue your DeFi education without interruption.
                          </p>
                          
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
        });
        
        await supabase.from('email_logs').insert({
          email_type: 'trial_expiring',
          recipient_email: user.email,
          status: 'sent',
          edge_function_name: 'send-trial-expiring-email',
          metadata: { days_remaining: daysRemaining, trial_end: trial.trial_end }
        });
        
        emailsSent++;
        console.log(`Trial expiring email sent to ${user.email} (${daysRemaining} days remaining)`);
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 550));
        
      } catch (emailErr: any) {
        console.error(`Failed to send to ${user.email}:`, emailErr);
        errors.push(`${user.email}: ${emailErr.message}`);
        
        await supabase.from('email_logs').insert({
          email_type: 'trial_expiring',
          recipient_email: user.email,
          status: 'failed',
          edge_function_name: 'send-trial-expiring-email',
          error_message: emailErr.message
        });
      }
    }
    
    console.log(`Trial expiring emails complete. Sent ${emailsSent} emails.`);
    
    return new Response(
      JSON.stringify({ success: true, emailsSent, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Error in send-trial-expiring-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a bulk send for existing subscribers
    const url = new URL(req.url);
    const sendToAll = url.searchParams.get('sendToAll') === 'true';
    
    console.log(`Starting subscriber signup reminder. Send to all: ${sendToAll}`);
    
    // Get all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('id, email, name, created_at');
    
    if (subError) {
      console.error('Error fetching subscribers:', subError);
      throw subError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found');
      return new Response(
        JSON.stringify({ success: true, message: 'No subscribers to process', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Get all user emails from auth
    const { data: authUsers, error: authError } = await supabase
      .rpc('get_user_emails_with_profiles');
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }
    
    const registeredEmails = new Set(authUsers?.map((u: any) => u.email.toLowerCase()) || []);
    
    // Filter subscribers who don't have accounts
    let subscribersWithoutAccounts = subscribers.filter(
      sub => !registeredEmails.has(sub.email.toLowerCase())
    );
    
    console.log(`Found ${subscribersWithoutAccounts.length} subscribers without accounts`);
    
    // If not sending to all, only send to those who subscribed ~24 hours ago
    if (!sendToAll) {
      const now = new Date();
      const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      
      subscribersWithoutAccounts = subscribersWithoutAccounts.filter(sub => {
        const createdAt = new Date(sub.created_at);
        return createdAt >= twentyFiveHoursAgo && createdAt <= twentyThreeHoursAgo;
      });
      
      console.log(`After time filter: ${subscribersWithoutAccounts.length} subscribers in 24-hour window`);
    }
    
    // Check which subscribers have already received this email
    const { data: sentEmails, error: logsError } = await supabase
      .from('email_logs')
      .select('recipient_email')
      .eq('email_type', 'subscriber_signup_reminder');
    
    if (logsError) {
      console.error('Error fetching email logs:', logsError);
    }
    
    const alreadySent = new Set(sentEmails?.map((e: any) => e.recipient_email.toLowerCase()) || []);
    
    // Filter out subscribers who already received this email
    subscribersWithoutAccounts = subscribersWithoutAccounts.filter(
      sub => !alreadySent.has(sub.email.toLowerCase())
    );
    
    console.log(`After deduplication: ${subscribersWithoutAccounts.length} subscribers to email`);
    
    if (subscribersWithoutAccounts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No new subscribers to email', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    let emailsSent = 0;
    const errors: string[] = [];
    
    for (const subscriber of subscribersWithoutAccounts) {
      const firstName = subscriber.name?.split(' ')[0] || 'there';
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Sentinel DeFi <info@sentineldefi.online>",
          to: [subscriber.email],
          subject: "Unlock Your Full DeFi Learning Experience 🔓",
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
                  .header h2 { font-size: 18px !important; }
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
                        <td style="padding: 40px 32px;">
                          <!-- Header -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="header" style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid hsl(217, 33%, 25%); margin-bottom: 24px;">
                            <tr>
                              <td align="center">
                                <h1 style="color: hsl(217, 91%, 60%); font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">Sentinel DeFi</h1>
                                <h2 style="color: hsl(271, 91%, 65%); font-size: 20px; margin: 0; font-weight: 600;">Take Your Learning to the Next Level</h2>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: hsl(0, 0%, 96%); font-size: 18px; margin: 0 0 16px 0; line-height: 1.6; text-align: center;">
                            Hey ${firstName}! 👋
                          </p>
                          
                          <p style="color: hsl(0, 0%, 83%); font-size: 16px; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                            Thanks for subscribing to our newsletter! We noticed you haven't created an account yet – and you're missing out on some amazing features.
                          </p>
                          
                          <!-- Benefits Box -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: hsl(217, 33%, 17%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid hsl(217, 33%, 25%);">
                            <tr>
                              <td>
                                <h3 style="color: hsl(217, 91%, 60%); margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">🎁 What You Get With a Free Account:</h3>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px; line-height: 1.6;">
                                      <strong style="color: hsl(217, 91%, 60%);">Track Your Progress</strong> - Save your place in courses
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px; line-height: 1.6;">
                                      <strong style="color: hsl(217, 91%, 60%);">Free DeFi Courses</strong> - Access beginner-friendly content
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px; line-height: 1.6;">
                                      <strong style="color: hsl(217, 91%, 60%);">Community Access</strong> - Join discussions with learners
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px; line-height: 1.6;">
                                      <strong style="color: hsl(217, 91%, 60%);">Raffle Entries</strong> - Participate in exclusive giveaways
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: hsl(0, 0%, 83%); font-size: 16px; line-height: 1.6;">
                                      <strong style="color: hsl(217, 91%, 60%);">Certificates</strong> - Earn badges as you complete courses
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: hsl(0, 0%, 83%); font-size: 16px; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                            Creating an account takes less than 30 seconds – just use the same email you subscribed with!
                          </p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" style="padding: 24px 0;">
                                <a href="https://sentineldefi.online/auth" class="cta-button" style="display: inline-block; background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: #ffffff; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; min-height: 44px; box-sizing: border-box;">
                                  Create Free Account
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: hsl(0, 0%, 60%); font-size: 14px; margin: 24px 0 0 0; line-height: 1.6; text-align: center;">
                            Questions? Just reply to this email – we're here to help!
                          </p>
                          
                          <!-- Footer -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid hsl(217, 33%, 25%);">
                            <tr>
                              <td align="center">
                                <p style="color: hsl(0, 0%, 45%); font-size: 12px; margin: 0;">
                                  You're receiving this because you subscribed at sentineldefi.online
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
        
        console.log(`Signup reminder sent to ${subscriber.email}:`, emailResponse);
        
        await supabase.from('email_logs').insert({
          email_type: 'subscriber_signup_reminder',
          recipient_email: subscriber.email,
          status: 'sent',
          edge_function_name: 'send-subscriber-signup-reminder',
          metadata: { name: subscriber.name, resend_id: emailResponse.data?.id }
        });
        
        emailsSent++;
        
        // Delay to respect Resend's rate limit (2 req/sec)
        await new Promise(resolve => setTimeout(resolve, 550));
        
      } catch (emailErr: any) {
        console.error(`Failed to send to ${subscriber.email}:`, emailErr);
        errors.push(`${subscriber.email}: ${emailErr.message}`);
        
        await supabase.from('email_logs').insert({
          email_type: 'subscriber_signup_reminder',
          recipient_email: subscriber.email,
          status: 'failed',
          edge_function_name: 'send-subscriber-signup-reminder',
          error_message: emailErr.message
        });
      }
    }
    
    console.log(`Subscriber signup reminder complete. Sent ${emailsSent} emails.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        totalSubscribersWithoutAccounts: subscribersWithoutAccounts.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Error in send-subscriber-signup-reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      throw new Error('User is not an admin');
    }

    const supabase = supabaseAdmin;

    console.log(`Fetching subscribers for raffle announcement triggered by ${user.email}...`);

    // Fetch all subscribers (exclude bot accounts)
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email, name')
      .not('email', 'ilike', 'bot-%@internal.3rdeyeadvisors.com');

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending raffle announcement to ${subscribers.length} subscribers...`);

    // Send emails with rate limiting (600ms delay between sends)
    const results = [];
    for (const subscriber of subscribers) {
      try {
        const result = await resend.emails.send({
        from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
        to: [subscriber.email],
        subject: "🎟 Learn to Earn — Join Our $50 Bitcoin Raffle Now",
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
                          Hi <strong>${subscriber.name || 'there'}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937;">
                          The future of finance is decentralized — and now, learning it pays.
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
                                <div style="font-size: 56px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">🪙 $50</div>
                                <p style="font-size: 22px; margin: 8px 0; color: #ffffff; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                                  Prize: Bitcoin
                                </p>
                                <p style="font-size: 16px; margin: 8px 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                                  🕒 Active Period: November 10–23, 2025
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding: 40px 0 30px 0;">
                              <a href="https://sentineldefi.com/raffles" style="display: inline-block; background-color: #3B82F6; color: #ffffff; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                                Join the Raffle Now →
              </a>
            </td>
          </tr>
        </table>
        
        <p style="font-size: 16px; line-height: 1.6; font-style: italic; text-align: center; color: #6b7280; margin: 0 0 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
          The more you learn, the more you earn — because awareness is the real currency.
        </p>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="font-size: 18px; font-weight: 700; color: #3B82F6; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                Awareness is advantage.
              </p>
              <p style="font-size: 14px; color: #6b7280; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                — Sentinel DeFi
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
        
        results.push({ status: 'fulfilled', value: result });
        console.log(`✅ Sent to ${subscriber.email}`);
        
        // Rate limiting: wait 600ms between sends
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
        console.error(`❌ Failed to send to ${subscriber.email}:`, error);
        
        // Still wait on errors to maintain rate limit
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Raffle announcement sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed: failed,
        total: subscribers.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-raffle-announcement:", error);
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

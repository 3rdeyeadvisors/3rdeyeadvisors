import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomEmailRequest {
  recipients: string | string[];
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    const { recipients, subject, body }: CustomEmailRequest = await req.json();

    if (!recipients) {
      throw new Error("No recipients provided");
    }

    if (!subject || !body) {
      throw new Error("Subject and body are required");
    }

    const supabase = supabaseAdmin;
    let recipientList: string[] = [];

    if (typeof recipients === "string") {
      if (recipients === "all") {
        // Fetch all real subscribers — exclude internal bot test emails
        const { data, error } = await supabase
          .from("subscribers")
          .select("email")
          .not("email", "ilike", "bot-%@internal.sentineldefi.online");
        if (error) throw error;
        recipientList = (data || []).map(s => s.email).filter(Boolean);

      } else if (recipients === "premium") {
        // Get user_ids of everyone who has made a purchase
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("user_purchases")
          .select("user_id");
        if (purchaseError) throw purchaseError;
        const premiumUserIds = [...new Set((purchaseData || []).map((p: any) => p.user_id))];

        // Use the RPC function that joins auth.users to get emails
        const { data: emailData, error: emailError } = await supabase
          .rpc("get_user_emails_with_profiles");
        if (emailError) throw emailError;
        recipientList = (emailData || [])
          .filter((u: any) => premiumUserIds.includes(u.user_id))
          .map((u: any) => u.email)
          .filter(Boolean);

      } else if (recipients === "free") {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("user_purchases")
          .select("user_id");
        if (purchaseError) throw purchaseError;
        const premiumUserIds = [...new Set((purchaseData || []).map((p: any) => p.user_id))];

        const { data: emailData, error: emailError } = await supabase
          .rpc("get_user_emails_with_profiles");
        if (emailError) throw emailError;
        recipientList = (emailData || [])
          .filter((u: any) => !premiumUserIds.includes(u.user_id))
          .map((u: any) => u.email)
          .filter(Boolean);
      }
    } else {
      recipientList = recipients;
    }

    console.log(`Sending custom email from ${user.email} to:`, recipientList.length, "recipients");

    if (recipientList.length === 0) {
      throw new Error("Recipient list is empty");
    }

    const results = [];

    // Send emails to all recipients
    for (const recipient of recipientList) {
      try {
        const emailResponse = await resend.emails.send({
          from: "Sentinel DeFi <info@sentineldefi.online>",
          to: [recipient],
          subject: subject,
          tags: [
            { name: 'category', value: 'custom' }
          ],
          html: `
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
                        <td style="padding: 48px 40px; text-align: center; background-color: #8B5CF6; border-radius: 8px 8px 0 0;">
                          <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">Sentinel DeFi</h1>
                          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; font-weight: 500; letter-spacing: 0.5px;">CONSCIOUS DEFI EDUCATION</p>
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
                            ${subject}
                          </h2>
                          ${body.split('\n\n').map(paragraph => 
                            `<p style="color: #4B5563; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">${paragraph.replace(/\n/g, '<br>')}</p>`
                          ).join('')}
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
          `,
        });

        console.log("Email sent to:", recipient, "Response:", emailResponse);

        // Log successful email
        await supabase.from('email_logs').insert({
          email_type: 'custom',
          recipient_email: recipient,
          status: 'sent',
          edge_function_name: 'send-custom-email',
          metadata: {
            subject: subject,
            resend_id: emailResponse.data?.id || null
          }
        });

        results.push({ email: recipient, status: 'sent', id: emailResponse.data?.id });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to send to:", recipient, error);

        // Log failed email
        await supabase.from('email_logs').insert({
          email_type: 'custom',
          recipient_email: recipient,
          status: 'failed',
          error_message: errorMsg,
          edge_function_name: 'send-custom-email',
          metadata: {
            subject: subject
          }
        });

        results.push({ email: recipient, status: 'failed', error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: results,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-custom-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

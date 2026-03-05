import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
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

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received password reset request");
    const { email, resetUrl }: PasswordResetRequest = await req.json();
    console.log(`Processing password reset for email: ${email?.substring(0, 5)}...`);

    // Get user's name from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', (await supabase.auth.admin.getUserByEmail(email)).data.user?.id)
      .single();

    const firstName = profile?.display_name?.split(' ')[0] || 'there';

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [email],
      subject: "Reset Your Password - Sentinel DeFi",
      tags: [
        { name: 'category', value: 'password_reset' }
      ],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <style type="text/css">
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #030717;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #030717;" bgcolor="#030717">
            <tr>
              <td align="center" style="padding: 0; background-color: #030717;" bgcolor="#030717">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
                  <tr>
                    <td style="padding: 32px 20px;">
                      
                      <!-- Header with Cosmic Background -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%);">
                        <tr>
                          <td style="text-align: center; padding: 48px 24px;">
                            <h1 style="color: hsl(217, 91%, 60%); font-size: 36px; margin: 0 0 8px 0; font-weight: 700; text-shadow: 0 0 24px hsla(217, 91%, 60%, 0.4);">Sentinel DeFi</h1>
                            <p style="color: hsl(0, 0%, 95%); font-size: 18px; margin: 0; opacity: 0.9;">Secure Password Reset</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Spacer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 32px; line-height: 32px;"></td></tr></table>

                      <!-- Main Content -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <h2 style="color: hsl(217, 91%, 70%); font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">Hello ${firstName}!</h2>
                            
                            <p style="color: #F5F5F5; font-size: 16px; margin: 0 0 28px 0; line-height: 1.6;">
                              We received a request to reset the password for your Sentinel DeFi account. Click the button below to create a new secure password and continue your DeFi journey.
                            </p>

                            <!-- Reset Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td align="center" style="padding: 32px 0;">
                                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: hsl(0, 0%, 98%); padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 0 30px hsla(217, 91%, 60%, 0.4), 0 8px 20px rgba(0,0,0,0.3);">🔐 Reset My Password</a>
                                </td>
                              </tr>
                            </table>

                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-left: 4px solid hsl(217, 91%, 60%); border-radius: 0 8px 8px 0; margin: 28px 0;">
                              <tr>
                                <td style="padding: 20px;">
                                  <p style="color: #F5F5F5; margin: 0; font-size: 14px; line-height: 1.6;">
                                    <strong style="color: hsl(217, 91%, 70%);">🛡️ Security Notice:</strong> This link will expire in 24 hours for your protection. If you didn't request this password reset, you can safely ignore this email.
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <!-- Alternative Link -->
                            <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 24px 0 12px 0; line-height: 1.5;">
                              If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: hsl(217, 32%, 10%); border-radius: 8px; border: 1px solid hsl(217, 32%, 15%); margin: 0 0 28px 0;">
                              <tr>
                                <td style="padding: 16px; word-break: break-all; font-size: 13px; color: hsl(217, 91%, 70%);">
                                  ${resetUrl}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Spacer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 24px; line-height: 24px;"></td></tr></table>

                      <!-- Footer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid hsl(217, 32%, 15%);">
                        <tr>
                          <td style="text-align: center; padding: 24px 0;">
                            <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                              Need help? Contact our support team at 
                              <a href="mailto:info@the3rdeyeadvisors.com" style="color: hsl(217, 91%, 70%); text-decoration: none; font-weight: 500;">info@the3rdeyeadvisors.com</a>
                            </p>
                            <p style="color: hsl(215, 20%, 50%); font-size: 12px; margin: 0;">
                              © 2024 Sentinel DeFi. Empowering DeFi consciousness.
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

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reset email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send password reset email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
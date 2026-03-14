import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'signup' | 'recovery';
  email: string;
  token?: string;
  redirect_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, token, redirect_url }: EmailRequest = await req.json();

    // Get user's name for personalization
    let firstName = 'there';
    try {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const matchedUser = users.find((u: any) => u.email === email);
      if (matchedUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', matchedUser.id)
          .single();
        
        firstName = profile?.display_name?.split(' ')[0] || 
                   matchedUser.user_metadata?.first_name || 
                   matchedUser.user_metadata?.display_name?.split(' ')[0] || 
                   'there';
      }
    } catch (error) {
      console.log('Could not fetch user name, using default greeting');
    }

    // Create custom email content based on type
    let subject: string;
    let htmlContent: string;

    if (type === 'signup') {
      subject = 'Welcome to Sentinel DeFi - Your DeFi Journey Begins! 🚀';
      htmlContent = `
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
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <tr>
                    <td style="padding: 20px;">
          
          <!-- Cosmic Welcome Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(222, 84%, 4.9%), hsl(217, 32%, 8%)); border-radius: 12px 12px 0 0; position: relative; overflow: hidden;">
            <tr>
              <td style="text-align: center; padding: 50px 30px 40px; position: relative;">
                <h1 style="color: hsl(217, 91%, 60%); font-size: 36px; margin: 0; font-weight: bold; text-shadow: 0 0 30px hsl(217, 91%, 60%, 0.5); position: relative; z-index: 1;">Sentinel DeFi</h1>
                <p style="color: hsl(0, 0%, 95%); font-size: 20px; margin: 16px 0 0 0; opacity: 0.9; position: relative; z-index: 1;">Your DeFi Consciousness Awakening Begins</p>
              </td>
            </tr>
          </table>
          
          <!-- Main Welcome Content -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border: 1px solid hsl(217, 32%, 15%); border-top: none;">
            <tr>
              <td style="padding: 40px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(45deg, hsl(217, 91%, 60%, 0.1), hsl(271, 91%, 65%, 0.1)); border-radius: 16px; border: 1px solid hsl(217, 32%, 15%); margin: 0 0 32px 0;">
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="color: hsl(217, 91%, 70%); margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">🎉 Welcome ${firstName}!</h2>
                      <p style="line-height: 1.7; margin: 0 0 24px 0; color: hsl(0, 0%, 90%); font-size: 16px;">
                        Your journey into decentralized finance consciousness has begun. You now have access to our comprehensive DeFi education platform designed to elevate your understanding and mastery.
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="padding: 32px 0;">
                            <a href="${redirect_url || 'https://sentineldefi.online'}"
                               style="background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: hsl(222, 84%, 4.9%); padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 0 30px hsl(217, 91%, 60%, 0.4), 0 8px 20px rgba(0,0,0,0.3);">
                              🚀 Start Your Journey
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps with Cosmic Styling -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%); margin: 32px 0;">
                  <tr>
                    <td style="padding: 28px;">
                      <h3 style="color: hsl(271, 91%, 75%); margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🌟 Your Next Steps</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr><td style="color: hsl(0, 0%, 85%); line-height: 1.8; padding: 6px 0 6px 24px; position: relative;"><span style="position: absolute; left: 0; color: hsl(217, 91%, 70%);">📚</span> Explore our comprehensive course library</td></tr>
                        <tr><td style="color: hsl(0, 0%, 85%); line-height: 1.8; padding: 6px 0 6px 24px; position: relative;"><span style="position: absolute; left: 0; color: hsl(271, 91%, 70%);">🎯</span> Start with DeFi Foundations for beginners</td></tr>
                        <tr><td style="color: hsl(0, 0%, 85%); line-height: 1.8; padding: 6px 0 6px 24px; position: relative;"><span style="position: absolute; left: 0; color: hsl(142, 76%, 46%);">💬</span> Join our community discussions</td></tr>
                        <tr><td style="color: hsl(0, 0%, 85%); line-height: 1.8; padding: 6px 0 6px 24px; position: relative;"><span style="position: absolute; left: 0; color: hsl(217, 91%, 70%);">📈</span> Track your learning progress</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Cosmic Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 6%), hsl(222, 84%, 4.9%)); border-radius: 0 0 12px 12px; border: 1px solid hsl(217, 32%, 15%); border-top: none;">
            <tr>
              <td style="text-align: center; padding: 32px 24px;">
                <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                  Questions? Contact us at 
                  <a href="mailto:info@sentineldefi.online" style="color: hsl(217, 91%, 70%); text-decoration: none; font-weight: 500;">info@sentineldefi.online</a>
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
      `;
    } else if (type === 'recovery') {
      subject = 'Reset Your Sentinel DeFi Password 🔑';
      htmlContent = `
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
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <tr>
                    <td style="padding: 20px;">
          
          <!-- Security Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(222, 84%, 4.9%), hsl(217, 32%, 8%)); border-radius: 12px 12px 0 0;">
            <tr>
              <td style="text-align: center; padding: 50px 30px 30px;">
                <h1 style="color: hsl(217, 91%, 60%); font-size: 32px; margin: 0; font-weight: bold; text-shadow: 0 0 20px hsl(217, 91%, 60%, 0.3);">Password Reset</h1>
                <p style="color: hsl(0, 0%, 95%); font-size: 16px; margin: 12px 0 0 0; opacity: 0.9;">Sentinel DeFi Account Security</p>
              </td>
            </tr>
          </table>
          
          <!-- Main Recovery Content -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border: 1px solid hsl(217, 32%, 15%); border-top: none;">
            <tr>
              <td style="padding: 40px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(45deg, hsl(217, 91%, 60%, 0.1), hsl(271, 91%, 65%, 0.1)); border-radius: 16px; border: 1px solid hsl(217, 32%, 15%); margin: 0 0 32px 0;">
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="color: hsl(217, 91%, 70%); margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">🔑 Hello ${firstName}!</h2>
                      <p style="line-height: 1.7; margin: 0 0 24px 0; color: hsl(0, 0%, 90%); font-size: 16px;">
                        We received a request to reset your password for your Sentinel DeFi account. Click the button below to create a new secure password.
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="padding: 32px 0;">
                            <a href="${redirect_url || 'https://sentineldefi.online/auth?reset=true'}"
                               style="background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: hsl(222, 84%, 4.9%); padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 0 30px hsl(217, 91%, 60%, 0.4), 0 8px 20px rgba(0,0,0,0.3);">
                              🔐 Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="font-size: 14px; color: hsl(215, 20%, 65%); margin: 24px 0 0 0; text-align: center;">
                        This link will expire in 24 hours for security.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Security Warning -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(45, 100%, 25%), hsl(45, 100%, 20%)); border: 1px solid hsl(45, 100%, 40%); border-radius: 12px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="color: hsl(45, 100%, 85%); margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong style="color: hsl(45, 100%, 95%);">⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Cosmic Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 6%), hsl(222, 84%, 4.9%)); border-radius: 0 0 12px 12px; border: 1px solid hsl(217, 32%, 15%); border-top: none;">
            <tr>
              <td style="text-align: center; padding: 32px 24px;">
                <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                  Need help? Contact us at 
                  <a href="mailto:info@sentineldefi.online" style="color: hsl(217, 91%, 70%); text-decoration: none; font-weight: 500;">info@sentineldefi.online</a>
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
      `;
    } else {
      throw new Error('Invalid email type');
    }

    console.log(`Custom email prepared for ${type}: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} email prepared`,
        subject,
        html: htmlContent 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
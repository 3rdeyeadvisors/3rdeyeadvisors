import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  userId: string;
  taskType: 'instagram' | 'x';
  username: string;
  raffleTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, taskType, username, raffleTitle }: VerificationEmailRequest = await req.json();

    console.log("Sending social verification email for:", { userId, taskType, username });

    // Get user's email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user?.email) {
      console.error("Error fetching user email:", userError);
      throw new Error("User email not found");
    }

    const displayName = profile?.display_name || "there";
    const platform = 'Instagram';
    const platformHandle = taskType === 'instagram' ? '@sentineldefi' : '@sentineldefi';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Social Media Handle Verified</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Verification Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your <strong>${platform}</strong> handle has been verified for the <strong>${raffleTitle}</strong> raffle.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 14px; color: #666;">Verified Handle:</p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #667eea;">@${username}</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your raffle entries have been updated! Keep completing tasks to earn more entries and increase your chances of winning.
            </p>
            
            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>💡 Pro Tip:</strong> Follow ${platformHandle} and engage with our content to stay updated on future raffles and DeFi education!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sentineldefi.com/raffles" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                View My Entries
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Keep learning. Keep sharing. Keep growing the decentralized movement.
            </p>
            
            <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">
              <strong>Sentinel DeFi</strong><br>
              <em>Awareness = Advantage</em>
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [user.email],
      subject: `✅ Your ${platform} Handle Has Been Verified!`,
      html: emailHtml,
    });

    console.log("Verification email sent successfully:", emailResponse);

    // Log to email_logs table
    await supabase.from("email_logs").insert({
      email_type: "social_verification",
      recipient_email: user.email,
      status: "sent",
      edge_function_name: "send-social-verification-email",
      metadata: {
        task_type: taskType,
        username: username,
        raffle_title: raffleTitle,
        resend_id: emailResponse.data?.id,
      },
    });

    return new Response(JSON.stringify({ success: true, email_id: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-social-verification-email function:", error);

    // Log error to email_logs
    try {
      await supabase.from("email_logs").insert({
        email_type: "social_verification",
        recipient_email: "unknown",
        status: "failed",
        edge_function_name: "send-social-verification-email",
        error_message: error.message,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

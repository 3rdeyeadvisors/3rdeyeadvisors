import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UsernameVerificationRequest {
  email: string;
  raffle_title: string;
  instagram_username?: string;
  x_username?: string;
  task_type: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, raffle_title, instagram_username, x_username, task_type }: UsernameVerificationRequest = await req.json();

    console.log("Sending admin notification for username verification...");

    const platform = task_type === 'instagram' ? 'Instagram' : 'X';
    const username = instagram_username || x_username;

    // Send notification to admin only
    const adminEmail = "info@the3rdeyeadvisors.com";

    const adminEmailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [adminEmail],
      subject: `🔍 New ${platform} Username Submitted - ${raffle_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#030717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#030717"><tr><td align="center" style="padding:32px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(135deg,#1a1f2e,#0f1419);border-radius:12px;border:1px solid #2a3441">
        <tr><td style="text-align:center;padding:48px 24px">
        <h1 style="color:#60a5fa;font-size:32px;margin:0 0 8px 0;font-weight:700">Sentinel DeFi</h1>
        <p style="color:#c084fc;font-size:16px;margin:0">Username Verification</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px">
        <h2 style="color:#60a5fa;font-size:22px;margin:0 0 16px 0">🔍 New ${platform} Username</h2>
        <div style="background:#1e293b;padding:20px;border-radius:8px;border:1px solid #334155;margin:20px 0">
        <p style="color:#f5f5f5;margin:8px 0"><strong style="color:#60a5fa">User:</strong> ${email}</p>
        <p style="color:#f5f5f5;margin:8px 0"><strong style="color:#60a5fa">Raffle:</strong> ${raffle_title}</p>
        <p style="color:#f5f5f5;margin:8px 0"><strong style="color:#60a5fa">Platform:</strong> ${platform}</p>
        <p style="color:#f5f5f5;margin:8px 0"><strong style="color:#60a5fa">Username:</strong> @${username}</p>
        <p style="color:#f5f5f5;margin:8px 0"><strong style="color:#60a5fa">Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="background:#422006;padding:16px;border-radius:0 8px 8px 0;border-left:4px solid #f59e0b;margin:20px 0">
        <p style="color:#fbbf24;margin:0;font-weight:600">⚡ Action Required</p>
        <p style="color:#f5f5f5;margin:8px 0 0;font-size:14px">Verify this username in the Admin dashboard.</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0">
        <a href="https://sentineldefi.com/admin" style="display:inline-block;background:linear-gradient(45deg,#3b82f6,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700">Go to Admin Dashboard</a>
        </td></tr></table>
        <p style="text-align:center;color:#64748b;font-size:12px;margin:20px 0 0;border-top:1px solid #334155;padding-top:20px">Automated notification from Sentinel DeFi</p>
        </td></tr>
        </table>
        </td></tr></table>
        </body>
        </html>
      `,
    });

    console.log("Admin notification sent:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      admin_email_sent: true 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-username-verification-email:", error);
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

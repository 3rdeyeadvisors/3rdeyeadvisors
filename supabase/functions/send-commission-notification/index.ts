import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMMISSION-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { referrer_id, commission_amount_cents, plan_type } = await req.json();
    
    if (!referrer_id || !commission_amount_cents) {
      throw new Error("Missing required fields");
    }

    logStep("Payload received", { referrer_id, commission_amount_cents, plan_type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get referrer profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("display_name, payout_method, payout_details, payout_crypto_network")
      .eq("user_id", referrer_id)
      .single();

    // Get referrer email
    const { data: userData } = await supabaseClient.auth.admin.listUsers();
    const referrerUser = userData.users.find(u => u.id === referrer_id);
    const referrerEmail = referrerUser?.email || "Unknown";

    logStep("Referrer info fetched", { 
      displayName: profile?.display_name,
      email: referrerEmail,
      payoutMethod: profile?.payout_method 
    });

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const commissionAmount = (commission_amount_cents / 100).toFixed(2);
    const planLabel = plan_type === "annual" ? "Annual" : "Monthly";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .highlight { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .amount { font-size: 28px; font-weight: bold; color: #10b981; }
    .info-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: bold; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 New Commission Pending!</h1>
    </div>
    <div class="content">
      <p>A new referral commission is ready for payout.</p>
      
      <div class="highlight">
        <p style="margin: 0; color: #6b7280;">Commission Amount</p>
        <p class="amount" style="margin: 5px 0;">$${commissionAmount}</p>
        <p style="margin: 0; color: #6b7280;">${planLabel} Plan</p>
      </div>
      
      <h3>Referrer Details</h3>
      <div class="info-row">
        <span class="label">Name:</span> ${profile?.display_name || "Not set"}
      </div>
      <div class="info-row">
        <span class="label">Email:</span> ${referrerEmail}
      </div>
      <div class="info-row">
        <span class="label">Payout Method:</span> ${profile?.payout_method || "Not set"}
      </div>
      <div class="info-row">
        <span class="label">Payout Details:</span> ${profile?.payout_details || "Not set"}
      </div>
      ${profile?.payout_crypto_network ? `
      <div class="info-row">
        <span class="label">Crypto Network:</span> ${profile.payout_crypto_network}
      </div>
      ` : ''}
      
      <p style="margin-top: 20px;">
        <a href="https://www.sentineldefi.com/admin" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
          View in Admin Dashboard
        </a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Sentinel DeFi <noreply@the3rdeyeadvisors.com>",
        to: ["info@the3rdeyeadvisors.com"],
        subject: `💰 New Commission Pending: $${commissionAmount} (${planLabel})`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    logStep("Admin notification email sent successfully");

    // Log the email
    await supabaseClient.from("email_logs").insert({
      recipient_email: "info@the3rdeyeadvisors.com",
      email_type: "commission_notification",
      edge_function_name: "send-commission-notification",
      status: "sent",
      metadata: { referrer_id, commission_amount_cents, plan_type },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FOUNDING33-CONFIRMATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    
    const { 
      customer_email, 
      customer_name, 
      seat_number, 
      order_id,
      user_id
    } = await req.json();

    logStep("Sending confirmation email", { 
      email: customer_email, 
      seatNumber: seat_number 
    });

    if (!customer_email) {
      throw new Error("Customer email is required");
    }

    const displayName = customer_name || customer_email.split('@')[0];
    const orderId = order_id ? order_id.substring(order_id.length - 8).toUpperCase() : 'F33-GENESIS';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Founding 33</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header with Crown -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">👑</span>
      </div>
      <h1 style="color: #f59e0b; font-size: 32px; margin: 0 0 10px; font-weight: 700;">
        Welcome to the Founding 33
      </h1>
      <p style="color: #9ca3af; font-size: 16px; margin: 0;">
        You've secured your place in 3EA history
      </p>
    </div>

    <!-- Seat Number Card -->
    <div style="background: linear-gradient(135deg, #1a1a1a, #262626); border: 2px solid #f59e0b; border-radius: 24px; padding: 40px; margin-bottom: 30px; text-align: center;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 2px;">
        Your Genesis Seat
      </p>
      <div style="font-size: 72px; font-weight: 700; color: #f59e0b; margin: 10px 0;">
        #${seat_number}
      </div>
      <p style="color: #d4d4d4; font-size: 16px; margin: 15px 0 0;">
        of only 33 founding members
      </p>
    </div>

    <!-- Welcome Message -->
    <div style="background-color: #1a1a1a; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
      <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Dear ${displayName},
      </p>
      <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Congratulations on becoming one of the <strong style="color: #f59e0b;">Founding 33</strong> – an exclusive group of visionaries who believed in the 3rdeyeadvisors mission from the very beginning.
      </p>
      <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0;">
        Your seat number <strong style="color: #f59e0b;">#${seat_number}</strong> is permanently yours. This is your genesis mark in the 3EA ecosystem.
      </p>
    </div>

    <!-- Benefits -->
    <div style="background-color: #1a1a1a; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
      <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 20px; font-weight: 600;">
        🎁 Your Lifetime Benefits
      </h2>
      <div style="color: #d4d4d4; font-size: 15px; line-height: 1.8;">
        <div style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>Lifetime access</strong> to ALL current courses</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>Every future course</strong> release included</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>Priority access</strong> to new features</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>70% commission</strong> on referrals</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>Founding member</strong> recognition badge</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="color: #f59e0b; margin-right: 12px;">✓</span>
          <span><strong>3x weighted vote</strong> on platform roadmap</span>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://the3rdeyeadvisors.com/courses" 
         style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Start Exploring Your Courses →
      </a>
    </div>

    <!-- Order Details -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 12px;">
        <span style="color: #9ca3af; font-size: 14px;">Order Reference</span>
        <span style="color: #ffffff; font-size: 14px; font-family: monospace;">${orderId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 12px;">
        <span style="color: #9ca3af; font-size: 14px;">Amount Paid</span>
        <span style="color: #f59e0b; font-size: 14px; font-weight: 600;">$2,000.00</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #9ca3af; font-size: 14px;">Access Type</span>
        <span style="color: #f59e0b; font-size: 14px; font-weight: 600;">Lifetime</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
        Welcome to the inner circle. We're honored to have you.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        3rdeyeadvisors • DeFi Education for the Awakened
      </p>
    </div>

  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: "3rdeyeadvisors <founder@the3rdeyeadvisors.com>",
      to: [customer_email],
      subject: `🎉 Welcome to the Founding 33 – Seat #${seat_number} is Yours!`,
      html: emailHtml,
    });

    if (error) {
      logStep("Email send error", { error: error.message });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logStep("Email sent successfully", { emailId: data?.id });

    // Log email in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseClient.from('email_logs').insert({
      recipient_email: customer_email,
      email_type: 'founding33_confirmation',
      edge_function_name: 'send-founding33-confirmation',
      status: 'sent',
      related_id: user_id || null,
      metadata: { seat_number, order_id: orderId }
    });

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
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

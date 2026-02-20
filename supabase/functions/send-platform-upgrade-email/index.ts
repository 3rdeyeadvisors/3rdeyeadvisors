import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:20px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="background-color:#7c3aed;padding:24px 32px;border-radius:8px 8px 0 0;">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">3rd Eye Advisors</h1>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 20px;">Hi Fellow Leaders,</p>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 20px;">We have been heads down building, and the new 3rdeyeadvisors platform is live.</p>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 12px;font-weight:600;">Here is what changed:</p>
<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 20px;">The entire platform has been redesigned from the ground up. New navigation that actually makes sense on mobile, a cleaner learning experience inside every course and tutorial, a completely rebuilt dashboard, and a more consistent look and feel across every single page.</p>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 12px;font-weight:600;">Specifically:</p>

<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— Courses and tutorials now have a proper learning layout with module navigation, progress tracking, and a polished quiz experience</td></tr>
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— The mobile experience has been fully rebuilt. Everything is now finger-friendly and readable on any screen size</td></tr>
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— The Vault waitlist is live. If you want early access to Sky Vault or Cosmos Vault, you can now drop your email directly on the site</td></tr>
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— The Earn page and referral system have been cleaned up with a clearer breakdown of your commission tiers</td></tr>
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— The Leaderboard, Raffle, and Community pages have all been refreshed</td></tr>
<tr><td style="font-size:16px;color:#111827;line-height:1.7;padding:4px 0;">— We added a dedicated page for financial professionals and institutions at <a href="https://the3rdeyeadvisors.com/institutional" style="color:#7c3aed;">the3rdeyeadvisors.com/institutional</a> — if you know an advisor, attorney, or educator who needs to get up to speed on DeFi, send them there.</td></tr>
</table>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 20px;">If the site looks the same as before when you visit, do a hard refresh. On desktop hold Shift and click the refresh button. On mobile close the browser completely and reopen it. That clears your browser cache and loads the new version.</p>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 28px;">More updates coming. This is just the beginning.</p>

<p style="font-size:16px;color:#111827;line-height:1.6;margin:0 0 4px;">Best,</p>

<p style="font-size:16px;color:#111827;line-height:1.5;margin:0 0 4px;font-weight:600;">Kevin Guerrier-Paul</p>
<p style="font-size:14px;color:#6b7280;line-height:1.5;margin:0 0 8px;">Founder | 3EA</p>
<p style="font-size:14px;color:#6b7280;line-height:1.5;margin:0;">
📧 <a href="mailto:info@the3rdeyeadvisors.com" style="color:#7c3aed;">info@the3rdeyeadvisors.com</a><br>
🔗 <a href="https://linkedin.com/in/kevin-guerrier-paul-717144220" style="color:#7c3aed;">LinkedIn</a><br>
🌐 <a href="https://the3rdeyeadvisors.com" style="color:#7c3aed;">the3rdeyeadvisors.com</a>
</p>

</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 32px;text-align:center;">
<p style="font-size:12px;color:#9ca3af;margin:0;">© 2025 3rd Eye Advisors. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    // Check admin role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Admin access required");

    // Fetch real subscribers (exclude bots)
    const { data: subscribers, error: subError } = await adminClient
      .from("subscribers")
      .select("email, name")
      .not("email", "ilike", "bot-%@internal.3rdeyeadvisors.com");

    if (subError) throw new Error(`Failed to fetch subscribers: ${subError.message}`);

    console.log(`Found ${subscribers?.length} real subscribers`);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    let successCount = 0;
    let failCount = 0;
    const results: { email: string; status: string; error?: string }[] = [];

    for (const sub of subscribers || []) {
      try {
        await resend.emails.send({
          from: "3rdeyeadvisors <info@the3rdeyeadvisors.com>",
          to: [sub.email],
          subject: "the platform just got a major upgrade",
          html: emailHtml,
        });

        // Log success
        await adminClient.from("email_logs").insert({
          recipient_email: sub.email,
          email_type: "platform_upgrade_announcement",
          edge_function_name: "send-platform-upgrade-email",
          status: "sent",
          metadata: { name: sub.name },
        });

        successCount++;
        results.push({ email: sub.email, status: "sent" });
        console.log(`✅ Sent to ${sub.email}`);
      } catch (err: any) {
        failCount++;
        results.push({ email: sub.email, status: "failed", error: err.message });
        console.error(`❌ Failed for ${sub.email}: ${err.message}`);

        await adminClient.from("email_logs").insert({
          recipient_email: sub.email,
          email_type: "platform_upgrade_announcement",
          edge_function_name: "send-platform-upgrade-email",
          status: "failed",
          error_message: err.message,
        });
      }

      // Rate limit: 600ms between sends
      await new Promise((r) => setTimeout(r, 600));
    }

    return new Response(
      JSON.stringify({ success: true, successCount, failCount, results }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

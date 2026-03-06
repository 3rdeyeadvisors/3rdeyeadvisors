import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NEW-COURSE-ANNOUNCEMENT] ${step}${detailsStr}`);
};

interface CourseAnnouncementRequest {
  course_id: number;
  course_title: string;
  course_description: string;
  early_access_date?: string;
  public_release_date?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

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

    const { course_id, course_title, course_description, early_access_date, public_release_date }: CourseAnnouncementRequest = await req.json();

    const supabaseClient = supabaseAdmin;

    logStep(`Starting announcement by ${user.email}`, { course_id, course_title });

    // Get all premium subscribers (annual + founding members)
    const premiumEmails: { email: string; name: string; tier: 'founding' | 'annual' }[] = [];

    // 1. Get Founding 33 members
    const { data: foundingMembers } = await supabaseClient
      .from('founding33_purchases')
      .select('user_id, customer_email, customer_name')
      .eq('status', 'completed');

    if (foundingMembers) {
      for (const member of foundingMembers) {
        premiumEmails.push({
          email: member.customer_email,
          name: member.customer_name || member.customer_email.split('@')[0],
          tier: 'founding'
        });
      }
    }
    logStep("Found founding members", { count: foundingMembers?.length || 0 });

    // 2. Get annual Stripe subscribers
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    for (const subscription of subscriptions.data) {
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      
      if (customer.deleted) continue;
      
      // Check if it's an annual subscription (interval = year)
      const isAnnual = subscription.items.data.some(
        item => item.price.recurring?.interval === 'year'
      );
      
      if (isAnnual && customer.email) {
        // Check if not already in list (founding members take priority)
        if (!premiumEmails.some(e => e.email.toLowerCase() === customer.email!.toLowerCase())) {
          premiumEmails.push({
            email: customer.email,
            name: customer.name || customer.email.split('@')[0],
            tier: 'annual'
          });
        }
      }
    }
    logStep("Found annual subscribers", { totalPremium: premiumEmails.length });

    if (premiumEmails.length === 0) {
      logStep("No premium subscribers to notify");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No premium subscribers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Send emails
    let successCount = 0;
    let errorCount = 0;

    for (const recipient of premiumEmails) {
      const tierColor = recipient.tier === 'founding' ? '#f59e0b' : '#8b5cf6';
      const tierLabel = recipient.tier === 'founding' ? '👑 Founding Member' : '⭐ Annual Member';
      const tierBadge = recipient.tier === 'founding' 
        ? 'background: linear-gradient(135deg, #f59e0b, #d97706);'
        : 'background: linear-gradient(135deg, #8b5cf6, #7c3aed);';

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Course Available</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; ${tierBadge} color: ${recipient.tier === 'founding' ? '#000' : '#fff'}; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
        ${tierLabel}
      </div>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px; font-weight: 700;">
        🎉 New Course Just Released!
      </h1>
      <p style="color: #9ca3af; font-size: 16px; margin: 0;">
        You have exclusive early access, ${recipient.name}!
      </p>
    </div>

    <!-- Course Card -->
    <div style="background: linear-gradient(135deg, #1a1a1a, #262626); border: 2px solid ${tierColor}; border-radius: 20px; padding: 30px; margin-bottom: 30px;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 15px; font-weight: 600;">
        ${course_title}
      </h2>
      <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        ${course_description}
      </p>
      ${public_release_date ? `
      <div style="background-color: rgba(0,0,0,0.3); padding: 12px 16px; border-radius: 10px; display: inline-block;">
        <span style="color: ${tierColor}; font-size: 14px; font-weight: 600;">
          ⏰ Public release: ${new Date(public_release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      ` : ''}
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://sentineldefi.online/courses/${course_id}"
         style="display: inline-block; ${tierBadge} color: ${recipient.tier === 'founding' ? '#000000' : '#ffffff'}; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
        Start Learning Now →
      </a>
    </div>

    <!-- Why You Got This -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0; text-align: center;">
        You're receiving this because you're a <strong style="color: ${tierColor};">${recipient.tier === 'founding' ? 'Founding 33 Member' : 'Annual Premium Subscriber'}</strong>.
        <br>New courses are available to you immediately, before anyone else!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Sentinel DeFi • DeFi Education for the Awakened
      </p>
    </div>

  </div>
</body>
</html>
      `;

      try {
        await resend.emails.send({
          from: "Sentinel DeFi <courses@the3rdeyeadvisors.com>",
          to: [recipient.email],
          subject: `🎓 New Course Available: ${course_title} — You Have Early Access!`,
          html: emailHtml,
        });

        // Log email
        await supabaseClient.from('email_logs').insert({
          recipient_email: recipient.email,
          email_type: 'new_course_announcement',
          edge_function_name: 'send-new-course-announcement',
          status: 'sent',
          related_id: course_id.toString(),
          metadata: { course_title, tier: recipient.tier }
        });

        successCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${recipient.email}:`, emailError);
        errorCount++;
      }
    }

    // Record announcement in database
    await supabaseClient.from('premium_content_announcements').insert({
      content_type: 'course',
      content_id: course_id.toString(),
      title: course_title,
      description: course_description,
      early_access_date: early_access_date || null,
      public_release_date: public_release_date || null,
      announcement_sent_at: new Date().toISOString()
    });

    logStep("Announcement complete", { sent: successCount, errors: errorCount });

    return new Response(
      JSON.stringify({ success: true, sent: successCount, errors: errorCount }),
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

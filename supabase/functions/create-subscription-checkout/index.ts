import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

// Price IDs for subscription plans
// NOTE: These must match the Stripe Price IDs in src/lib/constants.ts (PRICING object)
const PRICE_IDS = {
  monthly: 'price_1SfmuFLxeGPiI62jZkGuCmqm', // $99/month
  annual: 'price_1Sl04YLxeGPiI62jjtRmPeC9',  // $1188/year
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { plan = 'monthly' } = await req.json();
    logStep("Received request", { plan });

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error(`Invalid plan: ${plan}. Must be 'monthly' or 'annual'.`);
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if user has used their database trial
    const { data: trialData } = await supabaseClient
      .from('user_trials')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const hasUsedDbTrial = !!trialData;
    logStep("Database trial check", { hasUsedDbTrial, trialData });

    // Check if customer already exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    let hasHadStripeSubscription = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });

      // Check ALL subscriptions (including canceled) to determine if they've subscribed before
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      });

      // Check for any current active/trialing subscription
      const activeSub = allSubscriptions.data.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );

      if (activeSub) {
        logStep("User already has active subscription", { subscriptionId: activeSub.id });
        throw new Error("You already have an active subscription. Please manage it from your account settings.");
      }

      // Check if user has ever had any Stripe subscription
      hasHadStripeSubscription = allSubscriptions.data.length > 0;
      logStep("Previous Stripe subscription check", { hasHadStripeSubscription, totalPreviousSubs: allSubscriptions.data.length });
    }

    const origin = req.headers.get("origin") || "https://sentineldefi.online";

    // Build subscription data - NO additional Stripe trial since they already had database trial
    const subscriptionData: Stripe.Checkout.SessionCreateParams['subscription_data'] = {
      metadata: {
        user_id: user.id,
      },
    };

    // Only offer Stripe trial to users who:
    // 1. Have NEVER had a database trial (edge case for old users before this feature)
    // 2. Have NEVER had a Stripe subscription
    if (!hasUsedDbTrial && !hasHadStripeSubscription) {
      subscriptionData.trial_period_days = 14;
      logStep("Legacy user without DB trial - offering 14-day Stripe trial");
    } else {
      logStep("User has used trial - no additional trial offered", { 
        hasUsedDbTrial, 
        hasHadStripeSubscription 
      });
    }

    // Mark trial as converted when user proceeds to checkout
    if (trialData && !trialData.converted_at) {
      await supabaseClient
        .from('user_trials')
        .update({ converted_at: new Date().toISOString() })
        .eq('user_id', user.id);
      logStep("Marked database trial as converted");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: subscriptionData,
      payment_method_collection: 'always',
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Parse JWT directly instead of using getUser() - more reliable
    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    let userEmail: string;
    
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      userId = payload.sub;
      userEmail = payload.email;
      
      if (!userId || !userEmail) {
        throw new Error("Invalid token payload");
      }
      
      logStep("User authenticated via JWT parsing", { userId, email: userEmail });
    } catch (parseError) {
      logStep("JWT parsing failed", { error: String(parseError) });
      throw new Error("Invalid or expired token");
    }

    // Create service role client for database queries
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if user is admin FIRST (before grandfathered to ensure isAdmin flag is always set)
    const { data: adminRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    const isAdmin = !!adminRole;
    if (isAdmin) {
      logStep("User has admin role", { userId });
    }

    // Check if user is grandfathered (full platform access)
    const { data: grandfatheredData } = await supabaseClient
      .from('grandfathered_emails')
      .select('*')
      .ilike('email', userEmail)
      .maybeSingle();
    
    if (grandfatheredData) {
      if (!grandfatheredData.claimed_by) {
        await supabaseClient
          .from('grandfathered_emails')
          .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
          .eq('id', grandfatheredData.id);
      }
      
      // Determine if this is a Founding 33 member (highest tier)
      const isFounder = grandfatheredData.access_type === 'founding_33';
      
      logStep("User is grandfathered", { 
        email: userEmail, 
        isFounder,
        isAdmin,
        accessType: grandfatheredData.access_type 
      });
      
      return new Response(JSON.stringify({
        subscribed: true,
        isGrandfathered: true,
        isFounder,
        isAdmin, // Include admin status for voting eligibility
        plan: isFounder ? 'founding_33' : 'grandfathered',
        subscriptionEnd: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If admin but not grandfathered
    if (isAdmin) {
      logStep("User is admin (not grandfathered)", { userId });
      return new Response(JSON.stringify({
        subscribed: true,
        isAdmin: true,
        plan: 'admin',
        subscriptionEnd: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for active database trial (auto-granted on signup)
    const { data: trialData } = await supabaseClient
      .from('user_trials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (trialData && !trialData.converted_at) {
      const trialEnd = new Date(trialData.trial_end);
      const now = new Date();
      
      if (trialEnd > now) {
        // Calculate days remaining
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        logStep("Active database trial found", { 
          trialEnd: trialData.trial_end, 
          daysRemaining 
        });
        
        return new Response(JSON.stringify({
          subscribed: true,
          isGrandfathered: false,
          isAdmin: false,
          plan: 'trial',
          status: 'trialing',
          subscriptionEnd: null,
          trialEnd: trialData.trial_end,
          daysRemaining,
          isDbTrial: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("Database trial expired", { trialEnd: trialData.trial_end });
      }
    }

    // Check Stripe for paid subscriptions
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user is not subscribed");
      return new Response(JSON.stringify({ 
        subscribed: false,
        isGrandfathered: false,
        isAdmin: false,
        plan: null,
        subscriptionEnd: null,
        trialEnd: trialData?.trial_end || null,
        trialExpired: trialData ? new Date(trialData.trial_end) <= new Date() : false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active or trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      (sub: any) => sub.status === 'active' || sub.status === 'trialing'
    );

    if (!activeSubscription) {
      logStep("No active subscription found");
      return new Response(JSON.stringify({
        subscribed: false,
        isGrandfathered: false,
        isAdmin: false,
        plan: null,
        subscriptionEnd: null,
        trialEnd: trialData?.trial_end || null,
        trialExpired: trialData ? new Date(trialData.trial_end) <= new Date() : false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Mark database trial as converted if user has a paid subscription
    if (trialData && !trialData.converted_at) {
      await supabaseClient
        .from('user_trials')
        .update({ converted_at: new Date().toISOString() })
        .eq('user_id', userId);
      logStep("Marked trial as converted");
    }

    const subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
    const trialEnd = activeSubscription.trial_end 
      ? new Date(activeSubscription.trial_end * 1000).toISOString() 
      : null;
    const priceId = activeSubscription.items.data[0]?.price.id;
    
    // Determine plan based on price ID
    // Annual price ID: price_1Sl04YLxeGPiI62jjtRmPeC9
    // Monthly price ID: price_1SfmuFLxeGPiI62jZkGuCmqm
    let plan = 'monthly';
    if (priceId === 'price_1Sl04YLxeGPiI62jjtRmPeC9') {
      plan = 'annual';
    }

    logStep("Active subscription found", { 
      subscriptionId: activeSubscription.id, 
      status: activeSubscription.status,
      plan,
      trialEnd 
    });

    return new Response(JSON.stringify({
      subscribed: true,
      isGrandfathered: false,
      isAdmin: false,
      plan,
      status: activeSubscription.status,
      subscriptionEnd,
      trialEnd,
      cancelAtPeriodEnd: activeSubscription.cancel_at_period_end
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

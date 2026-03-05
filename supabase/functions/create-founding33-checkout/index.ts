import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOUNDING33_PRICE_ID = "price_1SpxvgLxeGPiI62jQoF3Muoi";
const TOTAL_SPOTS = 33;

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FOUNDING33-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Founding 33 checkout process");

    // Initialize clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      logStep("Authentication failed", { error: authError?.message });
      throw new Error("Authentication required. Please sign in first.");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check spots remaining
    const { data: spotsRemaining, error: spotsError } = await supabaseClient.rpc('get_founding33_spots_remaining');
    
    if (spotsError) {
      logStep("Error checking spots", { error: spotsError.message });
      throw new Error("Unable to check available spots. Please try again.");
    }

    logStep("Spots check", { remaining: spotsRemaining, total: TOTAL_SPOTS });

    if (spotsRemaining <= 0) {
      throw new Error("All 33 Founding Member spots have been claimed. Join our waitlist for future opportunities.");
    }

    // Check if user already has a completed Founding 33 purchase
    const { data: existingPurchase, error: purchaseError } = await supabaseClient
      .from('founding33_purchases')
      .select('id, status, seat_number')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle();

    if (purchaseError) {
      logStep("Error checking existing purchase", { error: purchaseError.message });
    }

    if (existingPurchase) {
      logStep("User already has Founding 33 access", { seatNumber: existingPurchase.seat_number });
      throw new Error(`You already have a Founding 33 seat (#${existingPurchase.seat_number}). Welcome back, founding member!`);
    }

    // Check for any pending checkout sessions for this user
    const { data: pendingPurchase } = await supabaseClient
      .from('founding33_purchases')
      .select('id, stripe_session_id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If there's a recent pending session (within 30 minutes), check if it's still valid
    if (pendingPurchase) {
      const pendingAge = Date.now() - new Date(pendingPurchase.created_at).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (pendingAge < thirtyMinutes) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(pendingPurchase.stripe_session_id);
          if (existingSession.status === 'open' && existingSession.url) {
            logStep("Returning existing session", { sessionId: existingSession.id });
            return new Response(
              JSON.stringify({ url: existingSession.url }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
        } catch (e) {
          logStep("Existing session expired or invalid, creating new one");
        }
      }
    }

    // Check if Stripe customer exists
    let customerId: string | undefined;
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://sentineldefi.com";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: FOUNDING33_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        user_id: user.id,
        purchase_type: "founding_33",
      },
      success_url: `${origin}/?founding33=success`,
      cancel_url: `${origin}/?founding33=canceled`,
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          purchase_type: "founding_33",
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Create pending purchase record
    const { error: insertError } = await supabaseClient
      .from('founding33_purchases')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        status: 'pending',
        customer_email: user.email || '',
        amount_paid: 200000, // $2000 in cents
      });

    if (insertError) {
      logStep("Error creating pending purchase record", { error: insertError.message });
      // Don't fail the checkout - the webhook will handle completion
    } else {
      logStep("Pending purchase record created");
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

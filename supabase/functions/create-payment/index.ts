import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    // Initialize Stripe and Supabase
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate product and fetch actual price from database
    const { data: course, error } = await supabaseClient
      .from('courses')
      .select('id, title, price_cents, is_active')
      .eq('id', productId)
      .single();

    if (error || !course || !course.is_active) {
      throw new Error(`Invalid or inactive product: ${productId}`);
    }

    // Create a one-time payment session with validated price
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: course.title, // Use validated title from database
            },
            unit_amount: course.price_cents, // Use validated price from database
            tax_behavior: 'exclusive', // Tax calculated and added on top
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      billing_address_collection: 'required', // Required for accurate tax calculation
      automatic_tax: {
        enabled: true,
      },
      success_url: `${req.headers.get("origin")}/store?success=true&product=${encodeURIComponent(course.title)}`,
      cancel_url: `${req.headers.get("origin")}/store?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
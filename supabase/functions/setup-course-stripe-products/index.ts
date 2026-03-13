import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Check admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roles) {
      throw new Error("Forbidden: Admin access required");
    }

    console.log("Starting Stripe course product setup...");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Define the courses that need Stripe setup
    const coursesToSetup = [
      {
        id: 3,
        title: "Earning with DeFi",
        description: "Learn how to earn passive income through DeFi protocols",
        price: 6700, // $67.00 in cents
      },
      {
        id: 4,
        title: "Managing Your Own DeFi Portfolio",
        description: "Master portfolio management strategies for DeFi",
        price: 9700, // $97.00 in cents
      },
    ];

    const results = [];

    for (const course of coursesToSetup) {
      console.log(`Setting up Stripe product for course ${course.id}: ${course.title}`);

      // Create Stripe product
      const product = await stripe.products.create({
        name: course.title,
        description: course.description,
        metadata: {
          course_id: course.id.toString(),
        },
      });

      console.log(`Created Stripe product: ${product.id}`);

      // Create Stripe price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: course.price,
        currency: "usd",
        metadata: {
          course_id: course.id.toString(),
        },
      });

      console.log(`Created Stripe price: ${price.id}`);

      // Update course in database
      const { data, error } = await supabaseClient
        .from("courses")
        .update({ stripe_price_id: price.id })
        .eq("id", course.id)
        .select();

      if (error) {
        console.error(`Error updating course ${course.id}:`, error);
        results.push({
          course_id: course.id,
          success: false,
          error: error.message,
        });
      } else {
        console.log(`Successfully updated course ${course.id}`);
        results.push({
          course_id: course.id,
          success: true,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          price_amount: course.price / 100,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Setup complete: ${successCount} succeeded, ${failureCount} failed`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Stripe setup error:", error);
    return new Response(
      JSON.stringify({
        error: message,
        details: "Failed to setup Stripe course products",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get all Stripe products
    const products = await stripe.products.list({ 
      limit: 100,
      active: true 
    });

    console.log(`Found ${products.data.length} active Stripe products`);

    // Filter to only Printify products
    const printifyProducts = products.data.filter((p: any) =>
      p.metadata?.type === 'printify' || p.metadata?.printify_product_id
    );

    console.log(`Found ${printifyProducts.length} Printify-linked Stripe products`);

    return new Response(
      JSON.stringify({ 
        success: true,
        products: printifyProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          metadata: p.metadata
        }))
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error checking sync:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

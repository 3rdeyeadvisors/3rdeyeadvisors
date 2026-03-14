import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all Decentralize Everything Tee products
    const { data: products, error: fetchError } = await supabaseClient
      .from("printify_products")
      .select("*")
      .ilike("title", "%Decentralize Everything Tee%");

    if (fetchError) throw fetchError;

    console.log(`Found ${products?.length} products to update`);

    // Update each product's white variants to $35.18
    for (const product of products || []) {
      const updatedVariants = product.variants.map((variant: any) => {
        if (variant.title.includes("White")) {
          return { ...variant, price: 35.18 };
        }
        return variant;
      });

      const { error: updateError } = await supabaseClient
        .from("printify_products")
        .update({ variants: updatedVariants })
        .eq("id", product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`Updated product ${product.id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "White tee prices updated to $35.18",
        updated: products?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error updating prices:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

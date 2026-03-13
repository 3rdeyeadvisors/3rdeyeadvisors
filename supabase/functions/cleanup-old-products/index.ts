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

    // Get current shop ID from Printify
    const printifyResponse = await fetch("https://api.printify.com/v1/shops.json", {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PRINTIFY_API_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!printifyResponse.ok) {
      throw new Error("Failed to fetch Printify shops");
    }

    const shops = await printifyResponse.json();
    const currentShopId = shops[0]?.id?.toString();

    if (!currentShopId) {
      throw new Error("No Printify shop found");
    }

    console.log(`Current shop ID: ${currentShopId}`);

    // Deactivate products from old shops
    const { data: deactivated, error: deactivateError } = await supabaseClient
      .from("printify_products")
      .update({ is_active: false })
      .neq("shop_id", currentShopId)
      .select();

    if (deactivateError) {
      throw deactivateError;
    }

    console.log(`Deactivated ${deactivated?.length || 0} old products`);

    // Get remaining active products
    const { data: activeProducts } = await supabaseClient
      .from("printify_products")
      .select("printify_id, title, shop_id")
      .eq("is_active", true);

    return new Response(
      JSON.stringify({
        success: true,
        current_shop_id: currentShopId,
        deactivated_count: deactivated?.length || 0,
        active_products: activeProducts || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error cleaning up products:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

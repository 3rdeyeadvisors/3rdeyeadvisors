import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{
    src: string;
    alt: string;
    position: number;
    is_default: boolean;
  }>;
  variants: Array<{
    id: number;
    title: string;
    options: Record<string, string>;
    price: number;
    is_enabled: boolean;
  }>;
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;
      images: Array<{
        id: string;
        name: string;
        type: string;
        height: number;
        width: number;
        x: number;
        y: number;
        scale: number;
        angle: number;
      }>;
    }>;
  }>;
}

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

    // Fetch products from Printify
    const printifyResponse = await fetch("https://api.printify.com/v1/shops.json", {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PRINTIFY_API_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!printifyResponse.ok) {
      throw new Error(`Printify API error: ${printifyResponse.statusText}`);
    }

    const shops = await printifyResponse.json();
    console.log("Printify shops:", shops);

    if (!shops || shops.length === 0) {
      throw new Error("No Printify shops found");
    }

    const shopId = shops[0].id;
    console.log("Using shop ID:", shopId);

    // Fetch products from the first shop
    const productsResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PRINTIFY_API_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
    }

    const productsData = await productsResponse.json();
    console.log("Printify products:", productsData);

    // Transform Printify products for our database
    const products = productsData.data?.map((product: PrintifyProduct) => ({
      printify_id: product.id,
      title: product.title,
      description: product.description,
      tags: product.tags,
      images: product.images,
      variants: product.variants.filter(v => v.is_enabled).map(v => ({
        id: v.id,
        title: v.title,
        options: v.options,
        price: v.price / 100, // Convert from cents to dollars
      })),
      shop_id: shopId,
      updated_at: new Date().toISOString(),
    })) || [];

    console.log("Transformed products:", products);

    // Store products in Supabase
    if (products.length > 0) {
      const { data, error } = await supabaseClient
        .from("printify_products")
        .upsert(products, { onConflict: "printify_id" });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Products synced successfully:", data);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: products.length,
        products: products 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error syncing Printify products:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
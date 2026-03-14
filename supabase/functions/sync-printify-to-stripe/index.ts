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

    console.log("Starting Printify to Stripe sync...");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Fetch all active Printify products from database
    const { data: printifyProducts, error: fetchError } = await supabaseClient
      .from("printify_products")
      .select("*")
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Failed to fetch Printify products: ${fetchError.message}`);
    }

    if (!printifyProducts || printifyProducts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No Printify products to sync",
          synced: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${printifyProducts.length} Printify products to sync`);

    const results = [];

    for (const product of printifyProducts) {
      try {
        console.log(`Processing product: ${product.title} (${product.printify_id})`);

        let stripeProductId = product.stripe_product_id;

        // Get the primary image URL
        const primaryImage = product.images?.[0];
        const imageUrl = typeof primaryImage === 'string' 
          ? primaryImage 
          : primaryImage?.src || primaryImage?.url;

        // Create or update Stripe product
        if (stripeProductId) {
          // Update existing Stripe product
          console.log(`Updating existing Stripe product: ${stripeProductId}`);
          await stripe.products.update(stripeProductId, {
            name: product.title,
            description: product.description || `${product.title} - Available in multiple sizes and colors`,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              printify_id: product.printify_id,
              shop_id: product.shop_id,
              type: 'printify',
            },
          });
        } else {
          // Create new Stripe product
          console.log(`Creating new Stripe product for: ${product.title}`);
          const stripeProduct = await stripe.products.create({
            name: product.title,
            description: product.description || `${product.title} - Available in multiple sizes and colors`,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              printify_id: product.printify_id,
              shop_id: product.shop_id,
              type: 'printify',
            },
          });
          stripeProductId = stripeProduct.id;
          console.log(`Created Stripe product: ${stripeProductId}`);
        }

        // Create/update prices for each variant
        const stripePrices = [];
        
        if (product.variants && Array.isArray(product.variants)) {
          for (const variant of product.variants) {
            const variantTitle = variant.title || `${variant.options?.color || ''} ${variant.options?.size || ''}`.trim();
            const priceInCents = Math.round(variant.price * 100);

            console.log(`Creating price for variant: ${variantTitle} - $${variant.price}`);

            // Create a new price for this variant
            const stripePrice = await stripe.prices.create({
              product: stripeProductId,
              unit_amount: priceInCents,
              currency: "usd",
              nickname: variantTitle,
              metadata: {
                variant_id: variant.id.toString(),
                printify_variant_id: variant.id.toString(),
                color: variant.options?.color || '',
                size: variant.options?.size || '',
              },
            });

            stripePrices.push({
              price_id: stripePrice.id,
              variant_id: variant.id,
              variant_title: variantTitle,
              amount: priceInCents,
            });

            console.log(`Created Stripe price: ${stripePrice.id}`);
          }
        }

        // Update database with Stripe IDs
        const { error: updateError } = await supabaseClient
          .from("printify_products")
          .update({
            stripe_product_id: stripeProductId,
            stripe_prices: stripePrices,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError);
          results.push({
            printify_id: product.printify_id,
            title: product.title,
            success: false,
            error: updateError.message,
          });
        } else {
          console.log(`Successfully synced product: ${product.title}`);
          results.push({
            printify_id: product.printify_id,
            title: product.title,
            success: true,
            stripe_product_id: stripeProductId,
            prices_created: stripePrices.length,
          });
        }
      } catch (productError: unknown) {
        console.error(`Error processing product ${product.printify_id}:`, productError);
        results.push({
          printify_id: product.printify_id,
          title: product.title,
          success: false,
          error: productError instanceof Error ? productError.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sync complete: ${successCount} succeeded, ${failureCount} failed`,
        synced: successCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Stripe sync error:", error);
    return new Response(
      JSON.stringify({
        error: message,
        details: "Failed to sync Printify products to Stripe",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
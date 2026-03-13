import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    const { items, discountCode, userId } = await req.json();

    console.log('=== Checkout Session Creation ===');
    console.log('User ID:', userId);
    console.log('Items:', items.length);

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    // Initialize Stripe with secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key starts with:", stripeSecretKey?.substring(0, 7));
    
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      throw new Error("Invalid or missing Stripe secret key. Expected key starting with 'sk_'");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate all items against database and fetch actual prices
    const validatedItems = await Promise.all(items.map(async (item: any) => {
      // Validate quantity
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        throw new Error(`Invalid quantity for item: ${item.title || item.id}`);
      }

      if (item.printify_id) {
        // Validate Printify product and get Stripe price info
        const { data: product, error } = await supabaseClient
          .from('printify_products')
          .select('printify_id, title, variants, is_active, stripe_product_id, stripe_prices')
          .eq('printify_id', item.printify_id)
          .single();

        if (error || !product || !product.is_active) {
          console.error('Product validation error:', { error, product, printify_id: item.printify_id });
          throw new Error(`Invalid or inactive product: ${item.printify_id}`);
        }

        // Find the specific variant price - try matching by id (both string and number)
        const variant = product.variants?.find((v: any) => 
          v.id === item.variant_id || 
          v.id?.toString() === item.variant_id?.toString() ||
          v.variant_id === item.variant_id
        );
        
        if (!variant) {
          console.error('Variant not found:', { 
            item_variant_id: item.variant_id, 
            available_variants: product.variants?.map((v: any) => ({ id: v.id, variant_id: v.variant_id })),
            product_title: product.title
          });
          throw new Error(`Invalid variant ${item.variant_id} for product: ${item.printify_id}`);
        }

        const validatedPrice = Math.round(variant.price * 100);
        console.log('Printify item validated:', {
          title: product.title,
          variant_id: item.variant_id,
          client_price: item.price,
          db_price: variant.price,
          validated_price_cents: validatedPrice,
          quantity: item.quantity,
          has_stripe_prices: !!product.stripe_prices
        });

        return { 
          ...item, 
          validatedPrice, 
          dbTitle: product.title,
          stripePrices: product.stripe_prices || []
        };
      } else {
        // Validate course/digital product
        const { data: course, error } = await supabaseClient
          .from('courses')
          .select('id, title, price_cents, is_active')
          .eq('id', item.id)
          .single();

        if (error || !course || !course.is_active) {
          throw new Error(`Invalid or inactive course: ${item.id}`);
        }

        // Handle price validation - if DB price is null, use client price (converted to cents)
        // This handles cases where courses are free or price not set in DB yet
        const validatedPrice = course.price_cents ?? Math.round(item.price * 100);
        
        console.log('Digital item validated:', {
          title: course.title,
          client_price: item.price,
          db_price_cents: course.price_cents,
          validated_price_cents: validatedPrice,
          quantity: item.quantity
        });

        return { ...item, validatedPrice, dbTitle: course.title };
      }
    }));

    // Separate digital and physical (Printify) products
    const digitalItems = validatedItems.filter((item: any) => !item.printify_id);
    const printifyItems = validatedItems.filter((item: any) => item.printify_id);

    console.log('Digital items:', digitalItems.length);
    console.log('Printify items:', printifyItems.length);

    // Create line items for Stripe using validated prices
    const lineItems = await Promise.all(validatedItems.map(async (item: any) => {
      // For Printify items, check if we have pre-created Stripe prices
      if (item.printify_id && item.stripePrices && Array.isArray(item.stripePrices)) {
        const stripePriceData = item.stripePrices.find((sp: any) => 
          sp.variant_id?.toString() === item.variant_id?.toString()
        );
        
        if (stripePriceData?.price_id) {
          console.log('Using pre-created Stripe price:', {
            product: item.dbTitle,
            variant_id: item.variant_id,
            price_id: stripePriceData.price_id
          });
          
          return {
            price: stripePriceData.price_id,
            quantity: item.quantity,
          };
        }
      }

      // Fallback to dynamic price creation for items without pre-created prices
      console.log('Creating dynamic price for:', item.dbTitle);
      
      // Build product name with variant info for Printify items
      let productName = item.dbTitle; // Use validated title from database
      if (item.printify_id && (item.color || item.size)) {
        const variantInfo = [item.color, item.size].filter(Boolean).join(' / ');
        if (variantInfo) {
          productName = `${item.dbTitle} (${variantInfo})`;
        }
      }

      const productData: any = {
        name: productName,
        description: `${item.category} - ${item.type}`,
        metadata: {
          type: item.printify_id ? 'printify' : 'digital',
          category: item.category || 'product',
          printify_id: item.printify_id || '',
          printify_product_id: item.printify_id || '',
          variant_id: item.variant_id ? item.variant_id.toString() : '',
          color: item.color || '',
          size: item.size || '',
          item_id: item.id.toString(),
        },
      };

      // Validate and add product image - Stripe requires valid HTTPS URLs
      const isValidUrl = (url: string): boolean => {
        if (!url || typeof url !== 'string') return false;
        try {
          const parsedUrl = new URL(url);
          return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
          return false;
        }
      };

      // Try to get a valid image URL
      let imageUrl = null;
      
      if (item.image && isValidUrl(item.image)) {
        imageUrl = item.image;
      } else if (item.images && Array.isArray(item.images)) {
        for (const img of item.images) {
          const url = typeof img === 'string' ? img : (img?.src || img?.url);
          if (url && isValidUrl(url)) {
            imageUrl = url;
            break;
          }
        }
      }
      
      // Only add images if we have a valid URL
      if (imageUrl) {
        productData.images = [imageUrl];
        console.log('Valid image URL added:', imageUrl);
      } else {
        console.log('No valid image URL found for item:', { 
          id: item.id, 
          title: item.title,
          image: item.image,
          images: item.images 
        });
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: item.validatedPrice, // Use validated price from database
          tax_behavior: 'exclusive', // Tax calculated and added on top
        },
        quantity: item.quantity,
      };
    }));

    // Calculate total amount - handle both pre-created prices and dynamic prices
    const totalAmount = await (async () => {
      let total = 0;
      for (const item of lineItems) {
        if (item.price) {
          // Pre-created Stripe price - need to fetch the price details
          const priceDetails = await stripe.prices.retrieve(item.price);
          total += (priceDetails.unit_amount || 0) * item.quantity;
        } else if (item.price_data) {
          // Dynamic price
          total += item.price_data.unit_amount * item.quantity;
        }
      }
      return total;
    })();
    
    console.log('Checkout totals:', {
      subtotal_cents: totalAmount,
      subtotal_dollars: (totalAmount / 100).toFixed(2),
      items_count: lineItems.length,
      line_items: lineItems.map(item => {
        if (item.price) {
          // Pre-created Stripe price
          return {
            name: 'Pre-created Stripe price',
            price_id: item.price,
            quantity: item.quantity
          };
        } else {
          // Dynamic price
          return {
            name: item.price_data?.product_data?.name,
            unit_price_cents: item.price_data?.unit_amount,
            unit_price_dollars: ((item.price_data?.unit_amount || 0) / 100).toFixed(2),
            quantity: item.quantity,
            total_cents: (item.price_data?.unit_amount || 0) * item.quantity
          };
        }
      })
    });

    // Validate and apply discount if provided
    let discountAmount = 0;
    let discountId = null;
    
    if (discountCode) {
      const { data: discountResult, error: discountError } = await supabaseClient
        .rpc('validate_discount_code', {
          _code: discountCode,
          _amount: Math.floor(totalAmount / 100),
          _product_type: 'all'
        })
        .single();

      if ((discountResult as any)?.is_valid) {
        discountId = (discountResult as any).discount_id;
        discountAmount = (discountResult as any).discount_amount * 100;
        console.log('Discount applied:', { discountId, discountAmount });
      }
    }

    // Check if there are any physical items
    const hasPhysicalItems = printifyItems.length > 0;

    // Create checkout session config
    const sessionConfig: any = {
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true, // Collect phone for shipping
      },
      automatic_tax: { enabled: true },
      success_url: `${req.headers.get("origin")}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart?canceled=true`,
      metadata: {
        has_printify_items: printifyItems.length > 0 ? 'true' : 'false',
        printify_items_count: printifyItems.length.toString(),
        discount_id: discountId || '',
        discount_code: discountCode || '',
        user_id: userId || '', // Critical: pass user_id for webhook processing
      },
    };
    
    console.log('Session metadata:', sessionConfig.metadata);

    // Add shipping address collection for physical items (Printify)
    if (hasPhysicalItems) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI', 'AT', 'IE', 'PT', 'PL', 'CZ', 'GR', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU', 'IS', 'LI', 'CH', 'JP', 'SG', 'NZ', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'CR', 'PA', 'UY', 'EC', 'GT', 'HN', 'NI', 'SV', 'DO', 'BO', 'PY', 'VE', 'TT', 'JM', 'BS', 'BB', 'BZ', 'GY', 'SR', 'GD', 'LC', 'VC', 'AG', 'DM', 'KN', 'AW', 'CW', 'BM', 'KY', 'VG', 'TC', 'AI', 'MS', 'FK', 'GI', 'GG', 'JE', 'IM', 'FO', 'GL', 'AX'],
      };
      console.log('✅ Shipping address collection enabled for physical items');
    }

    // Apply discount if valid
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'usd',
        duration: 'once',
        name: discountCode,
      });
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Note: Digital product purchase recording would be handled after successful payment
    // via webhook or success page, not in the checkout creation phase

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error creating cart checkout session:", error);
    return new Response(JSON.stringify({ error: errMsg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
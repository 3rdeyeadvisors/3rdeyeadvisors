import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const { paymentId } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Looking up payment:", paymentId);

    // Try to find the checkout session associated with this payment
    let session;
    
    // If it's a payment intent ID
    if (paymentId.startsWith("pi_") || paymentId.startsWith("pm_")) {
      const charges = await stripe.charges.list({ limit: 100 });
      const charge = charges.data.find((c: any) => 
        c.payment_intent?.toString().includes(paymentId) || 
        c.payment_method?.toString() === paymentId
      );
      
      if (!charge) {
        throw new Error("Payment not found");
      }

      // Get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      
      // Find the session
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      session = sessions.data.find((s: any) => s.payment_intent === paymentIntent.id);
    } else if (paymentId.startsWith("cs_")) {
      session = await stripe.checkout.sessions.retrieve(paymentId);
    }

    if (!session) {
      throw new Error("Checkout session not found for this payment");
    }

    console.log("Found session:", session.id);

    // Re-retrieve session with ALL possible expansions to see what's available
    session = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'line_items.data.price.product', 'customer', 'shipping_cost', 'total_details']
    });
    
    // Log EVERYTHING about this session to debug
    console.log("=== FULL SESSION DEBUG ===");
    console.log("Session ID:", session.id);
    console.log("Mode:", session.mode);
    console.log("Status:", session.status);
    console.log("Payment Status:", session.payment_status);
    console.log("Shipping:", JSON.stringify(session.shipping));
    console.log("Customer Details:", JSON.stringify(session.customer_details));
    console.log("Shipping Details (deprecated):", JSON.stringify((session as any).shipping_details));
    console.log("Shipping Options:", JSON.stringify(session.shipping_options));
    console.log("Customer Email:", session.customer_email);
    console.log("=== END DEBUG ===");
    
    const lineItems = session.line_items?.data || [];
    
    // Separate Printify items from digital items
    const printifyItems = [];
    
    for (const item of lineItems) {
      const product = item.price?.product as Stripe.Product;
      
      if (product?.metadata && (product.metadata.type === "printify" || product.metadata.printify_product_id)) {
        printifyItems.push({
          printify_product_id: product.metadata.printify_product_id,
          variant_id: parseInt(product.metadata.variant_id || "0"),
          quantity: item.quantity || 1,
        });
      }
    }

    if (printifyItems.length === 0) {
      throw new Error("No Printify items found in this order");
    }

    // Get shipping info from session
    // Try session.shipping first, fallback to customer_details if needed
    const shipping = session.shipping || session.customer_details;
    
    if (!shipping?.address) {
      console.error("Session data dump:", JSON.stringify(session, null, 2));
      throw new Error(`No shipping address found in session. Has shipping: ${!!session.shipping}, Has customer_details: ${!!session.customer_details}`);
    }
    
    console.log("Processing order with shipping:", {
      name: shipping.name,
      country: shipping.address.country,
      city: shipping.address.city,
      source: session.shipping ? 'shipping' : 'customer_details'
    });

    // Call create-printify-order function using direct HTTP call to get proper error messages
    const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-printify-order`;
    const printifyResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        line_items: printifyItems,
        shipping_method: 1, // Standard shipping
        send_shipping_notification: true,
        customer_email: session.customer_details?.email || session.customer_email || "",
        customer_name: shipping.name || "Customer",
        amount_paid: session.amount_total || 0,
        stripe_session_id: session.id,
        address_to: {
          first_name: shipping.name?.split(" ")[0] || "Customer",
          last_name: shipping.name?.split(" ").slice(1).join(" ") || "",
          email: session.customer_details?.email || session.customer_email || "",
          phone: session.customer_details?.phone || "",
          country: shipping.address.country || "US",
          region: shipping.address.state || "",
          address1: shipping.address.line1 || "",
          address2: shipping.address.line2 || "",
          city: shipping.address.city || "",
          zip: shipping.address.postal_code || "",
        },
      }),
    });

    const printifyData = await printifyResponse.json();
    
    if (!printifyResponse.ok) {
      console.error("Printify order failed:", printifyData);
      throw new Error(printifyData.error || "Failed to create Printify order");
    }

    console.log("Printify order created:", printifyData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order processed and sent to Printify",
        session_id: session.id,
        printify_result: printifyData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: error }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

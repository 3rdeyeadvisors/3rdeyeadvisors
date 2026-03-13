import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-COURSE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { courseId, discountCode } = await req.json();
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    logStep("Course ID received", { courseId });

    // Initialize Supabase with service role to check course details
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid authentication");
    }

    logStep("User authenticated", { userId: userData.user.id, email: userData.user.email });

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    logStep("Course found", { course: course.title, category: course.category, price: course.price_cents });

    // Check if course is free
    if (course.category === 'free') {
      throw new Error("This course is free and doesn't require payment");
    }

    // Check if user already purchased this course
    const { data: existingPurchase } = await supabaseClient
      .from('user_purchases')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('product_id', courseId)
      .single();

    if (existingPurchase) {
      throw new Error("You have already purchased this course");
    }

    logStep("Purchase verification complete - course can be purchased");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Validate and apply discount if provided
    let discountAmount = 0;
    let discountId = null;
    
    if (discountCode && course.price_cents) {
      const { data: discountResult, error: discountError } = await supabaseClient
        .rpc('validate_discount_code', {
          _code: discountCode,
          _amount: Math.floor(course.price_cents / 100),
          _product_type: 'courses'
        })
        .single();

      if ((discountResult as any)?.is_valid) {
        discountId = (discountResult as any).discount_id;
        discountAmount = (discountResult as any).discount_amount * 100;
        logStep('Discount applied', { discountId, discountAmount });
      }
    }

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ 
      email: userData.user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Create checkout session config
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description,
              metadata: {
                course_id: courseId.toString(),
                type: 'course'
              },
            },
            unit_amount: course.price_cents,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      automatic_tax: { enabled: true },
      success_url: `${req.headers.get("origin")}/courses/${courseId}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/courses?payment=canceled`,
      metadata: {
        course_id: courseId.toString(),
        user_id: userData.user.id,
        type: 'course_purchase',
        discount_id: discountId || '',
        discount_code: discountCode || '',
      },
    };

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-course-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
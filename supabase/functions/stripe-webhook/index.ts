import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  let event: Stripe.Event;

  try {
    // Read raw body and signature for webhook verification
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      logStep("ERROR: No Stripe signature found");
      return new Response(
        JSON.stringify({ error: "invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify webhook signature using async crypto (Edge runtime safe)
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "webhook secret not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Webhook signature verified", { eventType: event.type });

  } catch (verifyError: unknown) {
    logStep("ERROR: Signature verification failed", { message: verifyError instanceof Error ? verifyError.message : 'Unknown error' });
    return new Response(
      JSON.stringify({ error: "invalid signature" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Immediately acknowledge receipt to Stripe (before slow operations)
  const responsePromise = new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );

  // Process webhook event in background (don't block response)
  const backgroundWork = async () => {
    try {
      // Handle subscription invoice payments for commission tracking
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as any;
        
        // Only process first subscription payment (not renewals)
        if (invoice.subscription && invoice.billing_reason === "subscription_create") {
          logStep("Processing first subscription payment for commission", { 
            customerId: invoice.customer,
            customerEmail: invoice.customer_email,
            amount: invoice.amount_paid 
          });
          
          const customerEmail = invoice.customer_email;
          if (!customerEmail) {
            logStep("No customer email on invoice, skipping commission check");
          } else {
            // Find user by email
            const { data: userData } = await supabaseClient.auth.admin.listUsers();
            const user = userData.users.find(u => u.email === customerEmail);
            
            if (user) {
              logStep("Found user for commission check", { userId: user.id });
              
              // Check if this user was referred
              const { data: referralData } = await supabaseClient
                .from("referrals")
                .select("referrer_id")
                .eq("referred_user_id", user.id)
                .single();
              
              if (referralData) {
                logStep("User was referred, creating commission", { referrerId: referralData.referrer_id });
                
                const subscriptionAmountCents = invoice.amount_paid;
                const planType = subscriptionAmountCents > 50000 ? "annual" : "monthly"; // $500+ is annual
                
                // Check if the REFERRER is a Founding 33 member, annual subscriber, or regular
                // Founding 33 gets 70%, Annual gets 60%, everyone else gets 50%
                let referrerIsAnnual = false;
                let referrerIsFounder = false;
                
                try {
                  // Get referrer's email from auth
                  const { data: referrerUser } = await supabaseClient.auth.admin.getUserById(
                    referralData.referrer_id
                  );
                  const referrerEmail = referrerUser?.user?.email;
                  
                  if (referrerEmail) {
                    logStep("Checking referrer subscription status", { referrerEmail });
                    
                    // First check if referrer is a Founding 33 member (highest tier)
                    const { data: founderData } = await supabaseClient
                      .from('grandfathered_emails')
                      .select('access_type')
                      .ilike('email', referrerEmail)
                      .eq('access_type', 'founding_33')
                      .single();
                    
                    if (founderData) {
                      referrerIsFounder = true;
                      logStep("Referrer is Founding 33 member, using 70% rate");
                    } else {
                      // Not a founder, check for annual subscription in Stripe
                      const referrerCustomers = await stripe.customers.list({ 
                        email: referrerEmail, 
                        limit: 1 
                      });
                      
                      if (referrerCustomers.data.length > 0) {
                        // Check for active annual subscription
                        const referrerSubs = await stripe.subscriptions.list({
                          customer: referrerCustomers.data[0].id,
                          status: "active",
                          limit: 10
                        });
                        
                        // Annual price ID from constants
                        const annualPriceId = "price_1Sl04YLxeGPiI62jjtRmPeC9";
                        
                        referrerIsAnnual = referrerSubs.data.some((sub: any) =>
                          sub.items.data.some((item: any) => item.price.id === annualPriceId)
                        );
                        
                        logStep("Referrer subscription check complete", { 
                          referrerIsAnnual,
                          activeSubscriptions: referrerSubs.data.length
                        });
                      } else {
                        logStep("Referrer not found in Stripe, using default 50% rate");
                      }
                    }
                  }
                } catch (lookupError: unknown) {
                  logStep("Error checking referrer subscription, using default 50% rate", { 
                    error: lookupError instanceof Error ? lookupError.message : 'Unknown error'
                  });
                }

                // Commission rate based on REFERRER's status (tiered: Founding 33 > Annual > Monthly/None)
                let commissionRate = 0.5; // Default rate
                if (referrerIsFounder) {
                  commissionRate = 0.7; // Founding 33 premium rate
                } else if (referrerIsAnnual) {
                  commissionRate = 0.6; // Annual subscriber rate
                }
                
                const commissionAmountCents = Math.floor(subscriptionAmountCents * commissionRate);
                
                logStep("Calculating tiered commission", { 
                  planType, 
                  commissionRate: `${commissionRate * 100}%`,
                  subscriptionAmountCents,
                  commissionAmountCents 
                });
                
                // Check if commission already exists (idempotency via UNIQUE constraint)
                const { data: existingCommission } = await supabaseClient
                  .from("commissions")
                  .select("id")
                  .eq("referred_user_id", user.id)
                  .single();
                
                if (!existingCommission) {
                  const { error: commissionError } = await supabaseClient
                    .from("commissions")
                    .insert({
                      referrer_id: referralData.referrer_id,
                      referred_user_id: user.id,
                      subscription_id: invoice.subscription as string,
                      plan_type: planType,
                      subscription_amount_cents: subscriptionAmountCents,
                      commission_amount_cents: commissionAmountCents,
                      status: "pending",
                    });
                  
                  if (commissionError) {
                    logStep("Error creating commission", { error: commissionError.message });
                  } else {
                    logStep("Commission created successfully", { 
                      amount: commissionAmountCents,
                      planType,
                      commissionRate: `${commissionRate * 100}%`
                    });
                    
                    // Send admin notification
                    try {
                      await supabaseClient.functions.invoke("send-commission-notification", {
                        body: {
                          referrer_id: referralData.referrer_id,
                          commission_amount_cents: commissionAmountCents,
                          plan_type: planType,
                        },
                      });
                      logStep("Commission notification sent to admin");
                    } catch (notifyError: unknown) {
                      logStep("Failed to send commission notification", { error: notifyError instanceof Error ? notifyError.message : 'Unknown error' });
                    }
                  }
                } else {
                  logStep("Commission already exists for this referred user");
                }
              } else {
                logStep("User was not referred, no commission to create");
              }
            } else {
              logStep("Could not find user by email for commission check");
            }
          }
        }
        return;
      }

      if (event.type !== "checkout.session.completed") {
        logStep("Ignoring event type", { eventType: event.type });
        return;
      }

      const session = event.data.object as Stripe.Checkout.Session;
      
      // ============ FOUNDING 33 PAYMENT HANDLING ============
      if (session.metadata?.purchase_type === "founding_33") {
        logStep("Processing Founding 33 purchase", { sessionId: session.id, userId: session.metadata.user_id });
        
        try {
          // Retrieve full session with customer details
          session = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['customer', 'payment_intent']
          });

          const userId = session.metadata?.user_id;
          if (!userId) {
            logStep("ERROR: No user_id in Founding 33 session metadata");
            return;
          }

          // Get next seat number atomically
          const { data: seatNumber, error: seatError } = await supabaseClient.rpc('get_next_founding33_seat');
          
          if (seatError) {
            logStep("ERROR getting seat number", { error: seatError.message });
            throw seatError;
          }

          logStep("Assigned seat number", { seatNumber });

          // Update purchase record to completed
          const { error: updateError } = await supabaseClient
            .from('founding33_purchases')
            .update({
              status: 'completed',
              seat_number: seatNumber,
              stripe_payment_intent_id: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id,
              purchased_at: new Date().toISOString(),
              customer_name: session.customer_details?.name || null,
            })
            .eq('stripe_session_id', session.id);

          if (updateError) {
            logStep("ERROR updating purchase record", { error: updateError.message });
          } else {
            logStep("Purchase record updated to completed");
          }

          // Grant lifetime access via grandfathered_emails
          const customerEmail = session.customer_email || session.customer_details?.email;
          if (customerEmail) {
            const { error: grandfatherError } = await supabaseClient
              .from('grandfathered_emails')
              .upsert({
                email: customerEmail.toLowerCase(),
                access_type: 'founding_33',
                claimed_by: userId,
                claimed_at: new Date().toISOString(),
              }, { onConflict: 'email' });

            if (grandfatherError) {
              logStep("ERROR granting lifetime access", { error: grandfatherError.message });
            } else {
              logStep("Lifetime access granted via grandfathered_emails");
            }
          }

          // Send confirmation email
          try {
            await supabaseClient.functions.invoke('send-founding33-confirmation', {
              body: {
                customer_email: customerEmail,
                customer_name: session.customer_details?.name,
                seat_number: seatNumber,
                order_id: session.id,
                user_id: userId,
              },
            });
            logStep("Confirmation email triggered");
          } catch (emailError: unknown) {
            logStep("ERROR sending confirmation email", { error: emailError instanceof Error ? emailError.message : 'Unknown error' });
          }

          logStep("Founding 33 purchase completed successfully", { seatNumber, userId });
          return;
        } catch (founding33Error: unknown) {
          logStep("ERROR processing Founding 33 purchase", { error: founding33Error instanceof Error ? founding33Error.message : 'Unknown error' });
          return;
        }
      }
      // ============ END FOUNDING 33 HANDLING ============

      let cartSession = event.data.object as Stripe.Checkout.Session;
      
      // Retrieve full session with line items and shipping details
      session = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price.product', 'customer', 'shipping_details']
      });
      
      console.log("🛒 Processing checkout session:", session.id);
      console.log("Session metadata:", session.metadata);
      console.log("Customer email:", session.customer_email);
      console.log("Shipping info:", session.shipping_details ? "✅ Present" : "❌ Missing");
      console.log("Shipping details:", JSON.stringify(session.shipping_details, null, 2));

      // Line items are already expanded in the session retrieval
      const lineItems = { data: session.line_items?.data || [] };

      console.log("📦 Line items count:", lineItems.data.length);

      // Separate merchandise (Printify) from digital items
      const printifyItems: any[] = [];
      const digitalItems: any[] = [];

      for (const item of lineItems.data) {
        const product = item.price?.product as Stripe.Product;
        if (product?.metadata) {
          const metadata = product.metadata;
          
          if (metadata.printify_id || metadata.printify_product_id) {
            printifyItems.push({
              printify_product_id: metadata.printify_product_id || metadata.printify_id,
              variant_id: parseInt(metadata.variant_id),
              quantity: item.quantity || 1,
              item_id: metadata.item_id,
            });
          } else if (metadata.item_id) {
            digitalItems.push({
              product_id: parseInt(metadata.item_id),
              quantity: item.quantity || 1,
            });
          }
        }
      }

      console.log("🎽 Printify items:", printifyItems.length);
      console.log("💾 Digital items:", digitalItems.length);

      // Get user ID from metadata or email lookup
      let userId: string | null = session.metadata?.user_id || null;
      
      if (!userId && session.customer_email) {
        try {
          const { data: userData } = await supabaseClient.auth.admin.listUsers();
          const user = userData.users.find(u => u.email === session.customer_email);
          if (user) {
            userId = user.id;
            console.log("👤 User found by email:", userId);
          }
        } catch (userErr) {
          console.error("Error looking up user:", userErr);
        }
      }

      // Handle Printify orders (merchandise only)
      if (printifyItems.length > 0) {
        try {
          const shippingInfo = session.shipping_details || session.shipping;
          if (!shippingInfo) {
            console.error("❌ Printify items present but no shipping info!");
            await supabaseClient.from('order_action_logs').insert({
              order_id: session.id,
              action_type: 'printify_created',
              status: 'error',
              error_message: 'No shipping information provided'
            });
          } else {
            console.log("📦 Creating Printify order (merchandise only)...");
            
            const orderData = {
              line_items: printifyItems,
              shipping_method: 1,
              send_shipping_notification: true,
              address_to: {
                first_name: shippingInfo.name?.split(' ')[0] || "Customer",
                last_name: shippingInfo.name?.split(' ').slice(1).join(' ') || "Name",
                email: session.customer_email || session.customer_details?.email || "",
                phone: session.customer_details?.phone || "",
                country: shippingInfo.address?.country || "",
                region: shippingInfo.address?.state || "",
                address1: shippingInfo.address?.line1 || "",
                address2: shippingInfo.address?.line2 || "",
                city: shippingInfo.address?.city || "",
                zip: shippingInfo.address?.postal_code || "",
              },
            };

            const printifyResponse = await supabaseClient.functions.invoke('create-printify-order', {
              body: orderData,
            });

            if (printifyResponse.error) {
              console.error("❌ Error creating Printify order:", printifyResponse.error);
              await supabaseClient.from('order_action_logs').insert({
                order_id: session.id,
                action_type: 'printify_created',
                status: 'error',
                error_message: printifyResponse.error.message
              });
            } else {
              console.log("✅ Printify order created:", printifyResponse.data?.order?.id);

              // Update order with user_id
              if (userId && printifyResponse.data?.order?.id) {
                await supabaseClient
                  .from('printify_orders')
                  .update({ user_id: userId })
                  .eq('printify_order_id', printifyResponse.data.order.id);
              }

              await supabaseClient.from('order_action_logs').insert({
                order_id: session.id,
                action_type: 'printify_created',
                status: 'success',
                metadata: { 
                  printify_order_id: printifyResponse.data?.order?.id,
                  items_count: printifyItems.length
                }
              });
            }
          }
        } catch (printifyErr) {
          console.error("❌ Printify order failed:", printifyErr);
          await supabaseClient.from('order_action_logs').insert({
            order_id: session.id,
            action_type: 'printify_created',
            status: 'error',
            error_message: printifyErr.message
          });
        }
      }

      // Record digital product purchases and generate download links
      const digitalDownloadItems: any[] = [];
      if (digitalItems.length > 0 && userId) {
        try {
          console.log("💾 Recording digital purchases and generating download links...");
          
          for (const item of digitalItems) {
            // Record purchase
            const { data: existingPurchase } = await supabaseClient
              .from('user_purchases')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', item.product_id)
              .eq('stripe_session_id', session.id)
              .single();

            if (!existingPurchase) {
              const { error: purchaseError } = await supabaseClient
                .from('user_purchases')
                .insert({
                  user_id: userId,
                  product_id: item.product_id,
                  stripe_session_id: session.id,
                  amount_paid: session.amount_total,
                  purchase_date: new Date().toISOString(),
                });

              if (purchaseError) {
                console.error("❌ Error recording purchase:", purchaseError);
              } else {
                console.log("✅ Purchase recorded for product:", item.product_id);
              }
            }

            // Get product details (course)
            const { data: course } = await supabaseClient
              .from('courses')
              .select('title')
              .eq('id', item.product_id)
              .single();

            // Get associated files for this product
            const { data: files } = await supabaseClient
              .from('digital_product_files')
              .select('id')
              .eq('product_id', item.product_id);

            if (files && files.length > 0) {
              // Generate cryptographically secure 64-character hex token (256 bits of entropy)
              const tokenBytes = new Uint8Array(32);
              crypto.getRandomValues(tokenBytes);
              const downloadToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry

              // Create download record
              const { error: downloadError } = await supabaseClient
                .from('digital_downloads')
                .insert({
                  order_id: session.id,
                  user_id: userId,
                  user_email: session.customer_email || '',
                  product_id: item.product_id,
                  product_name: course?.title || `Course ${item.product_id}`,
                  product_type: 'course',
                  download_token: downloadToken,
                  file_ids: files.map(f => f.id),
                  expires_at: expiryDate.toISOString(),
                  max_downloads: 5,
                  download_count: 0
                });

              if (downloadError) {
                console.error("❌ Error creating download record:", downloadError);
              } else {
                console.log("✅ Download link generated for product:", item.product_id);
                digitalDownloadItems.push({
                  product_id: item.product_id,
                  product_name: course?.title || `Course ${item.product_id}`,
                  download_token: downloadToken
                });
              }
            }
          }

          // Log action
          await supabaseClient.from('order_action_logs').insert({
            order_id: session.id,
            action_type: 'digital_links_generated',
            status: 'success',
            metadata: { items_count: digitalDownloadItems.length }
          });

        } catch (digitalErr) {
          console.error("❌ Digital purchase processing failed:", digitalErr);
          await supabaseClient.from('order_action_logs').insert({
            order_id: session.id,
            action_type: 'digital_links_generated',
            status: 'error',
            error_message: digitalErr.message
          });
        }
      }

      // Prepare email items
      const emailItems = lineItems.data.map(item => {
        const product = item.price?.product as Stripe.Product;
        const isPrintify = product.metadata?.printify_id || product.metadata?.printify_product_id;
        
        return {
          name: product.name,
          quantity: item.quantity || 1,
          price: item.amount_total || 0,
          type: isPrintify ? 'merchandise' : 'digital'
        };
      });

      // Send customer order confirmation email
      try {
        console.log("📧 Sending customer confirmation email...");
        
        const orderConfirmationPayload = {
          order_id: session.id.substring(session.id.length - 8).toUpperCase(),
          customer_email: session.customer_email || session.customer_details?.email || '',
          customer_name: session.customer_details?.name || session.shipping?.name || 'Customer',
          items: emailItems,
          subtotal: session.amount_subtotal || 0,
          shipping: session.total_details?.amount_shipping || 0,
          total: session.amount_total || 0,
          shipping_address: session.shipping?.address || undefined
        };

        const { error: emailError } = await supabaseClient.functions.invoke('send-order-confirmation', {
          body: orderConfirmationPayload
        });

        if (emailError) {
          console.error("❌ Failed to send customer confirmation:", emailError);
        } else {
          console.log("✅ Customer confirmation email sent");
        }
      } catch (emailErr) {
        console.error("❌ Customer email failed:", emailErr);
      }

      // Send admin notification email
      try {
        console.log("📧 Sending admin notification email...");
        
        const adminNotificationPayload = {
          order_id: session.id.substring(session.id.length - 8).toUpperCase(),
          customer_email: session.customer_email || session.customer_details?.email || '',
          customer_name: session.customer_details?.name || session.shipping?.name || 'Customer',
          items: emailItems,
          total: session.amount_total || 0,
          shipping_address: session.shipping?.address || undefined
        };

        const { error: adminEmailError } = await supabaseClient.functions.invoke('send-admin-order-notification', {
          body: adminNotificationPayload
        });

        if (adminEmailError) {
          console.error("❌ Failed to send admin notification:", adminEmailError);
        } else {
          console.log("✅ Admin notification email sent");
        }
      } catch (adminErr) {
        console.error("❌ Admin email failed:", adminErr);
      }

      // Record discount usage if applicable
      if (session.metadata?.discount_id && session.total_details?.amount_discount) {
        try {
          console.log("🎟️ Recording discount usage...");
          
          await supabaseClient
            .from('discount_usage')
            .insert({
              discount_id: session.metadata.discount_id,
              user_id: userId,
              stripe_session_id: session.id,
              order_amount: session.amount_total || 0,
              discount_amount: session.total_details.amount_discount,
            });

          await supabaseClient
            .from('discount_codes')
            .update({ current_uses: supabaseClient.sql`current_uses + 1` })
            .eq('id', session.metadata.discount_id);

          console.log("✅ Discount usage recorded");
        } catch (discountErr) {
          console.error("❌ Discount recording failed:", discountErr);
        }
      }

      console.log("✅ Webhook processing complete");
    } catch (bgError) {
      console.error("❌ Background processing error:", bgError);
    }
  };

  // Start background work without blocking response
  EdgeRuntime.waitUntil(backgroundWork());

  return responsePromise;
});

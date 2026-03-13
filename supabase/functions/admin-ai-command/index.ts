import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      throw new Error('User is not an admin');
    }

    const { command } = await req.json();
    console.log(`Processing admin command from ${user.email}:`, command);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = supabaseAdmin;

    // Analyze command intent using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an admin dashboard AI assistant. Analyze admin commands and determine the action to take. 
            Possible actions: "show_weekly_sales", "resend_failed_emails", "generate_report", "sync_orders", "weekly_summary".
            Respond ONLY with a JSON object: { "action": "action_name", "parameters": {} }
            Do not include any other text or explanation.`
          },
          {
            role: "user",
            content: command
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI response error:", await aiResponse.text());
      throw new Error("AI processing failed");
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0]?.message?.content || "";
    console.log("AI response:", aiMessage);
    
    let actionData;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedMessage = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      actionData = JSON.parse(cleanedMessage);
    } catch {
      console.error("Failed to parse AI response:", aiMessage);
      actionData = { action: "unknown", parameters: {} };
    }

    console.log("Parsed action:", actionData);

    // Execute the action
    let result = { message: "Command processed", data: null as any };

    switch (actionData.action) {
      case "resend_failed_emails": {
        const { data: failedEmails, error } = await supabase
          .from("email_logs")
          .select("id, recipient_email, email_type, edge_function_name, metadata")
          .eq("status", "failed")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error fetching failed emails:", error);
          throw error;
        }

        const count = failedEmails?.length || 0;
        
        if (count === 0) {
          result = {
            message: "No failed emails found. All emails have been sent successfully!",
            data: { count: 0 }
          };
        } else {
          // Mark emails for retry
          await supabase
            .from("email_logs")
            .update({ status: "pending_retry" })
            .in("id", failedEmails.map(e => e.id));

          result = {
            message: `Found ${count} failed emails and marked them for retry.`,
            data: { count, emails: failedEmails.map(e => ({ email: e.recipient_email, type: e.email_type })) }
          };
        }
        break;
      }

      case "weekly_summary":
      case "generate_report": {
        // Get date ranges
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Fetch user stats
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: newUsersThisWeek } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString());

        // Fetch order stats
        const { data: recentOrders } = await supabase
          .from("printify_orders")
          .select("total_price")
          .gte("created_at", oneWeekAgo.toISOString());

        const weeklyRevenue = recentOrders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
        const orderCount = recentOrders?.length || 0;

        // Fetch course enrollment stats
        const { count: newEnrollments } = await supabase
          .from("user_purchases")
          .select("*", { count: "exact", head: true })
          .gte("created_at", oneWeekAgo.toISOString());

        // Fetch email stats
        const { count: emailsSent } = await supabase
          .from("email_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent")
          .gte("created_at", oneWeekAgo.toISOString());

        const { count: emailsFailed } = await supabase
          .from("email_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "failed")
          .gte("created_at", oneWeekAgo.toISOString());

        const insight = `Weekly Summary: ${newUsersThisWeek || 0} new users joined (${totalUsers} total). ${orderCount} orders processed totaling $${(weeklyRevenue / 100).toFixed(2)}. ${newEnrollments || 0} new course enrollments. ${emailsSent || 0} emails sent successfully, ${emailsFailed || 0} failed.`;

        result = {
          message: "Weekly Summary Generated",
          data: {
            insight,
            stats: {
              totalUsers,
              newUsersThisWeek,
              orderCount,
              weeklyRevenue: weeklyRevenue / 100,
              newEnrollments,
              emailsSent,
              emailsFailed
            }
          }
        };
        break;
      }

      case "show_weekly_sales": {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentOrders } = await supabase
          .from("printify_orders")
          .select("total_price, status, created_at")
          .gte("created_at", oneWeekAgo.toISOString());

        const totalSales = recentOrders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

        result = {
          message: `Weekly sales: $${(totalSales / 100).toFixed(2)} from ${recentOrders?.length || 0} orders`,
          data: { sales: totalSales / 100, orderCount: recentOrders?.length || 0 }
        };
        break;
      }

      case "sync_orders": {
        // Check if Printify API key is configured
        const PRINTIFY_API_KEY = Deno.env.get("PRINTIFY_API_KEY");
        
        if (!PRINTIFY_API_KEY) {
          result = {
            message: "Printify API key not configured. Please add PRINTIFY_API_KEY to your secrets.",
            data: { error: "missing_api_key" }
          };
          break;
        }

        // Fetch orders that need syncing (not in final states)
        const { data: ordersToSync } = await supabase
          .from("printify_orders")
          .select("id, printify_order_id, status")
          .not("status", "in", '("delivered","cancelled")')
          .limit(20);

        if (!ordersToSync || ordersToSync.length === 0) {
          result = {
            message: "No orders need syncing. All orders are in final states.",
            data: { synced: 0 }
          };
          break;
        }

        let syncedCount = 0;
        let errorCount = 0;

        // Note: Full Printify API sync would require their API
        // For now, we'll mark this as a placeholder that could be expanded
        result = {
          message: `Found ${ordersToSync.length} orders that could be synced. Full Printify API sync requires additional implementation.`,
          data: { 
            ordersFound: ordersToSync.length,
            note: "Use the Printify webhook for real-time order updates"
          }
        };
        break;
      }

      default:
        result = {
          message: `Command "${command}" was not recognized. Available commands: resend failed emails, generate weekly report, show weekly sales, sync orders.`,
          data: { action: "unknown" }
        };
    }

    console.log("Command result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error processing admin command:", error);
    return new Response(
      JSON.stringify({ 
        error: message,
        message: `Failed to process command: ${message}`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

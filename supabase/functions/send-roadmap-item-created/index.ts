import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  item_id: string;
  resend_to_real_only?: boolean; // Bypass duplicate check and send only to real subscribers
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { item_id, resend_to_real_only = false }: RequestBody = await req.json();

    if (!item_id) {
      return new Response(JSON.stringify({ error: "item_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the roadmap item
    const { data: item, error: itemError } = await supabase
      .from("roadmap_items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      console.error("Error fetching roadmap item:", itemError);
      return new Response(JSON.stringify({ error: "Roadmap item not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if we already sent this reminder (skip if resending to real subscribers)
    if (!resend_to_real_only) {
      const { data: existingReminder } = await supabase
        .from("roadmap_reminder_sent")
        .select("id")
        .eq("roadmap_item_id", item_id)
        .eq("reminder_type", "created")
        .single();

      if (existingReminder) {
        console.log("Created email already sent for this item");
        return new Response(JSON.stringify({ message: "Email already sent" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch all subscribers (exclude bot accounts)
    const { data: subscribers, error: subsError } = await supabase
      .from("subscribers")
      .select("email, name")
      .not("email", "ilike", "bot-%@internal.3rdeyeadvisors.com");

    if (subsError) {
      console.error("Error fetching subscribers:", subsError);
      throw subsError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers to notify");
      return new Response(JSON.stringify({ message: "No subscribers" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate voting end date
    const votingEndsAt = item.voting_ends_at 
      ? new Date(item.voting_ends_at).toLocaleDateString("en-US", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        })
      : "7 days from now";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">
                🗳️ New Feature to Vote On
              </h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="color: #a1a1aa; font-size: 16px; line-height: 1.6; padding-bottom: 20px;">
              We've added a new feature to the platform roadmap for community voting. Your voice matters!
            </td>
          </tr>
          
          <!-- Feature Card -->
          <tr>
            <td style="padding: 24px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); border-radius: 12px; margin: 20px 0;">
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 12px 0; font-weight: 600;">
                ${item.title}
              </h2>
              ${item.description ? `
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
                ${item.description}
              </p>
              ` : ''}
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0;">
                ⏰ Voting ends: ${votingEndsAt}
              </p>
            </td>
          </tr>
          
          <!-- Voting Power Info -->
          <tr>
            <td style="padding: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #18181b; border-radius: 8px; padding: 16px;">
                    <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0;">Your Voting Power:</p>
                    <p style="color: #ffffff; font-size: 14px; margin: 0;">
                      👑 Founding 33 = <strong style="color: #f59e0b;">3x votes</strong><br>
                      ⭐ Annual = <strong style="color: #3B82F6;">1x vote</strong><br>
                      🔒 Monthly/Trial = View only
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="text-align: center; padding: 20px 0 30px 0;">
              <a href="https://sentineldefi.com/roadmap"
                 style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Vote Now →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding-top: 24px; text-align: center;">
              <p style="color: #71717a; font-size: 13px; margin: 0 0 8px 0;">
                Awareness is advantage.
              </p>
              <p style="color: #52525b; font-size: 12px; margin: 0;">
                © Sentinel DeFi • <a href="https://sentineldefi.com" style="color: #52525b;">sentineldefi.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send to all subscribers (in batches to avoid rate limits)
    const batchSize = 50;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      for (const subscriber of batch) {
        try {
          await resend.emails.send({
            from: "Sentinel DeFi <updates@the3rdeyeadvisors.com>",
            to: [subscriber.email],
            subject: `🗳️ New Feature to Vote On: ${item.title}`,
            html: emailHtml.replace("We've added", subscriber.name ? `Hi ${subscriber.name},\n\nWe've added` : "We've added"),
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to send to ${subscriber.email}:`, err);
          failCount++;
        }
      }
    }

    // Record that we sent this reminder
    await supabase.from("roadmap_reminder_sent").insert({
      roadmap_item_id: item_id,
      reminder_type: "created",
    });

    // Log the email
    await supabase.from("email_logs").insert({
      email_type: "roadmap_item_created",
      edge_function_name: "send-roadmap-item-created",
      recipient_email: `${successCount} subscribers`,
      related_id: item_id,
      status: "sent",
      metadata: { success_count: successCount, fail_count: failCount },
    });

    console.log(`Roadmap item created email sent to ${successCount} subscribers, ${failCount} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, failed: failCount }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-roadmap-item-created:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

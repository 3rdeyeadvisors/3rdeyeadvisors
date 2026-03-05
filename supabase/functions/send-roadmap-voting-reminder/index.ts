import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  reminder_type: "3-day" | "24-hour";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reminder_type }: RequestBody = await req.json();

    if (!reminder_type || !["3-day", "24-hour"].includes(reminder_type)) {
      return new Response(
        JSON.stringify({ error: "reminder_type must be '3-day' or '24-hour'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    let minDate: Date, maxDate: Date;

    if (reminder_type === "3-day") {
      // Items ending in 3 days (between 72 and 73 hours from now)
      minDate = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      maxDate = new Date(now.getTime() + 73 * 60 * 60 * 1000);
    } else {
      // Items ending in 24 hours (between 23 and 25 hours from now)
      minDate = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      maxDate = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    }

    // Find roadmap items with voting ending in the specified window
    const { data: items, error: itemsError } = await supabase
      .from("roadmap_items")
      .select("*")
      .eq("status", "proposed")
      .gte("voting_ends_at", minDate.toISOString())
      .lte("voting_ends_at", maxDate.toISOString());

    if (itemsError) {
      console.error("Error fetching roadmap items:", itemsError);
      throw itemsError;
    }

    if (!items || items.length === 0) {
      console.log(`No items need ${reminder_type} reminder`);
      return new Response(
        JSON.stringify({ message: "No items to remind about" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      return new Response(
        JSON.stringify({ message: "No subscribers" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const item of items) {
      // Check if we already sent this reminder
      const { data: existingReminder } = await supabase
        .from("roadmap_reminder_sent")
        .select("id")
        .eq("roadmap_item_id", item.id)
        .eq("reminder_type", reminder_type)
        .single();

      if (existingReminder) {
        console.log(`${reminder_type} reminder already sent for item ${item.id}`);
        continue;
      }

      const urgencyEmoji = reminder_type === "24-hour" ? "🚨" : "⏰";
      const urgencyText = reminder_type === "24-hour" ? "Last Chance" : "3 Days Left";
      const subjectLine = `${urgencyEmoji} ${urgencyText} to Vote: ${item.title}`;

      const votingEndsAt = item.voting_ends_at
        ? new Date(item.voting_ends_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "soon";

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
                ${urgencyEmoji} ${urgencyText} to Vote!
              </h1>
            </td>
          </tr>
          
          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: ${reminder_type === "24-hour" ? "#dc2626" : "#f59e0b"}; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">
                ${reminder_type === "24-hour" 
                  ? "⚡ Voting closes in 24 hours!" 
                  : "⏳ Only 3 days left to vote!"}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="color: #a1a1aa; font-size: 16px; line-height: 1.6; padding: 20px 0;">
              Don't miss your chance to influence the future of the platform. Voting is closing soon on this feature:
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
          
          <!-- CTA Button -->
          <tr>
            <td style="text-align: center; padding: 30px 0;">
              <a href="https://sentineldefi.com/roadmap"
                 style="display: inline-block; background: linear-gradient(135deg, ${reminder_type === "24-hour" ? "#dc2626, #b91c1c" : "#f59e0b, #d97706"}); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Vote Now Before It's Too Late →
              </a>
            </td>
          </tr>
          
          <!-- Voting Power Reminder -->
          <tr>
            <td style="padding: 16px; background-color: #18181b; border-radius: 8px;">
              <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
                <strong>Remember:</strong> Founding 33 members have 3x voting power, Annual subscribers have 1x vote.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding-top: 24px; margin-top: 30px; text-align: center;">
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

      // Send to all subscribers in batches
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
              subject: subjectLine,
              html: emailHtml,
            });
            successCount++;
          } catch (err) {
            console.error(`Failed to send to ${subscriber.email}:`, err);
            failCount++;
          }
        }
      }

      totalSent += successCount;
      totalFailed += failCount;

      // Record that we sent this reminder
      await supabase.from("roadmap_reminder_sent").insert({
        roadmap_item_id: item.id,
        reminder_type: reminder_type,
      });

      // Log the email
      await supabase.from("email_logs").insert({
        email_type: `roadmap_${reminder_type.replace("-", "_")}_reminder`,
        edge_function_name: "send-roadmap-voting-reminder",
        recipient_email: `${successCount} subscribers`,
        related_id: item.id,
        status: "sent",
        metadata: { 
          success_count: successCount, 
          fail_count: failCount,
          reminder_type 
        },
      });

      console.log(`${reminder_type} reminder sent for item ${item.id}: ${successCount} sent, ${failCount} failed`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        items_processed: items.length,
        total_sent: totalSent, 
        total_failed: totalFailed 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-roadmap-voting-reminder:", error);
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

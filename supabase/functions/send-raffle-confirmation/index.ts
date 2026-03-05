import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RaffleConfirmationRequest {
  email: string;
  first_name?: string;
  raffle_title: string;
  prize: string;
  prize_amount: number;
  end_date: string;
  entry_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, raffle_title, prize, prize_amount, end_date, entry_count }: RaffleConfirmationRequest = await req.json();

    console.log("Sending raffle confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [email],
      subject: "You're officially entered — Sentinel DeFi Learn-to-Earn Raffle 🎟",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#030717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#030717"><tr><td align="center" style="padding:32px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(135deg,#1a1f2e,#0f1419);border-radius:12px;border:1px solid #2a3441">
        <tr><td style="text-align:center;padding:48px 24px">
        <h1 style="color:#60a5fa;font-size:32px;margin:0 0 8px 0;font-weight:700">Sentinel DeFi</h1>
        <p style="color:#c084fc;font-size:16px;margin:0">Raffle Confirmation</p>
        </td></tr>
        <tr><td style="padding:0 32px 32px">
        <h2 style="color:#60a5fa;font-size:26px;margin:0 0 16px 0;font-weight:700">You're In! 🎉</h2>
        <p style="color:#f5f5f5;font-size:16px;line-height:1.6;margin:0 0 12px 0">Hi <strong>${first_name || 'there'}</strong>,</p>
        <p style="color:#f5f5f5;font-size:16px;line-height:1.6;margin:0 0 20px 0">You've successfully joined the <strong style="color:#60a5fa">Learn-to-Earn Raffle</strong> — welcome to the next evolution of financial consciousness.</p>
        <div style="background:linear-gradient(135deg,#581c87,#4c1d95);padding:28px;border-radius:12px;border:1px solid #7c3aed;margin:24px 0;text-align:center">
        <h3 style="margin:0 0 16px 0;color:#c084fc;font-size:20px">Your Entry Details</h3>
        <div style="font-size:48px;font-weight:700;margin:16px 0;color:#fff">🪙 $${prize_amount}</div>
        <p style="font-size:18px;margin:8px 0;color:#fff;font-weight:600">Prize: ${prize}</p>
        <p style="font-size:16px;margin:8px 0;color:#e9d5ff">Entries: <strong style="color:#fff">${entry_count}</strong></p>
        <p style="font-size:14px;margin:12px 0 0;color:#e9d5ff">⏰ Ends: ${new Date(end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</p>
        </div>
        <div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #334155;margin:20px 0;text-align:center">
        <p style="font-size:14px;color:#f5f5f5;margin:0">Want more entries? Share your referral link from your <a href="https://sentineldefi.com/raffles" style="color:#60a5fa;text-decoration:underline">raffle dashboard</a>.</p>
        </div>
        <p style="text-align:center;font-size:16px;font-weight:700;color:#60a5fa;margin:24px 0 8px;border-top:1px solid #334155;padding-top:20px">Awareness is advantage.</p>
        <p style="text-align:center;font-size:14px;color:#64748b;margin:0">— The Sentinel DeFi Team</p>
        </td></tr>
        </table>
        </td></tr></table>
        </body>
        </html>
      `,
    });

    console.log("Raffle confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-raffle-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

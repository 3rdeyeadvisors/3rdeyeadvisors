import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MiniGameResultRequest {
  email: string;
  game_type: string;
  score: number;
  iq_score?: number;
  percentile?: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, game_type, score, iq_score, percentile, description }: MiniGameResultRequest = await req.json();

    console.log(`Sending ${game_type} results to:`, email);

    let subject = "Your Cognitive Lab Performance Report 🧠";
    let title = "Performance Report";
    let bodyContent = `You recently completed the ${game_type} exercise in the Sentinel DeFi Cognitive Lab.`;

    if (game_type === 'IQ Assessment') {
      subject = `Your IQ Assessment Result: ${iq_score} 🏆`;
      title = "IQ Assessment Results";
      bodyContent = `Congratulations on completing your cognitive assessment. Your results provide a window into your current fluid intelligence and processing capacity.`;
    }

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#030717;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#030717">
            <tr>
              <td align="center" style="padding:32px 20px">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(135deg,#1a1f2e,#0f1419);border-radius:12px;border:1px solid #2a3441">
                  <tr>
                    <td style="text-align:center;padding:48px 24px">
                      <h1 style="color:#60a5fa;font-size:32px;margin:0 0 8px 0;font-weight:700">Sentinel DeFi</h1>
                      <p style="color:#c084fc;font-size:16px;margin:0 uppercase;letter-spacing:1px">${title}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 40px 48px">
                      <p style="color:#f5f5f5;font-size:16px;line-height:1.6;margin:0 0 24px 0">${bodyContent}</p>

                      <div style="background:rgba(96,165,250,0.1);padding:32px;border-radius:12px;border:1px solid rgba(96,165,250,0.2);text-align:center;margin-bottom:32px">
                        ${iq_score ? `
                          <div style="color:#60a5fa;font-size:14px;font-weight:600;margin-bottom:8px">ESTIMATED IQ</div>
                          <div style="color:#fff;font-size:56px;font-weight:800;margin-bottom:8px">${iq_score}</div>
                          <div style="color:#c084fc;font-size:18px;font-weight:600">Top ${percentile} Percentile</div>
                        ` : `
                          <div style="color:#60a5fa;font-size:14px;font-weight:600;margin-bottom:8px">EXERCISE SCORE</div>
                          <div style="color:#fff;font-size:48px;font-weight:800">${score}</div>
                        `}
                      </div>

                      ${description ? `<p style="color:#94a3b8;font-size:15px;line-height:1.6;margin-bottom:32px;text-align:center;font-style:italic">"${description}"</p>` : ''}

                      <div style="text-align:center">
                        <a href="https://sentineldefi.com/mini-games" style="background:#60a5fa;color:#030717;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">Continue Training</a>
                      </div>

                      <p style="text-align:center;font-size:14px;color:#64748b;margin-top:40px;padding-top:24px;border-top:1px solid #2a3441">
                        Awareness is advantage. Keep pushing your limits.<br>
                        — The Sentinel DeFi Team
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-mini-game-results:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

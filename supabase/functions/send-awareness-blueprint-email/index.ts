import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AwarenessBlueprintEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: AwarenessBlueprintEmailRequest = await req.json();

    console.log("Sending Awareness Blueprint email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [email],
      subject: "Your Awareness Blueprint (Download Inside)",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 24px;">Welcome — here's your download.</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Click below to access your Awareness Blueprint:
          </p>
          
          <div style="margin: 30px 0;">
            <a href="https://sentineldefi.com/resources/Awareness_Blueprint_Clean.pdf"
               style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Download Your Blueprint
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 16px;">
            This guide explains how money, value, identity, and power are shifting on-chain in 2025. Read it fully.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 16px;">
            More insights are coming soon.
          </p>
          
          <p style="color: #888; line-height: 1.6; margin-top: 32px; font-style: italic;">
            Knowledge is free.<br/>
            Awareness is the real currency.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          
          <p style="color: #999; font-size: 12px; line-height: 1.4;">
            Sentinel DeFi<br/>
            <a href="https://sentineldefi.com" style="color: #999;">sentineldefi.com</a>
          </p>
        </div>
      `,
    });

    console.log("Awareness Blueprint email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending Awareness Blueprint email:", error);
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

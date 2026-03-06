import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingNotificationPayload {
  order_id: string;
  customer_email: string;
  customer_name: string;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  items?: Array<{
    printify_product_id: string;
    variant_id: number;
    quantity: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ShippingNotificationPayload = await req.json();
    console.log('Sending shipping notification for order:', payload.order_id);

    const { customer_email, customer_name, order_id, tracking_number, tracking_url, carrier } = payload;
    
    const firstName = customer_name?.split(' ')[0] || 'there';
    
    // Build tracking section
    const trackingSection = tracking_url ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(142, 76%, 10%), hsl(142, 76%, 12%)); border-radius: 12px; border: 1px solid hsl(142, 76%, 25%); margin: 24px 0;">
        <tr>
          <td style="padding: 24px; text-align: center;">
            <h3 style="color: hsl(142, 76%, 65%); margin: 0 0 16px 0; font-size: 18px;">📍 Track Your Package</h3>
            ${carrier ? `<p style="color: #F5F5F5; margin: 0 0 12px 0;">Carrier: <strong>${carrier}</strong></p>` : ''}
            ${tracking_number ? `<p style="color: hsl(215, 20%, 65%); margin: 0 0 16px 0; font-size: 14px;">Tracking #: ${tracking_number}</p>` : ''}
            <a href="${tracking_url}" style="background: linear-gradient(45deg, hsl(142, 76%, 45%), hsl(142, 76%, 55%)); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px hsla(142, 76%, 45%, 0.3);">
              Track Package →
            </a>
          </td>
        </tr>
      </table>
    ` : tracking_number ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%); margin: 24px 0;">
        <tr>
          <td style="padding: 24px;">
            <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 12px 0; font-size: 18px;">📍 Tracking Information</h3>
            ${carrier ? `<p style="color: #F5F5F5; margin: 0 0 8px 0;">Carrier: <strong>${carrier}</strong></p>` : ''}
            <p style="color: #F5F5F5; margin: 0;">Tracking Number: <strong>${tracking_number}</strong></p>
          </td>
        </tr>
      </table>
    ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #030717;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #030717;">
          <tr>
            <td align="center" style="padding: 0; background-color: #030717;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
                <tr>
                  <td style="padding: 32px 20px;">
                    
                    <!-- Header -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%);">
                      <tr>
                        <td style="text-align: center; padding: 48px 24px;">
                          <h1 style="color: hsl(217, 91%, 60%); font-size: 36px; margin: 0 0 8px 0; font-weight: 700; text-shadow: 0 0 24px hsla(217, 91%, 60%, 0.4);">Sentinel DeFi</h1>
                          <p style="color: hsl(142, 76%, 60%); font-size: 18px; margin: 0; font-weight: 500;">Your Order Has Shipped! 🚀</p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 32px;"></td></tr></table>
                    
                    <!-- Main Message -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <h2 style="color: hsl(142, 76%, 65%); font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
                            📦 Great news, ${firstName}!
                          </h2>
                          <p style="color: #F5F5F5; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0;">
                            Your order <strong>#${order_id}</strong> is on its way!
                          </p>
                          <p style="color: hsl(215, 20%, 65%); font-size: 15px; line-height: 1.6; margin: 0;">
                            We've handed your package off to the carrier and it's heading your way. Here's how you can track it:
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Tracking Section -->
                    ${trackingSection}

                    <!-- Delivery Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%); margin-top: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 16px 0; font-size: 18px;">📬 What's Next?</h3>
                          <ul style="color: #F5F5F5; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Delivery typically takes 5-10 business days</li>
                            <li>You'll see updates as your package moves</li>
                            <li>Check your mailbox or front door upon delivery</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 24px;"></td></tr></table>
                    
                    <!-- Support -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 10%)); border-radius: 8px; border: 1px solid hsl(217, 32%, 15%);">
                      <tr>
                        <td style="text-align: center; padding: 20px;">
                          <p style="color: #F5F5F5; font-size: 14px; margin: 0 0 8px 0;">
                            Questions about your shipment?
                          </p>
                          <a href="mailto:info@the3rdeyeadvisors.com" style="color: hsl(217, 91%, 70%); text-decoration: underline;">info@the3rdeyeadvisors.com</a>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 24px;"></td></tr></table>
                    
                    <!-- Footer -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid hsl(217, 32%, 15%);">
                      <tr>
                        <td style="text-align: center; padding-top: 24px;">
                          <p style="color: hsl(215, 20%, 65%); font-size: 12px; margin: 0 0 8px 0;">
                            Sentinel DeFi - DeFi Education
                          </p>
                          <p style="margin: 0;">
                            <a href="https://sentineldefi.online" style="color: hsl(215, 20%, 65%); text-decoration: underline; font-size: 12px;">Visit Website</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      reply_to: "info@the3rdeyeadvisors.com",
      to: [customer_email],
      subject: `🚀 Your order #${order_id} has shipped!`,
      html: emailHtml,
      tags: [{ name: 'category', value: 'shipping_notification' }],
    });

    console.log("Shipping notification sent to:", customer_email);

    // Log email
    await supabase.from('email_logs').insert({
      email_type: 'shipping_notification',
      recipient_email: customer_email,
      status: 'sent',
      edge_function_name: 'send-shipping-notification',
      metadata: {
        resend_id: emailResponse.data?.id,
        order_id,
        tracking_number,
        carrier
      }
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending shipping notification:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

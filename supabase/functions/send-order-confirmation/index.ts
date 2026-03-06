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

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  type: 'digital' | 'merchandise';
  download_url?: string;
}

interface OrderConfirmationPayload {
  order_id: string;
  customer_email: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: OrderConfirmationPayload = await req.json();
    console.log('Sending order confirmation:', payload.order_id);

    const { customer_email, customer_name, items, order_id, subtotal, shipping, total, shipping_address } = payload;
    
    const firstName = customer_name.split(' ')[0] || 'there';
    
    // Categorize items
    const digitalItems = items.filter(item => item.type === 'digital');
    const merchandiseItems = items.filter(item => item.type === 'merchandise');
    const hasBoth = digitalItems.length > 0 && merchandiseItems.length > 0;

    // Generate item list HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid hsl(217, 32%, 15%);">
          <span style="color: #F5F5F5; font-size: 15px;">${item.name}</span>
          <span style="color: hsl(215, 20%, 65%); font-size: 13px; display: block; margin-top: 4px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid hsl(217, 32%, 15%);">
          <span style="color: #F5F5F5; font-size: 15px; font-weight: 600;">$${(item.price * item.quantity / 100).toFixed(2)}</span>
        </td>
      </tr>
    `).join('');

    // Digital items section
    const digitalSection = digitalItems.length > 0 ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(271, 91%, 10%), hsl(271, 91%, 12%)); border-radius: 12px; border: 1px solid hsl(271, 91%, 25%); margin-bottom: 24px;">
        <tr>
          <td style="padding: 24px;">
            <h3 style="color: hsl(271, 91%, 75%); margin: 0 0 12px 0; font-size: 18px;">📧 Digital Products</h3>
            <p style="color: #F5F5F5; line-height: 1.6; margin: 0 0 16px 0;">
              Your digital products will be delivered to this email address within the next few minutes. Check your inbox (and spam folder) for download links.
            </p>
            ${digitalItems.map(item => item.download_url ? `
              <div style="margin: 12px 0;">
                <a href="${item.download_url}" style="background: linear-gradient(45deg, hsl(271, 91%, 60%), hsl(217, 91%, 65%)); color: hsl(0, 0%, 98%); padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px hsla(271, 91%, 60%, 0.3);">
                  Download ${item.name}
                </a>
              </div>
            ` : '').join('')}
          </td>
        </tr>
      </table>
    ` : '';

    // Shipping section
    const shippingSection = merchandiseItems.length > 0 && shipping_address ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 91%, 10%), hsl(217, 91%, 12%)); border-radius: 12px; border: 1px solid hsl(217, 91%, 25%); margin-bottom: 24px;">
        <tr>
          <td style="padding: 24px;">
            <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 12px 0; font-size: 18px;">📦 Physical Items - Shipping Details</h3>
            <p style="color: #F5F5F5; line-height: 1.6; margin: 0 0 16px 0;">
              Your merchandise will be shipped to:
            </p>
            <div style="color: #F5F5F5; line-height: 1.6; padding: 12px; background: hsl(217, 32%, 8%); border-radius: 8px;">
              ${shipping_address.line1}<br>
              ${shipping_address.line2 ? shipping_address.line2 + '<br>' : ''}
              ${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}<br>
              ${shipping_address.country}
            </div>
            <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 16px 0 0 0;">
              You'll receive a shipping confirmation email with tracking information once your order ships.
            </p>
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
                          <p style="color: hsl(271, 91%, 75%); font-size: 18px; margin: 0; font-weight: 500;">Order Confirmation</p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 32px;"></td></tr></table>
                    
                    <!-- Confirmation Message -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <h2 style="color: hsl(217, 91%, 70%); font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
                            ✅ Thanks ${firstName}! Order #${order_id} confirmed
                          </h2>
                          <p style="color: #F5F5F5; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                            We've received your order and are processing it now. Here are the details:
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Digital/Shipping sections based on order type -->
                    ${digitalSection}
                    ${shippingSection}

                    <!-- Order Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%);">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 16px 0; font-size: 18px;">Order Summary</h3>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${itemsHtml}
                            <tr>
                              <td style="padding: 12px 0;">
                                <span style="color: hsl(215, 20%, 65%); font-size: 15px;">Subtotal</span>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="color: #F5F5F5; font-size: 15px;">$${(subtotal / 100).toFixed(2)}</span>
                              </td>
                            </tr>
                            ${shipping ? `
                            <tr>
                              <td style="padding: 12px 0;">
                                <span style="color: hsl(215, 20%, 65%); font-size: 15px;">Shipping</span>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="color: #F5F5F5; font-size: 15px;">$${(shipping / 100).toFixed(2)}</span>
                              </td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 16px 0 0 0; border-top: 2px solid hsl(217, 91%, 60%);">
                                <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">Total</span>
                              </td>
                              <td style="padding: 16px 0 0 0; text-align: right; border-top: 2px solid hsl(217, 91%, 60%);">
                                <span style="color: hsl(217, 91%, 70%); font-size: 22px; font-weight: 700;">$${(total / 100).toFixed(2)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 24px;"></td></tr></table>
                    
                    <!-- Support -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 10%)); border-radius: 8px; border: 1px solid hsl(217, 32%, 15%);">
                      <tr>
                        <td style="text-align: center; padding: 20px;">
                          <p style="color: #F5F5F5; font-size: 14px; margin: 0 0 8px 0;">
                            Questions about your order?
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
      subject: `✅ Thanks! Order #${order_id} confirmed - $${(total / 100).toFixed(2)}`,
      html: emailHtml,
      tags: [{ name: 'category', value: 'order_confirmation' }],
    });

    console.log("Order confirmation sent to:", customer_email);

    // Log email
    await supabase.from('email_logs').insert({
      email_type: 'order_confirmation',
      recipient_email: customer_email,
      status: 'sent',
      edge_function_name: 'send-order-confirmation',
      metadata: {
        resend_id: emailResponse.data?.id,
        order_id,
        total,
        items_count: items.length
      }
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);

    try {
      const payload: OrderConfirmationPayload = await req.json();
      await supabase.from('email_logs').insert({
        email_type: 'order_confirmation',
        recipient_email: payload.customer_email,
        status: 'failed',
        edge_function_name: 'send-order-confirmation',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

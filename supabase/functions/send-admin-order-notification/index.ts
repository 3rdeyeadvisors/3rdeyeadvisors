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
}

interface AdminNotificationPayload {
  order_id: string;
  customer_email: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  shipping_address?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AdminNotificationPayload = await req.json();
    console.log('Sending admin notification for order:', payload.order_id);

    const { customer_email, customer_name, items, order_id, total, shipping_address } = payload;
    
    const digitalItems = items.filter(item => item.type === 'digital');
    const merchandiseItems = items.filter(item => item.type === 'merchandise');

    const itemsList = items.map(item => 
      `${item.name} (x${item.quantity}) - $${(item.price * item.quantity / 100).toFixed(2)}`
    ).join('\n');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🔔 New Order Received #${order_id}</h2>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
            <p><strong>Customer:</strong> ${customer_name} (${customer_email})</p>
          </div>

          <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items (${items.length})</h3>
            <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px;">${itemsList}</pre>
            
            ${digitalItems.length > 0 ? `
              <p style="margin-top: 15px; color: #7c3aed;">
                <strong>📧 Digital items:</strong> ${digitalItems.length}
              </p>
            ` : ''}
            
            ${merchandiseItems.length > 0 ? `
              <p style="margin-top: 15px; color: #2563eb;">
                <strong>📦 Merchandise items:</strong> ${merchandiseItems.length}
              </p>
            ` : ''}
          </div>

          ${shipping_address ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p style="margin: 5px 0;">${shipping_address.line1}</p>
              ${shipping_address.line2 ? `<p style="margin: 5px 0;">${shipping_address.line2}</p>` : ''}
              <p style="margin: 5px 0;">${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}</p>
              <p style="margin: 5px 0;">${shipping_address.country}</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated notification from your Sentinel DeFi store.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi Store <info@the3rdeyeadvisors.com>",
      reply_to: customer_email,
      to: ["info@the3rdeyeadvisors.com"],
      subject: `🛒 New order #${order_id} — $${(total / 100).toFixed(2)}`,
      html: emailHtml,
      tags: [{ name: 'category', value: 'admin_notification' }],
    });

    console.log("Admin notification sent for order:", order_id);

    await supabase.from('email_logs').insert({
      email_type: 'admin_notification',
      recipient_email: 'info@the3rdeyeadvisors.com',
      status: 'sent',
      edge_function_name: 'send-admin-order-notification',
      metadata: {
        resend_id: emailResponse.data?.id,
        order_id,
        total
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending admin notification:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

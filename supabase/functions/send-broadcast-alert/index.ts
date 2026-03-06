import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  alert_id: string;
  alert_type: string;
  severity: string;
  error_message?: string;
  failed_payload?: any;
  missing_fields?: string[];
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');
    const payload: AlertPayload = await req.json();

    console.log('Sending broadcast alert:', payload);

    // Generate retry link
    const retryLink = `https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/retry-broadcast?alert_id=${payload.alert_id}`;

    // Construct email body
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .alert-details { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .code-block { background: #1f2937; color: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .retry-button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Sentinel DeFi Broadcast Issue Detected</h1>
          </div>
          <div class="content">
            <div class="alert-details">
              <h2>Alert Details</h2>
              <p><strong>Timestamp:</strong> ${new Date(payload.timestamp).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
              <p><strong>Alert Type:</strong> ${payload.alert_type}</p>
              <p><strong>Severity:</strong> <span style="color: ${payload.severity === 'error' ? '#dc2626' : '#f59e0b'}">${payload.severity.toUpperCase()}</span></p>
              ${payload.error_message ? `<p><strong>Error Message:</strong> ${payload.error_message}</p>` : ''}
              ${payload.missing_fields && payload.missing_fields.length > 0 ? `
                <p><strong>Missing Fields:</strong></p>
                <ul>
                  ${payload.missing_fields.map(field => `<li>${field}</li>`).join('')}
                </ul>
              ` : ''}
            </div>

            ${payload.failed_payload ? `
              <div class="alert-details">
                <h3>Raw Webhook Payload</h3>
                <pre class="code-block">${JSON.stringify(payload.failed_payload, null, 2)}</pre>
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${retryLink}" class="retry-button">🔄 Retry Now</a>
            </div>

            <div class="alert-details">
              <h3>What This Means</h3>
              <p>Your automated Sentinel DeFi Broadcast encountered an issue and requires attention. Please review the details above and use the "Retry Now" button to attempt reprocessing the broadcast.</p>
              <p>You can also view detailed logs in your <a href="https://sentineldefi.online/admin">Lovable admin dashboard</a> under <strong>Automation Logs → Sentinel DeFi Broadcast Alerts</strong>.</p>
            </div>
          </div>
          <div class="footer">
            <p style="font-size: 12px; color: #6b7280;">This is an automated alert from your Sentinel DeFi Broadcast monitoring system.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send alert email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Sentinel DeFi Alerts <info@the3rdeyeadvisors.com>',
      to: ['3rdeyeadvisors@gmail.com'],
      subject: '⚠️ Sentinel DeFi Broadcast Issue Detected',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending alert email:', emailError);
      throw emailError;
    }

    console.log('Alert email sent successfully:', emailData);

    // Update alert record
    const { error: updateError } = await supabase
      .from('broadcast_alerts')
      .update({
        alert_sent: true,
        alert_sent_at: new Date().toISOString(),
      })
      .eq('id', payload.alert_id);

    if (updateError) {
      console.error('Error updating alert record:', updateError);
    }

    // Log to email_logs
    await supabase.from('email_logs').insert({
      email_type: 'broadcast_alert',
      recipient_email: '3rdeyeadvisors@gmail.com',
      edge_function_name: 'send-broadcast-alert',
      status: 'sent',
      related_id: payload.alert_id,
      metadata: { alert_type: payload.alert_type },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-broadcast-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

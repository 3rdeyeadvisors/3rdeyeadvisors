import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const alert_id = url.searchParams.get('alert_id');

    if (!alert_id) {
      return new Response(
        JSON.stringify({ error: 'Missing alert_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the alert details
    const { data: alert, error: alertError } = await supabase
      .from('broadcast_alerts')
      .select('*')
      .eq('id', alert_id)
      .single();

    if (alertError || !alert) {
      console.error('Error fetching alert:', alertError);
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Retrying broadcast from alert:', alert_id);

    // Retry the broadcast by calling the 3ea-broadcast function
    const { data: retryData, error: retryError } = await supabase.functions.invoke('3ea-broadcast', {
      body: alert.failed_payload,
    });

    if (retryError) {
      console.error('Retry failed:', retryError);
      
      // Update retry count
      await supabase
        .from('broadcast_alerts')
        .update({ retry_count: alert.retry_count + 1 })
        .eq('id', alert_id);

      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 2px solid #c00; padding: 20px; border-radius: 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Retry Failed</h1>
            <p><strong>Error:</strong> ${retryError.message}</p>
            <p>The broadcast could not be retried at this time. Please check the admin dashboard for more details.</p>
            <a href="https://sentineldefi.com/admin" class="button">View Admin Dashboard</a>
          </div>
        </body>
        </html>`,
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Mark alert as resolved
    await supabase
      .from('broadcast_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        retry_count: alert.retry_count + 1,
      })
      .eq('id', alert_id);

    console.log('Broadcast retried successfully:', retryData);

    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { background: #efe; border: 2px solid #0a0; padding: 20px; border-radius: 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Broadcast Retried Successfully</h1>
          <p>The broadcast has been successfully queued and will be sent at the scheduled time.</p>
          <p><strong>Scheduled for:</strong> ${retryData.scheduled_for}</p>
          <a href="https://sentineldefi.com/admin" class="button">View Admin Dashboard</a>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('Error in retry-broadcast:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

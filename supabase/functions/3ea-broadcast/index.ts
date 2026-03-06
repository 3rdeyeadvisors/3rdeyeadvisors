import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastPayload {
  day_type: 'monday' | 'wednesday' | 'friday';
  subject_line: string;
  intro_text: string;
  market_block: string;
  cta_link: string;
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

    const payload: BroadcastPayload = await req.json();
    console.log('Received broadcast content:', payload);

    // Validate payload and detect missing fields
    const requiredFields = ['day_type', 'subject_line', 'intro_text', 'market_block'];
    const missingFields = requiredFields.filter(field => !payload[field as keyof BroadcastPayload]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      
      // Log alert
      const { data: alert } = await supabase
        .from('broadcast_alerts')
        .insert({
          alert_type: 'missing_field',
          severity: 'error',
          error_message: `Missing required fields: ${missingFields.join(', ')}`,
          failed_payload: payload,
          missing_fields: missingFields,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      // Send alert email
      if (alert) {
        await supabase.functions.invoke('send-broadcast-alert', {
          body: {
            alert_id: alert.id,
            alert_type: alert.alert_type,
            severity: alert.severity,
            error_message: alert.error_message,
            failed_payload: payload,
            missing_fields: missingFields,
            timestamp: alert.timestamp,
          },
        });
      }

      return new Response(
        JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missing_fields: missingFields 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine next scheduled date based on day_type
    const now = new Date();
    const daysOfWeek = { monday: 1, wednesday: 3, friday: 5 };
    const targetDay = daysOfWeek[payload.day_type];
    
    let scheduledDate = new Date(now);
    scheduledDate.setHours(9, 0, 0, 0); // 9 AM
    
    // Find next occurrence of target day
    const currentDay = now.getDay();
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Schedule for next week
    }
    scheduledDate.setDate(scheduledDate.getDate() + daysUntilTarget);

    // Store in queue
    const { data, error } = await supabase
      .from('broadcast_email_queue')
      .insert({
        day_type: payload.day_type,
        subject_line: payload.subject_line,
        intro_text: payload.intro_text,
        market_block: payload.market_block,
        cta_link: payload.cta_link || 'https://sentineldefi.online',
        scheduled_for: scheduledDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing broadcast content:', error);
      
      // Log queue failure alert
      const { data: alert } = await supabase
        .from('broadcast_alerts')
        .insert({
          alert_type: 'queue_failure',
          severity: 'error',
          error_message: `Failed to queue broadcast: ${error.message}`,
          failed_payload: payload,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      // Send alert email
      if (alert) {
        await supabase.functions.invoke('send-broadcast-alert', {
          body: {
            alert_id: alert.id,
            alert_type: alert.alert_type,
            severity: alert.severity,
            error_message: alert.error_message,
            failed_payload: payload,
            timestamp: alert.timestamp,
          },
        });
      }
      
      throw error;
    }

    console.log('Broadcast content stored successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Broadcast content queued successfully',
        scheduled_for: data.scheduled_for,
        id: data.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in 3ea-broadcast:', error);
    
    // Log webhook failure
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: alert } = await supabase
        .from('broadcast_alerts')
        .insert({
          alert_type: 'webhook_failure',
          severity: 'error',
          error_message: `Webhook processing failed: ${error.message}`,
          failed_payload: null,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (alert) {
        await supabase.functions.invoke('send-broadcast-alert', {
          body: {
            alert_id: alert.id,
            alert_type: alert.alert_type,
            severity: alert.severity,
            error_message: alert.error_message,
            timestamp: alert.timestamp,
          },
        });
      }
    } catch (alertError) {
      console.error('Error logging webhook failure:', alertError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

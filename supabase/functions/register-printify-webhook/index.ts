import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PRINTIFY_API_KEY = Deno.env.get('PRINTIFY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const WEBHOOK_SECRET = Deno.env.get('PRINTIFY_WEBHOOK_SECRET');
    
    if (!PRINTIFY_API_KEY) {
      throw new Error('PRINTIFY_API_KEY not configured');
    }

    if (!WEBHOOK_SECRET) {
      console.warn('PRINTIFY_WEBHOOK_SECRET not configured. Webhooks will be registered without a secret.');
    }

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(
      SUPABASE_URL!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Admin access required');
    }

    console.log('Fetching Printify shops...');

    // Get shop ID from Printify
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      const errorText = await shopsResponse.text();
      console.error('Failed to fetch shops:', errorText);
      throw new Error(`Failed to fetch Printify shops: ${shopsResponse.status}`);
    }

    const shops = await shopsResponse.json();
    console.log('Shops found:', shops.length);

    if (!shops || shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;
    console.log('Using shop ID:', shopId);

    // First, check existing webhooks
    const existingWebhooksResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/webhooks.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let existingWebhooks = [];
    if (existingWebhooksResponse.ok) {
      existingWebhooks = await existingWebhooksResponse.json();
      console.log('Existing webhooks:', JSON.stringify(existingWebhooks, null, 2));
    }

    // Our webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/printify-webhook`;

    // Check if our webhook already exists
    const existingWebhook = existingWebhooks.find(
      (wh: any) => wh.url === webhookUrl
    );

    if (existingWebhook) {
      console.log('Webhook already registered:', existingWebhook);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Webhook already registered',
          webhook: existingWebhook,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Register webhook for order events
    const webhookPayload = {
      topic: 'order:shipment:delivered',
      url: webhookUrl,
    };

    console.log('Registering webhook:', webhookPayload);

    // Register multiple webhooks for different events
    const events = [
      'order:created',
      'order:updated', 
      'order:shipment:created',
      'order:shipment:delivered',
    ];

    const registeredWebhooks = [];
    const errors = [];

    for (const topic of events) {
      // Check if this topic webhook already exists
      const topicExists = existingWebhooks.find(
        (wh: any) => wh.url === webhookUrl && wh.topic === topic
      );

      if (topicExists) {
        console.log(`Webhook for ${topic} already exists`);
        registeredWebhooks.push(topicExists);
        continue;
      }

      try {
        const response = await fetch(
          `https://api.printify.com/v1/shops/${shopId}/webhooks.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              topic,
              url: webhookUrl,
              secret: WEBHOOK_SECRET,
            }),
          }
        );

        if (response.ok) {
          const webhook = await response.json();
          console.log(`Registered webhook for ${topic}:`, webhook);
          registeredWebhooks.push(webhook);
        } else {
          const errorText = await response.text();
          console.error(`Failed to register ${topic}:`, errorText);
          errors.push({ topic, error: errorText });
        }
      } catch (err: unknown) {
        console.error(`Error registering ${topic}:`, err);
        errors.push({ topic, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Registered ${registeredWebhooks.length} webhooks`,
        webhooks: registeredWebhooks,
        errors: errors.length > 0 ? errors : undefined,
        shopId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error registering Printify webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_PIXEL_ID = 'D4P5GEBC77UAD0VSIV50';
const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

interface TikTokEventData {
  event: string;
  event_id?: string;
  timestamp?: string;
  user?: {
    email?: string;
    phone?: string;
    external_id?: string;
    ip?: string;
    user_agent?: string;
  };
  properties?: {
    currency?: string;
    value?: number;
    content_type?: string;
    content_id?: string;
    content_name?: string;
    quantity?: number;
  };
  page?: {
    url?: string;
    referrer?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.error('TIKTOK_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'TikTok access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventData: TikTokEventData = await req.json();
    console.log('Received TikTok conversion event:', eventData.event);

    // Build the TikTok Events API payload
    const payload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: eventData.event,
      event_id: eventData.event_id || crypto.randomUUID(),
      timestamp: eventData.timestamp || new Date().toISOString(),
      context: {
        user_agent: eventData.user?.user_agent || req.headers.get('user-agent') || '',
        ip: eventData.user?.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || '',
        page: {
          url: eventData.page?.url || '',
          referrer: eventData.page?.referrer || '',
        },
        user: {} as Record<string, string>,
      },
      properties: eventData.properties || {},
    };

    // Add hashed user data if available (TikTok requires SHA256 hashing)
    if (eventData.user?.email) {
      const encoder = new TextEncoder();
      const data = encoder.encode(eventData.user.email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      payload.context.user.email = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (eventData.user?.external_id) {
      const encoder = new TextEncoder();
      const data = encoder.encode(eventData.user.external_id);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      payload.context.user.external_id = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    console.log('Sending to TikTok Events API:', JSON.stringify(payload, null, 2));

    // Send to TikTok Events API
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify({
        data: [payload],
      }),
    });

    const result = await response.json();
    console.log('TikTok Events API response:', JSON.stringify(result, null, 2));

    if (!response.ok || result.code !== 0) {
      console.error('TikTok Events API error:', result);
      return new Response(
        JSON.stringify({ error: 'TikTok API error', details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: result.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing TikTok conversion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

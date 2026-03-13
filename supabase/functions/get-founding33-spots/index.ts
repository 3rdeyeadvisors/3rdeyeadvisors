import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOTAL_SPOTS = 33;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get spots remaining from database function
    const { data: remaining, error } = await supabaseClient.rpc('get_founding33_spots_remaining');

    if (error) {
      console.error("[GET-FOUNDING33-SPOTS] Error:", error.message);
      throw new Error("Unable to fetch spots data");
    }

    const claimed = TOTAL_SPOTS - remaining;

    console.log(`[GET-FOUNDING33-SPOTS] Total: ${TOTAL_SPOTS}, Claimed: ${claimed}, Remaining: ${remaining}`);

    return new Response(
      JSON.stringify({
        total: TOTAL_SPOTS,
        claimed,
        remaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("[GET-FOUNDING33-SPOTS] ERROR:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

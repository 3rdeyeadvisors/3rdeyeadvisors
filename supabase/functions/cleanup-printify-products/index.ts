import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Check admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roles) {
      throw new Error("Forbidden: Admin access required");
    }

    // Delete all Printify products EXCEPT "Decentralize Everything Tee (Unisex)"
    const { data, error } = await supabaseClient
      .from('printify_products')
      .delete()
      .neq('title', 'Decentralize Everything Tee (Unisex)');

    if (error) {
      console.error("Error deleting products:", error);
      throw error;
    }

    // Get remaining products
    const { data: remainingProducts, error: fetchError } = await supabaseClient
      .from('printify_products')
      .select('id, title, printify_id')
      .order('title');

    if (fetchError) {
      console.error("Error fetching remaining products:", fetchError);
    }

    console.log("Cleanup complete. Remaining products:", remainingProducts);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "All products deleted except Decentralize Everything Tee",
        remainingProducts: remainingProducts || []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error cleaning up products:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

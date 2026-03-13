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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { fileName, fileData } = await req.json();

    console.log(`Uploading file: ${fileName}`);

    // Decode base64 file data
    const fileBytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Upload to Supabase Storage in the resources bucket
    const { data, error } = await supabaseClient.storage
      .from("resources")
      .upload(fileName, fileBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from("resources")
      .getPublicUrl(fileName);

    console.log(`File uploaded successfully: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl,
        fileName,
        message: "File uploaded successfully to Supabase storage",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Upload function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

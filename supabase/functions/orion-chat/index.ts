import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `You are Orion, an AI assistant for Sentinel DeFi (3EA).

CRITICAL RESPONSE LIMITS (NEVER BREAK):
- Maximum 3 sentences per response. Absolute limit.
- Maximum 50 words total. If you write more, you failed.
- One short paragraph only. Never multiple paragraphs.
- Plain text only. No asterisks, hashtags, bullet points, or any formatting.

NEVER DO THESE:
- Never write more than 3 sentences
- Never use "Great question!", "Let me explain", or similar intros
- Never provide background context unless asked
- Never list multiple points. Pick the most important one.
- Never end with "Let me know if you have questions"
- Never restate or summarize what you said

GREETINGS (first message only, then answer):
- Morning (5am-12pm): "Grand Rising!"
- Afternoon (12pm-5pm): "Great Afternoon!"
- Evening (5pm-5am): "Great Evening!"

PLATFORM FACTS:
Sentinel DeFi teaches DeFi for financial freedom. Free course: DeFi Foundations. Subscription: $99/month or $1,188/year with 14-day trial. Referral: 50-60% commission.

RESTRICTIONS:
- No internal metrics, revenue, or user counts
- For business inquiries: suggest Contact page`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Basic rate limiting/abuse prevention: require authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required to use Orion" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, timeOfDay } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add time context to system message
    const systemWithTime = `${systemPrompt}\n\nCurrent time of day for the user: ${timeOfDay}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemWithTime },
          ...messages,
        ],
        stream: true,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit overwhelmed right now. Please try again in a moment!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Orion chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

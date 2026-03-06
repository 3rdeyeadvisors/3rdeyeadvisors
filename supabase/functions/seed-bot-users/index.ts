import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bot roster with personalities
const BOT_ROSTER = [
  // Aggressive learners (75-95% of leader)
  { name: "Marcus Chen", personality: "aggressive", maxPct: 95, bio: "DeFi enthusiast since 2019. Always learning." },
  { name: "Elena", personality: "aggressive", maxPct: 90, bio: "Former banker turned crypto believer." },
  { name: "David Park", personality: "aggressive", maxPct: 85, bio: "Building my Web3 knowledge one module at a time." },
  { name: "Priya", personality: "aggressive", maxPct: 80, bio: "Passionate about decentralized finance." },
  
  // Steady performers (55-75% of leader)
  { name: "James Wilson", personality: "steady", maxPct: 75, bio: "Taking it slow but steady in DeFi." },
  { name: "Sophia", personality: "steady", maxPct: 70, bio: "Learning crypto at my own pace." },
  { name: "Michael Thompson", personality: "steady", maxPct: 68, bio: "Just here to understand the future of finance." },
  { name: "Aisha Johnson", personality: "steady", maxPct: 65, bio: "Curious about blockchain technology." },
  { name: "Ryan", personality: "steady", maxPct: 60, bio: "Building knowledge for the long term." },
  { name: "Lisa Chen", personality: "steady", maxPct: 55, bio: "Step by step into Web3." },
  
  // Casual learners (30-55% of leader)
  { name: "Jordan", personality: "casual", maxPct: 52, bio: "Weekend crypto explorer." },
  { name: "Taylor Kim", personality: "casual", maxPct: 48, bio: "Learning when I can." },
  { name: "Alex Rivera", personality: "casual", maxPct: 45, bio: "Dipping my toes into DeFi." },
  { name: "Sam", personality: "casual", maxPct: 40, bio: "Curious newcomer." },
  { name: "Morgan Lee", personality: "casual", maxPct: 35, bio: "Just started my crypto journey." },
  { name: "Casey Brown", personality: "casual", maxPct: 32, bio: "Taking it easy, learning lots." },
  
  // Low activity (15-30% of leader)
  { name: "Chris Anderson", personality: "low_activity", maxPct: 28, bio: "Slow and steady." },
  { name: "Jamie", personality: "low_activity", maxPct: 22, bio: "Learning bit by bit." },
  { name: "Drew Mitchell", personality: "low_activity", maxPct: 18, bio: "New to all this." },
  { name: "Quinn", personality: "low_activity", maxPct: 15, bio: "Just getting started." },
];

// Avatar colors by personality type
const PERSONALITY_COLORS: Record<string, string> = {
  aggressive: "6366f1", // indigo
  steady: "8b5cf6",     // purple
  casual: "06b6d4",     // cyan
  low_activity: "64748b" // slate
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting bot seeding process...');
    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const bot of BOT_ROSTER) {
      try {
        // Create a unique email for the bot
        const sanitizedName = bot.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const botEmail = `bot-${sanitizedName}@internal.sentineldefi.online`;
        
        // Check if bot already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, user_id')
          .eq('display_name', bot.name)
          .eq('is_bot', true)
          .single();

        if (existingProfile) {
          console.log(`Bot ${bot.name} already exists, skipping...`);
          results.push({ name: bot.name, success: true, error: 'Already exists' });
          continue;
        }

        // Create auth user for the bot
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: botEmail,
          password: crypto.randomUUID(), // Random password they'll never use
          email_confirm: true,
          user_metadata: {
            display_name: bot.name,
            is_bot: true
          }
        });

        if (createError) {
          console.error(`Failed to create auth user for ${bot.name}:`, createError);
          results.push({ name: bot.name, success: false, error: createError.message });
          continue;
        }

        const userId = authData.user.id;
        const avatarColor = PERSONALITY_COLORS[bot.personality];
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=${avatarColor}&color=fff&size=128&bold=true`;

        // Update the profile (should be auto-created by trigger, but we'll update it)
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            display_name: bot.name,
            bio: bot.bio,
            avatar_url: avatarUrl,
            is_bot: true
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error(`Failed to update profile for ${bot.name}:`, profileError);
          results.push({ name: bot.name, success: false, error: profileError.message });
          continue;
        }

        // Create bot config entry
        const { error: configError } = await supabaseAdmin
          .from('bot_config')
          .insert({
            user_id: userId,
            personality_type: bot.personality,
            max_point_percentage: bot.maxPct
          });

        if (configError) {
          console.error(`Failed to create bot config for ${bot.name}:`, configError);
          results.push({ name: bot.name, success: false, error: configError.message });
          continue;
        }

        console.log(`Successfully created bot: ${bot.name}`);
        results.push({ name: bot.name, success: true });

      } catch (botError) {
        console.error(`Error creating bot ${bot.name}:`, botError);
        results.push({ name: bot.name, success: false, error: String(botError) });
      }
    }

    const successCount = results.filter(r => r.success && !r.error?.includes('Already exists')).length;
    const existingCount = results.filter(r => r.error?.includes('Already exists')).length;
    const failedCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Seeded ${successCount} new bots, ${existingCount} already existed, ${failedCount} failed`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in seed-bot-users:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

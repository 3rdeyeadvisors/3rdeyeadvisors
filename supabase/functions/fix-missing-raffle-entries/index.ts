import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to get admin key
    const body = await req.json();
    const adminKey = body.adminKey;

    // Verify admin key (you should set this as a secret)
    const expectedKey = Deno.env.get('ADMIN_SECRET_KEY');
    if (!expectedKey || adminKey !== expectedKey) {
      throw new Error('Invalid admin key');
    }

    // Create service role client for all operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Admin running missing entries fix');

    // Find all verified tasks that don't have corresponding entries
    const { data: verifiedTasks, error: taskError } = await supabaseAdmin
      .from('raffle_tasks')
      .select('id, user_id, raffle_id, task_type, verification_status')
      .eq('verification_status', 'verified')
      .eq('completed', true);

    if (taskError) throw taskError;

    console.log(`Found ${verifiedTasks?.length || 0} verified tasks`);

    const fixed = [];
    const tasksByUserRaffle = new Map<string, number>();

    // Count verified tasks per user per raffle
    for (const task of verifiedTasks || []) {
      const key = `${task.user_id}-${task.raffle_id}`;
      tasksByUserRaffle.set(key, (tasksByUserRaffle.get(key) || 0) + 1);
    }

    // Check each user/raffle combo
    for (const [key, taskCount] of tasksByUserRaffle.entries()) {
      const [userId, raffleId] = key.split('-');
      
      const { data: existingEntry } = await supabaseAdmin
        .from('raffle_entries')
        .select('entry_count')
        .eq('user_id', userId)
        .eq('raffle_id', raffleId)
        .maybeSingle();

      if (!existingEntry) {
        // Create missing entry
        const entryCount = taskCount * 2; // 2 tickets per verified task
        
        console.log(`Creating missing entry for user ${userId}: ${entryCount} tickets`);
        
        const { error: insertError } = await supabaseAdmin
          .from('raffle_entries')
          .insert({
            user_id: userId,
            raffle_id: raffleId,
            entry_count: entryCount,
          });

        if (insertError) {
          console.error(`Failed to create entry for ${userId}:`, insertError);
        } else {
          // Create individual tickets for each verified task
          for (let i = 0; i < taskCount; i++) {
            for (let j = 0; j < 2; j++) { // 2 tickets per task
              await supabaseAdmin
                .from('raffle_tickets')
                .insert({
                  user_id: userId,
                  raffle_id: raffleId,
                  ticket_source: 'verification',
                  metadata: { backfilled: true }
                });
            }
          }
          fixed.push({ userId, raffleId, entryCount });
        }
      }
    }

    console.log(`Fixed ${fixed.length} missing entries`);

    return new Response(
      JSON.stringify({ 
        success: true,
        fixed: fixed.length,
        details: fixed
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fixing missing entries:', error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

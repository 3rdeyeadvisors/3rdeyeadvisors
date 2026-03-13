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

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      throw new Error('User is not an admin');
    }

    const { taskIds, skipEmail } = await req.json();

    if (!taskIds || !Array.isArray(taskIds)) {
      throw new Error('taskIds must be an array');
    }

    console.log(`Admin ${user.email} marking ${taskIds.length} tasks as verified (skipEmail: ${skipEmail})`);

    // Update tasks - use service role to bypass RLS
    const { data: updatedTasks, error: updateError } = await supabaseAdmin
      .from('raffle_tasks')
      .update({
        verification_status: 'verified',
        completed: true,
        verified_at: new Date().toISOString(),
      })
      .in('id', taskIds)
      .select('id, user_id, task_type, raffle_id, instagram_username, x_username');

    if (updateError) {
      console.error('Error updating tasks:', updateError);
      throw updateError;
    }

    console.log(`Successfully updated ${updatedTasks?.length || 0} tasks`);

    // Update entry counts for each user
    if (updatedTasks && updatedTasks.length > 0) {
      for (const task of updatedTasks) {
        console.log(`Updating entry count for user: ${task.user_id}, raffle: ${task.raffle_id}`);
        
        // Use maybeSingle to avoid errors when no entry exists
        const { data: currentEntry, error: fetchError } = await supabaseAdmin
          .from('raffle_entries')
          .select('entry_count')
          .eq('raffle_id', task.raffle_id)
          .eq('user_id', task.user_id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching current entry:', fetchError);
        }

        const newEntryCount = (currentEntry?.entry_count || 0) + 2;
        console.log(`Current: ${currentEntry?.entry_count || 0}, New: ${newEntryCount}`);

        const { error: upsertError } = await supabaseAdmin
          .from('raffle_entries')
          .upsert({
            raffle_id: task.raffle_id,
            user_id: task.user_id,
            entry_count: newEntryCount,
          }, {
            onConflict: 'raffle_id,user_id'
          });

        if (upsertError) {
          console.error('Error upserting entry count:', upsertError);
          throw upsertError;
        }

        console.log(`✅ Successfully updated entry count to ${newEntryCount} for user ${task.user_id}`);

        // Create 2 individual tickets for verification (tracked separately)
        for (let i = 0; i < 2; i++) {
          const { error: ticketError } = await supabaseAdmin
            .from('raffle_tickets')
            .insert({
              user_id: task.user_id,
              raffle_id: task.raffle_id,
              ticket_source: 'verification',
              task_id: task.id,
              metadata: {
                task_type: task.task_type,
                username: task.task_type === 'instagram' ? task.instagram_username : task.x_username,
              }
            });

          if (ticketError) {
            console.error('❌ CRITICAL: Failed to create ticket for user', task.user_id, ticketError);
            throw new Error(`Failed to create raffle ticket: ${ticketError.message}`);
          }
        }
        console.log(`✅ Successfully created 2 tickets for user ${task.user_id}`);

        // Send verification email if not skipping
        if (!skipEmail) {
          try {
            const { data: raffleData } = await supabaseAdmin
              .from('raffles')
              .select('title')
              .eq('id', task.raffle_id)
              .single();

            const username = task.task_type === 'instagram' 
              ? task.instagram_username 
              : task.x_username;

            await supabaseAdmin.functions.invoke('send-social-verification-email', {
              body: {
                userId: task.user_id,
                taskType: task.task_type,
                username: username,
                raffleTitle: raffleData?.title || 'Raffle',
              },
            });
            console.log(`📧 Verification email sent to user ${task.user_id}`);
          } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the verification if email fails
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: updatedTasks?.length || 0,
        message: skipEmail ? 'Tasks marked as verified without sending emails' : 'Tasks verified and users notified'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in admin-mark-verified:', error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

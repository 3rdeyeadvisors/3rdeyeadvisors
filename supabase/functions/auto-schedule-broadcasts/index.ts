import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting auto-schedule broadcasts...');

    // Get current date in Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    
    // Calculate next Monday, Wednesday, Friday
    const nextDates: { day_type: string; date: Date }[] = [];
    
    for (let i = 1; i <= 14; i++) { // Look ahead 2 weeks
      const futureDate = new Date(centralTime);
      futureDate.setDate(centralTime.getDate() + i);
      const dayOfWeek = futureDate.getDay();
      
      if (dayOfWeek === 1) { // Monday
        nextDates.push({ day_type: 'monday', date: futureDate });
      } else if (dayOfWeek === 3) { // Wednesday
        nextDates.push({ day_type: 'wednesday', date: futureDate });
      } else if (dayOfWeek === 5) { // Friday
        nextDates.push({ day_type: 'friday', date: futureDate });
      }
    }

    console.log('Scheduling for dates:', nextDates);

    let created = 0;
    let skipped = 0;

    for (const { day_type, date } of nextDates) {
      const scheduledFor = date.toISOString().split('T')[0];
      
      // Check if entry already exists
      const { data: existing } = await supabase
        .from('broadcast_email_queue')
        .select('id')
        .eq('day_type', day_type)
        .eq('scheduled_for', scheduledFor)
        .single();

      if (existing) {
        console.log(`Entry already exists for ${day_type} on ${scheduledFor}`);
        skipped++;
        continue;
      }

      // Create placeholder entry (will be populated with live data when sent)
      const { error: insertError } = await supabase
        .from('broadcast_email_queue')
        .insert({
          day_type,
          scheduled_for: scheduledFor,
          subject_line: day_type === 'monday' ? 'Sentinel DeFi Market Pulse: Top Movers' :
                       day_type === 'wednesday' ? 'Sentinel DeFi Trends: What\'s Moving This Week' :
                       'Sentinel DeFi Learning Drop: DeFi Education',
          intro_text: day_type === 'monday' ? 'Top-performing DeFi tokens and their 24-hour metrics.' :
                      day_type === 'wednesday' ? 'Key trends shaping DeFi markets this week.' :
                      'This week\'s DeFi education highlight.',
          market_block: 'Live content will be generated at send time',
          cta_link: day_type === 'friday' ? 'https://sentineldefi.com/courses/defi-mastery' :
                    day_type === 'wednesday' ? 'https://sentineldefi.com/blog' :
                    'https://sentineldefi.com/courses'
        });

      if (insertError) {
        console.error(`Error creating entry for ${day_type} on ${scheduledFor}:`, insertError);
      } else {
        console.log(`Created entry for ${day_type} on ${scheduledFor}`);
        created++;
      }
    }

    console.log(`Auto-schedule complete: ${created} created, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        created,
        skipped,
        message: `Scheduled ${created} broadcasts, skipped ${skipped} existing entries`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in auto-schedule-broadcasts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

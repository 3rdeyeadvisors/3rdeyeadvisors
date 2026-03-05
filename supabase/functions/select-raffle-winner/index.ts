import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

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
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      throw new Error('User is not an admin');
    }

    const { raffle_id } = await req.json();
    const supabase = supabaseAdmin;

    console.log(`Selecting winner for raffle: ${raffle_id} triggered by ${user.email}`);

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffle_id)
      .single();

    if (raffleError || !raffle) throw new Error("Raffle not found");
    if (raffle.winner_user_id) throw new Error("Winner already selected");

    // Get all participants with entry counts
    const { data: entries, error: entriesError } = await supabase
      .from('raffle_entries')
      .select(`
        user_id,
        entry_count,
        profiles!inner(display_name)
      `)
      .eq('raffle_id', raffle_id)
      .gt('entry_count', 0);

    if (entriesError || !entries || entries.length === 0) {
      throw new Error("No valid entries found");
    }

    // Weighted random selection
    const totalEntries = entries.reduce((sum, e) => sum + e.entry_count, 0);
    let random = Math.random() * totalEntries;
    let winner = entries[0];

    for (const entry of entries) {
      random -= entry.entry_count;
      if (random <= 0) {
        winner = entry;
        break;
      }
    }

    console.log("Winner selected:", winner.user_id);

    // Update raffle with winner
    await supabase
      .from('raffles')
      .update({
        winner_user_id: winner.user_id,
        winner_selected_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', raffle_id);

    // Get winner email
    const { data: emailsData } = await supabase.rpc('get_user_emails_with_profiles');
    const winnerEmail = emailsData?.find((u: any) => u.user_id === winner.user_id);
    const winnerName = (winner.profiles as any)?.display_name || 'there';

    // Send winner notification
    await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [winnerEmail?.email || ''],
      subject: "🎉 YOU WON! Sentinel DeFi Raffle Winner",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; font-size: 48px; margin: 0;">🎉 CONGRATULATIONS! 🎉</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <h2 style="margin: 0 0 20px 0; color: white;">You Won the ${raffle.title}!</h2>
            <div style="font-size: 64px; margin: 20px 0;">🏆</div>
            <div style="font-size: 48px; font-weight: bold; margin: 20px 0;">$${raffle.prize_amount}</div>
            <p style="font-size: 24px; margin: 10px 0;">in ${raffle.prize}</p>
          </div>
          
          <p style="font-size: 18px; line-height: 1.6;">
            Hi ${winnerName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your dedication to learning DeFi has been rewarded! You are the official winner of our Learn-to-Earn Raffle.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            We'll contact you shortly with instructions on claiming your prize. Keep an eye on your inbox!
          </p>
          
          <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Thank you for being part of the Sentinel DeFi community. Keep learning, keep growing! 🌐
            </p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #8B5CF6;">
              Awareness is advantage.
            </p>
            <p style="font-size: 14px; color: #666;">
              — The Sentinel DeFi Team
            </p>
          </div>
        </div>
      `,
    });

    // Send participant notifications (background)
    const participants = entries.filter(e => e.user_id !== winner.user_id);
    for (const participant of participants) {
      const email = emailsData?.find((u: any) => u.user_id === participant.user_id)?.email;
      const name = (participant.profiles as any)?.display_name || 'there';
      
      if (email) {
        await resend.emails.send({
          from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
          to: [email],
          subject: "Raffle Results - Thank You for Participating!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #8B5CF6;">Thank You for Participating!</h1>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                The ${raffle.title} has concluded, and we've selected our winner!
              </p>
              
              <p style="font-size: 16px; line-height: 1.6;">
                While you weren't selected this time, your commitment to learning DeFi is what truly matters. Keep engaging with our courses and community — more raffles are coming!
              </p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  💡 <strong>Stay tuned:</strong> We'll announce our next Learn-to-Earn raffle soon!
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Thank you for being part of the Sentinel DeFi community.
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
                <p style="font-size: 18px; font-weight: bold; color: #8B5CF6;">
                  Keep learning. Keep growing.
                </p>
                <p style="font-size: 14px; color: #666;">
                  — Sentinel DeFi
                </p>
              </div>
            </div>
          `,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        winner_id: winner.user_id,
        winner_name: winnerName,
        total_participants: entries.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error selecting winner:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

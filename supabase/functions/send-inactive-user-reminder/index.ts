import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // TEMPORARILY DISABLED - Re-enable when ready
  console.log('Inactive user reminder is temporarily disabled');
  return new Response(
    JSON.stringify({ success: true, message: 'Function temporarily disabled', emailsSent: 0 }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );

  try {
    console.log('Starting inactive user reminder check...');
    
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    // Get all users with their last sign in time using admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    if (!users || users.length === 0) {
      console.log('No users found');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to process', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Filter users who haven't logged in for at least 2 days
    const inactiveUsers = users.filter(user => {
      if (!user.last_sign_in_at) return true; // Never logged in counts as inactive
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn < twoDaysAgo;
    });
    
    console.log(`Found ${inactiveUsers.length} users inactive for 2+ days`);
    
    if (inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All users are active', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Get profiles for display names
    const userIds = inactiveUsers.map(u => u.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
    
    // Check which users have already received this email recently (within 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: recentEmails } = await supabase
      .from('email_logs')
      .select('recipient_email')
      .eq('email_type', 'inactive_user_reminder')
      .gte('created_at', sevenDaysAgo.toISOString());
    
    const recentlySent = new Set(recentEmails?.map(e => e.recipient_email.toLowerCase()) || []);
    
    // Filter out users who received this email in the last 7 days
    const usersToEmail = inactiveUsers.filter(
      u => u.email && !recentlySent.has(u.email.toLowerCase())
    );
    
    console.log(`After deduplication: ${usersToEmail.length} users to email`);
    
    if (usersToEmail.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All inactive users already emailed recently', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    let emailsSent = 0;
    const errors: string[] = [];
    
    for (const user of usersToEmail) {
      if (!user.email) continue;
      
      const displayName = profileMap.get(user.id) || user.email.split('@')[0];
      const firstName = displayName.split(' ')[0] || 'there';
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
          to: [user.email],
          subject: "We miss you! Continue your DeFi journey 🚀",
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #020817; color: #fff; padding: 20px; border-radius: 12px;">
              <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 12px; margin-bottom: 24px; border: 1px solid #1e293b;">
                <h1 style="color: #3b82f6; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Sentinel DeFi</h1>
                <h2 style="color: #a78bfa; font-size: 20px; margin: 0;">Your Learning Journey Awaits</h2>
              </div>
              
              <p style="color: #e5e5e5; font-size: 18px; margin: 0 0 16px 0; line-height: 1.6;">
                Hey ${firstName}! 👋
              </p>
              
              <p style="color: #d4d4d4; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
                We noticed you haven't stopped by in a while. The DeFi space moves fast, and we've got fresh content waiting for you!
              </p>
              
              <div style="background: linear-gradient(135deg, #1e293b, #1e1b4b); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #334155;">
                <h3 style="color: #60a5fa; margin: 0 0 16px 0; font-size: 18px;">📚 What's New:</h3>
                <ul style="color: #d4d4d4; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong style="color: #60a5fa;">New Tutorials</strong> - Step-by-step guides on the latest DeFi protocols</li>
                  <li><strong style="color: #60a5fa;">Market Updates</strong> - Stay informed on what's happening in crypto</li>
                  <li><strong style="color: #60a5fa;">Community Discussions</strong> - Join conversations with fellow learners</li>
                  <li><strong style="color: #60a5fa;">Raffle Opportunities</strong> - Don't miss your chance to win prizes!</li>
                </ul>
              </div>
              
              <p style="color: #d4d4d4; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
                Just 10 minutes a day can make a huge difference in your DeFi knowledge. Ready to jump back in?
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://sentineldefi.com/courses" style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Continue Learning
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
                Questions or feedback? Just reply to this email!
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #1e293b;">
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
                You're receiving this because you have an account at sentineldefi.com
              </p>
            </div>
          `,
        });
        
        console.log(`Inactive reminder sent to ${user.email}:`, emailResponse);
        
        await supabase.from('email_logs').insert({
          email_type: 'inactive_user_reminder',
          recipient_email: user.email,
          status: 'sent',
          edge_function_name: 'send-inactive-user-reminder',
          metadata: { user_id: user.id, name: displayName, resend_id: emailResponse.data?.id }
        });
        
        emailsSent++;
        
        // Delay to respect Resend's rate limit (2 req/sec)
        await new Promise(resolve => setTimeout(resolve, 550));
        
      } catch (emailErr: any) {
        console.error(`Failed to send to ${user.email}:`, emailErr);
        errors.push(`${user.email}: ${emailErr.message}`);
        
        await supabase.from('email_logs').insert({
          email_type: 'inactive_user_reminder',
          recipient_email: user.email,
          status: 'failed',
          edge_function_name: 'send-inactive-user-reminder',
          error_message: emailErr.message
        });
      }
    }
    
    console.log(`Inactive user reminder complete. Sent ${emailsSent} emails.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        totalInactiveUsers: inactiveUsers.length,
        usersEmailed: usersToEmail.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Error in send-inactive-user-reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

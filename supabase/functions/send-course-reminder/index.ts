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

  try {
    console.log('Starting course reminder check...');
    
    // Find users who signed up between 23-25 hours ago (to catch within a window)
    const now = new Date();
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    
    // Get profiles created in that window
    const { data: recentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, created_at')
      .gte('created_at', twentyFiveHoursAgo.toISOString())
      .lte('created_at', twentyThreeHoursAgo.toISOString());
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    if (!recentProfiles || recentProfiles.length === 0) {
      console.log('No users in the 24-hour window to check');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to process', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Found ${recentProfiles.length} users to check`);
    
    const userIds = recentProfiles.map(p => p.user_id);
    
    // Check which users have started any course
    const { data: courseProgress, error: progressError } = await supabase
      .from('course_progress')
      .select('user_id')
      .in('user_id', userIds);
    
    if (progressError) {
      console.error('Error fetching course progress:', progressError);
      throw progressError;
    }
    
    const usersWithProgress = new Set(courseProgress?.map(cp => cp.user_id) || []);
    
    // Filter to users who haven't started any course
    const usersToRemind = recentProfiles.filter(p => !usersWithProgress.has(p.user_id));
    
    if (usersToRemind.length === 0) {
      console.log('All users in window have started courses');
      return new Response(
        JSON.stringify({ success: true, message: 'All users have started courses', emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`${usersToRemind.length} users haven't started a course yet`);
    
    // Get emails for these users
    const { data: userEmails, error: emailError } = await supabase
      .rpc('get_user_emails_with_profiles');
    
    if (emailError) {
      console.error('Error fetching user emails:', emailError);
      throw emailError;
    }
    
    const emailMap = new Map(userEmails?.map(u => [u.user_id, u.email]) || []);
    
    let emailsSent = 0;
    const errors: string[] = [];
    
    for (const user of usersToRemind) {
      const email = emailMap.get(user.user_id);
      if (!email) {
        console.log(`No email found for user ${user.user_id}`);
        continue;
      }
      
      const firstName = user.display_name?.split(' ')[0] || 'there';
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
          to: [email],
          subject: "Ready to start your DeFi journey? 🚀",
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: hsl(222, 84%, 4.9%); color: #fff; padding: 20px; border-radius: 12px;">
              <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; margin-bottom: 24px; border: 1px solid hsl(217, 32%, 15%);">
                <h1 style="color: hsl(217, 91%, 60%); font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Sentinel DeFi</h1>
                <h2 style="color: hsl(271, 91%, 75%); font-size: 20px; margin: 0;">Your DeFi Education Awaits</h2>
              </div>
              
              <p style="color: hsl(0, 0%, 90%); font-size: 18px; margin: 0 0 16px 0; line-height: 1.6;">
                Hey ${firstName}! 👋
              </p>
              
              <p style="color: hsl(0, 0%, 85%); font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
                We noticed you signed up yesterday but haven't started any courses yet. No worries – DeFi can feel overwhelming at first!
              </p>
              
              <div style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid hsl(217, 32%, 15%);">
                <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 16px 0; font-size: 18px;">🎓 Recommended Starting Points:</h3>
                <ul style="color: hsl(0, 0%, 85%); line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong style="color: hsl(217, 91%, 70%);">DeFi Foundations</strong> - Perfect for beginners, covers all the basics</li>
                  <li><strong style="color: hsl(217, 91%, 70%);">Wallet Setup Tutorial</strong> - Get your crypto wallet ready in minutes</li>
                  <li><strong style="color: hsl(217, 91%, 70%);">First DEX Swap</strong> - Learn to trade on decentralized exchanges</li>
                </ul>
              </div>
              
              <p style="color: hsl(0, 0%, 85%); font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
                Our courses are designed to take you from zero to confident in the DeFi space. Start with just 10 minutes today!
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://sentineldefi.com/courses" style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Start Learning Now
                </a>
              </div>
              
              <p style="color: hsl(215, 20%, 65%); font-size: 14px; margin: 24px 0 0 0; line-height: 1.6;">
                Questions? Just reply to this email – we're here to help!
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid hsl(217, 32%, 15%);">
              <p style="color: hsl(215, 20%, 65%); font-size: 12px; text-align: center; margin: 0;">
                You're receiving this because you signed up at sentineldefi.com
              </p>
            </div>
          `,
        });
        
        console.log(`Reminder email sent to ${email}:`, emailResponse);
        
        // Log the email
        await supabase.from('email_logs').insert({
          email_type: 'course_reminder',
          recipient_email: email,
          status: 'sent',
          edge_function_name: 'send-course-reminder',
          metadata: { user_id: user.user_id, name: user.display_name, resend_id: emailResponse.data?.id }
        });
        
        emailsSent++;
        
        // Delay to respect Resend's rate limit (2 req/sec)
        await new Promise(resolve => setTimeout(resolve, 550));
      } catch (emailErr: any) {
        console.error(`Failed to send reminder to ${email}:`, emailErr);
        errors.push(`${email}: ${emailErr.message}`);
        
        await supabase.from('email_logs').insert({
          email_type: 'course_reminder',
          recipient_email: email,
          status: 'failed',
          edge_function_name: 'send-course-reminder',
          error_message: emailErr.message
        });
      }
    }
    
    console.log(`Course reminder job complete. Sent ${emailsSent} emails.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        usersChecked: recentProfiles.length,
        usersWithoutProgress: usersToRemind.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Error in send-course-reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

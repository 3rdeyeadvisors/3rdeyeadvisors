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

interface NotificationPayload {
  table: string;
  record: {
    id: string;
    email: string;
    name?: string;
    display_name?: string;
    created_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log('Received notification payload:', payload);

    const { table, record } = payload;
    const email = record.email;
    const name = record.name || record.display_name || 'New User';
    const firstName = name.split(' ')[0] || 'there';
    
    // Determine the type of signup
    const signupType = table === 'subscribers' ? 'subscriber' : 'user signup';
    
    // Send appropriate email based on signup type
    if (table === 'subscribers') {
      console.log('Sending thank you email to subscriber:', email);
      try {
        const thankYouResponse = await fetch('https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/send-subscriber-thank-you', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (thankYouResponse.ok) {
          console.log('Thank you email triggered successfully');
        } else {
          console.error('Failed to trigger thank you email:', await thankYouResponse.text());
        }
      } catch (error) {
        console.error('Error triggering thank you email:', error);
      }
    } else if (table === 'profiles') {
      console.log('Sending welcome email to new user:', email);
      try {
        const welcomeResponse = await fetch('https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (welcomeResponse.ok) {
          console.log('Welcome email triggered successfully');
        } else {
          console.error('Failed to trigger welcome email:', await welcomeResponse.text());
        }
      } catch (error) {
        console.error('Error triggering welcome email:', error);
      }
    }
    
    // Send notification email
    const emailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: ["info@the3rdeyeadvisors.com"],
      subject: `New ${signupType === 'subscriber' ? 'Subscriber' : 'Signup'} - Sentinel DeFi Platform`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: hsl(222, 84%, 4.9%); color: #fff; padding: 20px; border-radius: 12px;">
          <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; margin-bottom: 24px; border: 1px solid hsl(217, 32%, 15%);">
            <h1 style="color: hsl(217, 91%, 60%); font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Sentinel DeFi</h1>
            <h2 style="color: hsl(271, 91%, 75%); font-size: 20px; margin: 0;">New ${signupType === 'subscriber' ? 'Subscriber' : 'User Signup'} Alert</h2>
          </div>
          
          <p style="color: hsl(0, 0%, 90%); font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
            A new ${signupType} has joined the Sentinel DeFi community! 🚀
          </p>
          
          <div style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid hsl(217, 32%, 15%);">
            <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 16px 0; font-size: 18px;">Details:</h3>
            <div style="color: hsl(0, 0%, 85%); line-height: 1.6;">
              <p style="margin: 8px 0;"><strong style="color: hsl(217, 91%, 70%);">Name:</strong> ${firstName}</p>
              <p style="margin: 8px 0;"><strong style="color: hsl(217, 91%, 70%);">Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong style="color: hsl(217, 91%, 70%);">Source:</strong> ${table}</p>
              <p style="margin: 8px 0;"><strong style="color: hsl(217, 91%, 70%);">Date:</strong> ${new Date(record.created_at).toLocaleString()}</p>
              <p style="margin: 8px 0;"><strong style="color: hsl(217, 91%, 70%);">User ID:</strong> ${record.id}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://supabase.com/dashboard/project/zapbkuaejvzpqerkkcnc" style="background: linear-gradient(45deg, hsl(217, 91%, 60%), hsl(271, 91%, 65%)); color: hsl(222, 84%, 4.9%); padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View in Dashboard
            </a>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid hsl(217, 32%, 15%);">
          <p style="color: hsl(215, 20%, 65%); font-size: 12px; text-align: center; margin: 0;">
            Automated notification from your Sentinel DeFi platform
          </p>
        </div>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for new ${signupType}`,
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-new-signup function:", error);

    // Log failed notification
    try {
      await supabase.from('email_logs').insert({
        email_type: 'notification',
        recipient_email: 'info@the3rdeyeadvisors.com',
        status: 'failed',
        edge_function_name: 'notify-new-signup',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log notification error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
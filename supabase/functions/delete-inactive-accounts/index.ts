import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INACTIVITY_DAYS = 30;

function generateDeletionEmail(userName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Removed - Sentinel DeFi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0f;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.3);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Sentinel DeFi
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(139, 92, 246, 0.8); text-transform: uppercase; letter-spacing: 2px;">
                DeFi Education Platform
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                Hello${userName ? ` ${userName}` : ''},
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                We're reaching out to let you know that your Sentinel DeFi account has been removed due to inactivity (30+ days without signing in).
              </p>
              
              <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #c4b5fd;">
                  <strong style="color: #a78bfa;">Why was my account removed?</strong><br><br>
                  We've recently upgraded our platform with new features, improved security, and enhanced learning experiences. As part of this upgrade, we've cleaned up inactive accounts to ensure the best experience for our active community members.
                </p>
              </div>
              
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                The good news? You can always create a new account and rejoin our DeFi education community. All our courses, tutorials, and resources are ready and waiting for you.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://sentineldefi.online/auth" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                      Create New Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                If you have any questions or need assistance, feel free to reach out to us at 
                <a href="mailto:info@the3rdeyeadvisors.com" style="color: #a78bfa; text-decoration: none;">info@the3rdeyeadvisors.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(139, 92, 246, 0.2);">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #94a3b8; text-align: center;">
                Thank you for being part of the Sentinel DeFi community.
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
                © ${new Date().getFullYear()} Sentinel DeFi. All rights reserved.<br>
                <a href="https://sentineldefi.online" style="color: #8b5cf6; text-decoration: none;">sentineldefi.online</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting inactive account deletion process...");

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Calculate the cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_DAYS);
    const cutoffDateISO = cutoffDate.toISOString();

    console.log(`Looking for users inactive since: ${cutoffDateISO}`);

    // Get all users from auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching users:", authError);
      throw authError;
    }

    const allUsers = authData.users || [];
    console.log(`Total users in system: ${allUsers.length}`);

    // Filter inactive users (last_sign_in_at older than 30 days OR null)
    const inactiveUsers = allUsers.filter((user) => {
      if (!user.last_sign_in_at) {
        // Never signed in
        return true;
      }
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn < cutoffDate;
    });

    console.log(`Found ${inactiveUsers.length} inactive users to process`);

    const results = {
      totalProcessed: 0,
      emailsSent: 0,
      accountsDeleted: 0,
      errors: [] as string[],
      processedUsers: [] as { email: string; name: string; status: string }[],
    };

    // Process each inactive user
    for (const user of inactiveUsers) {
      const userEmail = user.email;
      if (!userEmail) {
        console.log(`Skipping user ${user.id} - no email`);
        continue;
      }

      console.log(`Processing user: ${userEmail}`);
      results.totalProcessed++;

      try {
        // Get user profile for name
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        const userName = profile?.display_name || userEmail.split("@")[0];

        // Send deletion notification email
        const emailHtml = generateDeletionEmail(userName);

        const { error: emailError } = await resend.emails.send({
          from: "Sentinel DeFi <noreply@the3rdeyeadvisors.com>",
          to: [userEmail],
          subject: "Your Sentinel DeFi Account Has Been Removed",
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email to ${userEmail}:`, emailError);
          results.errors.push(`Email failed for ${userEmail}: ${emailError.message}`);
          results.processedUsers.push({ email: userEmail, name: userName, status: "email_failed" });
          continue; // Don't delete if email fails
        }

        console.log(`Email sent successfully to ${userEmail}`);
        results.emailsSent++;

        // Log email send
        await supabaseAdmin.from("email_logs").insert({
          email_type: "account_deletion_notification",
          recipient_email: userEmail,
          edge_function_name: "delete-inactive-accounts",
          status: "sent",
          related_id: user.id,
          metadata: { reason: "inactivity", days_inactive: INACTIVITY_DAYS },
        });

        // Delete user data from related tables
        console.log(`Deleting data for user ${user.id}...`);

        // Delete from raffle_tickets
        await supabaseAdmin.from("raffle_tickets").delete().eq("user_id", user.id);
        
        // Delete from raffle_entries
        await supabaseAdmin.from("raffle_entries").delete().eq("user_id", user.id);
        
        // Delete from raffle_tasks
        await supabaseAdmin.from("raffle_tasks").delete().eq("user_id", user.id);
        
        // Delete from course_progress
        await supabaseAdmin.from("course_progress").delete().eq("user_id", user.id);
        
        // Delete from user_purchases
        await supabaseAdmin.from("user_purchases").delete().eq("user_id", user.id);
        
        // Delete from user_trials
        await supabaseAdmin.from("user_trials").delete().eq("user_id", user.id);
        
        // Delete from user_badges
        await supabaseAdmin.from("user_badges").delete().eq("user_id", user.id);
        
        // Delete from user_presence
        await supabaseAdmin.from("user_presence").delete().eq("user_id", user.id);
        
        // Delete from quiz_attempts
        await supabaseAdmin.from("quiz_attempts").delete().eq("user_id", user.id);
        
        // Delete from comments
        await supabaseAdmin.from("comments").delete().eq("user_id", user.id);
        
        // Delete from ratings
        await supabaseAdmin.from("ratings").delete().eq("user_id", user.id);
        
        // Delete from discussions
        await supabaseAdmin.from("discussions").delete().eq("user_id", user.id);
        
        // Delete from discussion_replies
        await supabaseAdmin.from("discussion_replies").delete().eq("user_id", user.id);
        
        // Delete from referrals (as referrer or referred)
        await supabaseAdmin.from("referrals").delete().eq("referrer_id", user.id);
        await supabaseAdmin.from("referrals").delete().eq("referred_user_id", user.id);
        
        // Delete from wallet_addresses
        await supabaseAdmin.from("wallet_addresses").delete().eq("user_id", user.id);
        
        // Delete from vault_whitelist
        await supabaseAdmin.from("vault_whitelist").delete().eq("user_id", user.id);
        
        // Delete from user_roles
        await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);
        
        // Delete from profiles
        await supabaseAdmin.from("profiles").delete().eq("user_id", user.id);

        // Delete from subscribers table (using email since it's not user_id based)
        await supabaseAdmin.from("subscribers").delete().eq("email", userEmail);

        // Log to security audit
        await supabaseAdmin.from("security_audit_log").insert({
          event_type: "account_deleted_inactivity",
          user_id: user.id,
          details: {
            email: userEmail,
            name: userName,
            last_sign_in: user.last_sign_in_at,
            reason: "inactivity_30_days_platform_upgrade",
          },
        });

        // Finally, delete the auth user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
          console.error(`Failed to delete auth user ${userEmail}:`, deleteError);
          results.errors.push(`Delete failed for ${userEmail}: ${deleteError.message}`);
          results.processedUsers.push({ email: userEmail, name: userName, status: "delete_failed" });
        } else {
          console.log(`Successfully deleted user ${userEmail}`);
          results.accountsDeleted++;
          results.processedUsers.push({ email: userEmail, name: userName, status: "deleted" });
        }
      } catch (userError: any) {
        console.error(`Error processing user ${userEmail}:`, userError);
        results.errors.push(`Error for ${userEmail}: ${userError.message}`);
        results.processedUsers.push({ email: userEmail, name: userEmail, status: "error" });
      }
    }

    console.log("Deletion process complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.totalProcessed} inactive accounts`,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-inactive-accounts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

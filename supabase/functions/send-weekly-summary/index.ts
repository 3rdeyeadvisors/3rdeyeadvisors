import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

    console.log('Generating weekly broadcast summary...');

    // Calculate week range (Monday to Friday of current week)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Friday
    weekEnd.setHours(23, 59, 59, 999);

    // Get broadcasts scheduled this week
    const { data: broadcasts, error: broadcastsError } = await supabase
      .from('broadcast_email_queue')
      .select('*')
      .gte('scheduled_for', weekStart.toISOString().split('T')[0])
      .lte('scheduled_for', weekEnd.toISOString().split('T')[0])
      .order('scheduled_for', { ascending: true });

    if (broadcastsError) {
      console.error('Error fetching broadcasts:', broadcastsError);
      throw broadcastsError;
    }

    // Get total subscribers
    const { count: subscriberCount, error: subError } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    if (subError) {
      console.error('Error fetching subscriber count:', subError);
    }

    // Get email logs for this week
    const { data: emailLogs, error: logsError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('email_type', 'broadcast')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    if (logsError) {
      console.error('Error fetching email logs:', logsError);
    }

    // Get alerts for this week
    const { data: alerts, error: alertsError } = await supabase
      .from('broadcast_alerts')
      .select('*')
      .gte('timestamp', weekStart.toISOString())
      .lte('timestamp', weekEnd.toISOString());

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
    }

    // Calculate stats
    const totalScheduled = broadcasts?.length || 0;
    const totalSent = broadcasts?.filter(b => b.sent_at !== null).length || 0;
    const totalEmailsSent = emailLogs?.filter(e => e.status === 'sent').length || 0;
    const failuresCount = alerts?.filter(a => !a.resolved).length || 0;
    const successRate = totalScheduled > 0 ? (totalSent / totalScheduled * 100).toFixed(2) : '0.00';

    // Store summary in database
    const { data: summaryData, error: summaryError } = await supabase
      .from('broadcast_weekly_summary')
      .insert({
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        total_broadcasts_scheduled: totalScheduled,
        total_broadcasts_sent: totalSent,
        total_emails_sent: totalEmailsSent,
        total_subscribers: subscriberCount || 0,
        success_rate: parseFloat(successRate),
        failures_count: failuresCount,
        summary_sent: false,
      })
      .select()
      .single();

    if (summaryError) {
      console.error('Error storing summary:', summaryError);
    }

    // Generate broadcast details HTML
    const broadcastDetailsHtml = broadcasts?.map((broadcast, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px;">${['Monday', 'Wednesday', 'Friday'][index]}</td>
        <td style="padding: 12px;">${new Date(broadcast.scheduled_for).toLocaleDateString()}</td>
        <td style="padding: 12px;">${broadcast.subject_line}</td>
        <td style="padding: 12px;">
          ${broadcast.sent_at 
            ? `<span style="color: #10b981;">✅ Sent</span>` 
            : `<span style="color: #f59e0b;">⏳ Pending</span>`}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="padding: 12px; text-align: center;">No broadcasts this week</td></tr>';

    // Construct summary email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Sentinel DeFi Broadcast Weekly Summary</h1>
            <p style="margin: 10px 0 0 0;">Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${failuresCount === 0 && totalSent === 3 
              ? '<div style="text-align: center; margin: 20px 0;"><span class="success-badge">✅ All Broadcasts Sent Successfully!</span></div>'
              : failuresCount > 0 
              ? `<div style="background: #fee; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;"><strong>⚠️ ${failuresCount} Issue(s) Detected This Week</strong></div>`
              : ''}

            <h2>Weekly Performance</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${totalSent}/${totalScheduled}</div>
                <div class="stat-label">Broadcasts Sent</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${totalEmailsSent.toLocaleString()}</div>
                <div class="stat-label">Total Emails Delivered</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${(subscriberCount || 0).toLocaleString()}</div>
                <div class="stat-label">Active Subscribers</div>
              </div>
            </div>

            <h2>Broadcast Schedule</h2>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${broadcastDetailsHtml}
              </tbody>
            </table>

            ${alerts && alerts.length > 0 ? `
              <h2>Recent Issues</h2>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0;">
                <p><strong>${alerts.length} alert(s) logged this week.</strong></p>
                <p style="margin: 10px 0 0 0;">
                  <a href="https://sentineldefi.online/admin" style="color: #2563eb; text-decoration: none;">View details in Admin Dashboard →</a>
                </p>
              </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <h3>Next Steps</h3>
              <ul>
                <li>Review any unresolved alerts in your admin dashboard</li>
                <li>Monitor subscriber engagement metrics</li>
                <li>Prepare content for next week's broadcasts</li>
                <li>Check Make.com automation is still active and scheduled</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">Sentinel DeFi Broadcast Automation System</p>
            <p style="font-size: 12px; color: #9ca3af; margin: 10px 0 0 0;">Sent every Friday at 9:10 AM CST</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send summary email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Sentinel DeFi Reports <info@the3rdeyeadvisors.com>',
      to: ['3rdeyeadvisors@gmail.com'],
      subject: `📊 Sentinel DeFi Broadcast Weekly Summary - ${successRate}% Success Rate`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending summary email:', emailError);
      throw emailError;
    }

    console.log('Weekly summary email sent successfully:', emailData);

    // Mark summary as sent
    if (summaryData) {
      await supabase
        .from('broadcast_weekly_summary')
        .update({
          summary_sent: true,
          summary_sent_at: new Date().toISOString(),
        })
        .eq('id', summaryData.id);
    }

    // Log to email_logs
    await supabase.from('email_logs').insert({
      email_type: 'weekly_summary',
      recipient_email: '3rdeyeadvisors@gmail.com',
      edge_function_name: 'send-weekly-summary',
      status: 'sent',
      metadata: {
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        success_rate: successRate,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly summary sent successfully',
        stats: {
          totalScheduled,
          totalSent,
          totalEmailsSent,
          subscriberCount: subscriberCount || 0,
          successRate,
          failuresCount,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-weekly-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

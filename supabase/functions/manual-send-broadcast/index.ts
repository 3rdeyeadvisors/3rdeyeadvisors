import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      throw new Error('User is not an admin');
    }

    const { broadcast_id, apology_message } = await req.json();

    const supabase = supabaseAdmin;

    console.log(`Manual broadcast send for: ${broadcast_id} triggered by ${user.email}`);

    // Get broadcast
    const { data: broadcast, error: fetchError } = await supabase
      .from('broadcast_email_queue')
      .select('*')
      .eq('id', broadcast_id)
      .single();

    if (fetchError || !broadcast) {
      throw new Error('Broadcast not found');
    }

    // Fetch fresh crypto prices from CoinGecko
    console.log('Fetching fresh crypto prices...');
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,uniswap,aave&vs_currencies=usd&include_24hr_change=true');
    const prices = await priceResponse.json();
    
    console.log('Current prices:', prices);

    // Format prices with current data
    const formatChange = (change: number) => {
      const color = change >= 0 ? '#10b981' : '#ef4444';
      const sign = change >= 0 ? '+' : '';
      return `<span style='color: ${color};'>${sign}${change.toFixed(1)}%</span>`;
    };

    const freshMarketBlock = `<h3 style="color: #e5e7eb; margin-top: 0; margin-bottom: 15px;">Top Movers</h3><ul style="margin: 0; padding-left: 20px;"><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Ethereum (ETH)</strong>: <span style="color: #e5e7eb;">$${prices.ethereum.usd.toLocaleString()}</span> ${formatChange(prices.ethereum.usd_24h_change)}</li><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Uniswap (UNI)</strong>: <span style="color: #e5e7eb;">$${prices.uniswap.usd.toFixed(2)}</span> ${formatChange(prices.uniswap.usd_24h_change)}</li><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Aave (AAVE)</strong>: <span style="color: #e5e7eb;">$${prices.aave.usd.toFixed(2)}</span> ${formatChange(prices.aave.usd_24h_change)}</li></ul>`;

    console.log('Fresh market block:', freshMarketBlock);

    // Prepend apology message if provided
    const finalIntroText = apology_message 
      ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px; color: #991b1b;"><strong>Our Apologies:</strong> ${apology_message}</div>${broadcast.intro_text}`
      : broadcast.intro_text;

    // Get all subscribers (exclude bot accounts)
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, name')
      .not('email', 'ilike', 'bot-%@internal.3rdeyeadvisors.com');

    if (subscribersError || !subscribers || subscribers.length === 0) {
      throw new Error('No subscribers found');
    }

    console.log(`Sending to ${subscribers.length} subscribers`);

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${broadcast.subject_line}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #e5e5e5;
      background-color: #0a0a0a;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1a1a1a;
      border: 1px solid #2a2a2a;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 30px;
    }
    .intro {
      font-size: 16px;
      margin-bottom: 25px;
      color: #d1d5db;
    }
    .market-block {
      background-color: #0f172a;
      border-left: 4px solid #6366f1;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .cta a {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .footer {
      background-color: #0a0a0a;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
      border-top: 1px solid #2a2a2a;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
    .disclaimer {
      margin-top: 15px;
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sentinel DeFi</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">DeFi Education & Insights</p>
    </div>
    
    <div class="content">
      <div class="intro">
        ${finalIntroText}
      </div>
      
      <div class="market-block">
        ${freshMarketBlock}
      </div>
      
      <div class="cta">
        <a href="${broadcast.cta_link}">Learn More on Sentinel DeFi</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Sentinel DeFi</strong> | DeFi Education Platform</p>
      <p>
        <a href="https://sentineldefi.com">Visit Website</a> |
        <a href="https://sentineldefi.com/courses">View Courses</a>
      </p>
      <p class="disclaimer">
        Educational purposes only. Not financial advice.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send emails with rate limiting
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        const { error: sendError } = await resend.emails.send({
          from: 'Sentinel DeFi <info@the3rdeyeadvisors.com>',
          to: [subscriber.email],
          subject: broadcast.subject_line,
          html: emailHtml,
          tags: [
            { name: 'campaign', value: '3ea-broadcast-manual' },
            { name: 'broadcast_id', value: broadcast_id }
          ]
        });
        
        // Rate limit: wait 600ms between sends
        await new Promise(resolve => setTimeout(resolve, 600));

        if (sendError) {
          console.error(`Failed to send to ${subscriber.email}:`, sendError);
          failCount++;
          
          await supabase.from('email_logs').insert({
            email_type: '3ea-broadcast',
            edge_function_name: 'manual-send-broadcast',
            recipient_email: subscriber.email,
            status: 'failed',
            error_message: sendError.message,
            metadata: { broadcast_id: broadcast.id }
          });
        } else {
          successCount++;
          
          await supabase.from('email_logs').insert({
            email_type: '3ea-broadcast',
            edge_function_name: 'manual-send-broadcast',
            recipient_email: subscriber.email,
            status: 'sent',
            metadata: { broadcast_id: broadcast.id }
          });
        }
      } catch (error: any) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        failCount++;
      }
    }

    // Mark broadcast as sent
    await supabase
      .from('broadcast_email_queue')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', broadcast.id);

    console.log(`Manual broadcast complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Manual broadcast sent',
        sent: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in manual-send-broadcast:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

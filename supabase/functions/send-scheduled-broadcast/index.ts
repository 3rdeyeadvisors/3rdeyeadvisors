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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting scheduled broadcast check...');

    // Get current day and date in Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const dayOfWeek = centralTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const today = centralTime.toISOString().split('T')[0];

    // Map day number to day_type
    const dayTypeMap: { [key: number]: string } = {
      1: 'monday',
      3: 'wednesday',
      5: 'friday'
    };

    const dayType = dayTypeMap[dayOfWeek];

    // Only run on Mon/Wed/Fri
    if (!dayType) {
      console.log('Not a broadcast day, skipping...');
      return new Response(
        JSON.stringify({ message: 'Not a scheduled broadcast day' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking for ${dayType} broadcasts scheduled for ${today}`);

    // Get pending broadcast for today
    const { data: broadcasts, error: fetchError } = await supabase
      .from('broadcast_email_queue')
      .select('*')
      .eq('day_type', dayType)
      .eq('scheduled_for', today)
      .is('sent_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching broadcasts:', fetchError);
      throw fetchError;
    }

    if (!broadcasts || broadcasts.length === 0) {
      console.log('No broadcast content found for today, skipping send');
      return new Response(
        JSON.stringify({ message: 'No broadcast content available for today' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const broadcast = broadcasts[0];
    console.log('Found broadcast:', broadcast);

    // Fetch live content based on day type
    let marketBlockContent = '';
    let introText = broadcast.intro_text;
    let subjectLine = broadcast.subject_line;

    if (dayType === 'monday') {
      // Monday: Fetch live crypto prices from CoinGecko
      console.log('Fetching live crypto prices for Monday Market Movers...');
      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,uniswap,aave&vs_currencies=usd&include_24hr_change=true');
        const prices = await priceResponse.json();
        
        console.log('Current prices:', prices);

        const formatChange = (change: number) => {
          const color = change >= 0 ? '#10b981' : '#ef4444';
          const sign = change >= 0 ? '+' : '';
          return `<span style='color: ${color};'>${sign}${change.toFixed(1)}%</span>`;
        };

        marketBlockContent = `<h3 style="color: #e5e7eb; margin-top: 0; margin-bottom: 15px;">Top Movers</h3><ul style="margin: 0; padding-left: 20px;"><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Ethereum (ETH)</strong>: <span style="color: #e5e7eb;">$${prices.ethereum.usd.toLocaleString()}</span> ${formatChange(prices.ethereum.usd_24h_change)}</li><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Uniswap (UNI)</strong>: <span style="color: #e5e7eb;">$${prices.uniswap.usd.toFixed(2)}</span> ${formatChange(prices.uniswap.usd_24h_change)}</li><li style="color: #e5e7eb; margin-bottom: 10px;"><strong style="color: #f3f4f6;">Aave (AAVE)</strong>: <span style="color: #e5e7eb;">$${prices.aave.usd.toFixed(2)}</span> ${formatChange(prices.aave.usd_24h_change)}</li></ul>`;
        
        subjectLine = 'Sentinel DeFi Market Pulse: Top Movers';
        introText = "Here are this week's top-performing DeFi tokens and their 24-hour performance metrics.";
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        marketBlockContent = broadcast.market_block; // Fallback to stored content
      }
    } else if (dayType === 'wednesday') {
      // Wednesday: Generate DeFi trends using AI
      console.log('Generating live DeFi trends for Wednesday...');
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{
              role: 'user',
              content: 'Generate 3 current DeFi market trends for this week. Format as HTML with emoji icons, bold titles, and brief descriptions (2-3 sentences each). Focus on: TVL changes, cross-chain activity, gas fees, new protocols, or regulatory updates. Keep it professional and data-driven. Use <h3>, <p>, <strong> tags with dark theme colors.'
            }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          marketBlockContent = aiData.choices[0].message.content;
          subjectLine = 'Sentinel DeFi Trends: What\'s Moving This Week';
          introText = 'Key trends shaping DeFi markets this week.';
          console.log('Generated Wednesday trends:', marketBlockContent);
        } else {
          throw new Error('AI API failed');
        }
      } catch (error) {
        console.error('Error generating Wednesday trends:', error);
        marketBlockContent = broadcast.market_block; // Fallback to stored content
      }
    } else if (dayType === 'friday') {
      // Friday: Generate educational content using AI
      console.log('Generating educational content for Friday...');
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{
              role: 'user',
              content: 'Create educational DeFi content explaining one core concept (choose from: yield farming, liquidity pools, gas optimization, smart contract risks, staking, governance, MEV, or layer 2 solutions). Format as HTML with: 1) 📚 emoji header with concept name, 2) "What is it?" section, 3) "Key Takeaway" section, 4) "Pro Tip" section. Use <h3>, <p>, <strong> tags. Keep it clear and beginner-friendly. Use dark theme colors (#e5e7eb, #f3f4f6).'
            }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          marketBlockContent = aiData.choices[0].message.content;
          subjectLine = 'Sentinel DeFi Learning Drop: DeFi Education';
          introText = 'This week\'s DeFi education highlight you need to know.';
          console.log('Generated Friday education:', marketBlockContent);
        } else {
          throw new Error('AI API failed');
        }
      } catch (error) {
        console.error('Error generating Friday education:', error);
        marketBlockContent = broadcast.market_block; // Fallback to stored content
      }
    }

    console.log('Final market block content:', marketBlockContent);

    // Get all subscribers (exclude bot accounts)
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, name')
      .not('email', 'ilike', 'bot-%@internal.3rdeyeadvisors.com');

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found');
      return new Response(
        JSON.stringify({ message: 'No subscribers to send to' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending to ${subscribers.length} subscribers`);

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectLine}</title>
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
    .cta a:hover {
      transform: translateY(-2px);
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
        ${introText}
      </div>
      
      <div class="market-block">
        ${marketBlockContent}
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
          subject: subjectLine,
          html: emailHtml,
          tags: [
            { name: 'campaign', value: '3ea-broadcast' },
            { name: 'day_type', value: broadcast.day_type }
          ]
        });
        
        // Rate limit: wait 600ms between sends to stay under 2/second
        await new Promise(resolve => setTimeout(resolve, 600));

        if (sendError) {
          console.error(`Failed to send to ${subscriber.email}:`, sendError);
          failCount++;
          
          // Log email send failure
          await supabase.from('email_logs').insert({
            email_type: '3ea-broadcast',
            edge_function_name: 'send-scheduled-broadcast',
            recipient_email: subscriber.email,
            status: 'failed',
            error_message: sendError.message,
            metadata: { broadcast_id: broadcast.id, day_type: broadcast.day_type }
          });
        } else {
          successCount++;
          
          // Log email send success
          await supabase.from('email_logs').insert({
            email_type: '3ea-broadcast',
            edge_function_name: 'send-scheduled-broadcast',
            recipient_email: subscriber.email,
            status: 'sent',
            metadata: { broadcast_id: broadcast.id, day_type: broadcast.day_type }
          });
        }
      } catch (error: any) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        failCount++;
      }
    }

    // Mark broadcast as sent
    const { error: updateError } = await supabase
      .from('broadcast_email_queue')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', broadcast.id);

    if (updateError) {
      console.error('Error marking broadcast as sent:', updateError);
    }

    console.log(`Broadcast complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Broadcast sent successfully',
        sent: successCount,
        failed: failCount,
        broadcast_id: broadcast.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-scheduled-broadcast:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

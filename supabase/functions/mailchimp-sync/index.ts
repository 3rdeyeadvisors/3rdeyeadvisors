import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

// Using crypto module for MD5 hashing

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MailchimpPayload {
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

  let payload: MailchimpPayload | null = null;

  try {
    payload = await req.json();
    console.log('Received Mailchimp sync payload:', payload);

    const { table, record } = payload;
    const email = record.email;
    const name = record.name || record.display_name || '';
    
    // Determine the tag based on table
    const tag = table === 'subscribers' ? 'Subscriber' : 'Signup';
    
    const mailchimpApiKey = Deno.env.get("Mailchimp_Key");
    if (!mailchimpApiKey) {
      throw new Error("Mailchimp API key not found");
    }

    // Extract datacenter from API key (format: key-dc)
    const datacenter = mailchimpApiKey.split('-')[1];
    if (!datacenter) {
      throw new Error("Invalid Mailchimp API key format");
    }

    const baseUrl = `https://${datacenter}.api.mailchimp.com/3.0`;
    
    // First, try to find or create the audience
    let audienceId = '';
    
    // Get all audiences to find 'Sentinel DeFi Subscribers'
    const audiencesResponse = await fetch(`${baseUrl}/lists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!audiencesResponse.ok) {
      throw new Error(`Failed to fetch audiences: ${audiencesResponse.statusText}`);
    }

    const audiencesData = await audiencesResponse.json();
    console.log('Found audiences:', audiencesData.lists?.length || 0);

    // Look for existing audience
    const existingAudience = audiencesData.lists?.find((list: any) => 
      list.name === 'Sentinel DeFi Subscribers'
    );

    if (existingAudience) {
      audienceId = existingAudience.id;
      console.log('Using existing audience:', audienceId);
    } else {
      // Create new audience
      console.log('Creating new audience: Sentinel DeFi Subscribers');
      const createAudienceResponse = await fetch(`${baseUrl}/lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mailchimpApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Sentinel DeFi Subscribers',
          contact: {
            company: 'Sentinel DeFi',
            address1: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US'
          },
          permission_reminder: 'You signed up for updates from Sentinel DeFi',
          campaign_defaults: {
            from_name: 'Sentinel DeFi',
            from_email: 'info@3rdeyeadvisors.com',
            subject: '',
            language: 'en'
          },
          email_type_option: true
        }),
      });

      if (!createAudienceResponse.ok) {
        const errorText = await createAudienceResponse.text();
        throw new Error(`Failed to create audience: ${createAudienceResponse.statusText} - ${errorText}`);
      }

      const newAudience = await createAudienceResponse.json();
      audienceId = newAudience.id;
      console.log('Created new audience:', audienceId);
    }

    // Add subscriber to audience
    const memberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: name ? { FNAME: name.split(' ')[0], LNAME: name.split(' ').slice(1).join(' ') || '' } : {},
      tags: [tag]
    };

    console.log('Adding member to audience:', email, 'with tag:', tag);

    const addMemberResponse = await fetch(`${baseUrl}/lists/${audienceId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    let memberResult;
    if (addMemberResponse.status === 400) {
      // Member might already exist, try to update instead
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase());
      const hashBuffer = await crypto.subtle.digest("MD5", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const emailHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('Member might exist, trying to update instead');
      const updateResponse = await fetch(`${baseUrl}/lists/${audienceId}/members/${emailHashHex}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${mailchimpApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...memberData,
          status: 'subscribed'
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update member: ${updateResponse.statusText} - ${errorText}`);
      }
      memberResult = await updateResponse.json();
    } else if (!addMemberResponse.ok) {
      const errorText = await addMemberResponse.text();
      throw new Error(`Failed to add member: ${addMemberResponse.statusText} - ${errorText}`);
    } else {
      memberResult = await addMemberResponse.json();
    }

    console.log("Member successfully added/updated in Mailchimp:", memberResult.email_address);

    // Log to email_logs table
    await supabase.from('email_logs').insert({
      email_type: 'mailchimp_sync',
      recipient_email: email,
      status: 'sent',
      edge_function_name: 'mailchimp-sync',
      related_id: record.id,
      metadata: {
        mailchimp_member_id: memberResult.id,
        tag: tag,
        audience_id: audienceId
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${email} to Mailchimp audience with tag: ${tag}`,
        memberId: memberResult.id 
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
    console.error("Error in mailchimp-sync function:", error);

    // Log failed sync (only if we successfully parsed the payload)
    if (payload) {
      try {
        await supabase.from('email_logs').insert({
          email_type: 'mailchimp_sync',
          recipient_email: payload.record.email,
          status: 'failed',
          edge_function_name: 'mailchimp-sync',
          related_id: payload.record.id,
          error_message: error.message
        });
      } catch (logError) {
        console.error('Failed to log Mailchimp sync error:', logError);
      }
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
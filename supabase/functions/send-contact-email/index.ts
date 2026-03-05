import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Input validation functions
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s'-]+$/.test(name);
};

const validateSubject = (subject: string): boolean => {
  return subject.length >= 5 && subject.length <= 200;
};

const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 2000;
};

// Rate limiting function
const checkRateLimit = async (email: string, ipAddress: string): Promise<boolean> => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  try {
    // Check submissions in the last hour for this email or IP
    const { data: recentSubmissions, error } = await supabase
      .from('contact_submissions')
      .select('id')
      .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
      .gte('submitted_at', oneHourAgo.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail safe - deny if we can't check
    }

    return (recentSubmissions?.length || 0) < 3; // Max 3 submissions per hour
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received contact form request:", JSON.stringify({ email: req.headers.get('content-type'), method: req.method }));
    const { name, email, subject, message }: ContactFormRequest = await req.json();
    console.log("Parsed form data:", { name: name?.substring(0, 10), email: email?.substring(0, 15), hasSubject: !!subject, hasMessage: !!message });

    // Input validation
    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid email address" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!validateName(name)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Invalid name format" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!validateSubject(subject)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Subject must be between 5 and 200 characters" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!validateMessage(message)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Message must be between 10 and 2000 characters" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limiting
    const canSubmit = await checkRateLimit(email, clientIP);
    if (!canSubmit) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Too many submissions. Please try again later." 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize inputs for display
    const sanitizedName = sanitizeInput(name);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);

    // Record the submission
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        email,
        name: sanitizedName,
        subject: sanitizedSubject,
        ip_address: clientIP
      });

    if (insertError) {
      console.error('Error recording submission:', insertError);
      // Continue anyway - don't fail the email send for this
    }

    // Send email to info
    const supportEmailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: ["info@the3rdeyeadvisors.com"],
      subject: `Contact Form: ${sanitizedSubject}`,
      tags: [
        { name: 'category', value: 'contact_form' }
      ],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <style type="text/css">
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #030717;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #030717;" bgcolor="#030717">
            <tr>
              <td align="center" style="padding: 20px; background-color: #030717;" bgcolor="#030717">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <tr>
                    <td style="padding: 24px; background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%);">
                      <h2 style="color: hsl(217, 91%, 60%); margin: 0 0 20px 0; font-size: 24px;">New Contact Form Submission</h2>
                      <p style="color: hsl(0, 0%, 90%); margin: 12px 0;"><strong style="color: hsl(217, 91%, 70%);">From:</strong> ${sanitizedName} (${email})</p>
                      <p style="color: hsl(0, 0%, 90%); margin: 12px 0;"><strong style="color: hsl(217, 91%, 70%);">Subject:</strong> ${sanitizedSubject}</p>
                      <p style="color: hsl(0, 0%, 90%); margin: 16px 0 8px 0;"><strong style="color: hsl(217, 91%, 70%);">Message:</strong></p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: hsl(217, 32%, 10%); border-radius: 8px; border: 1px solid hsl(217, 32%, 15%); margin: 10px 0;">
                        <tr>
                          <td style="padding: 16px; color: hsl(0, 0%, 85%);">
                            ${sanitizedMessage.replace(/\n/g, '<br>')}
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid hsl(217, 32%, 15%); margin: 24px 0 0 0;">
                        <tr>
                          <td style="padding-top: 24px;">
                            <p style="font-size: 12px; color: hsl(215, 20%, 65%); margin: 0;">
                              This email was sent from the Sentinel DeFi contact form.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Sentinel DeFi <info@the3rdeyeadvisors.com>",
      to: [email],
      subject: "We received your message!",
      tags: [
        { name: 'category', value: 'contact_confirmation' }
      ],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <style type="text/css">
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #030717;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #030717;" bgcolor="#030717">
            <tr>
              <td align="center" style="padding: 0; background-color: #030717;" bgcolor="#030717">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <tr>
                    <td style="padding: 32px 20px;">
                      
                      <!-- Header -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 8%), hsl(217, 32%, 6%)); border-radius: 12px; border: 1px solid hsl(217, 32%, 15%);">
                        <tr>
                          <td style="text-align: center; padding: 48px 24px;">
                            <h1 style="color: hsl(217, 91%, 60%); font-size: 36px; margin: 0 0 8px 0; font-weight: 700; text-shadow: 0 0 24px hsla(217, 91%, 60%, 0.4);">Sentinel DeFi</h1>
                            <p style="color: hsl(271, 91%, 75%); font-size: 18px; margin: 0;">Message Received</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Spacer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 32px; line-height: 32px;"></td></tr></table>

                      <!-- Content -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <h2 style="color: hsl(217, 91%, 70%); font-size: 24px; margin: 0 0 16px 0;">Thank you for contacting us, ${sanitizedName}!</h2>
                            <p style="color: #F5F5F5; margin: 0 0 16px 0; line-height: 1.6;">We have received your message regarding: <strong style="color: #FFFFFF;">${sanitizedSubject}</strong></p>
                            <p style="color: #F5F5F5; margin: 0 0 24px 0; line-height: 1.6;">We typically respond within 24 hours during weekdays. For urgent matters, we'll prioritize your inquiry.</p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, hsl(217, 32%, 10%), hsl(217, 32%, 12%)); border-radius: 8px; border: 1px solid hsl(217, 32%, 15%); margin: 20px 0;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h3 style="color: hsl(217, 91%, 70%); margin: 0 0 12px 0; font-size: 16px;">Your Message:</h3>
                                  <p style="color: hsl(0, 0%, 85%); margin: 0; line-height: 1.6;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #F5F5F5; margin: 24px 0 8px 0; line-height: 1.6;">Thank you for your patience as we work to support your journey toward financial consciousness.</p>
                            <p style="color: #F5F5F5; margin: 0; line-height: 1.6;">Best regards,<br><strong style="color: hsl(217, 91%, 70%);">The Sentinel DeFi Team</strong></p>
                          </td>
                        </tr>
                      </table>

                      <!-- Spacer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height: 24px; line-height: 24px;"></td></tr></table>
                      
                      <!-- Footer -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid hsl(217, 32%, 15%);">
                        <tr>
                          <td style="text-align: center; padding-top: 24px;">
                            <p style="color: hsl(215, 20%, 65%); font-size: 12px; margin: 0;">
                              This is an automated response from Sentinel DeFi.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // Log successful submission without exposing sensitive data
    console.log("Contact form submission processed for:", email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error?.message || 'Unknown error');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "An error occurred while processing your request. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
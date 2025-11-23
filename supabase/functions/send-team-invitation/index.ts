import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  organizationName: string;
  role: string;
  invitedByName: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, organizationName, role, invitedByName, appUrl }: InvitationEmailRequest = await req.json();

    console.log(`Sending team invitation to ${email} for organization ${organizationName}`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Madison Studio <onboarding@resend.dev>",
        to: [email],
        subject: `You've been invited to join ${organizationName} on Madison Studio`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #2D2D2D; font-size: 24px; margin-bottom: 24px;">You've been invited to join ${organizationName}</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              ${invitedByName} has invited you to join <strong>${organizationName}</strong> on Madison Studio as a <strong>${role}</strong>.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Click the button below to accept your invitation and get started:
            </p>
            
            <a href="${appUrl}/auth" 
               style="display: inline-block; background-color: #C4A962; color: #2D2D2D; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 32px;">
              Accept Invitation
            </a>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 32px; padding-top: 32px; border-top: 1px solid #E5E5E5;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 16px;">
              This invitation will expire in 7 days.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await emailResponse.json();
    console.log("Team invitation email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending team invitation:", error);
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

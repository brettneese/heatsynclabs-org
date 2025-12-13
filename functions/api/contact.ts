interface ContactRequest {
  name: string;
  email: string;
  interests: string[];
  notes?: string;
  referredBy?: string;
}

interface Env {
  RESEND_API_KEY: string;
  CONTACT_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  try {
    // Parse request body
    const body: ContactRequest = await request.json();
    const { name, email, interests, notes, referredBy } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required' }),
        { status: 400, headers }
      );
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please select at least one interest' }),
        { status: 400, headers }
      );
    }

    // Check for required environment variables
    if (!env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers }
      );
    }

    const contactEmail = env.CONTACT_EMAIL || 'info@heatsynclabs.org';

    // Format interests for email
    const interestLabels: Record<string, string> = {
      'classes': 'Learning about classes',
      'connect-member': 'Connecting with a member',
      'email-updates': 'Receiving occasional email updates',
    };

    const formattedInterests = interests
      .map(interest => interestLabels[interest] || interest)
      .join('\n  • ');

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HeatSync Labs Website <noreply@heatsynclabs.org>',
        to: [contactEmail],
        reply_to: email,
        subject: `New Contact Form Submission from ${name.trim()}`,
        text: `
New contact form submission from the HeatSync Labs website:

Name: ${name.trim()}
Email: ${email.trim()}

Interests:
  • ${formattedInterests}
${referredBy && referredBy.trim() ? `\nReferred by: ${referredBy.trim()}` : ''}
${notes && notes.trim() ? `\nNotes:\n${notes.trim()}` : ''}

---
This message was sent via the contact form at heatsynclabs.org
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1918; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #a85a3c; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 24px; color: #1a1918; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; color: #3e3d3c; }
    .value { margin-top: 4px; }
    .interests { background: #f9f7f5; padding: 16px; border-radius: 4px; }
    .interests ul { margin: 8px 0 0 0; padding-left: 20px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #6b6866; font-size: 14px; color: #6b6866; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    
    <div class="field">
      <div class="label">Name</div>
      <div class="value">${escapeHtml(name.trim())}</div>
    </div>
    
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${escapeHtml(email.trim())}">${escapeHtml(email.trim())}</a></div>
    </div>
    
    <div class="field interests">
      <div class="label">Interests</div>
      <ul>
        ${interests.map(interest => `<li>${escapeHtml(interestLabels[interest] || interest)}</li>`).join('')}
      </ul>
    </div>
    ${referredBy && referredBy.trim() ? `
    <div class="field">
      <div class="label">Referred by</div>
      <div class="value">${escapeHtml(referredBy.trim())}</div>
    </div>
    ` : ''}
    ${notes && notes.trim() ? `
    <div class="field">
      <div class="label">Notes</div>
      <div class="value" style="white-space: pre-wrap;">${escapeHtml(notes.trim())}</div>
    </div>
    ` : ''}

    <div class="footer">
      This message was sent via the contact form at heatsynclabs.org
    </div>
  </div>
</body>
</html>
        `.trim(),
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send message. Please try again later.' }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Thank you! We\'ll be in touch soon.' }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}


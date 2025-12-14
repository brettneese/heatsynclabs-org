import { PROSPECTS_SEGMENT_ID, TOPICS, type InterestKey } from './config';

interface ContactRequest {
  name: string;
  email: string;
  interests: string[];
  notes?: string;
  referredBy?: string;
}

interface Env {
  RESEND_API_KEY: string;
}

type PagesFunction<T = unknown> = (context: { request: Request; env: T }) => Promise<Response>;

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

    // Parse name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    // Build properties object with metadata
    const properties: Record<string, string> = {
      interests: interests.join(','),
      source: 'website_contact_form',
      submitted_at: new Date().toISOString(),
    };

    if (referredBy && referredBy.trim()) {
      properties.referred_by = referredBy.trim();
    }

    if (notes && notes.trim()) {
      properties.notes = notes.trim();
    }

    // Create contact via Resend API
    const createContactResponse = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
        unsubscribed: false,
        properties,
      }),
    });

    if (!createContactResponse.ok) {
      const errorData = await createContactResponse.json();
      console.error('Resend create contact error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to submit. Please try again later.' }),
        { status: 500, headers }
      );
    }

    const contactData = await createContactResponse.json() as { id: string };
    const contactId = contactData.id;

    // Add contact to Prospects segment
    const segmentResponse = await fetch(
      `https://api.resend.com/contacts/${contactId}/segments/${PROSPECTS_SEGMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!segmentResponse.ok) {
      const errorData = await segmentResponse.json();
      console.error('Failed to add contact to Prospects segment:', errorData);
    }

    // Subscribe contact to topics based on interests
    const topicSubscriptions = interests
      .map(interest => {
        const topicId = TOPICS[interest as InterestKey];
        return topicId ? { id: topicId, subscription: 'opt_in' as const } : null;
      })
      .filter((topic) => topic !== null) as Array<{ id: string; subscription: string }>;

    if (topicSubscriptions.length > 0) {
      const topicsResponse = await fetch('https://api.resend.com/contacts/topics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contactId,
          topics: topicSubscriptions,
        }),
      });

      if (!topicsResponse.ok) {
        const errorData = await topicsResponse.json();
        console.error('Failed to update contact topics:', errorData);
      }
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

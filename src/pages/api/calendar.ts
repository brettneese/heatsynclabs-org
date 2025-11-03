import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const { timeMin, timeMax, maxResults = '50' } = Object.fromEntries(url.searchParams);

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;
    const CALENDAR_ID = import.meta.env.CALENDAR_ID;

    if (!GOOGLE_API_KEY || !CALENDAR_ID) {
      return new Response(
        JSON.stringify({
          error: 'Missing environment variables. Please set GOOGLE_API_KEY and CALENDAR_ID'
        }),
        { status: 500, headers }
      );
    }

    // Build the Google Calendar API URL
    const baseUrl = 'https://www.googleapis.com/calendar/v3/calendars';
    const calendarId = encodeURIComponent(CALENDAR_ID);

    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      orderBy: 'startTime',
      singleEvents: 'true',
      maxResults: maxResults,
    });

    if (timeMin) {
      params.append('timeMin', timeMin);
    }

    if (timeMax) {
      params.append('timeMax', timeMax);
    }

    const apiUrl = `${baseUrl}/${calendarId}/events?${params.toString()}`;

    // Make the request to Google Calendar API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      return new Response(
        JSON.stringify({
          error: `Google Calendar API error: ${data.error.message}`
        }),
        { status: 400, headers }
      );
    }

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error: any) {
    console.error('Calendar API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch calendar events',
        details: error.message
      }),
      { status: 500, headers }
    );
  }
};


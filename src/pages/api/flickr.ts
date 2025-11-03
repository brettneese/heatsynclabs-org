import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const { limit = '20' } = Object.fromEntries(url.searchParams);

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
    // Flickr API URL
    const flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=bec64c9c0f28889dc6e0c5ef7be3511f&user_id=60827818%40N07&tags=publish&format=rest';

    // Fetch data from Flickr API
    const response = await fetch(flickrUrl);
    const data = await response.text();

    return new Response(
      JSON.stringify({ contents: data }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Flickr API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Flickr photos',
        details: error.message
      }),
      { status: 500, headers }
    );
  }
};


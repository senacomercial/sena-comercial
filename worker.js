// Cloudflare Worker — Meta Conversions API proxy
// Variável de ambiente necessária: ACCESS_TOKEN (já adicionada como secret)
// Pixel ID hardcoded (não é sensível)

const PIXEL_ID = '1608769783530090';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const ip = request.headers.get('CF-Connecting-IP') ?? '';
      const ua = request.headers.get('User-Agent') ?? '';

      const events = (body.data || []).map(ev => ({
        ...ev,
        user_data: {
          ...ev.user_data,
          client_ip_address: ip,
          client_user_agent: ua,
        },
      }));

      const metaRes = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${env.ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: events }),
        }
      );

      const json = await metaRes.json();
      return new Response(JSON.stringify(json), {
        status: metaRes.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};

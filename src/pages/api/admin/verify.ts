import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token === 'xiaolongxia2024') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
};

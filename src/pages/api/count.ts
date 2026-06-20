import type { APIRoute } from 'astro';
import { incrementVisitorCount, getVisitorCount } from '../../utils/db';

export const GET: APIRoute = async () => {
  const count = await getVisitorCount();
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const POST: APIRoute = async () => {
  const count = await incrementVisitorCount();
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

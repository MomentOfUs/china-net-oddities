import type { APIRoute } from 'astro';
import { getSuggestions } from '../../utils/db';

export const GET: APIRoute = async () => {
  const suggestions = await getSuggestions();
  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

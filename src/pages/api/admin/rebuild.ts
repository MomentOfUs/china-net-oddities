import type { APIRoute } from 'astro';
import { exec } from 'node:child_process';

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== 'xiaolongxia2024') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    exec('pnpm build', (error, stdout, stderr) => {
      if (error) {
        console.error(`Rebuild process failed: ${error.message}`);
        return;
      }
      console.log(`Rebuild finished:\nstdout: ${stdout}\nstderr: ${stderr}`);
    });

    return new Response(JSON.stringify({ ok: true, message: 'Rebuild initiated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

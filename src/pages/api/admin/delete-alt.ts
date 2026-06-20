import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== 'xiaolongxia2024') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { slug, index } = body;
    if (!slug || index === undefined) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filename = `${slug}-avatar-alt-${index}.jpg`;
    const publicPath = path.resolve('public/images', filename);
    const distPath = path.resolve('dist/client/images', filename);

    let deleted = false;
    try {
      await fs.unlink(publicPath);
      deleted = true;
    } catch {}

    try {
      await fs.unlink(distPath);
      deleted = true;
    } catch {}

    if (deleted) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: '未找到备选图片文件' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

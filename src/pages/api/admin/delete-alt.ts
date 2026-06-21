import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { resolvePath, getAdminToken } from '../../../utils/pathHelper';

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== getAdminToken()) {
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

    const publicDir = resolvePath('public/images');
    const distDir = resolvePath('dist/client/images');

    const formats = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
    let deleted = false;

    for (const fmt of formats) {
      const filename = `${slug}-avatar-alt-${index}.${fmt}`;
      const publicPath = path.join(publicDir, filename);
      const distPath = path.join(distDir, filename);

      try {
        await fs.unlink(publicPath);
        deleted = true;
      } catch {}

      try {
        await fs.unlink(distPath);
        deleted = true;
      } catch {}
    }

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

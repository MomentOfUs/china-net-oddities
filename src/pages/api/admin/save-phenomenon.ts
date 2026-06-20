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
    const { slug, yamlContent } = body;

    if (!slug || !yamlContent) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 安全检查，防路径穿越
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: '无效的 Slug 格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dirPath = path.resolve('src/content/phenomenon');
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `${slug}.yaml`);
    await fs.writeFile(filePath, yamlContent, 'utf-8');

    return new Response(JSON.stringify({ ok: true }), {
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

import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async ({ url, request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== 'xiaolongxia2024') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: '缺少 slug 参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 严格验证 slug 防注入
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return new Response(JSON.stringify({ error: '非法的 slug 格式' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const filePath = path.resolve('src/content/phenomenon', `${slug}.yaml`);
  try {
    const yamlContent = await fs.readFile(filePath, 'utf-8');
    return new Response(JSON.stringify({ ok: true, yamlContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: '未找到该档案或读取失败' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

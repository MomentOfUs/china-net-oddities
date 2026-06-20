import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== 'xiaolongxia2024') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
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

    const filePath = path.resolve('src/content/phenomenon', `${slug}.yaml`);
    
    let yamlContent = '';
    try {
      yamlContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      return new Response(JSON.stringify({ error: '档案配置文件不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ yamlContent }), {
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

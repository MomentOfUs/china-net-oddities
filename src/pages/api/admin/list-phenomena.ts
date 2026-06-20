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

  const dir = path.resolve('src/content/phenomenon');
  try {
    const files = await fs.readdir(dir);
    const list = [];
    for (const file of files) {
      if (file.endsWith('.yaml')) {
        const slug = file.slice(0, -5);
        const filePath = path.join(dir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 使用正则多行匹配寻找以 title: 开头的行
        const match = content.match(/^title:\s*(['"]?)(.*?)\1\s*$/m);
        const title = match ? match[2].trim() : slug;
        
        list.push({ slug, title });
      }
    }
    
    // 按照字母顺序对列表进行简单排序
    list.sort((a, b) => a.slug.localeCompare(b.slug));

    return new Response(JSON.stringify({ ok: true, list }), {
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

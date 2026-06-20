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
    const dirPath = path.resolve('src/content/phenomenon');
    const files = await fs.readdir(dirPath);
    const list = [];

    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const slug = file.replace(/\.yaml$|\.yml$/, '');
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 正则提取 YAML 中的 title 字段
        const titleMatch = content.match(/^title:\s*(['"]?)(.*?)\1\s*$/m);
        const title = titleMatch ? titleMatch[2] : slug;
        
        list.push({ slug, title });
      }
    }

    // 按照 slug 进行字母表排序
    list.sort((a, b) => a.slug.localeCompare(b.slug));

    return new Response(JSON.stringify({ list }), {
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

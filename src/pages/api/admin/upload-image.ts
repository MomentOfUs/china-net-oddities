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
    const { slug, image, type } = body;

    if (!slug || !image) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new Response(JSON.stringify({ error: '图片格式错误，必须为base64' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    let filename = `${slug}-avatar.jpg`;
    
    const publicDir = path.resolve('public/images');
    const distDir = path.resolve('dist/client/images');

    if (type === 'avatar-alt') {
      let files: string[] = [];
      try {
        files = await fs.readdir(publicDir);
      } catch {}
      
      const pattern = new RegExp(`^${slug}-avatar-alt-(\\d+)\\.(jpg|jpeg|png|webp|svg)$`, 'i');
      const indexes = files
        .map(file => {
          const match = file.match(pattern);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((val): val is number => val !== null);
        
      let nextIndex = 1;
      while (indexes.includes(nextIndex)) {
        nextIndex++;
      }
      
      let ext = 'jpg';
      const mime = matches[1].toLowerCase();
      if (mime === 'image/png') ext = 'png';
      else if (mime === 'image/gif') ext = 'gif';
      else if (mime === 'image/svg+xml') ext = 'svg';
      else if (mime === 'image/webp') ext = 'webp';
      else if (mime === 'image/jpeg' || mime === 'image/jpg') ext = 'jpg';
      
      filename = `${slug}-avatar-alt-${nextIndex}.${ext}`;
    }

    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, filename), buffer);

    try {
      await fs.mkdir(distDir, { recursive: true });
      await fs.writeFile(path.join(distDir, filename), buffer);
    } catch {
      // 忽略编译产物目录可能不存在的情况
    }

    return new Response(JSON.stringify({ ok: true, url: `/images/${filename}` }), {
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

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
    const publicDir = resolvePath('public/images');
    const distDir = resolvePath('dist/client/images');
    
    // 确保两处目录存在
    await fs.mkdir(publicDir, { recursive: true });
    try {
      await fs.mkdir(distDir, { recursive: true });
    } catch {}

    // 提取真实的图片扩展名
    let ext = 'jpg';
    const mime = matches[1].toLowerCase();
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/gif') ext = 'gif';
    else if (mime === 'image/svg+xml') ext = 'svg';
    else if (mime === 'image/webp') ext = 'webp';
    else if (mime === 'image/jpeg' || mime === 'image/jpg') ext = 'jpg';

    let filename = '';

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
      
      filename = `${slug}-avatar-alt-${nextIndex}.${ext}`;
    } else {
      filename = `${slug}-avatar.${ext}`;
      
      // 清理可能存在的其它后缀的旧主头像
      const formats = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
      for (const fmt of formats) {
        if (fmt === ext) continue;
        try {
          await fs.unlink(path.join(publicDir, `${slug}-avatar.${fmt}`));
        } catch {}
        try {
          await fs.unlink(path.join(distDir, `${slug}-avatar.${fmt}`));
        } catch {}
      }

      // 同步更新 YAML 配置文件中的 avatar 字段
      const yamlPath = resolvePath('src/content/phenomenon', `${slug}.yaml`);
      try {
        let yamlContent = await fs.readFile(yamlPath, 'utf-8');
        const newAvatarUrl = `/images/${filename}`;
        if (yamlContent.match(/^avatar:\s*/m)) {
          yamlContent = yamlContent.replace(/^avatar:\s*.*$/m, `avatar: ${newAvatarUrl}`);
        } else {
          yamlContent = `avatar: ${newAvatarUrl}\n${yamlContent}`;
        }
        await fs.writeFile(yamlPath, yamlContent, 'utf-8');
      } catch (err) {
        console.error('Failed to update yaml avatar:', err);
      }
    }

    await fs.writeFile(path.join(publicDir, filename), buffer);

    try {
      await fs.writeFile(path.join(distDir, filename), buffer);
    } catch {
      // 忽略编译产物目录写入失败的情况
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

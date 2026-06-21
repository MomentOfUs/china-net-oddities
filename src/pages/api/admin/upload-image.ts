import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

function getExt(mime: string): string {
  const m = mime.toLowerCase();
  if (m === 'image/png') return 'png';
  if (m === 'image/gif') return 'gif';
  if (m === 'image/svg+xml') return 'svg';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/jpeg' || m === 'image/jpg') return 'jpg';
  return 'jpg';
}

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
    const ext = getExt(matches[1]);
    const publicDir = path.resolve('public/images');
    const distDir = path.resolve('dist/client/images');

    // === 头像替换：写入 avatars/ 目录 + 更新 YAML ===
    if (type === 'avatar') {
      const avatarFilename = `${slug}.${ext}`;
      const avatarDir = path.resolve('public/images/avatars');
      const avatarDistDir = path.resolve('dist/client/images/avatars');

      await fs.mkdir(avatarDir, { recursive: true });
      await fs.writeFile(path.join(avatarDir, avatarFilename), buffer);
      await fs.mkdir(avatarDistDir, { recursive: true });
      await fs.writeFile(path.join(avatarDistDir, avatarFilename), buffer);

      // 清理旧扩展名文件
      for (const oldExt of ['jpg', 'jpeg', 'png', 'webp', 'svg']) {
        if (oldExt !== ext) {
          for (const dir of [avatarDir, avatarDistDir]) {
            try { await fs.unlink(path.join(dir, `${slug}.${oldExt}`)); } catch {}
          }
        }
      }

      // 更新 YAML 中 avatar 字段（文本替换）
      const yamlPath = path.resolve('src/content/phenomenon', `${slug}.yaml`);
      try {
        let yamlText = await fs.readFile(yamlPath, 'utf-8');
        yamlText = yamlText.replace(/^avatar:.*$/m, `avatar: /images/avatars/${avatarFilename}`);
        await fs.writeFile(yamlPath, yamlText);
      } catch (err) {
        console.warn('更新 YAML avatar 字段失败:', err);
      }

      return new Response(JSON.stringify({ ok: true, url: `/images/avatars/${avatarFilename}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // === 备选图上传 ===
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
      while (indexes.includes(nextIndex)) nextIndex++;

      const filename = `${slug}-avatar-alt-${nextIndex}.${ext}`;
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, filename), buffer);
      try {
        await fs.mkdir(distDir, { recursive: true });
        await fs.writeFile(path.join(distDir, filename), buffer);
      } catch {}

      return new Response(JSON.stringify({ ok: true, url: `/images/${filename}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: '未知的 type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

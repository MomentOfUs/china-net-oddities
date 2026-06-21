import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
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

    const rawBuffer = Buffer.from(matches[2], 'base64');

    // === 头像替换：3:4 证件照裁剪 + 自动转 WebP + 更新 YAML ===
    if (type === 'avatar') {
      const ext = 'webp';
      const avatarFilename = `${slug}.${ext}`;
      const avatarDir = resolvePath('public/images/avatars');
      const avatarDistDir = resolvePath('dist/client/images/avatars');

      // 使用 sharp 优化裁剪，强锁 3:4 比例，尺寸限定在 360x480 并输出 webp
      const optimizedBuffer = await sharp(rawBuffer)
        .resize(360, 480, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();

      await fs.mkdir(avatarDir, { recursive: true });
      await fs.writeFile(path.join(avatarDir, avatarFilename), optimizedBuffer);
      
      try {
        await fs.mkdir(avatarDistDir, { recursive: true });
        await fs.writeFile(path.join(avatarDistDir, avatarFilename), optimizedBuffer);
      } catch {}

      // 清理以往可能存在的其它所有后缀的旧头像文件，防缓存污染
      const oldExtensions = ['jpg', 'jpeg', 'png', 'svg', 'gif'];
      for (const oldExt of oldExtensions) {
        for (const dir of [avatarDir, avatarDistDir]) {
          try {
            await fs.unlink(path.join(dir, `${slug}.${oldExt}`));
          } catch {}
        }
      }

      // 同步更新对应 YAML 配置文件中的 avatar 属性为最新 webp 路径
      const yamlPath = resolvePath('src/content/phenomenon', `${slug}.yaml`);
      try {
        let yamlText = await fs.readFile(yamlPath, 'utf-8');
        yamlText = yamlText.replace(/^avatar:.*$/m, `avatar: /images/avatars/${avatarFilename}`);
        await fs.writeFile(yamlPath, yamlText, 'utf-8');
      } catch (err) {
        console.warn('更新 YAML avatar 字段失败:', err);
      }

      return new Response(JSON.stringify({ ok: true, url: `/images/avatars/${avatarFilename}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // === 备选图上传：自动限宽 800px + 压缩为 WebP ===
    if (type === 'avatar-alt') {
      const publicDir = resolvePath('public/images');
      const distDir = resolvePath('dist/client/images');

      await fs.mkdir(publicDir, { recursive: true });
      
      let files: string[] = [];
      try {
        files = await fs.readdir(publicDir);
      } catch {}

      // 寻找可用的备选图序号
      const pattern = new RegExp(`^${slug}-avatar-alt-(\\d+)\\.(jpg|jpeg|png|webp|svg)$`, 'i');
      const indexes = files
        .map(file => {
          const match = file.match(pattern);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((val): val is number => val !== null);

      let nextIndex = 1;
      while (indexes.includes(nextIndex)) nextIndex++;

      const filename = `${slug}-avatar-alt-${nextIndex}.webp`;

      // 对备选图进行限宽 800px 缩放，并压缩为 webp，极大地降低带宽和磁盘占用
      const optimizedBuffer = await sharp(rawBuffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(path.join(publicDir, filename), optimizedBuffer);
      
      try {
        await fs.mkdir(distDir, { recursive: true });
        await fs.writeFile(path.join(distDir, filename), optimizedBuffer);
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

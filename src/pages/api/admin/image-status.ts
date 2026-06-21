import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import { resolvePath, verifyToken } from '../../../utils/pathHelper';

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (!token || !verifyToken(token)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const phenomenonDir = resolvePath('src/content/phenomenon');
    let slugList: string[] = [];
    try {
      const files = await fs.readdir(phenomenonDir);
      slugList = files
        .filter(f => f.endsWith('.yaml'))
        .map(f => f.replace(/\.yaml$/, ''))
        .sort();
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to read content' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const statusObj: Record<string, any> = {};

    const publicImagesDir = resolvePath('public/images');
    let imageFiles: string[] = [];
    try {
      await fs.mkdir(publicImagesDir, { recursive: true });
      imageFiles = await fs.readdir(publicImagesDir);
    } catch (e) {
      console.warn('public/images directory not found or empty', e);
    }

    for (const slug of slugList) {
      // 直接读 YAML 文件，避免 Astro getCollection 缓存
      let declaredAvatar = '';
      const yamlPath = resolvePath('src/content/phenomenon', `${slug}.yaml`);
      try {
        const yamlText = await fs.readFile(yamlPath, 'utf-8');
        const match = yamlText.match(/^avatar:\s*(.*)$/m);
        if (match && match[1].trim() !== '') {
          declaredAvatar = match[1].trim();
        }
      } catch {}
      
      let avatarUrl = `/images/placeholder-avatar.svg`;
      let hasAvatar = false;

      // 1. 如果 YAML 里声明了头像路径，验证物理存在
      if (declaredAvatar) {
        const cleanUrl = declaredAvatar.split('?')[0];
        if (cleanUrl.startsWith('/images/')) {
          const relPath = cleanUrl.replace(/^\/images\//, '');
          const publicPath = resolvePath('public/images', relPath);
          const distPath = resolvePath('dist/client/images', relPath);

          try {
            await fs.access(publicPath);
            hasAvatar = true;
            avatarUrl = cleanUrl;
          } catch {
            try {
              await fs.access(distPath);
              hasAvatar = true;
              avatarUrl = cleanUrl;
            } catch {
              hasAvatar = false;
            }
          }
        } else {
          hasAvatar = true;
          avatarUrl = declaredAvatar;
        }
      }

      // 2. 如果没有声明或声明的图片失效，我们按格式顺序轮询匹配本地存在的图片
      if (!hasAvatar) {
        const extensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
        for (const ext of extensions) {
          const checkPaths = [
            `avatars/${slug}.${ext}`,
            `${slug}-avatar.${ext}`,
            `${slug}.${ext}`
          ];
          for (const p of checkPaths) {
            const publicPath = resolvePath('public/images', p);
            const distPath = resolvePath('dist/client/images', p);
            let found = false;
            try {
              await fs.access(publicPath);
              found = true;
            } catch {
              try {
                await fs.access(distPath);
                found = true;
              } catch {}
            }
            if (found) {
              hasAvatar = true;
              avatarUrl = `/images/${p}`;
              break;
            }
          }
          if (hasAvatar) break;
        }
      }

      // 提取该 slug 对应的所有备选图
      // 备选图格式：slug-avatar-alt-<index>.<ext>
      const altUrls: string[] = [];
      const pattern = new RegExp(`^${slug}-avatar-alt-(\\d+)\\.(jpg|jpeg|png|webp|svg)$`, 'i');
      
      // 过滤匹配的文件
      const matchedFiles = imageFiles.filter(file => pattern.test(file));
      
      // 按序号进行升序排序
      matchedFiles.sort((a, b) => {
        const matchA = a.match(pattern);
        const matchB = b.match(pattern);
        if (matchA && matchB) {
          return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
        }
        return a.localeCompare(b);
      });

      for (const file of matchedFiles) {
        altUrls.push(`/images/${file}`);
      }

      statusObj[slug] = {
        hasAvatar,
        avatarUrl,
        altCount: altUrls.length,
        altUrls: altUrls
      };
    }

    return new Response(JSON.stringify({ status: statusObj }), {
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

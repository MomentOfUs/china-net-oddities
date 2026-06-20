import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
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
    const entries = await getCollection('phenomenon');
    const statusObj: Record<string, any> = {};

    const publicImagesDir = path.resolve('public/images');
    let files: string[] = [];
    try {
      files = await fs.readdir(publicImagesDir);
    } catch (e) {
      console.warn('public/images directory not found or empty', e);
    }

    for (const entry of entries) {
      const slug = entry.id;
      
      const publicPath = path.resolve('public/images', `${slug}-avatar.jpg`);
      const distPath = path.resolve('dist/client/images', `${slug}-avatar.jpg`);
      
      let hasAvatar = false;
      try {
        await fs.access(publicPath);
        hasAvatar = true;
      } catch {
        try {
          await fs.access(distPath);
          hasAvatar = true;
        } catch {
          hasAvatar = false;
        }
      }

      // 提取该 slug 对应的所有备选图
      // 备选图格式：slug-avatar-alt-<index>.<ext>
      const altUrls: string[] = [];
      const pattern = new RegExp(`^${slug}-avatar-alt-(\\d+)\\.(jpg|jpeg|png|webp|svg)$`, 'i');
      
      // 过滤匹配的文件
      const matchedFiles = files.filter(file => pattern.test(file));
      
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
        avatarUrl: `/images/${slug}-avatar.jpg`,
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

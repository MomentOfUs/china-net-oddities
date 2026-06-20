import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
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
    const { slug } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取该人物的中文名称
    const entries = await getCollection('phenomenon');
    const entry = entries.find(e => e.id === slug);
    const name = entry?.data?.title || slug;

    // 使用 Bing 搜索图片
    const searchUrl = `https://cn.bing.com/images/search?q=${encodeURIComponent(name)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`无法访问搜索引擎: ${response.statusText}`);
    }

    const html = await response.text();
    const urls: string[] = [];

    // 匹配 Bing 图片搜索里的图片真实地址 (murl)
    const regexEscaped = /murl&quot;\s*:\s*&quot;(https?:\/\/[^&"]+?)&quot;/gi;
    let match;
    while ((match = regexEscaped.exec(html)) !== null && urls.length < 10) {
      urls.push(match[1]);
    }

    if (urls.length === 0) {
      const regexNormal = /"murl"\s*:\s*"(https?:\/\/[^"]+?)"/gi;
      while ((match = regexNormal.exec(html)) !== null && urls.length < 10) {
        urls.push(match[1]);
      }
    }

    if (urls.length === 0) {
      return new Response(JSON.stringify({ count: 0, message: '未找到相关网络图片' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const publicDir = path.resolve('public/images');
    const distDir = path.resolve('dist/client/images');
    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(distDir, { recursive: true });

    // 获取当前最大的备选图序号并寻找空位
    const getNextIndex = async () => {
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
      return nextIndex;
    };

    let savedCount = 0;

    for (const imgUrl of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6秒超时限制
        
        const imgRes = await fetch(imgUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        clearTimeout(timeoutId);
        
        if (!imgRes.ok) continue;
        
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const contentType = imgRes.headers.get('content-type') || '';
        let ext = 'jpg';
        if (contentType.includes('image/png')) ext = 'png';
        else if (contentType.includes('image/webp')) ext = 'webp';
        else if (contentType.includes('image/svg+xml')) ext = 'svg';
        else if (contentType.includes('image/gif')) ext = 'gif';
        
        const nextIndex = await getNextIndex();
        const filename = `${slug}-avatar-alt-${nextIndex}.${ext}`;
        
        await fs.writeFile(path.join(publicDir, filename), buffer);
        try {
          await fs.writeFile(path.join(distDir, filename), buffer);
        } catch {}
        
        savedCount++;
        if (savedCount >= 3) {
          break; // 最多保存3张
        }
      } catch (err) {
        console.error(`Failed to download image ${imgUrl}:`, err);
      }
    }

    return new Response(JSON.stringify({ ok: true, count: savedCount }), {
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

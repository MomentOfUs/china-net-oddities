import type { APIRoute } from 'astro';
import { addSuggestion } from '../../utils/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return new Response(JSON.stringify({ error: '输入不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (name.length > 100) {
      return new Response(JSON.stringify({ error: '建议过长' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const success = await addSuggestion(name);
    if (success) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: '保存失败，请稍后重试' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: '非法请求体' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

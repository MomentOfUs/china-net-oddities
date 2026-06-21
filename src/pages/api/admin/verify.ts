import type { APIRoute } from 'astro';
import { getAdminToken, generateToken, verifyToken } from '../../../utils/pathHelper';

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Token missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. 如果传过来的是明文管理员密钥，说明是输入密码登录
  if (token === getAdminToken()) {
    // 签发 2 小时有效期的 JWT 令牌
    const jwtToken = generateToken({ user: 'admin', date: Date.now() });
    return new Response(JSON.stringify({ ok: true, token: jwtToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 如果传过来的是已签发的 JWT 令牌，我们校验其合法性以保持登录态 (自动登录/验证)
  const decoded = verifyToken(token);
  if (decoded) {
    // 自动为会话重新续期签发新 Token (Token Rotation)，让活跃会话不中断
    const newToken = generateToken({ user: 'admin', date: Date.now() });
    return new Response(JSON.stringify({ ok: true, token: newToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. 校验失败
  return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
};

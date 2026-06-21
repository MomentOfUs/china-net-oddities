import path from 'node:path';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';

let cachedProjectRoot: string | null = null;

export function getProjectRoot(): string {
  if (cachedProjectRoot) return cachedProjectRoot;

  if (process.env.PROJECT_ROOT) {
    cachedProjectRoot = path.resolve(process.env.PROJECT_ROOT);
    return cachedProjectRoot;
  }

  let currentDir = process.cwd();
  const rootDir = path.parse(currentDir).root;

  while (currentDir && currentDir !== rootDir) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      cachedProjectRoot = currentDir;
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  cachedProjectRoot = process.cwd();
  return cachedProjectRoot;
}

export function resolvePath(...paths: string[]): string {
  return path.join(getProjectRoot(), ...paths);
}

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'xiaolongxia2024';
}

// === JWT 动态会话持久化与签名算法 ===

/**
 * 签发具有 2 小时有效期的管理员 JSON Web Token (JWT)
 */
export function generateToken(payload: object): string {
  const secret = getAdminToken();
  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

/**
 * 解密并验证 JWT Token，如果合法返回解密后的载荷，否则返回 null
 */
export function verifyToken(tokenString: string): any {
  const secret = getAdminToken();
  try {
    return jwt.verify(tokenString, secret);
  } catch {
    return null;
  }
}

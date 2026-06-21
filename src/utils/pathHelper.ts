import path from 'node:path';
import fs from 'node:fs';

let cachedProjectRoot: string | null = null;

export function getProjectRoot(): string {
  if (cachedProjectRoot) return cachedProjectRoot;

  // 如果指定了环境变量，优先使用
  if (process.env.PROJECT_ROOT) {
    cachedProjectRoot = path.resolve(process.env.PROJECT_ROOT);
    return cachedProjectRoot;
  }

  // 从当前运行目录往上找，直到找到包含 package.json 的目录
  let currentDir = process.cwd();
  const rootDir = path.parse(currentDir).root;

  while (currentDir && currentDir !== rootDir) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      cachedProjectRoot = currentDir;
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // 默认降级为进程当前目录
  cachedProjectRoot = process.cwd();
  return cachedProjectRoot;
}

export function resolvePath(...paths: string[]): string {
  return path.join(getProjectRoot(), ...paths);
}

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'xiaolongxia2024';
}

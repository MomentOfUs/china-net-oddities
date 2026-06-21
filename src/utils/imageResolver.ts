import fs from 'node:fs';
import path from 'node:path';
import { resolvePath } from './pathHelper';

const IMG_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

function resolveImage(slug: string, suffix = ''): string | null {
  const publicDir = resolvePath('public/images');
  const distDir = resolvePath('dist/client/images');

  for (const ext of IMG_EXTENSIONS) {
    const filename = `${slug}${suffix}${ext}`;
    if (fs.existsSync(path.join(publicDir, filename))) {
      return `/images/${filename}`;
    }
    if (fs.existsSync(path.join(distDir, filename))) {
      return `/images/${filename}`;
    }
  }
  return null;
}

// 专门用来匹配 avatars/ 目录下的头像
function resolveAvatarDirectoryImage(slug: string): string | null {
  const publicDir = resolvePath('public/images/avatars');
  const distDir = resolvePath('dist/client/images/avatars');

  for (const ext of IMG_EXTENSIONS) {
    const filename = `${slug}${ext}`;
    if (fs.existsSync(path.join(publicDir, filename))) {
      return `/images/avatars/${filename}`;
    }
    if (fs.existsSync(path.join(distDir, filename))) {
      return `/images/avatars/${filename}`;
    }
  }
  return null;
}

export function getAvatar(slug: string, declaredAvatar?: string | null): string {
  if (declaredAvatar && declaredAvatar.trim() !== '') {
    return declaredAvatar;
  }
  return (
    resolveAvatarDirectoryImage(slug) ||
    resolveImage(slug, '-avatar') ||
    resolveImage(slug) ||
    '/images/placeholder-avatar.svg'
  );
}

export function getHero(slug: string, declaredHero?: string | null): string {
  if (declaredHero && declaredHero.trim() !== '') {
    return declaredHero;
  }
  return (
    resolveImage(slug, '-hero') ||
    resolveImage(slug) ||
    resolveAvatarDirectoryImage(slug) ||
    resolveImage(slug, '-avatar') ||
    '/images/placeholder.svg'
  );
}

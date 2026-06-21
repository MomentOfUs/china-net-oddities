import type { APIRoute } from 'astro';
import { exec } from 'node:child_process';
import { getAdminToken, getProjectRoot } from '../../../utils/pathHelper';

let isBuilding = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Admin-Token');
  if (token !== getAdminToken()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (isBuilding) {
    return new Response(JSON.stringify({ error: '系统正在重建中，请勿重复操作' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  isBuilding = true;
  const projectRoot = getProjectRoot();

  // 异步执行构建以避免堵塞 HTTP 响应
  const runBuild = () => {
    exec('pnpm build', { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.warn(`pnpm build failed, trying npm run build... Reason: ${error.message}`);
        exec('npm run build', { cwd: projectRoot }, (npmError, npmStdout, npmStderr) => {
          isBuilding = false;
          if (npmError) {
            console.error(`npm run build failed: ${npmError.message}`);
            return;
          }
          console.log(`npm run build finished:\nstdout: ${npmStdout}\nstderr: ${npmStderr}`);
        });
        return;
      }
      isBuilding = false;
      console.log(`pnpm build finished:\nstdout: ${stdout}\nstderr: ${stderr}`);
    });
  };

  runBuild();

  return new Response(JSON.stringify({ ok: true, message: '已成功触发后台编译重建流程' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

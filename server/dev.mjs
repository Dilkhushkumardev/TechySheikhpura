import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const viteBin = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const children = [];

function spawnNodeScript(scriptPath, args, label) {
  const child = spawn(process.execPath, ['--no-warnings', scriptPath, ...args], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM' && signal !== 'SIGINT' && code !== 0) {
      console.error(`[dev] ${label} exited unexpectedly with code ${code ?? 'null'}`);
      shutdown(code || 1);
    }
  });

  children.push(child);
  return child;
}

let shuttingDown = false;
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  setTimeout(() => process.exit(exitCode), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

spawnNodeScript('server/index.ts', [], 'backend');
spawnNodeScript(viteBin, ['--host', '--port', '5173'], 'frontend');

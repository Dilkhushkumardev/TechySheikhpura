import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { applySecurityHeaders, resolveRequestId } from './middleware/security.ts';
import { handleApiRequest } from './routes/api.ts';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveStaticFile(filePath: string, method: string, res: http.ServerResponse): void {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheHeader = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': cacheHeader,
  });
  if (method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

function tryServeSpa(reqPath: string, method: string, res: http.ServerResponse): boolean {
  if (!fs.existsSync(DIST_DIR)) {
    return false;
  }

  const normalized = path.posix.normalize(reqPath).replace(/^\/+/, '');
  const candidate = path.resolve(DIST_DIR, normalized || 'index.html');
  const distPrefix = DIST_DIR.endsWith(path.sep) ? DIST_DIR : `${DIST_DIR}${path.sep}`;

  if ((candidate === DIST_DIR || candidate.startsWith(distPrefix)) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    serveStaticFile(candidate, method, res);
    return true;
  }

  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    serveStaticFile(indexHtml, method, res);
    return true;
  }

  return false;
}

export function createAppServer(): http.Server {
  return http.createServer(async (req, res) => {
    if (await handleApiRequest(req, res)) {
      return;
    }

    const requestId = resolveRequestId(req);
    applySecurityHeaders(res, requestId);

    const method = req.method || 'GET';
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `http://${host}`);

    if ((method === 'GET' || method === 'HEAD') && tryServeSpa(url.pathname, method, res)) {
      return;
    }

    if ((method === 'GET' || method === 'HEAD') && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          service: 'TechySheikhpura 2026 Backend API',
          status: 'running',
          apiIndex: '/api',
          health: '/api/health',
        })
      );
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: `Route not found: ${method} ${url.pathname}`,
        requestId,
      })
    );
  });
}


import type { IncomingMessage, ServerResponse } from 'node:http';
import { enforceRateLimit } from '../middleware/rateLimit.ts';
import {
  applySecurityHeaders,
  attachRequestLogger,
  extractClientIp,
  handleCorsPreflight,
  resolveRequestId,
} from '../middleware/security.ts';
import { handleAdminRoutes } from './adminRoutes.ts';
import { HttpError, sendJson } from './helpers.ts';
import { handlePublicRoutes } from './publicRoutes.ts';

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);
  const pathname = url.pathname;

  if (pathname !== '/api' && !pathname.startsWith('/api/')) {
    return false;
  }

  const requestId = resolveRequestId(req);
  applySecurityHeaders(res, requestId);
  attachRequestLogger(req, res, requestId);

  if (handleCorsPreflight(req, res)) {
    return true;
  }

  const method = req.method || 'GET';
  const clientIp = extractClientIp(req);
  const rateLimit = enforceRateLimit(clientIp, method, pathname, res);
  if (!rateLimit.allowed) {
    sendJson(res, 429, {
      error: `Too many requests. Retry after ${rateLimit.retryAfterSeconds}s.`,
      requestId,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return true;
  }

  try {
    if (await handlePublicRoutes(req, res, pathname, url)) {
      return true;
    }
    if (await handleAdminRoutes(req, res, pathname, url)) {
      return true;
    }
    sendJson(res, 404, { error: `Endpoint not found: ${method} ${pathname}`, requestId });
    return true;
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, {
        error: error.message,
        ...(error.details ?? {}),
        requestId,
      });
      return true;
    }
    console.error(`[api] ${requestId} unhandled error:`, error);
    sendJson(res, 500, { error: 'Internal server error', requestId });
    return true;
  }
}

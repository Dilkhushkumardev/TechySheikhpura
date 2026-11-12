import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getServerConfig } from '../config/env.ts';

export function applySecurityHeaders(res: ServerResponse, requestId: string): void {
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Access-Control-Allow-Origin', '*');
}

export function extractClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export function resolveRequestId(req: IncomingMessage): string {
  const incoming = req.headers['x-request-id'];
  if (typeof incoming === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(incoming.trim())) {
    return incoming.trim();
  }
  return randomUUID().slice(0, 12);
}

export function handleCorsPreflight(req: IncomingMessage, res: ServerResponse): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Organizer-Pin, X-Request-Id',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
  return true;
}

export function attachRequestLogger(
  req: IncomingMessage,
  res: ServerResponse,
  requestId: string
): void {
  const { quietLogs } = getServerConfig();
  if (quietLogs) return;

  const startedAt = performance.now();
  res.on('finish', () => {
    const durationMs = (performance.now() - startedAt).toFixed(1);
    const method = req.method || 'GET';
    const pathUrl = req.url || '/';
    console.log(`[api] ${requestId} ${method} ${pathUrl} ${res.statusCode} ${durationMs}ms`);
  });
}


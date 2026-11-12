import type { IncomingMessage, ServerResponse } from 'node:http';
import { getServerConfig } from '../config/env.ts';

export class HttpError extends Error {
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

export function sendCsv(res: ServerResponse, filename: string, csvText: string): void {
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  });
  res.end(csvText);
}

export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const { maxBodyBytes } = getServerConfig();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > maxBodyBytes) {
      throw new HttpError(413, `Request body exceeds ${Math.round(maxBodyBytes / 1024)} KB limit`);
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Malformed JSON payload');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'Expected a JSON object payload');
  }
  return parsed as Record<string, unknown>;
}

export function readRequiredString(
  body: Record<string, unknown>,
  field: string,
  minLen = 1,
  maxLen = 200
): string {
  const value = body[field];
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} is required`);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLen || trimmed.length > maxLen) {
    throw new HttpError(400, `${field} must be between ${minLen} and ${maxLen} characters`);
  }
  return trimmed;
}

export function readOptionalString(
  body: Record<string, unknown>,
  field: string,
  maxLen = 200
): string | undefined {
  const value = body[field];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    throw new HttpError(400, `${field} must be at most ${maxLen} characters`);
  }
  return trimmed || undefined;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function decodeRouteParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    throw new HttpError(400, 'Malformed URL parameter encoding');
  }
}


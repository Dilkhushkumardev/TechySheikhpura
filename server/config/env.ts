import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

let envFileLoaded = false;

function loadDotEnvIfPresent(): void {
  if (envFileLoaded) return;
  envFileLoaded = true;
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Ignore malformed optional .env file and rely on process.env defaults
    }
  }
}

export interface ServerConfig {
  port: number;
  host: string;
  dbPath: string;
  organizerPin: string;
  sessionSecret: string;
  adminTokenTtlMs: number;
  maxBodyBytes: number;
  rateLimitDisabled: boolean;
  quietLogs: boolean;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getServerConfig(): ServerConfig {
  loadDotEnvIfPresent();

  const organizerPin = process.env.ORGANIZER_PIN?.trim() || 'GECS2026';
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  const sessionSecret =
    configuredSecret && configuredSecret.length >= 16
      ? configuredSecret
      : createHash('sha256')
          .update(`techysheikhpura-2026-hmac:${organizerPin}`)
          .digest('hex');

  const ttlHours = parsePositiveInt(process.env.ADMIN_TOKEN_TTL_HOURS, 12);

  return {
    port: parsePositiveInt(process.env.PORT, 5000),
    host: process.env.HOST?.trim() || '0.0.0.0',
    dbPath: process.env.DB_PATH?.trim() || path.resolve(process.cwd(), 'server', 'data', 'techysheikhpura.db'),
    organizerPin,
    sessionSecret,
    adminTokenTtlMs: ttlHours * 60 * 60 * 1000,
    maxBodyBytes: parsePositiveInt(process.env.MAX_JSON_BODY_BYTES, 64 * 1024),
    rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === '1',
    quietLogs: process.env.QUIET_LOGS === '1' || process.env.NODE_ENV === 'test',
  };
}


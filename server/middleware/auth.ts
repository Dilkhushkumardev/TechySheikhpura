import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { getServerConfig } from '../config/env.ts';

interface AdminTokenPayload {
  role: 'organizer';
  iat: number;
  exp: number;
}

export interface IssuedAdminSession {
  authenticated: true;
  token: string;
  expiresAt: string;
}

function sha256Digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function verifyOrganizerPin(candidate: string): boolean {
  const clean = candidate.trim();
  if (!clean) return false;
  const expected = getServerConfig().organizerPin;
  return timingSafeEqual(sha256Digest(expected), sha256Digest(clean));
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

export function issueAdminSessionToken(): IssuedAdminSession {
  const { sessionSecret, adminTokenTtlMs } = getServerConfig();
  const now = Date.now();
  const exp = now + adminTokenTtlMs;
  const payload: AdminTokenPayload = {
    role: 'organizer',
    iat: now,
    exp,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload, sessionSecret);

  return {
    authenticated: true,
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(exp).toISOString(),
  };
}

export function verifyAdminSessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return false;

  const { sessionSecret } = getServerConfig();
  const expectedSig = signPayload(encodedPayload, sessionSecret);

  const a = Buffer.from(providedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return false;
  }

  try {
    const raw = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as Partial<AdminTokenPayload>;
    return parsed.role === 'organizer' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function isRequestAdminAuthorized(req: IncomingMessage): boolean {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    const credential = authHeader.slice(7).trim();
    if (verifyAdminSessionToken(credential) || verifyOrganizerPin(credential)) {
      return true;
    }
  }

  const pinHeader = req.headers['x-organizer-pin'];
  if (typeof pinHeader === 'string' && verifyOrganizerPin(pinHeader)) {
    return true;
  }

  return false;
}

export function extractSubmittedPin(req: IncomingMessage): string {
  const pinHeader = req.headers['x-organizer-pin'];
  if (typeof pinHeader === 'string' && pinHeader.trim()) {
    return pinHeader.trim();
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return '';
}

export function computePassVerifyCode(
  regId: string,
  passId: string,
  rollNo: string,
  email: string
): string {
  const { sessionSecret } = getServerConfig();
  return createHmac('sha256', sessionSecret)
    .update(`pass:${regId.toUpperCase()}:${passId}:${rollNo.toUpperCase()}:${email.toLowerCase()}`)
    .digest('hex')
    .slice(0, 12)
    .toUpperCase();
}

export function isPassVerifyCodeValid(expectedCode: string, candidateCode: string): boolean {
  const cleanCandidate = candidateCode.trim().toUpperCase();
  if (cleanCandidate.length !== expectedCode.length) return false;
  return timingSafeEqual(Buffer.from(expectedCode, 'utf8'), Buffer.from(cleanCandidate, 'utf8'));
}


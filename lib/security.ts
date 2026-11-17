import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit } from '@/lib/db';

const adminCookie = () => process.env.NODE_ENV === 'production' ? '__Host-shajghuri_admin' : 'shajghuri_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

function signature(value: string, key: string): string {
  return createHmac('sha256', key).update(value).digest('base64url');
}

export function issueAdminSession(): string | null {
  const key = secret();
  if (!key) return null;
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:${expires}`;
  return `${payload}.${signature(payload, key)}`;
}

export function hasAdminSession(request: NextRequest): boolean {
  const key = secret();
  const token = request.cookies.get(adminCookie())?.value;
  if (!key || !token) return false;

  const splitAt = token.lastIndexOf('.');
  if (splitAt < 1) return false;
  const payload = token.slice(0, splitAt);
  const supplied = token.slice(splitAt + 1);
  const expected = signature(payload, key);
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return false;

  const match = /^admin:(\d+)$/.exec(payload);
  return Boolean(match && Number(match[1]) > Math.floor(Date.now() / 1000));
}

export function setAdminCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(adminCookie(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

export function clearAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(adminCookie(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const requestUrl = new URL(request.url);
      const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
      const host = forwardedHost || request.headers.get('host') || requestUrl.host;
      const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
      const protocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
      return new URL(origin).origin === `${protocol}//${host}`;
    } catch {
      return false;
    }
  }
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

export async function readJson<T>(request: Request, maxBytes = 16_384): Promise<T | null> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return null;

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) return null;

  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function rateLimit(request: Request, key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  // Vercel overwrites x-forwarded-for at its edge; do not trust the custom
  // x-vercel-forwarded-for header first because a client can supply that name.
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-vercel-forwarded-for');
  const client = forwarded?.split(',')[0].trim() || 'unknown';
  const secretKey = process.env.ADMIN_SESSION_SECRET || 'local-development-rate-limit-key';
  const clientHash = createHmac('sha256', secretKey).update(client).digest('hex');
  const bucketKey = `${key}:${clientHash}`;
  if (process.env.DATABASE_URL) {
    try {
      return await consumeRateLimit(bucketKey, limit, windowMs);
    } catch {
      return false;
    }
  }
  if (process.env.NODE_ENV === 'production') return false;
  const bucket = requestBuckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    if (requestBuckets.size >= 5_000) {
      for (const [oldKey, oldBucket] of requestBuckets) {
        if (oldBucket.resetAt <= now) requestBuckets.delete(oldKey);
      }
      if (requestBuckets.size >= 5_000) {
        const oldestKey = requestBuckets.keys().next().value;
        if (oldestKey) requestBuckets.delete(oldestKey);
      }
    }
    requestBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}

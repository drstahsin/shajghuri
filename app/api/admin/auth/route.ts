import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  clearAdminCookie,
  hasAdminSession,
  isSameOrigin,
  issueAdminSession,
  rateLimit,
  readJson,
  setAdminCookie,
} from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function secureCompare(left: string, right: string): boolean {
  const a = createHash('sha256').update(left).digest();
  const b = createHash('sha256').update(right).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { authenticated: hasAdminSession(request) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  if (!await rateLimit(request, 'admin-login', 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const body = await readJson<{ password?: unknown }>(request, 2_048);
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || configuredPassword.length < 14 || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: 'Admin access is not configured on the server.' }, { status: 503 });
  }
  if (!body || typeof body.password !== 'string' || body.password.length > 512 || !secureCompare(body.password, configuredPassword)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = issueAdminSession();
  if (!token) {
    return NextResponse.json({ error: 'Admin access is not configured on the server.' }, { status: 503 });
  }
  const response = NextResponse.json({ authenticated: true }, { headers: { 'Cache-Control': 'no-store' } });
  return setAdminCookie(response, token);
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false }, { headers: { 'Cache-Control': 'no-store' } });
  return clearAdminCookie(response);
}

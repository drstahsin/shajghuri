import { NextResponse } from 'next/server';
import { dispatchContactInquiry } from '@/lib/email';
import { isSameOrigin, rateLimit, readJson } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!await rateLimit(request, 'contact', 4, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  }
  const body = await readJson<Record<string, unknown>>(request, 4_096);
  if (!body || (typeof body.website === 'string' && body.website.trim())) {
    return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  }
  const name = text(body.name, 2, 100);
  const contact = text(body.contact, 5, 254);
  const subject = text(body.subject, 4, 120);
  const message = text(body.message, 10, 3_000);
  if (!name || !contact || !subject || !message) {
    return NextResponse.json({ error: 'Please check the message fields and try again.' }, { status: 400 });
  }
  try {
    await dispatchContactInquiry({ name, contact, subject, message });
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Contact] Message delivery failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'We could not deliver your message right now. Please call or email us directly.' }, { status: 503 });
  }
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const result = value.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  return result.length >= min && result.length <= max ? result : null;
}

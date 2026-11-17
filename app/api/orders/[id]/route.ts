import { NextRequest, NextResponse } from 'next/server';
import { getCustomerOrder } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: RouteContext<'/api/orders/[id]'>) {
  const { id } = await context.params;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const order = await getCustomerOrder(id, token);
    return order
      ? NextResponse.json(order, { headers: { 'Cache-Control': 'no-store' } })
      : NextResponse.json({ error: 'Order not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Order details are temporarily unavailable.' }, { status: 503 });
  }
}

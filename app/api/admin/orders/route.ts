import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrderStatus, type Order } from '@/lib/db';
import { hasAdminSession, isSameOrigin, readJson, unauthorized } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const orderStatuses: Order['status'][] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized();
  try {
    return NextResponse.json(await getAllOrders(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Order storage is temporarily unavailable.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized();
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

  const body = await readJson<{ id?: unknown; status?: unknown }>(request, 2_048);
  if (!body || typeof body.id !== 'string' || body.id.length > 80 || !orderStatuses.includes(body.status as Order['status'])) {
    return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 });
  }
  try {
    const order = await updateOrderStatus(body.id, body.status as Order['status']);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ success: true, order }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const insufficientStock = error instanceof Error && error.message.startsWith('Insufficient stock');
    return NextResponse.json({ error: insufficientStock ? 'There is not enough stock to reactivate this order.' : 'Order status could not be saved.' }, { status: insufficientStock ? 409 : 503 });
  }
}

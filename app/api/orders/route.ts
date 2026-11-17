import { NextResponse } from 'next/server';
import { createOrder, type NewOrderInput } from '@/lib/db';
import { isSameOrigin, rateLimit, readJson } from '@/lib/security';
import { dispatchOrderEmails } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckoutBody = {
  customerName?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  city?: unknown;
  deliveryZone?: unknown;
  paymentMethod?: unknown;
  trxId?: unknown;
  notes?: unknown;
  items?: unknown;
};

const deliveryZones: NewOrderInput['deliveryZone'][] = ['inside_narayanganj', 'outside_narayanganj', 'college_road_pickup'];
const paymentMethods: NewOrderInput['paymentMethod'][] = ['cod', 'bkash', 'nagad'];

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!await rateLimit(request, 'checkout', 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many order attempts. Please wait a few minutes.' }, { status: 429 });
  }

  const body = await readJson<CheckoutBody>(request, 16_384);
  if (!body) return NextResponse.json({ error: 'Invalid or oversized order request.' }, { status: 400 });

  const customerName = cleanText(body.customerName, 2, 100);
  const phone = cleanText(body.phone, 8, 24);
  const emailInput = cleanText(body.email, 5, 254);
  const email = emailInput?.toLowerCase() ?? null;
  const address = cleanText(body.address, 5, 300);
  const city = cleanText(body.city, 2, 80);
  const deliveryZone = body.deliveryZone;
  const paymentMethod = body.paymentMethod;
  const trxId = cleanText(body.trxId ?? '', 0, 100) || '';
  const notes = cleanText(body.notes ?? '', 0, 500) || '';

  if (!customerName || !phone || !/^[\d\s()+.-]{8,24}$/.test(phone) || phone.replace(/\D/g, '').length < 8 || phone.replace(/\D/g, '').length > 15
    || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !address || !city
    || !deliveryZones.includes(deliveryZone as NewOrderInput['deliveryZone'])
    || !paymentMethods.includes(paymentMethod as NewOrderInput['paymentMethod'])) {
    return NextResponse.json({ error: 'Please provide valid contact, delivery, and payment details.' }, { status: 400 });
  }
  if (paymentMethod !== 'cod' && trxId.length < 3) {
    return NextResponse.json({ error: 'Please provide a valid payment transaction reference.' }, { status: 400 });
  }

  const requestedItems = parseRequestedItems(body.items);
  if (!requestedItems) return NextResponse.json({ error: 'Your cart contains invalid items or quantities.' }, { status: 400 });

  try {
    const result = await createOrder({
      customerName,
      phone,
      email,
      address,
      city,
      deliveryZone: deliveryZone as NewOrderInput['deliveryZone'],
      paymentMethod: paymentMethod as NewOrderInput['paymentMethod'],
      trxId,
      notes,
      requestedItems,
    });

    dispatchOrderEmails(result.order).catch(() => console.warn('[Order Notification] Email dispatch failed.'));
    return NextResponse.json(
      { success: true, order: result.order, accessToken: result.accessToken },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message.startsWith('Insufficient stock') ? 409 : 503;
    console.error('[Orders] Order creation failed:', status, message.slice(0, 160));
    return NextResponse.json(
      { error: status === 409 ? 'One or more items are no longer available in the requested quantity.' : 'We could not save your order right now. Please try again.' },
      { status },
    );
  }
}

function cleanText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}

function parseRequestedItems(value: unknown): { id: number; quantity: number }[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) return null;
  const seen = new Set<number>();
  const items: { id: number; quantity: number }[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Record<string, unknown>;
    if (!Number.isSafeInteger(item.id) || Number(item.id) < 1 || !Number.isSafeInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 50) return null;
    const id = Number(item.id);
    if (seen.has(id)) return null;
    seen.add(id);
    items.push({ id, quantity: Number(item.quantity) });
  }
  return items;
}

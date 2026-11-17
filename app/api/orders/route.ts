import { NextResponse } from 'next/server';
import { getAllOrders, insertOrder, updateOrderStatus, Order, OrderItem } from '@/lib/db';
import { sendEmailNotification, getWhatsAppStoreUrl, getEmailStoreUrl } from '@/lib/notifications';
import { dispatchOrderEmails } from '@/lib/email';

export type { Order, OrderItem };

export async function GET() {
  try {
    const orders = getAllOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      deliveryZone,
      deliveryFee,
      paymentMethod,
      trxId,
      notes,
      items,
      subtotal,
      total,
    } = body;

    // Detailed field validation
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json({ error: 'Please enter your delivery address.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your shopping bag is empty.' }, { status: 400 });
    }

    // Save order into the database
    const newOrder = insertOrder({
      customerName,
      phone,
      email: email || '',
      address,
      city: city || (deliveryZone === 'outside_narayanganj' ? 'Outside Narayanganj' : 'Narayanganj'),
      deliveryZone: deliveryZone || 'inside_narayanganj',
      deliveryFee: Number(deliveryFee) || (deliveryZone === 'college_road_pickup' ? 20 : deliveryZone === 'inside_narayanganj' ? 60 : 120),
      paymentMethod: paymentMethod || 'cod',
      trxId: trxId || '',
      notes: notes || '',
      items,
      subtotal: Number(subtotal) || 0,
      total: Number(total) || 0,
    });

    // Dispatch automated confirmation emails to BOTH business (shajghuri@gmail.com) and customer
    dispatchOrderEmails(newOrder).catch((err) => {
      console.warn('[Order Notification] Dual email dispatch warning:', err?.message);
    });

    const whatsappUrl = getWhatsAppStoreUrl(newOrder);
    const emailUrl = getEmailStoreUrl(newOrder);

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        notifications: {
          whatsappUrl,
          emailUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order in database:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing order id or status' }, { status: 400 });
    }

    const updated = updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update order status' }, { status: 500 });
  }
}

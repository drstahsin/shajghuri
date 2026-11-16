import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  deliveryZone: 'inside_narayanganj' | 'outside_narayanganj' | 'college_road_pickup' | string;
  deliveryFee: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  trxId?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
}

function readOrders(): Order[] {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      fs.writeFileSync(ordersFilePath, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read orders:', error);
    return [];
  }
}

function writeOrders(orders: Order[]) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
}

export async function GET() {
  try {
    const orders = readOrders();
    // Return newest orders first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
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

    if (!customerName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const orderId = `SG-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      customerName,
      phone,
      email: email || '',
      address,
      city: city || (deliveryZone === 'inside_narayanganj' || deliveryZone === 'college_road_pickup' ? 'Narayanganj' : 'Outside Narayanganj'),
      deliveryZone,
      deliveryFee: Number(deliveryFee) || (deliveryZone === 'college_road_pickup' ? 20 : deliveryZone === 'inside_narayanganj' ? 60 : 120),
      paymentMethod,
      trxId: trxId || '',
      notes: notes || '',
      items,
      subtotal: Number(subtotal),
      total: Number(total),
    };

    // 1. Decrement stock in products.json
    try {
      if (fs.existsSync(productsFilePath)) {
        const rawProducts = fs.readFileSync(productsFilePath, 'utf8');
        const products = JSON.parse(rawProducts);
        
        items.forEach((orderedItem: OrderItem) => {
          const match = products.find((p: any) => p.id === orderedItem.id);
          if (match && typeof match.stock === 'number') {
            match.stock = Math.max(0, match.stock - orderedItem.quantity);
          }
        });

        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
      }
    } catch (stockError) {
      console.error('Failed to update stock in products.json', stockError);
    }

    // 2. Save order
    const orders = readOrders();
    orders.unshift(newOrder);
    writeOrders(orders);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const orders = readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[index].status = status;
    writeOrders(orders);

    return NextResponse.json({ success: true, order: orders[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

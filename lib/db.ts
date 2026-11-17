import fs from 'fs';
import path from 'path';
import os from 'os';

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

// In-memory fallback cache
let memoryOrders: Order[] | null = null;

const primaryPath = path.join(process.cwd(), 'data', 'orders.json');
const fallbackPath = path.join(os.tmpdir(), 'shajghuri_orders.json');

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore
    }
  }
}

export function getAllOrders(): Order[] {
  // 1. Try reading from primary disk file
  try {
    ensureDataDirectory();
    if (fs.existsSync(primaryPath)) {
      const content = fs.readFileSync(primaryPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
        return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.warn('[DB] Primary storage read warning:', err);
  }

  // 2. Try reading from temporary OS storage
  try {
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
        return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.warn('[DB] Fallback storage read warning:', err);
  }

  // 3. Fallback to memory
  if (memoryOrders && Array.isArray(memoryOrders)) {
    return memoryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return [];
}

export function saveOrders(orders: Order[]): boolean {
  memoryOrders = orders;
  let saved = false;

  // Save to primary storage
  try {
    ensureDataDirectory();
    fs.writeFileSync(primaryPath, JSON.stringify(orders, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.error('[DB] Primary storage write error (falling back to tmp):', err);
  }

  // Save to OS temp storage as backup
  try {
    fs.writeFileSync(fallbackPath, JSON.stringify(orders, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.error('[DB] Fallback storage write error:', err);
  }

  return saved || (memoryOrders !== null);
}

export function getOrderById(id: string): Order | null {
  const orders = getAllOrders();
  return orders.find(o => o.id === id) || null;
}

export function insertOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'> & { id?: string }): Order {
  const orders = getAllOrders();
  const orderId = orderData.id || `SG-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    customerName: orderData.customerName.trim(),
    phone: orderData.phone.trim(),
    email: orderData.email?.trim() || '',
    address: orderData.address.trim(),
    city: orderData.city?.trim() || 'Narayanganj',
    deliveryZone: orderData.deliveryZone || 'inside_narayanganj',
    deliveryFee: Number(orderData.deliveryFee) || 60,
    paymentMethod: orderData.paymentMethod || 'cod',
    trxId: orderData.trxId || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal) || 0,
    total: Number(orderData.total) || 0,
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  // Decrement product stock in products.json if present
  try {
    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
      const raw = fs.readFileSync(productsPath, 'utf8');
      const products = JSON.parse(raw);
      if (Array.isArray(products)) {
        newOrder.items.forEach(it => {
          const match = products.find((p: any) => Number(p.id) === Number(it.id));
          if (match) {
            const qty = Math.max(1, Number(it.quantity) || 1);
            const currentStock = typeof match.stock === 'number' ? match.stock : (parseInt(match.stock, 10) || 0);
            match.stock = Math.max(0, currentStock - qty);
          }
        });
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
      }
    }
  } catch (stockErr) {
    console.warn('[DB] Stock decrement warning:', stockErr);
  }

  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const orders = getAllOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;

  orders[idx].status = status;
  saveOrders(orders);
  return orders[idx];
}

export function deleteOrder(id: string): boolean {
  const orders = getAllOrders();
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
}

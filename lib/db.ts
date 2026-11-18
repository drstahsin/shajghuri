import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import initialProducts from '@/data/products.json';
import type { Product } from '@/context/AppContext';

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
  deliveryZone: 'inside_narayanganj' | 'outside_narayanganj' | 'college_road_pickup';
  deliveryFee: number;
  /** For new orders, only the delivery fee is prepaid; old records may not have this field. */
  paymentPlan?: 'delivery_fee_advance_cod_balance';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentSenderNumber?: string;
  trxId?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  stockDeducted: boolean;
}

export type NewOrderInput = Omit<Order, 'id' | 'createdAt' | 'status' | 'items' | 'subtotal' | 'total' | 'deliveryFee' | 'stockDeducted' | 'paymentPlan' | 'paymentSenderNumber' | 'paymentMethod'> & {
  paymentMethod: 'bkash' | 'nagad';
  paymentSenderNumber: string;
  requestedItems: { id: number; quantity: number }[];
};

const productsPath = path.join(process.cwd(), 'data', 'products.json');
const ordersPath = path.join(process.cwd(), 'data', 'orders.local.json');
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
let poolInstance: Pool | null = null;
let schemaReady: Promise<void> | null = null;
let localQueue: Promise<unknown> = Promise.resolve();

function hasDatabaseConfigured(): boolean {
  if (process.env.DATABASE_URL) return true;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL must be configured for production order and catalog storage.');
  }
  return false;
}

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: true },
    });
  }
  return poolInstance;
}

async function withClient<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    return await work(client);
  } finally {
    client.release();
  }
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await withClient(async (client) => {
        await client.query(`
          CREATE TABLE IF NOT EXISTS shajghuri_products (
            id integer PRIMARY KEY,
            stock integer NOT NULL CHECK (stock >= 0),
            data jsonb NOT NULL
          );
          CREATE TABLE IF NOT EXISTS shajghuri_orders (
            id text PRIMARY KEY,
            created_at timestamptz NOT NULL,
            status text NOT NULL CHECK (status IN ('Pending','Confirmed','Shipped','Delivered','Cancelled')),
            stock_deducted boolean NOT NULL DEFAULT true,
            access_token_hash text NOT NULL,
            data jsonb NOT NULL
          );
          CREATE INDEX IF NOT EXISTS shajghuri_orders_created_at_idx ON shajghuri_orders (created_at DESC);
          CREATE TABLE IF NOT EXISTS shajghuri_rate_limits (
            bucket text PRIMARY KEY,
            attempts integer NOT NULL,
            reset_at timestamptz NOT NULL
          );
        `);
        const count = await client.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM shajghuri_products');
        if (Number(count.rows[0]?.count || 0) === 0) {
          for (const product of initialProducts as Product[]) {
            await client.query(
              'INSERT INTO shajghuri_products (id, stock, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING',
              [product.id, product.stock, JSON.stringify(product)],
            );
          }
        }
      });
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export async function consumeRateLimit(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  await ensureSchema();
  const result = await pool().query<{ attempts: number }>(
    `INSERT INTO shajghuri_rate_limits (bucket, attempts, reset_at)
     VALUES ($1, 1, NOW() + ($3 * INTERVAL '1 millisecond'))
     ON CONFLICT (bucket) DO UPDATE SET
       attempts = CASE WHEN shajghuri_rate_limits.reset_at <= NOW() THEN 1 ELSE LEAST(shajghuri_rate_limits.attempts + 1, $2 + 1) END,
       reset_at = CASE WHEN shajghuri_rate_limits.reset_at <= NOW() THEN NOW() + ($3 * INTERVAL '1 millisecond') ELSE shajghuri_rate_limits.reset_at END
     RETURNING attempts`,
    [bucket, limit, windowMs],
  );
  if (Math.random() < 0.01) await pool().query('DELETE FROM shajghuri_rate_limits WHERE reset_at < NOW()');
  return Number(result.rows[0]?.attempts || 0) <= limit;
}

function queueLocal<T>(work: () => Promise<T>): Promise<T> {
  const next = localQueue.then(work, work) as Promise<T>;
  localQueue = next.then(() => undefined, () => undefined);
  return next;
}

function readJsonFile<T>(file: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

export async function getAllProducts(): Promise<Product[]> {
  if (!hasDatabaseConfigured()) return readJsonFile(productsPath, initialProducts as Product[]);
  await ensureSchema();
  const result = await pool().query<{ data: Product; stock: number }>('SELECT data, stock FROM shajghuri_products ORDER BY id');
  return result.rows.map((row) => ({ ...row.data, stock: row.stock }));
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (!hasDatabaseConfigured()) {
    await queueLocal(async () => writeJsonFile(productsPath, products));
    return;
  }
  await ensureSchema();
  await withClient(async (client) => {
    await client.query('BEGIN');
    try {
      await client.query('DELETE FROM shajghuri_products');
      for (const product of products) {
        await client.query(
          'INSERT INTO shajghuri_products (id, stock, data) VALUES ($1, $2, $3::jsonb)',
          [product.id, product.stock, JSON.stringify(product)],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

export async function getAllOrders(): Promise<Order[]> {
  if (!hasDatabaseConfigured()) {
    return readJsonFile<Array<Order & { accessTokenHash?: string }>>(ordersPath, [])
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(withoutAccessTokenHash);
  }
  await ensureSchema();
  const result = await pool().query<{ data: Order; status: Order['status']; stock_deducted: boolean }>(
    'SELECT data, status, stock_deducted FROM shajghuri_orders ORDER BY created_at DESC LIMIT 1000',
  );
  return result.rows.map(({ data, status, stock_deducted }) => ({ ...data, status, stockDeducted: stock_deducted }));
}

export async function getCustomerOrder(id: string, accessToken: string): Promise<Order | null> {
  if (!hasDatabaseConfigured()) {
    const order = readJsonFile<Array<Order & { accessTokenHash?: string }>>(ordersPath, []).find((item) => item.id === id);
    if (!order || order.accessTokenHash !== tokenHash(accessToken)) return null;
    return withoutAccessTokenHash(order);
  }
  await ensureSchema();
  const result = await pool().query<{ data: Order; status: Order['status']; stock_deducted: boolean }>(
    'SELECT data, status, stock_deducted FROM shajghuri_orders WHERE id = $1 AND access_token_hash = $2',
    [id, tokenHash(accessToken)],
  );
  const row = result.rows[0];
  return row ? { ...row.data, status: row.status, stockDeducted: row.stock_deducted } : null;
}

export async function createOrder(input: NewOrderInput): Promise<{ order: Order; accessToken: string }> {
  const accessToken = randomBytes(32).toString('base64url');
  const id = `SG-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  const deliveryFees = { inside_narayanganj: 60, college_road_pickup: 20, outside_narayanganj: 120 };
  const deliveryFee = deliveryFees[input.deliveryZone];

  if (!hasDatabaseConfigured()) {
    return queueLocal(async () => {
      const products = readJsonFile<Product[]>(productsPath, initialProducts as Product[]);
      const orders = readJsonFile<Order[]>(ordersPath, []);
      const items = input.requestedItems.map(({ id: productId, quantity }) => {
        const product = products.find((item) => item.id === productId);
        if (!product || product.stock < quantity) throw new Error(`Insufficient stock for product ${productId}.`);
        return { id: product.id, name: product.name, price: product.price, quantity, image: product.image };
      });
      for (const requested of input.requestedItems) {
        const product = products.find((item) => item.id === requested.id)!;
        product.stock -= requested.quantity;
      }
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order: Order = {
        ...input,
        id,
        createdAt,
        status: 'Pending',
        paymentPlan: 'delivery_fee_advance_cod_balance',
        deliveryFee,
        items,
        subtotal,
        total: subtotal + deliveryFee,
        stockDeducted: true,
      };
      writeJsonFile(productsPath, products);
      writeJsonFile(ordersPath, [...orders, { ...order, accessTokenHash: tokenHash(accessToken) }]);
      return { order, accessToken };
    });
  }

  await ensureSchema();
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const ids = input.requestedItems.map((item) => item.id).sort((a, b) => a - b);
      const rows = await client.query<{ id: number; stock: number; data: Product }>(
        'SELECT id, stock, data FROM shajghuri_products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
        [ids],
      );
      const productMap = new Map(rows.rows.map((row) => [row.id, { ...row.data, stock: row.stock }]));
      const items = input.requestedItems.map(({ id: productId, quantity }) => {
        const product = productMap.get(productId);
        if (!product || product.stock < quantity) throw new Error(`Insufficient stock for product ${productId}.`);
        return { id: product.id, name: product.name, price: product.price, quantity, image: product.image };
      });
      for (const requested of input.requestedItems) {
        const product = productMap.get(requested.id)!;
        const updated = { ...product, stock: product.stock - requested.quantity };
        await client.query('UPDATE shajghuri_products SET stock = $2, data = $3::jsonb WHERE id = $1', [product.id, updated.stock, JSON.stringify(updated)]);
      }
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order: Order = {
        ...input,
        id,
        createdAt,
        status: 'Pending',
        paymentPlan: 'delivery_fee_advance_cod_balance',
        deliveryFee,
        items,
        subtotal,
        total: subtotal + deliveryFee,
        stockDeducted: true,
      };
      await client.query(
        'INSERT INTO shajghuri_orders (id, created_at, status, stock_deducted, access_token_hash, data) VALUES ($1, $2, $3, true, $4, $5::jsonb)',
        [id, createdAt, order.status, tokenHash(accessToken), JSON.stringify(order)],
      );
      await client.query('COMMIT');
      return { order, accessToken };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

export async function updateOrderStatus(id: string, newStatus: Order['status']): Promise<Order | null> {
  if (!hasDatabaseConfigured()) {
    return queueLocal(async () => {
      const orders = readJsonFile<Order[]>(ordersPath, []);
      const order = orders.find((item) => item.id === id);
      if (!order) return null;
      if (order.status === newStatus) return order;
      const products = readJsonFile<Product[]>(productsPath, initialProducts as Product[]);
      const wasDeducted = order.stockDeducted ?? order.status !== 'Cancelled';
      if (newStatus === 'Cancelled' && wasDeducted) {
        adjustLocalStock(products, order.items, 1);
        order.stockDeducted = false;
      } else if (order.status === 'Cancelled' && newStatus !== 'Cancelled' && !wasDeducted) {
        assertStock(products, order.items);
        adjustLocalStock(products, order.items, -1);
        order.stockDeducted = true;
      }
      order.status = newStatus;
      writeJsonFile(productsPath, products);
      writeJsonFile(ordersPath, orders);
      return order;
    });
  }

  await ensureSchema();
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const result = await client.query<{ data: Order; status: Order['status']; stock_deducted: boolean }>(
        'SELECT data, status, stock_deducted FROM shajghuri_orders WHERE id = $1 FOR UPDATE', [id],
      );
      const row = result.rows[0];
      if (!row) { await client.query('ROLLBACK'); return null; }
      const order = { ...row.data, status: row.status, stockDeducted: row.stock_deducted };
      if (order.status === newStatus) { await client.query('COMMIT'); return order; }
      const wasDeducted = row.stock_deducted;
      if ((newStatus === 'Cancelled' && wasDeducted) || (order.status === 'Cancelled' && newStatus !== 'Cancelled' && !wasDeducted)) {
        const direction = newStatus === 'Cancelled' ? 1 : -1;
        for (const item of [...order.items].sort((a, b) => a.id - b.id)) {
          const productResult = await client.query<{ stock: number; data: Product }>(
            'SELECT stock, data FROM shajghuri_products WHERE id = $1 FOR UPDATE', [item.id],
          );
          const productRow = productResult.rows[0];
          if (!productRow) continue;
          if (direction < 0 && productRow.stock < item.quantity) throw new Error(`Insufficient stock to reactivate order ${id}.`);
          const stock = productRow.stock + direction * item.quantity;
          const product = { ...productRow.data, stock };
          await client.query('UPDATE shajghuri_products SET stock = $2, data = $3::jsonb WHERE id = $1', [item.id, stock, JSON.stringify(product)]);
        }
        order.stockDeducted = direction < 0;
      }
      order.status = newStatus;
      await client.query('UPDATE shajghuri_orders SET status = $2, stock_deducted = $3, data = $4::jsonb WHERE id = $1', [id, newStatus, order.stockDeducted, JSON.stringify(order)]);
      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

function assertStock(products: Product[], items: OrderItem[]): void {
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.id);
    if (!product || product.stock < item.quantity) throw new Error(`Insufficient stock to reactivate this order.`);
  }
}

function adjustLocalStock(products: Product[], items: OrderItem[], direction: 1 | -1): void {
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.id);
    if (product) product.stock = Math.max(0, product.stock + direction * item.quantity);
  }
}

function withoutAccessTokenHash(order: Order & { accessTokenHash?: string }): Order {
  const publicOrder = { ...order };
  delete publicOrder.accessTokenHash;
  return publicOrder;
}

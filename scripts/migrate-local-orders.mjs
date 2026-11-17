import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import pg from 'pg';

const { Pool } = pg;

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env.local before migrating.');
  const ordersPath = path.join(process.cwd(), 'data', 'orders.local.json');
  if (!fs.existsSync(ordersPath)) throw new Error('No local order file was found at data/orders.local.json.');
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  const products = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf8'));
  if (!Array.isArray(orders) || !Array.isArray(products)) throw new Error('The local data files have an invalid format.');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: true },
  });
  const client = await pool.connect();
  try {
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

    await client.query('BEGIN');
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM shajghuri_orders');
    if (existing.rows[0].count !== 0) throw new Error('The database already contains orders; migration stopped to avoid duplicates.');

    const productCount = await client.query('SELECT COUNT(*)::int AS count FROM shajghuri_products');
    if (productCount.rows[0].count === 0) {
      for (const product of products) {
        await client.query(
          'INSERT INTO shajghuri_products (id, stock, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING',
          [product.id, product.stock, JSON.stringify(product)],
        );
      }
    }

    for (const order of orders) {
      if (!order || typeof order.id !== 'string' || !Array.isArray(order.items)) throw new Error('A local order record is invalid; no orders were imported.');
      const createdAt = new Date(order.createdAt);
      const status = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(order.status) ? order.status : 'Pending';
      const stockDeducted = typeof order.stockDeducted === 'boolean' ? order.stockDeducted : status !== 'Cancelled';
      const savedOrder = { ...order, createdAt: createdAt.toISOString(), status, stockDeducted };
      const accessTokenHash = createHash('sha256').update(randomBytes(32)).digest('hex');
      await client.query(
        'INSERT INTO shajghuri_orders (id, created_at, status, stock_deducted, access_token_hash, data) VALUES ($1, $2, $3, $4, $5, $6::jsonb)',
        [savedOrder.id, savedOrder.createdAt, status, stockDeducted, accessTokenHash, JSON.stringify(savedOrder)],
      );
    }

    await client.query('COMMIT');
    console.log(`Imported ${orders.length} local order record(s). Product stock was preserved.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Order migration failed.');
  process.exitCode = 1;
});

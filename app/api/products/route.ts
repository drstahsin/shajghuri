import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, saveProducts } from '@/lib/db';
import { hasAdminSession, isSameOrigin, readJson, unauthorized } from '@/lib/security';
import type { Product } from '@/context/AppContext';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
  } catch (error) {
    console.error('[Products] Catalog read failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Catalog temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized();
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

  const newProducts = await readJson<unknown>(request, 512_000);
  if (!Array.isArray(newProducts) || newProducts.length > 500) {
    return NextResponse.json({ error: 'Invalid product list.' }, { status: 400 });
  }
  const seen = new Set<number>();
  for (const item of newProducts) {
    if (!isValidProduct(item) || seen.has(item.id)) {
      return NextResponse.json({ error: 'Product data is invalid.' }, { status: 400 });
    }
    seen.add(item.id);
  }

  try {
    await saveProducts(newProducts);
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Products] Catalog write failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Catalog could not be saved.' }, { status: 503 });
  }
}

function isValidProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const product = value as Record<string, unknown>;
  const safeImage = (image: unknown) => typeof image === 'string'
    && (image === '/brand-logo-bw.png' || /^\/product-images\/[\p{L}\p{N}._() -]{1,180}$/u.test(image));
  return Number.isSafeInteger(product.id) && Number(product.id) > 0
    && typeof product.name === 'string' && product.name.trim().length > 0 && product.name.length <= 160
    && Number.isSafeInteger(product.price) && Number(product.price) >= 0 && Number(product.price) <= 10_000_000
    && typeof product.description === 'string' && product.description.length <= 2_000
    && typeof product.category === 'string' && product.category.length > 0 && product.category.length <= 80
    && Number.isSafeInteger(product.stock) && Number(product.stock) >= 0 && Number(product.stock) <= 100_000
    && typeof product.featured === 'boolean'
    && safeImage(product.image)
    && (product.images === undefined || (Array.isArray(product.images) && product.images.length <= 8 && product.images.every(safeImage)));
}

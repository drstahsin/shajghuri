import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json([]);
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const products = JSON.parse(fileContents);
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProducts = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(newProducts, null, 2), 'utf8');
    return NextResponse.json(
      { success: true, message: 'Products updated successfully' },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

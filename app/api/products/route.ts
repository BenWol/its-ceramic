import { NextResponse } from 'next/server';
import { getProducts } from '../../../lib/airtable';

export async function GET() {
  try {
    const products = await getProducts();

    return NextResponse.json(
      { products },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

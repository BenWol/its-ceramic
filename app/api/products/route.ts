import { NextResponse } from 'next/server';

type AirtableRecord = {
  id: string;
  fields: Record<string, any>;
};

type Product = {
  id: string;
  name: string;
  category: string;
  material: string;
  technique: string;
  dimensions: string;
  price: number;
  images: string[]; // URLs
  active: boolean;
  stock: 'available' | 'sold';
};

async function fetchAllAirtableRecords(baseId: string, tableName: string, apiKey: string) {
  const records: AirtableRecord[] = [];
  let offset: string | undefined = undefined;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    // Sort by Order field descending (higher number = shown first)
    params.set('sort[0][field]', 'Order');
    params.set('sort[0][direction]', 'desc');
    if (offset) params.set('offset', offset);

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable fetch failed: ${res.status} ${res.statusText} - ${text}`);
    }

    const json = await res.json();
    if (Array.isArray(json.records)) {
      records.push(...json.records);
    }

    offset = json.offset;
  } while (offset);

  return records;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const preview = url.searchParams.get('preview') === '1';
    const previewSecret = url.searchParams.get('previewSecret') || undefined;

    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json({ error: 'Missing Airtable configuration' }, { status: 500 });
    }

    // Preview protection (optional)
    if (preview && process.env.AIRTABLE_PREVIEW_SECRET) {
      if (!previewSecret || previewSecret !== process.env.AIRTABLE_PREVIEW_SECRET) {
        return NextResponse.json({ error: 'Unauthorized preview' }, { status: 401 });
      }
    }

    const records = await fetchAllAirtableRecords(baseId, tableName, apiKey);

    const products: Product[] = records.map(r => {
      const f = r.fields || {};
      const attachments = f.Image || f.Images || [];
      const images: string[] = Array.isArray(attachments)
        ? attachments.map((a: any) => a.url).filter(Boolean)
        : [];

      return {
        id: r.id,
        name: f.Name || '',
        category: f.Category || '',
        material: f.Material || '',
        technique: f.Technique || '',
        dimensions: f.Dimensions || '',
        price: Number(f.Price ?? 0),
        images,
        active: !!f.Active,
        stock: f.Stock === 'sold' ? 'sold' : 'available',
      };
    });

    const visible = preview ? products : products.filter(p => p.active);

    // Sort: available items first, then sold items (both groups already sorted newest first from Airtable)
    const available = visible.filter(p => p.stock === 'available');
    const sold = visible.filter(p => p.stock === 'sold');
    const sorted = [...available, ...sold];

    return NextResponse.json(
      { products: sorted },
      {
        status: 200,
        headers: {
          // Short cache for viewers + stale-while-revalidate for faster UX
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('Error fetching Airtable', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

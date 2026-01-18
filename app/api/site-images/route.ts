import { NextResponse } from 'next/server';

type AirtableRecord = {
  id: string;
  fields: Record<string, any>;
};

export type SiteContent = {
  id: string;
  key: string; // e.g., "hero", "collection-circus", "about-artist", "about-studio-1"
  image: string;
  alt?: string;
  title?: string;
  description?: string;
};

async function fetchSiteImages(baseId: string, tableName: string, apiKey: string) {
  const params = new URLSearchParams();
  params.set('pageSize', '100');

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
  return json.records as AirtableRecord[];
}

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images';
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json({ error: 'Missing Airtable configuration' }, { status: 500 });
    }

    const records = await fetchSiteImages(baseId, tableName, apiKey);

    const content: SiteContent[] = records.map((r) => {
      const f = r.fields || {};
      const attachments = f.Image || f.Images || [];
      const imageUrl = Array.isArray(attachments) && attachments.length > 0
        ? attachments[0].url
        : '';

      return {
        id: r.id,
        key: f.Key || '',
        image: imageUrl,
        alt: f.Alt || '',
        title: f.Title || '',
        description: f.Description || '',
      };
    }).filter(item => item.key); // Only need a key, image/text can be optional

    // Convert to a key-value map for easy access
    const contentMap: Record<string, SiteContent> = {};
    content.forEach(item => {
      contentMap[item.key] = item;
    });

    return NextResponse.json(
      { content: contentMap },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('Error fetching site images:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

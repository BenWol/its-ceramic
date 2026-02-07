import { cache } from 'react';

// Types
type AirtableRecord = {
  id: string;
  fields: Record<string, any>;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  collection: string;
  material: string;
  technique: string;
  dimensions: string;
  description: string;
  price: number;
  images: string[];
  active: boolean;
  stock: 'available' | 'sold';
};

export type SiteContent = {
  id: string;
  key: string;
  image: string;
  alt?: string;
  title?: string;
  description?: string;
};

// Airtable config
function getConfig() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!baseId || !apiKey) {
    throw new Error('Missing Airtable configuration');
  }
  return { baseId, apiKey };
}

// Fetch all records with pagination
async function fetchAllRecords(tableName: string, sort?: { field: string; direction: string }) {
  const { baseId, apiKey } = getConfig();
  const records: AirtableRecord[] = [];
  let offset: string | undefined = undefined;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (sort) {
      params.set('sort[0][field]', sort.field);
      params.set('sort[0][direction]', sort.direction);
    }
    if (offset) params.set('offset', offset);

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
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

// Products
export const getProducts = cache(async (): Promise<Product[]> => {
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';
  const records = await fetchAllRecords(tableName, { field: 'Order', direction: 'desc' });

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
      collection: f.Collection || '',
      material: f.Material || '',
      technique: f.Technique || '',
      dimensions: f.Dimensions || '',
      description: f.Description || '',
      price: Number(f.Price ?? 0),
      images,
      active: !!f.Active,
      stock: f.Stock === 'sold' ? 'sold' : 'available',
    };
  });

  return products.filter(p => p.active);
});

// Site Content
export const getSiteContent = cache(async (): Promise<Record<string, SiteContent>> => {
  const tableName = process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images';
  const records = await fetchAllRecords(tableName);

  const contentMap: Record<string, SiteContent> = {};

  records.forEach((r) => {
    const f = r.fields || {};
    const key = f.Key || '';
    if (!key) return;

    const attachments = f.Image || f.Images || [];
    const imageUrl = Array.isArray(attachments) && attachments.length > 0
      ? attachments[0].url
      : '';

    contentMap[key] = {
      id: r.id,
      key,
      image: imageUrl,
      alt: f.Alt || '',
      title: f.Title || '',
      description: f.Description || '',
    };
  });

  return contentMap;
});

// Site content helpers (same logic as the useSiteContent hook, but for server components)
export function createSiteContentHelpers(content: Record<string, SiteContent>) {
  const isEmpty = (value: string | undefined): boolean => {
    if (!value) return true;
    const trimmed = value.trim();
    return trimmed === '' || trimmed === '-' || trimmed === '—';
  };

  const fieldIndicator = (key: string, field: string, fallback?: string): string => {
    const indicator = `[${key}:${field}]`;
    return fallback ? `${indicator} ${fallback}` : indicator;
  };

  const getImage = (key: string, fallback?: string): string => {
    const value = content[key]?.image;
    return isEmpty(value) ? (fallback || '') : value!;
  };

  const getAlt = (key: string, fallback?: string): string => {
    const value = content[key]?.alt;
    return isEmpty(value) ? (fallback || '') : value!;
  };

  const getTitle = (key: string, fallback?: string): string => {
    const value = content[key]?.title;
    if (isEmpty(value)) {
      return fieldIndicator(key, 'title', fallback);
    }
    return value!;
  };

  const getDescription = (key: string, fallback?: string): string => {
    const value = content[key]?.description;
    if (isEmpty(value)) {
      return fieldIndicator(key, 'description', fallback);
    }
    return value!;
  };

  return { getImage, getAlt, getTitle, getDescription };
}

import { cache } from 'react';
import { list } from '@vercel/blob';

// Types
export type ProductImage = {
  url: string;
  thumbnail: string;
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
  thumbnails: string[];
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

// Find a blob's public URL by its path prefix
async function findBlobUrl(prefix: string): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix, limit: 1 });
    return blobs[0]?.url || null;
  } catch {
    return null;
  }
}

// Fallback: fetch directly from Airtable (used when Blob cache is not seeded yet)
async function fetchProductsFromAirtable(): Promise<Product[]> {
  const { fetchAllRecords } = await import('./airtable-fetch');
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';
  const records = await fetchAllRecords(tableName, { field: 'Order', direction: 'desc' });

  return records
    .map(r => {
      const f = r.fields || {};
      const attachments = f.Image || f.Images || [];
      const images: string[] = [];
      const thumbnails: string[] = [];

      if (Array.isArray(attachments)) {
        for (const a of attachments) {
          const fullUrl = a.thumbnails?.full?.url || a.url;
          const thumbUrl = a.thumbnails?.large?.url || fullUrl;
          if (fullUrl) images.push(fullUrl);
          if (thumbUrl) thumbnails.push(thumbUrl);
        }
      }

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
        thumbnails,
        active: !!f.Active,
        stock: (f.Stock === 'sold' ? 'sold' : 'available') as 'available' | 'sold',
      };
    })
    .filter(p => p.active);
}

async function fetchSiteContentFromAirtable(): Promise<Record<string, SiteContent>> {
  const { fetchAllRecords } = await import('./airtable-fetch');
  const tableName = process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images';
  const records = await fetchAllRecords(tableName);

  const contentMap: Record<string, SiteContent> = {};
  records.forEach(r => {
    const f = r.fields || {};
    const key = f.Key || '';
    if (!key) return;

    const attachments = f.Image || f.Images || [];
    const firstAttachment =
      Array.isArray(attachments) && attachments.length > 0 ? attachments[0] : null;
    const imageUrl = firstAttachment
      ? firstAttachment.thumbnails?.full?.url || firstAttachment.url || ''
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
}

// Products — reads from Vercel Blob cache, falls back to Airtable
export const getProducts = cache(async (): Promise<Product[]> => {
  const url = await findBlobUrl('cache/products.json');

  if (url) {
    try {
      const res = await fetch(url, { next: { tags: ['products'] } });
      if (res.ok) return res.json();
    } catch {
      // Blob not available, fall through to Airtable
    }
  }

  console.warn('Blob cache miss for products — falling back to Airtable');
  try {
    return await fetchProductsFromAirtable();
  } catch (err) {
    console.error('Failed to fetch products from both Blob and Airtable:', err);
    return [];
  }
});

// Site Content — reads from Vercel Blob cache, falls back to Airtable
export const getSiteContent = cache(async (): Promise<Record<string, SiteContent>> => {
  const url = await findBlobUrl('cache/site-content.json');

  if (url) {
    try {
      const res = await fetch(url, { next: { tags: ['site-content'] } });
      if (res.ok) return res.json();
    } catch {
      // Blob not available, fall through to Airtable
    }
  }

  console.warn('Blob cache miss for site content — falling back to Airtable');
  try {
    return await fetchSiteContentFromAirtable();
  } catch (err) {
    console.error('Failed to fetch site content from both Blob and Airtable:', err);
    return {};
  }
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

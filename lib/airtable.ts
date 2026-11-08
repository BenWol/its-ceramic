import { cache } from 'react';
import { slugify } from './slug';
import catalogData from '../data/catalog.json';

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

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  alt: string;
  order: number;
};

export type SiteContent = {
  id: string;
  key: string;
  image: string;
  alt?: string;
  title?: string;
  description?: string;
};

// The catalog is copied from Airtable into data/catalog.json (and the photos into
// public/media) by scripts/sync-catalog.mjs, so pages are built once and visits
// never call Airtable or Vercel Blob.
type CatalogFile = {
  products: Product[];
  siteContent: Record<string, SiteContent>;
  collections: Collection[];
};

const catalogFile = catalogData as CatalogFile;

export const getProducts = cache(async (): Promise<Product[]> => catalogFile.products);

export const getSiteContent = cache(async (): Promise<Record<string, SiteContent>> => catalogFile.siteContent);

export const getCollections = cache(async (): Promise<Collection[]> => catalogFile.collections);

// Products and collections together, with each product's collection set to the
// collection's display name ("Marmol" → "Mármol"), or '' when it isn't a published
// collection (e.g. "Special"), so pieces never link to a collection page that doesn't exist.
export const getCatalog = cache(async () => {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);
  const bySlug = new Map(collections.map(c => [c.slug, c]));

  const normalizedProducts = products.map(p => ({
    ...p,
    collection: bySlug.get(slugify(p.collection))?.name || '',
  }));

  // Collections without their own photo use the first photo of one of their pieces
  const collectionsWithImages = collections.map(c => {
    if (c.image) return c;
    const piece = normalizedProducts.find(p => p.collection === c.name && p.images.length > 0);
    return { ...c, image: piece?.images[0] || '' };
  });

  return { products: normalizedProducts, collections: collectionsWithImages };
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

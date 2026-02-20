import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { fetchAllRecords } from '../../../lib/airtable-fetch';
import type { Product, SiteContent } from '../../../lib/airtable';

type ImageManifest = Record<string, string>; // key -> blob URL

function validateSecret(request: Request): boolean {
  const url = new URL(request.url);
  const secret =
    url.searchParams.get('secret') ||
    request.headers.get('x-revalidate-secret');
  return !!secret && secret === process.env.REVALIDATE_SECRET;
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, contentType };
}

function getExtension(contentType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeMap[contentType] || 'jpg';
}

async function uploadImageIfNeeded(
  imageKey: string,
  sourceUrl: string,
  manifest: ImageManifest,
): Promise<string> {
  // Already uploaded? Return existing URL
  if (manifest[imageKey]) {
    return manifest[imageKey];
  }

  try {
    const { buffer, contentType } = await downloadImage(sourceUrl);
    const ext = getExtension(contentType);
    const blobPath = `images/${imageKey}.${ext}`;

    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });

    manifest[imageKey] = blob.url;
    return blob.url;
  } catch (error) {
    console.error(`Failed to upload image ${imageKey}:`, error);
    return sourceUrl; // fall back to Airtable URL
  }
}

async function syncHandler(request: Request) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    // 1. Load existing manifest (or start fresh)
    let manifest: ImageManifest = {};
    try {
      const { blobs } = await list({ prefix: 'cache/manifest.json', limit: 1 });
      if (blobs[0]) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        if (res.ok) manifest = await res.json();
      }
    } catch {
      // first run, no manifest yet
    }

    // 2. Fetch raw data from Airtable
    const productsTable = process.env.AIRTABLE_TABLE_NAME || 'Products';
    const siteImagesTable = process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images';

    const [productRecords, siteRecords] = await Promise.all([
      fetchAllRecords(productsTable, { field: 'Order', direction: 'desc' }),
      fetchAllRecords(siteImagesTable),
    ]);

    // 3. Process products — upload images, build Product[]
    const products: Product[] = [];

    for (const r of productRecords) {
      const f = r.fields || {};
      const attachments = f.Image || f.Images || [];
      const images: string[] = [];
      const thumbnails: string[] = [];

      if (Array.isArray(attachments)) {
        for (let i = 0; i < attachments.length; i++) {
          const a = attachments[i];
          const fullSourceUrl = a.thumbnails?.full?.url || a.url;
          const thumbSourceUrl = a.thumbnails?.large?.url || fullSourceUrl;

          const fullKey = `products-${r.id}-${i}-full`;
          const fullBlobUrl = await uploadImageIfNeeded(fullKey, fullSourceUrl, manifest);
          images.push(fullBlobUrl);

          const thumbKey = `products-${r.id}-${i}-thumb`;
          const thumbBlobUrl = await uploadImageIfNeeded(thumbKey, thumbSourceUrl, manifest);
          thumbnails.push(thumbBlobUrl);
        }
      }

      products.push({
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
        stock: f.Stock === 'sold' ? 'sold' : 'available',
      });
    }

    const activeProducts = products.filter(p => p.active);

    // 4. Process site content — upload images, build Record<string, SiteContent>
    const contentMap: Record<string, SiteContent> = {};

    for (const r of siteRecords) {
      const f = r.fields || {};
      const key = f.Key || '';
      if (!key) continue;

      const attachments = f.Image || f.Images || [];
      const firstAttachment =
        Array.isArray(attachments) && attachments.length > 0 ? attachments[0] : null;

      let imageUrl = '';
      if (firstAttachment) {
        const sourceUrl = firstAttachment.thumbnails?.full?.url || firstAttachment.url || '';
        if (sourceUrl) {
          const imageKey = `site-${r.id}-0-full`;
          imageUrl = await uploadImageIfNeeded(imageKey, sourceUrl, manifest);
        }
      }

      contentMap[key] = {
        id: r.id,
        key,
        image: imageUrl,
        alt: f.Alt || '',
        title: f.Title || '',
        description: f.Description || '',
      };
    }

    // 5. Save JSON files to Blob
    await Promise.all([
      put('cache/products.json', JSON.stringify(activeProducts), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      }),
      put('cache/site-content.json', JSON.stringify(contentMap), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      }),
      put('cache/manifest.json', JSON.stringify(manifest), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      }),
    ]);

    // 6. Revalidate all pages
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      stats: {
        products: activeProducts.length,
        siteContentKeys: Object.keys(contentMap).length,
        imagesInManifest: Object.keys(manifest).length,
      },
    });
  } catch (error: any) {
    console.error('Revalidation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return syncHandler(request);
}

// GET for easy manual triggering in browser
export async function GET(request: Request) {
  return syncHandler(request);
}

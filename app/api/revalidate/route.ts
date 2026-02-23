import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { fetchAllRecords } from '../../../lib/airtable-fetch';
import type { Product, SiteContent } from '../../../lib/airtable';

type ManifestEntry = { blobUrl: string; attachmentId: string };
type ImageManifest = Record<string, ManifestEntry>;

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

type UploadResult = { url: string; action: 'skipped' | 'uploaded' | 'failed' };

async function uploadImageIfNeeded(
  imageKey: string,
  sourceUrl: string,
  attachmentId: string,
  manifest: ImageManifest,
): Promise<UploadResult> {
  // Already uploaded and attachment unchanged? Return existing URL
  const existing = manifest[imageKey];
  if (existing && existing.attachmentId === attachmentId) {
    return { url: existing.blobUrl, action: 'skipped' };
  }

  try {
    const { buffer, contentType } = await downloadImage(sourceUrl);
    const ext = getExtension(contentType);
    const blobPath = `images/${imageKey}.${ext}`;

    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    manifest[imageKey] = { blobUrl: blob.url, attachmentId };
    return { url: blob.url, action: 'uploaded' };
  } catch (error) {
    console.error(`Failed to upload image ${imageKey}:`, error);
    return { url: sourceUrl, action: 'failed' };
  }
}

function renderResponse(
  success: boolean,
  log: string[],
  stats: Record<string, number> | null,
  request: Request,
  errorMsg?: string,
) {
  const accept = request.headers.get('accept') || '';
  const isHtml = accept.includes('text/html');

  if (!isHtml) {
    if (!success) {
      return NextResponse.json({ error: errorMsg || 'Revalidation failed' }, { status: 500 });
    }
    return NextResponse.json({ success: true, stats, log });
  }

  const statusIcon = success ? '&#10003;' : '&#10007;';
  const statusColor = success ? '#22c55e' : '#ef4444';
  const statusText = success ? 'Sync completed' : 'Sync failed';

  const logHtml = log
    .map(line => {
      let color = '#cbd5e1';
      if (line.startsWith('FAILED') || line.startsWith('ERROR') || line.startsWith('-')) color = '#ef4444';
      else if (line.startsWith('Uploaded') || line.startsWith('+')) color = '#22c55e';
      else if (line.startsWith('~')) color = '#facc15';
      return `<div style="color:${color};padding:2px 0">${line}</div>`;
    })
    .join('\n');

  const statsHtml = stats
    ? Object.entries(stats)
        .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
        .join('\n')
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>its ceramic — sync</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
  .container { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem; }
  .status { display: inline-flex; align-items: center; gap: .5rem; color: ${statusColor}; font-weight: 600; margin-bottom: 1rem; }
  .log { background: #1e293b; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: .8rem; line-height: 1.6; margin-bottom: 1rem; overflow-x: auto; }
  .stats { background: #1e293b; border-radius: 8px; padding: 1rem; font-size: .85rem; line-height: 1.8; }
</style></head>
<body><div class="container">
  <h1>its ceramic — sync</h1>
  <div class="status"><span style="font-size:1.2rem">${statusIcon}</span> ${statusText}</div>
  <div class="log">${logHtml}</div>
  ${statsHtml ? `<div class="stats">${statsHtml}</div>` : ''}
</div></body></html>`;

  return new NextResponse(html, {
    status: success ? 200 : 500,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function loadBlobJson<T>(prefix: string): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix, limit: 1 });
    if (blobs[0]) {
      const res = await fetch(blobs[0].url, { cache: 'no-store' });
      if (res.ok) return await res.json();
    }
  } catch { /* not found */ }
  return null;
}

function diffProducts(oldList: Product[], newList: Product[], log: string[]) {
  const oldMap = new Map(oldList.map(p => [p.id, p]));
  const newMap = new Map(newList.map(p => [p.id, p]));

  // Compare fields (excluding images/thumbnails which are managed separately)
  const textFields = ['name', 'category', 'collection', 'material', 'technique', 'dimensions', 'description', 'price', 'stock'] as const;

  for (const p of newList) {
    const old = oldMap.get(p.id);
    if (!old) {
      log.push(`+ New product: "${p.name}"`);
      continue;
    }
    const changes: string[] = [];
    for (const f of textFields) {
      if (String(old[f]) !== String(p[f])) {
        changes.push(`${f}: "${old[f]}" → "${p[f]}"`);
      }
    }
    if (changes.length > 0) {
      log.push(`~ Updated "${p.name}": ${changes.join(', ')}`);
    }
  }

  for (const old of oldList) {
    if (!newMap.has(old.id)) {
      log.push(`- Removed product: "${old.name}"`);
    }
  }
}

function diffSiteContent(oldMap: Record<string, SiteContent>, newMap: Record<string, SiteContent>, log: string[]) {
  const textFields = ['alt', 'title', 'description'] as const;

  for (const [key, entry] of Object.entries(newMap)) {
    const old = oldMap[key];
    if (!old) {
      log.push(`+ New site content: "${key}"`);
      continue;
    }
    const changes: string[] = [];
    for (const f of textFields) {
      if (String(old[f]) !== String(entry[f])) {
        changes.push(`${f}: "${old[f]}" → "${entry[f]}"`);
      }
    }
    if (changes.length > 0) {
      log.push(`~ Updated site content "${key}": ${changes.join(', ')}`);
    }
  }

  for (const key of Object.keys(oldMap)) {
    if (!newMap[key]) {
      log.push(`- Removed site content: "${key}"`);
    }
  }
}

async function syncHandler(request: Request) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const log: string[] = [];
  const startTime = Date.now();

  try {
    // 1. Load existing manifest and cached data
    let manifest: ImageManifest = {};
    const [prevManifest, prevProducts, prevSiteContent] = await Promise.all([
      loadBlobJson<ImageManifest>('cache/manifest.json'),
      loadBlobJson<Product[]>('cache/products.json'),
      loadBlobJson<Record<string, SiteContent>>('cache/site-content.json'),
    ]);
    if (prevManifest) {
      manifest = prevManifest;
      log.push(`Loaded manifest with ${Object.keys(manifest).length} entries`);
    } else {
      log.push('No existing manifest found — starting fresh');
    }

    // 2. Fetch raw data from Airtable
    const productsTable = process.env.AIRTABLE_TABLE_NAME || 'Products';
    const siteImagesTable = process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images';

    const [productRecords, siteRecords] = await Promise.all([
      fetchAllRecords(productsTable, { field: 'Order', direction: 'desc' }),
      fetchAllRecords(siteImagesTable),
    ]);
    log.push(`Fetched ${productRecords.length} products and ${siteRecords.length} site images from Airtable`);

    // 3. Process products — upload images, build Product[]
    const products: Product[] = [];
    let imagesUploaded = 0;
    let imagesSkipped = 0;
    let imagesFailed = 0;

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

          const attId = a.id || '';
          const fullKey = `products-${r.id}-${i}-full`;
          const fullResult = await uploadImageIfNeeded(fullKey, fullSourceUrl, attId, manifest);
          images.push(fullResult.url);
          if (fullResult.action === 'uploaded') {
            imagesUploaded++;
            log.push(`Uploaded image for "${f.Name || r.id}" (full #${i})`);
          } else if (fullResult.action === 'failed') {
            imagesFailed++;
            log.push(`FAILED image for "${f.Name || r.id}" (full #${i})`);
          } else {
            imagesSkipped++;
          }

          const thumbKey = `products-${r.id}-${i}-thumb`;
          const thumbResult = await uploadImageIfNeeded(thumbKey, thumbSourceUrl, attId, manifest);
          thumbnails.push(thumbResult.url);
          if (thumbResult.action === 'uploaded') {
            imagesUploaded++;
          } else if (thumbResult.action === 'failed') {
            imagesFailed++;
          } else {
            imagesSkipped++;
          }
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
    log.push(`Products: ${activeProducts.length} active / ${products.length} total`);
    if (prevProducts) {
      diffProducts(prevProducts, activeProducts, log);
    }

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
          const attId = firstAttachment.id || '';
          const imageKey = `site-${r.id}-0-full`;
          const result = await uploadImageIfNeeded(imageKey, sourceUrl, attId, manifest);
          imageUrl = result.url;
          if (result.action === 'uploaded') {
            imagesUploaded++;
            log.push(`Uploaded site image "${key}"`);
          } else if (result.action === 'failed') {
            imagesFailed++;
            log.push(`FAILED site image "${key}"`);
          } else {
            imagesSkipped++;
          }
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

    if (prevSiteContent) {
      diffSiteContent(prevSiteContent, contentMap, log);
    }
    log.push(`Images: ${imagesUploaded} uploaded, ${imagesSkipped} unchanged, ${imagesFailed} failed`);
    log.push(`Site content keys: ${Object.keys(contentMap).length}`);

    // 5. Save JSON files to Blob
    await Promise.all([
      put('cache/products.json', JSON.stringify(activeProducts), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
      put('cache/site-content.json', JSON.stringify(contentMap), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
      put('cache/manifest.json', JSON.stringify(manifest), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
    ]);
    log.push('Saved JSON caches to Blob');

    // 6. Revalidate all pages
    revalidatePath('/', 'layout');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log.push(`Revalidated all pages — done in ${elapsed}s`);

    return renderResponse(true, log, {
      products: activeProducts.length,
      siteContentKeys: Object.keys(contentMap).length,
      imagesUploaded,
      imagesSkipped,
      imagesFailed,
    }, request);
  } catch (error: any) {
    console.error('Revalidation failed:', error);
    log.push(`ERROR: ${error.message || 'Unknown error'}`);
    return renderResponse(false, log, null, request, error.message);
  }
}

export async function POST(request: Request) {
  return syncHandler(request);
}

// GET for easy manual triggering in browser
export async function GET(request: Request) {
  return syncHandler(request);
}

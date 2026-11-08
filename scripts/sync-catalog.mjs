#!/usr/bin/env node
// Copies the catalog from Airtable into the site itself:
//   data/catalog.json  — products, site texts and collections
//   public/media/...   — photos, resized for the web
// The site reads only these files, so visits never call Airtable or Vercel Blob.
//
// Usage:
//   node scripts/sync-catalog.mjs              # read Airtable's API (3 calls + 1 per extra 100 rows)
//   node scripts/sync-catalog.mjs --from DIR   # read raw records saved in DIR/{products,site,collections}.json
//
// Photos are only downloaded when they are new or changed (the attachment id is part of the file name).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA_FILE = path.join(ROOT, 'data/catalog.json');
const MEDIA_DIR = path.join(ROOT, 'public/media');
const FULL_WIDTH = 1600;
const THUMB_WIDTH = 800;

function slugify(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function fetchAllRecords(table, sort) {
  const { AIRTABLE_BASE_ID: baseId, AIRTABLE_API_KEY: apiKey } = process.env;
  if (!baseId || !apiKey) throw new Error('Missing AIRTABLE_BASE_ID / AIRTABLE_API_KEY');
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams({ pageSize: '100' });
    if (sort) {
      params.set('sort[0][field]', sort.field);
      params.set('sort[0][direction]', sort.direction);
    }
    if (offset) params.set('offset', offset);
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Airtable ${table}: ${res.status} ${await res.text()}`);
    const json = await res.json();
    records.push(...json.records);
    offset = json.offset;
  } while (offset);
  return records;
}

async function loadRecords(fromDir) {
  if (fromDir) {
    const read = async name => JSON.parse(await fs.readFile(path.join(fromDir, `${name}.json`), 'utf8'));
    return Promise.all([read('products'), read('site'), read('collections')]);
  }
  return Promise.all([
    fetchAllRecords(process.env.AIRTABLE_TABLE_NAME || 'Products', { field: 'Order', direction: 'desc' }),
    fetchAllRecords(process.env.AIRTABLE_SITE_IMAGES_TABLE || 'Site Images'),
    fetchAllRecords(process.env.AIRTABLE_COLLECTIONS_TABLE || 'Collections', { field: 'Order', direction: 'asc' }),
  ]);
}

const used = new Set(); // media files the new catalog refers to; everything else gets deleted
const stats = { downloaded: 0, unchanged: 0, failed: 0 };

async function exists(file) {
  return fs.access(file).then(() => true, () => false);
}

// Saves one attachment as a resized JPEG and returns its public path ('' if it fails)
async function saveImage(attachment, name, width) {
  const file = `${name}-${attachment.id || 'x'}-${width}.jpg`;
  const dest = path.join(MEDIA_DIR, file);
  used.add(file);
  if (await exists(dest)) {
    stats.unchanged++;
    return `/media/${file}`;
  }
  try {
    const res = await fetch(attachment.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    await sharp(input).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(dest);
    stats.downloaded++;
    return `/media/${file}`;
  } catch (err) {
    used.delete(file);
    stats.failed++;
    console.error(`  FAILED ${name}: ${err.message}`);
    return '';
  }
}

async function main() {
  const fromIndex = process.argv.indexOf('--from');
  const fromDir = fromIndex > -1 ? path.resolve(process.argv[fromIndex + 1]) : null;

  const [productRecords, siteRecords, collectionRecords] = await loadRecords(fromDir);
  console.log(`Read ${productRecords.length} products, ${siteRecords.length} site texts, ${collectionRecords.length} collections`);
  await fs.mkdir(MEDIA_DIR, { recursive: true });

  const products = [];
  for (const r of productRecords) {
    const f = r.fields || {};
    if (!f.Active) continue;
    const images = [];
    const thumbnails = [];
    const attachments = Array.isArray(f.Image) ? f.Image : [];
    for (let i = 0; i < attachments.length; i++) {
      const full = await saveImage(attachments[i], `p-${r.id}-${i}`, FULL_WIDTH);
      const thumb = await saveImage(attachments[i], `p-${r.id}-${i}`, THUMB_WIDTH);
      if (full) images.push(full);
      if (thumb) thumbnails.push(thumb);
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
      active: true,
      stock: f.Stock === 'sold' ? 'sold' : 'available',
      order: Number(f.Order ?? 0),
    });
  }
  // Same order as Airtable's "Order" field, highest first
  products.sort((a, b) => b.order - a.order);
  products.forEach(p => delete p.order);

  const siteContent = {};
  for (const r of siteRecords) {
    const f = r.fields || {};
    if (!f.Key) continue;
    const first = Array.isArray(f.Image) ? f.Image[0] : null;
    siteContent[f.Key] = {
      id: r.id,
      key: f.Key,
      image: first ? await saveImage(first, `s-${r.id}`, FULL_WIDTH) : '',
      alt: f.Alt || '',
      title: f.Title || '',
      description: f.Description || '',
    };
  }

  const collections = [];
  for (const r of collectionRecords) {
    const f = r.fields || {};
    if (!f.Active || !f.Name) continue;
    const first = Array.isArray(f.Image) ? f.Image[0] : null;
    collections.push({
      id: r.id,
      name: f.Name,
      slug: slugify(f.Name),
      description: f.Description || '',
      image: first ? await saveImage(first, `c-${r.id}`, FULL_WIDTH) : '',
      alt: f.Alt || '',
      order: Number(f.Order ?? 0),
    });
  }
  collections.sort((a, b) => a.order - b.order);

  // Don't overwrite a good catalog with an empty one (e.g. a broken export)
  if (products.length === 0) throw new Error('No active products found — catalog not updated');

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ products, siteContent, collections }, null, 2) + '\n');

  let removed = 0;
  for (const file of await fs.readdir(MEDIA_DIR)) {
    if (!used.has(file)) {
      await fs.unlink(path.join(MEDIA_DIR, file));
      removed++;
    }
  }

  console.log(`Catalog: ${products.length} products, ${Object.keys(siteContent).length} site texts, ${collections.length} collections`);
  console.log(`Photos: ${stats.downloaded} downloaded, ${stats.unchanged} unchanged, ${removed} removed, ${stats.failed} failed`);
  if (stats.failed > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});

// Simple test script to verify Airtable connection and list a few products.
// Usage (in project root):
// AIRTABLE_BASE_ID=... AIRTABLE_TABLE_NAME=... AIRTABLE_API_KEY=... node scripts/test-airtable.js

async function fetchAll() {
  // Node 18+ provides global `fetch` — no extra dependency required

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    console.error('Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY');
    process.exit(1);
  }

  let records = [];
  let offset;

  try {
    do {
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=100${offset ? `&offset=${offset}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!res.ok) {
        console.error('Airtable returned', res.status, res.statusText);
        const txt = await res.text();
        console.error(txt);
        process.exit(1);
      }
      const json = await res.json();
      records.push(...(json.records || []));
      offset = json.offset;
    } while (offset);

    console.log(`Fetched ${records.length} records`);
    const samples = records.slice(0, 5).map(r => ({ id: r.id, fields: r.fields }));
    console.dir(samples, { depth: 4 });
  } catch (err) {
    console.error('Error fetching Airtable:', err);
    process.exit(1);
  }
}

fetchAll();

// Raw Airtable API fetching logic — only used by the /api/revalidate endpoint.
// Normal page renders read from Vercel Blob cache instead.

export type AirtableRecord = {
  id: string;
  fields: Record<string, any>;
};

function getConfig() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!baseId || !apiKey) {
    throw new Error('Missing Airtable configuration');
  }
  return { baseId, apiKey };
}

export async function fetchAllRecords(
  tableName: string,
  sort?: { field: string; direction: string },
): Promise<AirtableRecord[]> {
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
      cache: 'no-store',
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

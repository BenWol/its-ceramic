import { NextResponse } from 'next/server';

// The refresh link. It starts the "Sync catalog from Airtable" GitHub workflow, which copies
// the catalog and photos into the repo and, when something changed, publishes the site
// (about 1–2 minutes). Pages never read Airtable themselves, so visits use no API calls.

function validateSecret(request: Request): boolean {
  const url = new URL(request.url);
  const secret =
    url.searchParams.get('secret') ||
    request.headers.get('x-revalidate-secret');
  return !!secret && secret === process.env.REVALIDATE_SECRET;
}

function respond(request: Request, success: boolean, message: string, status: number) {
  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html')) {
    return NextResponse.json(success ? { success, message } : { error: message }, { status });
  }

  const color = success ? '#22c55e' : '#ef4444';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>its ceramic — sync</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
  .container { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem; }
  .status { color: ${color}; font-weight: 600; margin-bottom: 1rem; }
  p { line-height: 1.6; }
</style></head>
<body><div class="container">
  <h1>its ceramic — sync</h1>
  <div class="status">${success ? '&#10003; Sync started' : '&#10007; Sync failed'}</div>
  <p>${message}</p>
</div></body></html>`;

  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function syncHandler(request: Request) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const token = process.env.GITHUB_SYNC_TOKEN;
  const repo = process.env.GITHUB_REPO || 'BenWol/its-ceramic';
  if (!token) {
    return respond(request, false, 'GITHUB_SYNC_TOKEN is not set in Vercel.', 500);
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ event_type: 'sync-catalog' }),
  });

  if (!res.ok) {
    console.error('GitHub dispatch failed:', res.status, await res.text());
    return respond(request, false, `GitHub answered ${res.status}. Check the GITHUB_SYNC_TOKEN in Vercel.`, 502);
  }

  return respond(
    request,
    true,
    `The changes from Airtable will be on the site in about 1–2 minutes. You can follow it at <a style="color:#93c5fd" href="https://github.com/${repo}/actions">github.com/${repo}/actions</a>.`,
    202,
  );
}

export async function POST(request: Request) {
  return syncHandler(request);
}

// GET for easy manual triggering in browser
export async function GET(request: Request) {
  return syncHandler(request);
}

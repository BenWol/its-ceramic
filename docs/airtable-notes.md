# Integration Notes & Developer Guide

## Environment variables
- `AIRTABLE_BASE_ID` (e.g., `appCb...`)
- `AIRTABLE_TABLE_NAME` (default: `Products`)
- `AIRTABLE_API_KEY` (personal access token — **keep secret**)
- `AIRTABLE_PREVIEW_SECRET` (optional: secret to allow admin previewing inactive products)

Put these in `.env.local` (never commit it). Use `.env.example` as a template.

## API route
- `GET /api/products` fetches from Airtable server-side and returns `{ products: Product[] }`.
- Supports `?preview=1&previewSecret=...` to include inactive products (requires `AIRTABLE_PREVIEW_SECRET`).
- Caching: the route responds with `Cache-Control: public, max-age=60, stale-while-revalidate=300`.

Recommendation: For the Next.js app router, that short cache (60s) with stale-while-revalidate provides a good tradeoff between freshness and performance. For higher-frequency updates or stricter guarantees you can use webhooks or a revalidation-enabled endpoint.

## Error handling
- If Airtable is unreachable or misconfigured, the API route returns a JSON error and the client displays a friendly message.
- In production, monitor the API route and set up alerting if failures are frequent.

## Security
- Use **read-only** PAT (personal access token) for the website if possible. Do not store the key in code or commit it.
- For preview, `AIRTABLE_PREVIEW_SECRET` should be a random string and stored in server environment only. The client stores an inputted secret in `localStorage` temporarily to request preview — this is convenient for non-technical previews but not intended for strong security.

## Admin preview UX
- The site includes an admin control to "Set preview secret" and toggle preview on/off.
- When preview is ON and the secret is correct, inactive products will also be returned by the API.

## Further improvements
- Use Next.js ISR / revalidate APIs to programmatically revalidate the site on airtable changes (via Zapier, Make, or an Airtable webhook + server endpoint that calls `res.revalidate()`).
- If images need optimization, consider `next/image` with a remote image domain configured in `next.config.js`.

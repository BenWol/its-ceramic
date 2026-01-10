# Testing Checklist — Airtable Integration

- [ ] Connection to Airtable base works (run `scripts/test-airtable.js`)
- [ ] Products load from Airtable on the landing page
- [ ] Images display correctly (attachments shown)
- [ ] Price formatting works (shows `€` + number)
- [ ] Inactive products are hidden from public view
- [ ] Preview mode shows inactive products when using the preview secret
- [ ] Error states show helpful messages (API down or missing config)
- [ ] Build & deployment (CI) works without exposing API key (use env vars)

Manual steps to verify:
1. Create a test product (Active checked) and confirm it appears.
2. Uncheck `Active` and confirm it no longer appears (without preview).
3. Enter preview secret on site, toggle preview ON, and confirm the inactive product is visible.
4. Temporarily revoke API key or change it to an invalid one and confirm the site shows a friendly error message.

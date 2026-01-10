# Airtable Setup Guide for "Ceramics Inventory"

This guide shows step-by-step how to create a free Airtable base and set it up for the `its ceramic` site.

1) Create a free Airtable account
- Visit https://airtable.com and sign up with your email (or GitHub/Google).
- Screenshot tip: Capture the sign-up form and the welcome dashboard.

2) Create a new base called **Ceramics Inventory**
- From the Airtable home, click "Add a base" → "Start from scratch" → name it **Ceramics Inventory**.
- Screenshot tip: Show the modal with the new base name.

3) Set up the table fields (exact field names & types):
- Rename the primary field to `Name` (Single line text).
- Add a field `Category` (Single select): add options like `jarron`, `jarra`, `set`, `taza`, `bowl`, `plate`, etc.
- Add a field `Material` (Single line text).
- Add a field `Technique` (Long text).
- Add a field `Dimensions` (Single line text).
- Add a field `Price` (Number) and set the formatting to **Euro**.
- Add a field `Image` (Attachment) — allow multiple files.
- Add a field `Active` (Checkbox) — used to hide a product from the public site while keeping it in inventory.

Screenshot tips: For each created field, take a screenshot of the field type selector and a filled row example.

4) How to get the Base ID
- Open your base, look at the URL. It will look like `https://airtable.com/appXXXXXXXXXXXXXX/tbl...` — the `appXXX...` piece is your Base ID.
- Screenshot tip: Show the browser URL bar with the highlighted Base ID.

5) How to get the Table name
- The visible table name (usually `Products`) is used in the API paths. Use the exact name shown in Airtable.

6) Create an API key (Personal Access Token)
- Click your avatar (top-right) → Account → API → Create a new personal access token or go to the **Developer hub**.
- Give it a descriptive name (e.g., `its-ceramic-read`) and allow **read** access to the base.
- Copy the token — you will paste it into `.env.local`.
- **Security note:** Keep this token secret and do not commit it.

7) How to upload product images
- In the `Image` attachment cell, drag & drop images or click to upload.
- Airtable stores attachments and returns public URLs in the API.
- Screenshot tip: Show a drag & drop image upload in the cell.

8) Create a first test product
- Fill fields for a test product, mark `Active` checked.
- Upload at least one image.
- Save the row and note that it is visible via the API.

That’s it — your base is now ready to be used by the website.

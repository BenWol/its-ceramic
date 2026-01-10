# User Guide — Managing Products (non-technical)

This guide is for the person maintaining inventory in Airtable.

- Add a new product:
  1. Open the `Ceramics Inventory` base and the `Products` table.
  2. Click **+** to create a new row.
  3. Fill `Name`, choose `Category`, enter `Material`, `Technique`, `Dimensions`, set `Price` (in €), and upload images in `Image`.
  4. Tick `Active` if you want it to appear immediately on the site.

- Edit existing products:
  - Click any cell to edit. Save is automatic.
  - Changing `Active` to unchecked hides the product from the site (it is not deleted).

- Upload or change images:
  - Click into the `Image` cell and drag & drop one or more image files.
  - The first attachment will be used as the main image on the landing page.

- How changes appear on the website:
  - The site reads data from Airtable and caches responses for a short time.
  - Small delays (up to a minute) are expected because of caching; you can use **Preview** mode to bypass that for immediate checks.

- Preview mode (admin):
  - Click "Set preview secret" on the site and enter the secret provided by the site administrator.
  - Toggle `Preview` ON to include inactive products and see changes immediately.

If you need help or see an error on the site, contact the site administrator and include a screenshot and the product name.

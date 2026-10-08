# Public winner announcement integration

The public announcement (`winner-gallery-preview.html`) reads `published-winners.json` from the **same deployed website directory**. It does **not** read browser localStorage and contains no demo winner fallback.

## Workflow
1. In Winners Management, assign the recipients and complete name/brand/consent/jury verification.
2. Lock each category to be published and satisfy the release/embargo settings.
3. Click **Publish Winners** to download `published-winners.json`.
4. Review the JSON carefully for correctness and consent. Place it at the root of your public Vercel/GitHub website next to `winner-gallery-preview.html` and deploy it.
5. Visit `/winner-gallery-preview.html` and verify the published nominees and categories.
6. For subsequent changes, repeat export, deploy, and verification. The page fetches the file fresh on load.

**Important:** There is no automatic server-side publishing or shared backend connection in this patch. Winners Management still stores decisions in browser localStorage, and the static JSON is the public delivery mechanism. Browser-only localStorage cannot securely publish across browsers/devices. Use an authenticated backend or protected deploy workflow for automatic publishing. Do not put GitHub or Supabase secret credentials in frontend JavaScript.

**Safety:** No file deployed, invalid file, or missing recipients results in an unpublished/empty message, not demonstration winners. Older published-winners.json exports with `type: winners` and categories/recipients still work. Never deploy test data.

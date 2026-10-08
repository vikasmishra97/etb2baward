# Winner content queue to public announcement

The public `winner-gallery-preview.html` reads only `published-winners.json`. It never reads browser-local draft or demo records.

1. In Winners Management, assign recipients, complete the four checks, and lock the categories.
2. In Winner Gallery, confirm those recipients show **Public-ready**.
3. Click **Export winners for website** to download `published-winners.json`. Only locked, verified recipients are exported. A future scheduled release blocks exporting.
4. Review the file, add it beside `winner-gallery-preview.html` in the deployed site root, commit and deploy to Vercel.
5. Visit `/published-winners.json` to confirm it is publicly accessible; then refresh `/winner-gallery-preview.html`.

**Important:** Export is not live publishing. GitHub/Vercel deployment is required; never expose GitHub or Supabase secret keys in front-end code. Gallery profile edits are not a public content CMS; the exported public record includes name, award, category, and profile headline.

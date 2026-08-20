ETB2B Awards V19 - Website-First Award Builder
==============================================

WHAT CHANGED
- Create Award now saves basic event + nomination details and redirects directly to Website Studio.
- Website Studio includes live preview and editable basic details.
- Desktop + mobile banner uploads.
- 4 hero designs and 4 full visual presets.
- Every homepage section has On/Off plus its own design style.
- Sections included: Overview, Key Discussion Points, Who Should Attend, Why Join Us,
  Event Description, Speakers, Agenda, Resources, Glimpse/About, Contact, Custom HTML section.
- Registration form fields can be turned on/off and appear directly in the banner.
- Smart CTA changes automatically:
  * Before nomination start -> Express Interest
  * During nomination window -> Nominate Now
  * After nomination end -> Nominations Closed
- Nominate Now opens the public category page (nominate.html).
- Express Interest stores a demo lead in browser localStorage and opens thank-you.html.
- Landing/public site: website-preview.html
- Rewards page: rewards.html
- Thank-you page: thank-you.html
- Public category/nomination starter: nominate.html
- Save & Continue from Website Studio redirects to categories.html, then the existing flow continues.
- Existing V18 browser website data is migrated to the new V19 website structure when possible.

BEST DEMO FLOW
1. index.html -> click Create award
2. create-award.html -> click Use test award
3. Click Create award & build website
4. website.html -> upload a banner, switch hero/theme, toggle sections, edit content
5. Registration tab -> choose fields
6. Open Preview -> test Nominate Now
7. nominate.html -> choose a category and start nomination
8. Back in Website Studio -> Save & continue to Categories
9. categories.html -> continue existing category / entry-form / pricing journey

DEPLOY TO GITHUB + VERCEL
1. Extract this ZIP.
2. Open the site folder.
3. In GitHub repo: Add file -> Upload files.
4. Upload everything INSIDE site and replace existing files.
5. Commit message suggestion: ETB2B Awards V19 - Website First Builder
6. Vercel will auto-deploy from GitHub.
7. Open https://etb2baward.vercel.app/

PROTOTYPE NOTE
This version is a functional front-end prototype using browser localStorage. Data is saved in the
same browser/domain. It is not yet connected to a shared database, authentication, payment gateway,
email/WhatsApp provider or server-side storage.

Footer credit: Vikas Mishra

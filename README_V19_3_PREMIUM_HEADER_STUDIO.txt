ETB2B Awards V19.3 - Premium Header Studio

WHAT CHANGED
- Rebuilt Website Studio > Header into four premium workspaces: Basics, Hero Media, Brand & SEO, Style.
- Improved builder typography, spacing, panel width and live-preview sizing for laptops.
- Hero Media now supports:
  * Desktop background (1600 x 720)
  * Mobile background (768 x 1024)
  * Branding Banner Image (571 x 340)
  * Background focus position
  * Overlay strength
  * Illustration size
- Brand & SEO now supports:
  * Branding banner (1200 x 260)
  * Top / Presented-by sponsor logo
  * Bottom / Powered-by sponsor logo
  * SEO / social share image (1200 x 630)
  * Thumbnail image (300 x 300)
  * SEO page title and meta description with live search preview
- All header image uploads open the Smart Image Studio for crop/reposition/compression.
- Illustration/logo uploads preserve transparency when no background replacement is selected.
- Public website renderer now uses the foreground illustration, branding strip and sponsor assets.
- Public preview reads SEO title/description/share-image configuration and sets browser metadata in the prototype.
- Existing V19.2 section designer, speaker, agenda, gallery, contact and drag/drop functionality remains included.

TEST FLOW
1. Open website.html.
2. Header > Basics: update award information.
3. Header > Hero Media: upload desktop/mobile backgrounds and an illustration.
4. Adjust background focus, overlay and illustration size.
5. Header > Brand & SEO: upload 1200x630 SEO image and 300x300 thumbnail.
6. Add SEO title and description.
7. Open Preview and verify public header.
8. Continue testing Sections / Registration / Navigation / Pages.

PROTOTYPE NOTE
Data is stored in browser localStorage. Images are compressed client-side. Production SEO metadata should eventually be server-rendered so search/social crawlers can read it without JavaScript.

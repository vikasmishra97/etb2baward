ETB2B Awards V19.19 - Custom Section Design Import

What changed
- Added a reusable Custom Layout box inside Layout Design for every website section.
- Supports design source selection: Figma, Lovable, or Custom API.
- Added a Figma/Lovable share-link field.
- Added a Conversion API endpoint field.
- Added direct Converted HTML and Section CSS fallback fields.
- Added Convert & Apply, Apply HTML/CSS, and Return to standard layout actions.
- Custom design data is stored per section, so every section can have its own imported design.
- Existing section content/data remains available when a custom layout is enabled.
- Imported script tags, inline event handlers and javascript: URLs are removed before rendering.
- Private API/Figma tokens are intentionally not stored in this browser prototype; use a server-side proxy.

Conversion API contract
POST <your endpoint>
Content-Type: application/json

Request body:
{
  "source": "figma" | "lovable" | "api",
  "designUrl": "https://...",
  "sectionId": "overview",
  "section": { ...current section data... }
}

Expected JSON response:
{
  "html": "<div class=\"imported-section\">...</div>",
  "css": ".imported-section { ... }"
}

How to test
1. Open website.html.
2. Open Sections and edit any section.
3. Choose Layout Design.
4. Scroll below the standard layout cards to Custom Layout.
5. Either paste HTML/CSS and click Apply HTML/CSS, or enter a design link + API endpoint and click Convert & Apply.
6. Confirm the live preview switches only that section to the imported design.
7. Click Return to standard layout to restore the normal renderer.

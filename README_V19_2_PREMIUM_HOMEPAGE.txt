ETB2B Awards V19.2 — Premium Homepage Builder

Major upgrades
- Larger, clearer Homepage Sections UI
- Drag & drop section ordering
- Inactive sections automatically move below active sections
- Premium per-section layout gallery with more visual options
- Speaker management with groups, drag/drop ordering and active/inactive state
- Smart Speaker Photo Studio: crop, zoom/pan, auto compression, light/dark background cleanup and background color replacement
- Agenda manager with Agenda, Agenda Groups, Speaker Weightage and Group Weightage tabs
- Agenda session editor: title, start/end date & time, group, speakers, summary, description points and status
- Glimpse/Image Gallery manager with Image, Image Group and Image Weightage tabs
- Smart gallery upload with crop + auto compression
- Bulk gallery group update and drag/drop image ordering
- Contact directory with multiple contacts, contact groups, status and drag/drop ordering
- Existing localStorage data is migrated forward where possible
- Public website preview now renders speaker photos, grouped speakers, enhanced agenda, real gallery images and multiple contacts

Quick test
1. Open website.html
2. Open Sections tab
3. Drag Overview / Speakers / Agenda to reorder
4. Turn a section OFF: it should move to Inactive sections
5. Customize Speakers -> upload a photo -> use crop/background tools -> Apply
6. Customize Speakers -> Speaker Groups -> add/reorder groups
7. Customize Agenda -> + Add Agenda -> fill complete session details
8. Customize Glimpse / About -> + Add New Image -> crop/compress -> assign group
9. Customize Contact -> + Add New Contact -> assign contact group
10. Open Layout Design for any section and switch among layouts
11. Save and open website-preview.html

Prototype note
This is a front-end Vercel-ready prototype. Data and uploaded/compressed images are stored in browser localStorage. Production should move content and media to a backend/database/object storage.

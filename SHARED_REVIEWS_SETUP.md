# Shared jury evaluations — setup

This patch makes authenticated jury submissions write to Supabase and allows the admin Shortlist Management page to fetch submitted records from Supabase. The existing nominations, jury assignments and shortlist decisions are still browser-local: this is a **review-sync integration**, not a complete multi-user awards backend.

1. Create a Supabase project. In SQL Editor execute `shared-reviews-setup.sql`.
2. In Supabase Authentication create accounts for each juror and admin. Use unique emails, secure passwords, and confirmed email addresses. Do not publish passwords.
3. In Table Editor (or SQL editor), insert matching rows in `review_accounts`. `juror_id` must match the existing local juror ID (shown in admin jury management, not the email). Admin rows require `juror_id` NULL. Configure a secure method for onboarding users.
4. Edit `shared-reviews-config.js` with the Supabase project URL and **publishable/anon key ONLY**. NEVER put a `service_role`/secret key into website files.
5. Deploy the patch's files with unchanged relative paths. HTTPS required. Each juror signs into the shared reviews panel with their Supabase credentials in addition to the existing jury portal login; the admin does likewise in Scores & Shortlist.
6. Confirm one submission from an actual juror login/device and verify it appears on the admin page in another device. Check browser developer console for network/RLS errors.

**Limitations and security**: The old localStorage login is not server-backed authentication. Supabase Auth provides separate credentials for score submission. For production, move nomination records, round assignments, scoring definitions and shortlist decisions to authenticated server tables, and enforce nomination-specific assignments in RLS before relying on this system for confidential awards. Current RLS restricts juror identity but does not validate individual nominee assignments. Scores already in localStorage are not automatically migrated. Existing browser-local scores remain as local data, and the admin merges fetched remote submissions into them; server records take priority on matching review IDs. This feature does not publish public shortlists or winners to GitHub Pages automatically.

ETB2B Awards V19.17.2 — Premium Categories + Multi-Nomination Flow
Base: V19.17.1 completed homepage/navigation. Homepage behavior is preserved.

ADMIN / BACKEND
1. Open categories.html.
2. Public Category Experience now lets the organiser choose:
   - Single category
   - Multiple categories
   - Maximum category selections
   - Smart answer reuse ON/OFF
   - AI Category Finder ON/OFF
3. Existing category controls (description, group, fee, eligibility, status, limits) still work.

PUBLIC FLOW
1. Open nominate.html.
2. Search/filter categories or use AI Category Finder.
3. Select one or multiple categories according to the backend rule.
4. A fixed nomination-list dock appears with selected categories and total fee.
5. Click Review nominations.
6. nomination-bucket.html lists all selected categories and form progress.
7. Fill forms one by one using nomination-form.html.
8. When the same question appears again, matching answers are imported automatically when Smart Answer Reuse is ON.
9. Once all required forms are complete, Continue to payment.
10. payment-checkout.html groups all selected category fees into one demo checkout.
11. Submit to reach nomination-success.html.

LOCAL STORAGE KEYS
- etb2b_awards_category_settings_<slug>
- etb2b_public_category_selection_<slug>
- etb2b_public_nomination_bucket_<slug>
- etb2b_public_nomination_answers_<slug>_<categoryId>
- etb2b_public_shared_answers_<slug>
- etb2b_public_nominee_profile_<slug>
- etb2b_public_payment_<slug>

AI NOTE
The current manager prototype uses local keyword-fit ranking for Category AI. In production this can be replaced with semantic embeddings / LLM classification against category eligibility, description and historic successful entries.

PAYMENT NOTE
The checkout is a front-end demo and does not make a real payment.

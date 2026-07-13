# Featured Images: Stay Consistent with the Original System, Scale the Pool

## Context

User wants post images consistent with how the first 50 were created — superseding the earlier "unique branded card per post" addendum (Imagine.art / hybrid-card idea dropped). Current state (verified): all 50 published posts + all 24 queued posts pull from the same 12-image professional-stock pool (`voltixio-blog-*.jpg`, WP attachments, 1200×630, assigned via `wp.editPost post_thumbnail`). The system is already consistent; the problem is pool size. 226 total posts ÷ 12 images = ~19 repeats each, and the /blog/ grid (12 cards/page) will show duplicates side-by-side on every page. Fix repetition by extending the existing pipeline, not replacing it.

## Approach — same system, bigger topic-matched pool

1. **Expand the pool 12 → ~40 images** using the exact same method as before (proven in `scratchpad/fix_images_and_titles.py`): curated Unsplash stable photo IDs → download at `?w=1200&h=630&fit=crop&q=80` → `wp.uploadFile` as `voltixio-blog-<topic>.jpg` → collect attachment IDs.
   - New images are **topic-matched to the content calendar**: plumbing, electrical, roofing, landscaping, cleaning, pest control, restaurant/kitchen, law/office, med spa/clinic, dental, real estate, moving, auto repair, call center/phone, calculator/finance, calendar/scheduling, storm/weather, night/after-hours, handshake/deal, phone-in-hand, etc. (~28 new + 12 existing).
   - Validate each download (>20KB, image bytes) before upload; skip failures gracefully — same guard as the original script.

2. **Reassign the 24 queued posts topic-matched**: keyword-match slug → best image (e.g. `ai-for-plumbers` → plumbing image; `baltimore-med-spas...` → med spa image; generic topics keep current business imagery). Rule: no image used more than once per publish week (12-post window) so grid pages never show duplicates.

3. **Bake into future batches**: week-2+ post generation assigns from the 40-pool with the same slug-keyword matching + week-window dedupe rule. Store the mapping in `voltixio-site/image_pool.json` (name, attachment_id, topics list) so every future batch script reads it.

4. **Leave the 50 published posts as-is** (consistent, already indexed; only ~4 repeats per image at current count — acceptable) unless user later wants a re-spread.

## Files
- New: `voltixio-site/image_pool.json` (pool registry with attachment IDs + topic tags)
- New scripts: `scratchpad/expand_image_pool.py` (download → upload → registry), `scratchpad/reassign_queued_images.py` (topic-match the 24 queued)
- Reuse: retry wrapper + `wp.uploadFile` + `post_thumbnail` pattern from `scratchpad/fix_images_and_titles.py`

## Verification
- After upload: registry lists ~40 attachments; each URL returns 200 and >20KB
- After reassignment: all 24 future posts have a thumbnail; no attachment ID appears twice within any 7-day publish window; spot-check 3 slugs for sensible topic match (plumber→plumbing, med spa→clinic, restaurant→kitchen)
- /blog/ grid check after next publishes: page 1 shows no duplicate images

# Parlevu Global Services LLC — Competitor SEO Research + 120-Post Content Engine

## Context

Parlevu Global Services LLC (parlevugloballlc.com) is a cash home buyer serving Baltimore and the DMV. The site is static HTML on Apache shared hosting (repo: `C:\Users\Parlevu_Global\parlevu-global-services-llc`, GitHub: Deji147x/parlevu-global-services-llc). It currently has 7 blog posts as individual HTML files linked from a grid in `blog.html`.

Goal: research top local competitors' SEO, build a keyword map, generate **120 SEO-optimized blog posts** (unique image + CTA each), target **local SEO for Maryland, Virginia, and DC** with both short-tail and long-tail keywords, and set up a **cron job with a 30-day rolling content calendar** that publishes continuously with no manual work.

**Legal/SEO constraint:** competitor posts will NOT be copied. We crawl them to extract topics, keywords, structure, headings, and CTA patterns, then write fully original posts targeting the same keywords. (Duplicate content is also penalized by Google, so original is strictly better SEO.)

## Decisions (defaults — flip any before build)

| Setting | Default | Alternatives |
|---|---|---|
| Cadence | **1 post/day × 120 days** (30-day themed calendar, 4 cycles) | 4/day×30, 2/day×60 |
| Post length | **2000–3000 characters** as requested (~400–500 words) | Recommended upgrade: 1200–1800 words for competitive keywords; or mix (90 short local + 30 long pillars) |
| Images | **Pollinations.ai** free API (no key, AI-generated, unique per post), saved locally to `images/blog/` | Unsplash/Pexels stock; local Stable Diffusion (needs GPU) |
| Text generation | **Batch-generate all 120 posts upfront** (reviewable before anything goes live); local Ollama `llama3.2` available as free re-generation tool inside the pipeline | Generate at cron time (riskier: unreviewed content auto-publishes) |
| Deployment | Cron commits + pushes to GitHub and stages files in an `upload-queue/` folder; hosting last-mile (cPanel Git pull vs FTP) wired once user confirms how the site deploys today | — |

## Phase 1 — Competitor SEO research

Competitors (from user's Google Maps screenshots + known DMV players):
- JiT Home Buyers (jithomebuyers.com) — 4.9★ (34)
- Perry Hall Investment Group — 4.9★ (28)
- We Buy Houses For Cash Real Estate LLC — 5.0★ (4)
- Mid Atlantic Real Estate Investors Association
- Baltimore Real Estate Investors Association
- Investors United School of Real Estate Investing
- Plus dominant regional sites found via search: Express Homebuyers (DC/VA), Dependable Homebuyers (MD), Simple Homebuyers (MD), Creo Home Buyers (MD), similar

Method (all free — Ahrefs MCP exists but needs OAuth; use only if user authorizes it later):
1. WebSearch + WebFetch each competitor's sitemap.xml / blog index → enumerate all posts.
2. For each competitor, fetch their **top ~20 blog posts** and extract: title/H1 patterns, target keyword, headings outline, word count, meta description, internal links, CTA style, schema markup used.
3. SERP sampling: search ~15 seed queries ("sell my house fast baltimore", "we buy houses maryland", "cash home buyers dc", "sell inherited house virginia", etc.) and record who ranks → infer which keywords they win.
4. Output: `research/competitor-analysis.md` + `research/keyword-matrix.csv` (keyword, type short/long-tail, locale MD/VA/DC/city, difficulty proxy, competitor ranking, mapped post idea).

## Phase 2 — Keyword map & 120-post content calendar

- ~40 posts per state theme (MD / VA / DC) covering: seller-situation long-tails (foreclosure, probate, inherited, divorce, relocation, hoarder house, fire damage, tax liens, bad tenants), city pages (Baltimore, Columbia, Silver Spring, Rockville, Frederick, Annapolis, Bowie, Alexandria, Arlington, Richmond, Norfolk, DC wards/neighborhoods), process/education short-tails, and market updates.
- 30-day calendar template with 4 themed cycles (Cycle 1: MD focus, 2: VA, 3: DC, 4: cross-DMV situations) → `content-calendar.json`: one entry per post with `{slug, title, primary_keyword, secondary_keywords, locale, publish_date, status, image_prompt, cta_variant}`.

## Phase 3 — Generation pipeline (reusable)

Create `tools/` in the repo (Python, no paid dependencies):
- `tools/post_template.html` — cloned from existing `blog-we-buy-houses.html` structure so posts match the site: navbar/footer, GA4 tags, canonical, meta description, Open Graph, **Article + FAQPage + LocalBusiness schema.org JSON-LD** (service areas MD/VA/DC), breadcrumbs, 2 CTA blocks (tel:+16676468306 + Book a Call calendar link), 3+ internal links to services/contact/related posts.
- `tools/generate_post.py` — renders a brief from `content-calendar.json` into a full HTML post; content body produced in the batch-generation step (Claude writes the 120 posts during build; Ollama llama3.2 wired in as the free local option for future refresh/regeneration).
- `tools/gen_image.py` — downloads a unique 1200×630 image per post from Pollinations.ai (`https://image.pollinations.ai/prompt/{prompt}`) into `images/blog/{slug}.jpg`, with Unsplash keyword-URL fallback.
- `tools/publish_next.py` — the cron workhorse: picks the next `status=queued` post whose `publish_date` ≤ today → moves HTML live in repo root, inserts its card into `blog.html` grid, regenerates `sitemap.xml`, updates calendar status, `git commit + push`, copies files to `upload-queue/` for hosting.

## Phase 4 — Local SEO layer

- `sitemap.xml` + `robots.txt` (site currently has neither in repo).
- LocalBusiness JSON-LD sitewide with `areaServed` for MD/VA/DC + service cities.
- 3 state hub pages (`sell-house-fast-maryland.html`, `-virginia`, `-washington-dc`) that every geo post links up to (internal-link silo).
- Checklist doc for off-site items only the user can do: Google Business Profile posts, GSC sitemap submission, NAP citations.

## Phase 5 — Cron / 30-day rolling scheduler

- Create a scheduled task (scheduled-tasks MCP) running **daily 9:00 AM**: runs `tools/publish_next.py`, verifies the post rendered, reports what was published.
- Reusable: when the 120-post queue runs low, the same setup accepts a new batch of briefs appended to `content-calendar.json`.

## Verification

1. Generate 3 sample posts end-to-end first (1 MD, 1 VA, 1 DC) → user reviews tone/length/images before the remaining 117 are produced.
2. Open posts in the browser preview; validate schema JSON-LD (schema.org validator), check mobile layout, confirm images load.
3. Dry-run `publish_next.py` once manually: confirm blog.html grid updates, sitemap regenerates, commit lands on GitHub.
4. First real cron run monitored; confirm live URL once hosting last-mile is wired.

## Status: build complete, pending commit approval

All phases above have been executed in the working tree at
`C:\Users\Parlevu_Global\parlevu-global-services-llc`:
- `research/competitor-analysis.md` — competitor SEO research (Phase 1)
- `content-calendar.json` — 120 balanced MD/VA/DC post briefs (Phase 2)
- `tools/post_template.html`, `generate_post.py`, `gen_image.py`, `publish_next.py`, `build_calendar.py`, `build_hubs.py` (Phase 3)
- `sell-house-fast-maryland.html`, `-virginia.html`, `-washington-dc.html`, `sitemap.xml`, `robots.txt` (Phase 4)
- Scheduled task `daily-blog-publish` running daily at 9:07 AM (Phase 5)
- 3 sample posts generated and verified end-to-end in the browser preview (blog-foreclosure-md.html, blog-sell-my-house-fast-alexandria.html, blog-sell-my-house-fast-anacostia.html)

**Resolved:** Deployment confirmed as git push (matches the pipeline's `publish_next.py`, which commits + pushes to GitHub and mirrors to `upload-queue/`) — no change needed.

**Remaining ask:** commit the current working tree changes (all files above) with a descriptive message. This requires exiting plan mode since `git commit` is a write action.

## Open items still needing user input (don't block commit)

- Confirm post length choice (stated 2000–3000 chars vs recommended 1200–1800 words) — currently built to spec (2000–3000 chars).
- Optional: authorize Ahrefs connector for real keyword-volume data (free plan works without it).
- C: drive is critically low on space (~0.2 GB free before cleanup) — Ollama needed ~2GB free RAM/disk and intermittently fell back to the built-in writer. User should free space (Docker data ~34GB is the biggest reclaimable chunk) to get full AI-written variety back.

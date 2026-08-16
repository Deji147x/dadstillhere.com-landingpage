# Fix the Calendar Builders (content-calendar.json integrity)

## Context

Today's cleanup cut the queue from 224 → 167 posts by dropping 33 out-of-market briefs (Punta Cana, Volcán Panama, Canyon Lake TX…) and collapsing 23 three-way duplicate clusters. Those decisions are recorded as `status: "removed"` with reasons.

**None of that survives a builder re-run.** Four scripts write `content-calendar.json`, and not one preserves `removed`. Re-running the wrong one silently undoes the cleanup and worse.

I initially blamed `build_calendar.py` for generating the junk keywords. That was wrong — it only emits hardcoded MD/VA/DC briefs. The real source is `build_questions_calendar.py`, which reads an unfiltered keyword CSV and multiplies every row by three.

### Measured defects

| # | Defect | Evidence |
|---|---|---|
| 1 | `build_calendar.py` **replaces** the calendar instead of merging | Writes only its 120 template briefs (`tools/build_calendar.py:206`). Re-running deletes **120 queued** posts and **63 removal decisions**. |
| 2 | Only `published` is preserved | `tools/build_calendar.py:194`. The **60 posts marked `generated` are live on the site** but would be reset to `queued` and republished — overwriting live pages with fresh AI text and inserting duplicate cards. |
| 3 | `build_questions_calendar.py` triples every keyword and filters no geography | 3 variants hardcoded at `:116-135`; source CSV read raw at `:19`. Produced all 33 out-of-market and 69 duplicate briefs. |
| 4 | Slug truncation cuts mid-word | `slugify()` `[:50]` at `:64` plus `base_slug[:30]` at `:138` → `…-real-estate-for-sa`, `…-canton-il-vs-realtor`. 6 live slugs affected. |

Two findings worth separating from the builder work:

- **The source CSV no longer exists** (`../Downloads/questionfinder-…csv`). `build_questions_calendar.py` would crash on the unguarded `open()` at `:83`. Currently an accidental safety net.
- **60 live posts are orphaned** — `fire-damage-va`, `water-mold-md`, `sell-my-house-fast-towson` and 57 others return 200 but have **zero cards in `blog.html`**. They sit in the sitemap with no internal links pointing at them.

## Approach

### 1. New shared module: `tools/calendar_guard.py`

All four builders duplicate the same fragile logic. Centralize it:

- `merge_briefs(existing, new)` — key by slug. Never resurrect `removed`; never re-queue `published` or `generated`; carry unknown-`kind` entries through untouched. **This one function fixes defects 1 and 2.**
- `in_service_area(text)` — reject briefs naming places outside MD/VA/DC. Reuse the `STATES` and `CITIES` constants already in `tools/build_calendar.py:17-51` as the allowlist rather than inventing a second list.
- `safe_slug(text, maxlen)` — truncate on hyphen boundaries.

### 2. `tools/build_calendar.py`

Swap the wholesale write (`:206-211`) for `merge_briefs`. Change the preserve test at `:194` from `== "published"` to a set covering `published`, `generated`, and `removed`.

### 3. `tools/build_questions_calendar.py`

- Guard the missing CSV at `:83` with a clear error instead of a traceback.
- Filter rows through `in_service_area()`.
- Collapse the 3-variant block (`:116-135`) to a single Complete Guide brief — matching the format kept during today's dedup.
- Route slugs through `safe_slug()`; drop the `[:30]` truncation at `:138`.
- Merge via `merge_briefs` so removed slugs stay dead.

### 4. Apply the same merge to `build_fsbo_calendar.py` and `build_service_calendar.py`

Both write the calendar and share the identical gap.

### 5. Separate step — reconcile the 60 `generated` posts

Normalize `generated` → `published`, then insert their missing `blog.html` cards using the existing `insert_blog_card()` in `tools/publish_next.py:46`. This is orphan-page remediation, not builder work; drop it if you want the scope tighter.

## Verification

1. **Backup + dry-run diff.** Snapshot `content-calendar.json`, run each builder, diff. Expect: no `removed` → `queued` transitions, no `generated` → `queued` transitions, entry count never drops.
2. **Regression assertion** — after running all four builders in sequence:
   - queued stays 167, removed stays 63, published 32, generated 60
   - zero out-of-market keywords
   - zero duplicate slug clusters
3. **Live safety check** — confirm no post whose HTML currently returns 200 has been reset to `queued` (that would republish over a live page).
4. `python -m py_compile tools/*.py`, then `python tools/publish_next.py --dry-run` to confirm the publisher still selects correctly.

Restore point: `content-calendar.backup-20260816.json`. Builder backups: `tools/*.py.bak`.

---

# [COMPLETED — earlier initiative] Parlevu FSBO Authority Engine — 90-Day Question-Led Content Series + Link Building

## Context

Parlevu Global Services LLC (parlevugloballlc.com) has 91 posts live, partial Google indexation (~16-35 pages), one page-2 ranking, and **Domain Rating 0.0** — content exists but authority doesn't. Competitor research (Houzeo's "21 FSBO Questions", HomeLight's FSBO guide, iBuyer stats) shows the FSBO question space is dominated by national sites with NO local MD/VA/DC answers — an open lane.

User decisions: **FSBO series publishes first** (daily, starting now; existing 47-post queue shifts after) and **mixed depth** (10 long pillars + 80 standard Q&A posts).

Positioning: Parlevu as the FSBO seller's ally — free education, honest answers, and a no-pressure cash-offer fallback for homes in ANY condition. Not "FSBO fails, sell to us" but "here's how to FSBO right; if it stalls or the house needs work, we're your exit."

## The 10 Core Keywords (from competitor research)

| # | Short-tail core | Long-tail cluster (examples of ~8 variants each) |
|---|---|---|
| 1 | for sale by owner maryland | how does for sale by owner work in maryland; fsbo paperwork maryland |
| 2 | sell house without realtor | can i sell my house without a realtor in maryland/dc/virginia |
| 3 | fsbo paperwork | who draws up the contract in for sale by owner; fsbo contract maryland |
| 4 | fsbo closing costs | who pays closing costs when selling by owner; fsbo transfer tax md |
| 5 | flat fee mls | flat fee mls maryland; do fsbo homes go on mls |
| 6 | sell house as-is by owner | sell house as-is without realtor; fsbo any condition |
| 7 | fsbo pricing | how to price a house for sale by owner; fsbo appraisal vs cma |
| 8 | fsbo marketing | where to list home for sale by owner free; creative ways to market fsbo |
| 9 | fsbo vs cash offer | fsbo not selling what to do; when to take a cash offer instead |
| 10 | fsbo timeline | how long does it take to sell by owner (median 55 days vs 42 agent) |

Each cluster gets: 1 pillar (keywords 1-10 → 10 pillars) + 8 supporting question posts (80 standard posts). Every supporting post links up to its pillar; pillars link to the FSBO hub.

## Build Plan (reuses existing pipeline)

1. **`tools/build_fsbo_calendar.py`** (new) — generates 90 briefs into `content-calendar.json` with `status=queued`, `publish_date` = tomorrow onward daily, `category="FSBO Support"`, unique `image_prompt` per post (varied scene/style descriptors so Pollinations produces visually distinct images), rotating `cta_variant` (4 existing variants). Re-dates the existing 47 queued posts to resume after day 90.
2. **FSBO hub page** `fsbo-support-maryland-virginia-dc.html` — the linkable asset. "The Complete FSBO Resource for MD/VA/DC" with a free FSBO paperwork checklist. Links to all 10 pillars. This is the page we build backlinks TO.
3. **Content generation** — batch-write posts via existing `tools/generate_post.py` flow (Claude-written for humanized quality, Ollama fallback): pillars 1200+ words, standard posts 400-600 words, each answering ONE question in plain conversational English, with MD/VA/DC specifics (transfer taxes, disclosure law, median DOM), FAQPage schema, hero image, 3+ internal links, CTA block.
4. **Images** — existing `tools/gen_image.py` (Pollinations, per-slug Unsplash fallback = "reliable"): distinct prompt per post; verify no missing files with the `tools/seo_audit.py` hero-image check.
5. **Publishing** — existing `tools/publish_next.py` + daily 9:07 AM scheduled task, now pushing to `github` (auto-deploys once user finishes the hPanel Git webhook setup).

## Authority & Link Building Layer (the key ask)

- **Internal silo:** hub → pillars → question posts → hub (closed loop, descriptive anchors).
- **Citations kit** `research/citation_kit.md` — exact NAP + descriptions ready to paste into Yelp, BBB, Zillow, Angi, Nextdoor, Alignable, MD/Baltimore chamber listings (user submits — account creation is theirs to do; each moves DR off 0).
- **Linkable assets:** FSBO checklist on the hub + "Maryland FSBO statistics" section (citable numbers → passive links).
- **Outreach list** `research/outreach_targets.md` — 15 local targets (Baltimore realty blogs, MD landlord associations, credit-counseling orgs, local news tip lines) with a 3-line pitch each for the FSBO checklist.
- **GBP + social:** 2 Google Business Profile posts/week from the series; Buffer captions CSV extended for all 90 posts.

## Verification

1. Generate 3 sample posts (1 pillar + 2 standard) end-to-end → user reviews tone before the remaining 87.
2. `python3 tools/seo_audit.py` after batch: 0 CRITICAL/HIGH issues, all hero images exist, sitemap includes all new pages, single H1.
3. Browser preview of hub + one pillar; validate FAQPage JSON-LD.
4. One live `publish_next.py` dry-run; confirm GitHub push and (once webhook is set) auto-deploy.

## Out of scope / user actions

- hPanel Git deployment + webhook (user, ~2 min — already instructed)
- Directory account creation for citations (user; kit provided)
- GSC "Request indexing" for the 10 pillars once live

---

# Phase 2: Question-Answer Authority Series (Parallel Deployment)

## Context

Parlevu has 25 high-intent FSBO questions from `questionfinder-for-sale-by-owner-real-estate.csv` sourced from Google Trends / keyword research. These questions span: definition/education (high volume, 30-55 signal), cost/pricing (high signal, 67), website recommendations (high signal, 67), comparison vs realtor (high signal, 67), and mistakes/timeline (high signal, 67).

**Strategy:** Create 3 unique posts per question (75 total) + continue 90-day FSBO series in parallel = **4 posts/day for 25 days**, then maintain rolling queue of +2 posts daily.

**Authority building:** Each post embeds YouTube links to trusted real estate sources (Zillow, Realtor.com, RE/MAX) + backlinks to 2-3 external publications per post → builds domain trust via outbound link pattern + cited authority.

**Positioning:** Parlevu as the go-to authority answering specific FSBO questions with citations to national resources, positioning as the *local expert* on national knowledge.

## Questions to Address (25 source questions)

**High volume (30-20/month, 48-55 signal):**
- What does FSBO mean in real estate?
- Methow Valley FSBO (location-specific)
- How to list real estate FSBO
- Who pays commission in FSBO?

**High intent (0 volume but 67 signal — buyer search, not volume):***
- Is FSBO a good idea?
- Best FSBO website?
- How much realtor commission?
- Is it cheaper to buy FSBO?
- Zillow FSBO free/paid?
- Common FSBO mistakes?
- Do realtors avoid FSBO?
- What's the hardest month to sell?
- Is Zillow banning FSBO?

**Location-based (regional):**
- Methow Valley, Duncan, Big Canoe, Canadarago Lake, Cannon Beach, Canyon Lake TX, Punta Cana, Dominican Republic

## Build Plan (3 Posts Per Question = 75 Total)

### 1. **Calendar Generation** — `tools/build_questions_calendar.py` (NEW)

Parse CSV, generate 75 briefs into `content-calendar.json`:
- **Input:** `questionfinder-for-sale-by-owner-real-estate.csv` (25 questions)
- **Logic:** For each question, create 3 variants:
  - Post A: "Direct answer" (400-500 words, straightforward FAQ format)
  - Post B: "Deeper dive" (500-600 words, include statistics + local MD/VA/DC angle)
  - Post C: "Comparison/contrast" (450-550 words, compare FSBO to agents, Zillow, cash offers)
- **Metadata per brief:**
  - `slug`: derived from question (e.g., `fsbo-definition-what-means`, `fsbo-definition-pros-cons`, `fsbo-definition-vs-realtor`)
  - `title`: unique headline per variant (A, B, C)
  - `category`: "FSBO Q&A" (separate from pillar category)
  - `primary_keyword`: question + variant focus
  - `publish_date`: Daily starting 2026-07-29; 3/day for 25 days
  - `youtube_embed`: Curated list of trusted RE sources (Zillow, Realtor.com, RE/MAX, NAR)
  - `external_links`: 2-3 authority backlinks per question (e.g., Realtor.com article, Zillow guide, state/local MLS board)
  - `image_prompt`: Varied visuals per variant (e.g., A="clean dashboard", B="house inspection", C="agent vs FSBO comparison chart")
  - `cta_variants`: Rotate 3 CTAs: "Get instant cash offer", "Download free FSBO guide", "Schedule free consultation"
- **Output:** 75 entries added to `content-calendar.json` with `status=queued`, interspersed with FSBO series (pattern: 3 Q&A, 1 FSBO pillar, repeat)

### 2. **Content Generation** — Modify `tools/generate_post.py`

Extend existing generator to handle Q&A posts:
- **Structure:** 3-part post per question variant
  - Intro: Hook on the specific variant (direct answer, deeper dive, comparison)
  - Body: 3-5 paragraphs answering the question + local/national context
  - Citations: Embed 2-3 external links mid-text ("As Realtor.com reports...", "According to the National Association of Realtors...")
  - YouTube embed: Curated video (1-2 min) from trusted source, placed before CTA
  - CTA block: Rotating call-to-action (3 variants)
- **Schema:** FAQPage JSON-LD (same as FSBO series) + structured Q&A
- **SEO tags:** MD/VA/DC local signals where relevant; long-tail keyword in H1 and meta

### 3. **External Authority Links** — Strategic Placement

**Trusted real estate publications to cite:**
- National: Realtor.com, Zillow Research, NAR (National Association of Realtors), Redfin, RE/MAX blog
- State/local: MD Realtor Association, VA REALTORS® blog, DC Board of Realtors, local MLS boards
- YouTube sources: Zillow Zestimate explainer, Realtor.com guides, Local realtor Q&A channels

**Pattern per post:**
- 2 inline backlinks (mid-body, high-authority sources)
- 1 YouTube embed (before CTA, external video)
- 1 internal link (to related FSBO pillar or hub)
- Total: 3 external authority signals per post

**Backlink strategy for DR growth:**
- Links OUT to established domains (Realtor.com, Zillow, NAR) = signals to Google that Parlevu site references trusted sources
- Cited publications may reciprocate or notice → passive backlink opportunities
- Establishes Parlevu as "curator of expert content" not just original author

### 4. **Publishing Schedule** — Modify `tools/publish_next.py` + Cron

**Current schedule:** 1 FSBO post/day at 9:07 AM (90 days)

**New schedule:** 
- **Days 1-25 (July 29 - Aug 22):** 4 posts/day
  - 9:07 AM: Q&A post #1
  - 11:35 AM: Q&A post #2
  - 2:15 PM: Q&A post #3
  - 5:30 PM: FSBO pillar/question post #1
- **Days 26+ (Aug 23 onward):** 1-2 posts/day (FSBO series only, plus rolling queue of +2 daily Q&A refreshes)

**Windows Task Scheduler:** Add 3 additional tasks (11:35 AM, 2:15 PM, 5:30 PM) to `publish_next.py --slug` with explicit slug targets from calendar

**Git + Deploy:** Each publish → commit → push to GitHub → webhook → live at parlevugloballlc.com/blog-{slug}.html

### 5. **Image & Video Strategy**

- **Hero images:** Pollinations (per-post unique prompt, 1200x630 JPEG)
  - Variant A: Clean, minimal (charts, stats)
  - Variant B: Process-focused (inspection, closing, paperwork)
  - Variant C: Comparison visual (split-screen FSBO vs agent)
- **YouTube embeds:** Curated, not generated
  - Link to Zillow, Realtor.com, or local realtor Q&A videos
  - Placed before CTA block
  - Adds social proof + external authority

### 6. **Buffer Social Automation** — Extend BUFFER_POSTS.csv

Add 75 captions for Q&A series (rows 164-238):
- Format: Hook + question + 3-word CTA + URL + hashtags
- Example: "FSBO vs realtor? Here's the real cost breakdown. Get your free guide: [URL] #FSBO #RealEstateTips #DIY"
- Schedule: 3x/week (Mon/Wed/Fri) at 8 AM ET starting Aug 1

### 7. **SEO Audit & Validation**

Before first Q&A post publishes:
- Run `python3 tools/seo_audit.py` on generated sample Q&A posts
- Verify: single H1, external links are high-authority, YouTube embeds load, all hero images exist
- Check sitemap includes 75 new posts
- Validate FAQPage JSON-LD on 2-3 sample posts

## Critical Files to Modify

| File | Change | Notes |
|------|--------|-------|
| `tools/build_questions_calendar.py` | NEW | Parse CSV, generate 75 briefs with YouTube + external link metadata |
| `tools/generate_post.py` | EXTEND | Add Q&A structure: intro + body + citations + YouTube + CTA |
| `content-calendar.json` | APPEND | 75 entries (status=queued, publish_date staggered 3/day for 25 days) |
| Windows Task Scheduler | MODIFY | Add 3 new tasks (11:35 AM, 2:15 PM, 5:30 PM) calling `publish_next.py --slug` |
| `BUFFER_POSTS.csv` | APPEND | 75 social captions (rows 164-238) for Q&A series |
| `sitemap.xml` | REGENERATE | Include 75 new Q&A posts (auto-updated on publish) |
| `blog.html` | APPEND CARDS | 75 blog card inserts (auto-updated via publish_next.py) |

## Authority Building Mechanics

**Why external links help DR:**
1. Each post cites 2-3 high-authority sources (Realtor.com, Zillow, NAR)
2. Outbound links to trusted domains signal "this site curates quality information"
3. Trusted domains may notice citing their content → potential reciprocal links
4. YouTube embeds from Zillow/Realtor.com = video authority signals
5. Over 75 posts × 3 external links = 225 authority citations → Google recognizes Parlevu as aggregator of expert content

**Timeline to measurable DR growth:**
- Week 1-2: Posts index, outbound link profile establishes
- Week 3-4: Citation directories populate, first passive backlinks arrive
- Week 5-8: Reciprocal backlinks from cited publications (if any)
- Month 2-3: DR lift to 5-15 (assuming 3-5 organic backlinks from outreach + citations)

## Verification Steps

1. **Sample generation:** Generate 3 Q&A samples (1 each of A/B/C variants) → review tone, external links, YouTube embed format
2. **Calendar integrity:** Run `build_questions_calendar.py` → verify 75 entries, dates sequential, metadata complete
3. **Live publish dry-run:** `python3 tools/publish_next.py --dry-run --slug fsbo-definition-what-means` → confirm hero image, YouTube embed, external links render
4. **SEO audit:** `python3 tools/seo_audit.py` → 0 CRITICAL/HIGH, all images present, canonical tags correct
5. **Social sync:** BUFFER_POSTS.csv extends to row 238, captions parse correctly
6. **Cron timing:** Verify 4 Windows tasks fire in sequence (9:07 AM, 11:35 AM, 2:15 PM, 5:30 PM)

## Out of Scope / User Actions

- YouTube video curation (copy URLs of Zillow/Realtor.com Q&A videos into metadata manually or via script)
- Social scheduling on Buffer (user uploads CSV rows 164-238)
- Monitor organic backlinks from cited publications (track in Ahrefs weekly)
- Adjust publish times if needed (currently 4x/day; user can dial back to 2-3x/day if needed)

---

# Phase 3: GEO-SEO (AI Search Engine) Optimization

## Context

Parlevu's FSBO + Service content strategy focuses on Google organic search but **ignores AI-powered search engines** (ChatGPT, Claude, Perplexity, Google AI Overviews) where traffic is growing 527% YoY with 4.4x higher conversion rates. geo-seo-claude provides an integrated audit, optimization, and reporting framework to capture this emerging traffic.

**Market Reality (2026):**
- GEO services market: $850M → $7.3B by 2031 (34% CAGR)
- Gartner: Traditional search traffic drops 50% by 2028
- Only 23% of marketers investing in GEO
- Brand mentions 3x stronger than backlinks for AI citation

**Parlevu Opportunity:** Existing content (FAQPage schema, LocalBusiness markup, external citations) is 60% of the way to AI-optimized. Phase 3 closes the gap.

## Goals

1. **Audit current GEO standing** — Identify what AI engines see, what's missing, what's broken
2. **Enable Claude/ChatGPT crawling** — Deploy llms.txt so Claude crawls your site reliably
3. **Optimize schema markup** — Enhance FAQPage, LocalBusiness, Article for AI citation
4. **Generate GEO reports** — Client-ready reports showing AI visibility metrics
5. **Platform-specific tuning** — Optimize for ChatGPT, Perplexity, Google AI Overviews differently

## Implementation (Phased)

### Phase 3a: Audit + Discovery (Weeks 1-2)

**Tool:** `geo-seo-claude` (skill: `/geo`)

1. **Full GEO Audit** — `python tools/scripts/fetch_page.py https://parlevugloballlc.com`
   - Detects business type (Local + Service)
   - Fetches sitemap (92 blog pages)
   - Runs 5 parallel subagents:
     - `geo-ai-visibility`: GEO audit, citability scores, AI crawlers, llms.txt readiness, brand mentions
     - `geo-platform-analysis`: ChatGPT, Perplexity, Google AIO preferences
     - `geo-technical`: Core Web Vitals, crawlability, indexability
     - `geo-content`: E-E-A-T, readability, AI content detection
     - `geo-schema`: Detect existing schema, validate, recommend enhancements
   - Output: Comprehensive GEO report (HTML + recommendations)

2. **Citability Scoring** — `python scripts/citability_scorer.py https://parlevugloballlc.com`
   - Scores each page for AI citation readiness (1-100)
   - Identifies which pages rank highest for AI platforms
   - Flags low-citability content for rewriting

3. **Brand Mention Scan** — `python scripts/brand_scanner.py "Parlevu Global"`
   - Scans 50+ platforms AI engines crawl (Reddit, ProductHunt, Hacker News, industry forums, etc.)
   - Identifies where you're mentioned, where you should be mentioned
   - Reports competitive brand mention gaps

**Output:** GEO Audit Report (HTML) + Action Recommendations

### Phase 3b: llms.txt Setup (Week 2-3)

**Tool:** geo-seo-claude `geo-llmstxt` agent

1. **Generate llms.txt**
   - Creates machine-readable API for Claude, ChatGPT, Perplexity to crawl Parlevu
   - Serves at `/llms.txt` (standard location)
   - Includes:
     - Homepage summary (NAP, service areas, brand positioning)
     - Content categories (FSBO, Service, Blog)
     - Key endpoints (blog feed, schema.json, sitemap)
     - Instructions for AI crawlers (what to prioritize, what to cite)

   ```
   Parlevu Global Services LLC
   
   About: Black-owned real estate investment firm serving MD/VA/DC. 
   We buy homes for cash, any condition. FSBO consulting.
   
   Contact: (667) 646-8306, info@parlevugloballlc.com
   Address: 3333 Windsor Ave, Baltimore, MD 21216
   
   Service Areas: Maryland, Virginia, Washington DC
   
   Content:
   - FSBO Guides: /fsbo-support-maryland-virginia-dc.html (hub)
   - Service Posts: /blog/ (92 posts on foreclosure, divorce, speed, cash offers)
   - Pillars: /we-buy-houses-as-is.html, /sell-my-house-fast.html, /foreclosure-property-help.html
   - Schema: /schema.json (FAQPage, LocalBusiness, Article)
   
   Crawl Instructions:
   - Priority 1: FSBO hub + 10 pillars (complete education series)
   - Priority 2: Blog feed (daily fresh content)
   - Priority 3: Service descriptions + schema
   - Use: Brand mentions OK, external links to Realtor/Zillow OK
   - Cite: Always link back to original post
   ```

2. **Submit to AI platforms** (User actions)
   - Claude Projects: Link llms.txt in project config
   - ChatGPT: Add to ChatGPT Retrieval Plugin (if opted in)
   - Perplexity: Submit domain to citation sources (manual form)

**Output:** `/llms.txt` + submission checklist

### Phase 3c: Schema Markup Optimization (Week 3-4)

**Tool:** geo-seo-claude `geo-schema` agent

Current schema status: ✅ FAQPage (all posts), ✅ LocalBusiness (homepage + pillars), ❌ Article enhancements

1. **Audit current schema** — `python scripts/fetch_page.py --schema https://parlevugloballlc.com/blog-foreclosure-md.html`
   - Validates JSON-LD structure
   - Checks for E-E-A-T signals (author, expertise, date published, source)
   - Identifies AI-friendly best practices

2. **Enhance Article schema** (all blog posts + pillars)
   - Add `author` field: `{"@type": "Organization", "name": "Parlevu Global Services LLC", "url": "https://parlevugloballlc.com"}`
   - Add `datePublished` + `dateModified` (extract from post metadata)
   - Add `inLanguage`: `"en-US"`
   - Add `isAccessibleForFree`: `true`
   - Add `articleBody` (full text or leading paragraph)
   - Add `keywords` array (primary + secondary keywords)
   - Add `image` array (hero + any embedded images)

3. **Enhance FAQPage schema** (all 92 posts with Q&A)
   - Ensure each Q&A has `answerExplanation` field (boost AI comprehension)
   - Add `acceptedAnswer.url` pointing to the post URL
   - Add `acceptedAnswer.author` (attribution)
   - Validate 3-5 Q&As per post (currently compliant)

4. **Add AggregateRating + Review schema** (authority signal)
   - On homepage + pillars: Add client testimonials as structured reviews
   - Example: `{"@type": "Review", "ratingValue": "5", "text": "Sold my Baltimore home in 10 days..."}` 
   - AI engines weight review signals heavily

5. **Deploy enhanced schema**
   - Script: `tools/enhance_schema.py` (batch update all HTML files)
   - Input: `content-calendar.json` + post metadata
   - Output: Updated FAQPage + Article + LocalBusiness markup
   - Validation: `tools/seo_audit.py --schema` (verify all pages)

**Output:** Enhanced schema across all 92 pages + 37 upcoming service posts

### Phase 3d: Platform-Specific Tuning (Week 4-5)

**Tool:** geo-seo-claude `geo-platform-analysis` agent

AI engines have different crawling, ranking, and citation preferences:

| Platform | Crawl Bot | Preference | Optimization |
|----------|-----------|-----------|---------------|
| **ChatGPT** | GPTBot | Brand mentions, FAQ format, long-form | Expand FAQPage, add author attribution |
| **Claude** | ClaudeBot (via llms.txt) | Direct data + schema, long-form + nuance | Prioritize llms.txt, detailed explanations |
| **Perplexity** | PerplexityBot | Cited sources, recent content, site authority | External backlinks + publish schedule |
| **Google AI Overviews** | Googlebot | EAT signals, structured data, topical authority | Author expertise, depth, recency |

**Adjustments per platform:**

1. **For Claude** (highest conversion potential for service queries)
   - Ensure llms.txt is comprehensive + well-structured
   - Add `content-type` hints in schema (Article, FAQPage, LocalBusiness)
   - Emphasize original research + data (service stats, MD foreclosure timelines)

2. **For ChatGPT** (highest volume)
   - Optimize FAQPage for conversational Q&A (how, what, when, why first)
   - Add author + publication date to all posts (credibility signals)
   - Create dedicated "Quick Answer" sections (ChatGPT loves summary sections)

3. **For Perplexity** (discovery + research)
   - Strengthen external citations (Realtor.com, Zillow, NAR links)
   - Add statistics + data points (AI scrapes for citations)
   - Create "Source Lists" pages (curator authority)

4. **For Google AI Overviews** (SEO continuation)
   - Optimize for featured snippets (short, clear answers)
   - Strengthen topical authority (internal link clusters)
   - Add breadcrumb schema (navigation clarity)

**Implementation:**
- Script: `tools/platform_tune.py` — Updates schema `@context` per platform
- Deploy: Separate schema for each platform (via HTTP headers or A/B testing)
- Monitor: Track which platforms cite you (via brand mention scanner)

**Output:** Platform-specific schema variants + deployment strategy

### Phase 3e: Measurement + Reporting (Week 5+)

**Tool:** geo-seo-claude `geo-report` + `geo-compare` agents

1. **Generate GEO Report**
   - `python scripts/crm_dashboard.py --domain parlevugloballlc.com`
   - Metrics: Citability score, platform-specific visibility, brand mention count, schema coverage
   - Client-ready HTML + PDF

2. **Monthly Delta Reports**
   - `/geo compare <domain>` — Show month-over-month improvement
   - Track: "AI mentions up +23%", "Citability score 65→72", "Google AIO appearances: 12→18"

3. **Monitoring Dashboard**
   - Automated daily brand mention scan
   - Weekly AI crawler access check (robots.txt + crawlability)
   - Monthly GEO visibility report auto-sent to stakeholders

**Output:** Monthly GEO reports + client presentations + internal dashboards

## Critical Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `/llms.txt` | CREATE | Machine-readable site API for Claude/ChatGPT |
| `tools/enhance_schema.py` | CREATE | Batch update Article + FAQPage schema for AI |
| `tools/platform_tune.py` | CREATE | Platform-specific schema variants |
| `schema.json` | CREATE | Central schema registry (all posts + pages) |
| All post HTML files | MODIFY | Add Article schema + author + datePublished |
| All FAQPage posts | MODIFY | Add answerExplanation + url in answers |
| Homepage + pillars | MODIFY | Add Review schema (testimonials) |
| `/robots.txt` | MODIFY | Allow ClaudeBot, GPTBot, PerplexityBot (if blocked) |
| README.md | UPDATE | Document llms.txt + GEO strategy for team |

## Timeline & Rollout

| Phase | Week | Task | Blocker? |
|-------|------|------|----------|
| **3a** | 1-2 | Full GEO audit + citability scan | No (read-only) |
| **3b** | 2-3 | Create + deploy llms.txt | No (add file + test) |
| **3c** | 3-4 | Enhance schema (batch script) | No (batch update) |
| **3d** | 4-5 | Platform-specific tuning | No (optional optimization) |
| **3e** | 5+ | Measurement + reporting (ongoing) | No (continuous) |
| **Oct 27 Launch** | Ready? | llms.txt + base schema live, GEO audit report ready | ✅ YES |

## Integration with Phases 1 & 2

- **Phase 1 (FSBO pillars):** Schema + llms.txt active at launch → Immediate AI visibility
- **Phase 2 (Service posts, Oct 27):** All 37 new posts include enhanced schema + platform hints
- **Phase 3 (GEO):** Ongoing measurement + optimization feedback loop

## Out of Scope / User Actions

- llms.txt submission to ChatGPT Retrieval Plugin (manual integration)
- Perplexity citation source submission (web form)
- Testimonial collection for Review schema (user to gather + format)
- Ongoing brand mention monitoring (automated after setup, user reviews weekly)

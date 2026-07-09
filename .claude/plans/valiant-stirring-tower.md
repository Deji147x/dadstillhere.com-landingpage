# Restore VoltixIO landing page as voltixio.com homepage

## Context

`C:\Users\Parlevu_Global\Downloads\index.html.html` is a complete, self-contained VoltixIO marketing landing page (2,126 lines, ~180KB — inline CSS/JS, base64 favicons). It was damaged by an accidental paste: a ~106-line block of responsive CSS landed **inside the word `<!DOCTYPE`**. Line 1 ends `<!DOCT`, lines 2–107 are orphaned CSS (mobile nav, pricing tabs, calculator, FAQ overrides), and line 108 resumes `YPE html>`. Everything from line 108 onward is structurally intact (`</body></html>` present, balanced head/style/body).

voltixio.com currently serves a **WordPress site** on Hostinger (PHP 8.3 / LiteSpeed, LiteSpeed Cache active with 2h max-age). The user chose:
- **Override the homepage only** — WordPress stays installed; other WP URLs keep working; easy revert.
- **Deploy by driving the browser** — user logs into Hostinger hPanel in Chrome; Claude uses the Chrome extension to upload files via File Manager.

The page's only self-hosted asset, `https://voltixio.com/images/logo.png`, already exists on the live server (verified 200 OK). All other references are external (GTM, GA, FB pixel, YouTube, api.voltixio.com booking widgets) or inline base64.

## Step 1 — Repair the file locally

Create working folder `C:\Users\Parlevu_Global\voltixio-site\` and produce a repaired `index.html`:

1. Restore the DOCTYPE: rejoin line 1 (`<!DOCT`) with the `YPE html>` fragment at the start of line 108 → single `<!DOCTYPE html>` as line 1.
2. Relocate the orphaned responsive CSS (current lines 2–107) to the **end of the existing `<style>` block** (just before `</style>`, currently line 1077). It's a responsive-override patch (`.pricing-tab`, `.calc-input`, `.faq-btn`, mobile nav media queries) and must come *after* the minified base rules it overrides.
3. Keep the untouched original in Downloads as-is (it is itself the backup of the damaged state).

Implementation: script the splice with Python or awk in the scratchpad (file is too large for whole-file editor reads; several lines exceed 60KB), writing the repaired output to `voltixio-site\index.html`.

## Step 2 — Verify locally

- Sanity-check structure: exactly one `<!DOCTYPE`, one `<html>`/`</html>`, `<style>`/`</style>` balanced, no CSS outside tags.
- Serve `voltixio-site\` locally (e.g. `python -m http.server`) and open in the preview browser: check hero renders, pricing tabs switch, ROI calculator computes, FAQ accordions toggle, no console errors (external trackers may warn — ignore those). Check a mobile viewport (375px) since the recovered CSS is the mobile patch.

## Step 3 — Deploy via Hostinger hPanel (Chrome extension)

Prerequisite: user logged into hPanel (hpanel.hostinger.com) in Chrome with the extension connected.

1. Open File Manager → `public_html` (the WordPress root — confirm `wp-config.php` is present).
2. **Backup `.htaccess`**: download a copy / duplicate it as `.htaccess.bak` before editing.
3. Upload the repaired `index.html` to `public_html`.
4. Make it win over WordPress for the root URL: add `DirectoryIndex index.html index.php` at the **top** of `.htaccess` (above the `# BEGIN WordPress` block). WordPress permalinks keep working — the rewrite rules only route requests that don't match an existing file.
5. Purge LiteSpeed cache (hPanel or WP admin → LiteSpeed Cache → Purge All) so the old homepage isn't served for up to 2 hours.

## Step 4 — Verify live

- `curl -s https://voltixio.com/` → expect the new `<title>AI Voice Agents & Conversational AI for Business | VoltixIO</title>` and `<!DOCTYPE html>` first bytes (no PHP/wp-json headers on the homepage).
- Load voltixio.com in the browser: desktop + mobile widths, booking-widget links (api.voltixio.com) reachable.
- Confirm an existing WordPress URL (e.g. `/wp-json/` or any known WP page) still responds — proves WP untouched.

## Rollback

Delete `public_html/index.html`, restore `.htaccess` from `.htaccess.bak`, purge LiteSpeed cache. WordPress homepage returns immediately.

## Files

- Source (damaged, kept as-is): `C:\Users\Parlevu_Global\Downloads\index.html.html`
- Repaired output: `C:\Users\Parlevu_Global\voltixio-site\index.html`
- Remote: `public_html/index.html` and `public_html/.htaccess` on Hostinger

---

# Centralize & Standardize 30 VoltixIO Blog Posts via Hub (Post ID 420)

## Context

VoltixIO now has **30 published blog posts** (10 existing + 20 new, all LIVE):

**Existing 10 Posts** (standardized with footer, CTA, contact info):
1. Real Estate: AI Lead Follow-Up & Showing Automation
2. Law Firms: Automate Client Intake & Lead Qualification
3. HVAC: Deploy AI Answering Service in 7 Days
4. AI Voice Agents for Med Spas: Complete Setup & ROI
5. The Ultimate Guide to AI Voice Agents for Business in 2026
6. Business Logic Automation: Custom AI Beyond Chatbots
7. Multilingual AI Voice Agents: Serve Every Customer 24/7
8. The Revenue Calculator: How Much Are You Losing to Missed Calls
9. Missed Call Recovery: How AI Text Back Lost Leads
10. Contractors & Home Services: Automate Quotes & Dispatch

**New 20 Posts** (published yesterday, need consistency review):
Posts 11-30 across industries (Plumbing, Electrical, Landscaping, Pest Control, Cleaning, etc.)

**Current Issue**: 
- 10 posts are standardized (footer, CTA, images, meta)
- 20 new posts are LIVE but may lack consistent formatting/CTAs/metadata
- No central hub organizing/displaying all 30 posts
- Post ID 420 exists but not yet configured as master blog hub

**Goal**: 
1. Configure Post ID 420 as **Display Hub + Template** for all 30 posts
2. Ensure all 30 posts follow identical consistency standards
3. Create central management point at `https://voltixio.com/wp-admin/post.php?post=420&action=edit`
4. Verify all posts meet standardization checklist
5. Deploy and test live

## Implementation Strategy

### Recommended Approach: **Display Hub + Template Inheritance**

Post ID 420 will serve as the **central blog hub** with two functions:

**1. Display Hub** (Public-facing)
- Post 420 displays/lists all 30 blog posts in organized format
- Acts as master blog archive/index
- Replaces generic `/blog/` 404 page with curated post list
- URL: `https://voltixio.com/blog/` (redirects to or displays post 420)

**2. Template Inheritance** (Admin-side)
- Post 420 contains standardization template/checklist
- All 30 posts inherit consistency standards from post 420
- Creates single source of truth for formatting, CTAs, metadata

### Phase 1: Audit Post ID 420 & All 30 Posts

**Step 1a: Inspect Post 420 Structure**
- Read post 420 content/metadata via WordPress REST API
- Determine: Is it a page, custom post type, or post?
- Check: Does it already list posts or is it empty?
- Identify: Current role/purpose in WordPress

**Step 1b: Audit All 30 Posts for Consistency**
- Python script fetches all 30 published posts
- Check each post for:
  - Footer HTML presence ("Done-for-You AI Automation")
  - Featured image assigned
  - Meta description (150-160 chars, SEO keywords)
  - Categories assigned (Industries, Features, etc.)
  - Tags (3-5 per post, industry-specific)
  - Internal CTA links (to demo app, learning platform)
  - No broken HTML/formatting issues

**Script Output**:
- Posts needing footer: X
- Posts missing featured image: Y
- Posts lacking meta description: Z
- Compliance score: % (target: 100%)

**Critical files**:
- Template: `C:\Users\Parlevu_Global\voltixio-site\BLOG_DEPLOYMENT_GUIDE.md` — footer HTML, formatting standards
- Database: `C:\Users\Parlevu_Global\voltixio-site\blog_posts_database_v3_complete_50posts.json` — reference for consistency
- Audit Script: `wordpress_rest_api_standardizer.py` (create/modify)

### Phase 2: Standardize Posts with Missing Elements

**For each post identified as non-compliant:**
- Add footer HTML if missing
- Assign featured image if missing
- Update meta description if missing/short
- Add/verify categories and tags
- Insert internal CTA links if missing
- Ensure no broken formatting

**Using REST API Script:**
```
POST /wp-json/wp/v2/posts/{post_id}
{
  "content": "...[footer HTML added]...",
  "featured_media": IMAGE_ID,
  "meta": {"_yoast_wpseo_metadesc": "150-160 char description"},
  "categories": [cat_id_1, cat_id_2],
  "tags": [tag_id_1, tag_id_2, tag_id_3]
}
```

### Phase 3: Configure Post 420 as Hub

**Option A: Display Archive**
- Post 420 uses WordPress archive plugin/template to list all 30 posts
- Sortable by: category, date, industry, popularity
- Filterable by: industry type, feature, ROI tier

**Option B: Custom Index**
- Post 420 manually lists all 30 posts with:
  - Post title linked to URL
  - Excerpt (150 chars)
  - Featured image thumbnail
  - Industry category badge
  - Publication date

**Both Options**:
- Post 420 becomes canonical hub at: `https://voltixio.com/?p=420` (or custom URL)
- Link from main navigation to post 420
- Include standardization template/checklist as post content

### Phase 4: Verification

**Checklist for all 30 posts**:
- [ ] Footer displays with blue CTA button
- [ ] Featured image assigned and loads
- [ ] Meta description 150-160 chars
- [ ] Categories assigned (Industries, Features, etc.)
- [ ] Tags applied (3-5 per post)
- [ ] Internal CTAs link to demo/learn apps
- [ ] No broken HTML tags
- [ ] URL returns 200 OK
- [ ] Listed in Post 420 hub
- [ ] Sitemap includes post

**Test Sample** (5 posts):
```
1. https://voltixio.com/blog/the-ultimate-guide-to-ai-voice-agents-for-business-in-2026/
2. https://voltixio.com/blog/law-firms-automate-client-intake-lead-qualification/
3. https://voltixio.com/blog/hvac-companies-deploy-ai-answering-service-in-7-days/
4. https://voltixio.com/blog/plumbing-services-ai-dispatch-emergency-response/ (new)
5. https://voltixio.com/blog/electrical-services-24-7-service-call-automation/ (new)
```

**Post 420 Hub Test**:
- Load post 420 in browser
- Verify all 30 posts display/list
- Test filters and sorting (if applicable)
- Verify internal links work

### Phase 5: Post-Update Tasks

**Step 1: Update sitemap.xml**
- Regenerate/verify sitemap includes all 30 posts
- Update `lastmod` date to 2026-07-08
- Set priorities: Pillar posts (0.90-1.0), Quick guides (0.80-0.85)
- Upload updated sitemap to /public_html/

**Step 2: Purge LiteSpeed Cache**
- WordPress Admin → LiteSpeed Cache → Purge All
- Wait 30 seconds
- Hard refresh browser (Ctrl+F5)

**Step 3: Resubmit to Google Search Console**
- Go to https://search.google.com/search-console
- Resubmit `https://voltixio.com/sitemap.xml`
- Request indexing for all 30 posts (especially new 20)
- Monitor indexing status over next 2-8 weeks

**Step 4: Social Media Posting Campaign**
- Use templates: `SOCIAL_MEDIA_POSTS_CORRECTED.md`
- Post strategy: 3-5 posts/week across LinkedIn, Twitter, Facebook
- Focus on newest 20 posts (week 1), then rotate back through top 10
- Track engagement by post/platform

### Phase 6: Rollback (if needed)

If post 420 hub configuration breaks anything:
1. Restore previous post 420 version (WordPress keeps revisions)
2. Remove hub listing if it interferes with individual post access
3. Re-run audit script to verify posts still work individually

## Critical Files to Use

- **Standardization Template**: `voltixio-site/BLOG_DEPLOYMENT_GUIDE.md` (footer HTML, meta template)
- **Post Database Reference**: `voltixio-site/blog_posts_database_v3_complete_50posts.json`
- **Social Templates**: `voltixio-site/SOCIAL_MEDIA_POSTS_CORRECTED.md` (12 ready-to-post)
- **Audit/Update Script**: `wordpress_rest_api_standardizer.py` (modify for 30 posts)
- **WordPress Credentials**: 
  - Username: `blog_admin`
  - Endpoint: `https://voltixio.com/wp-json/`
  - Post 420 URL: `https://voltixio.com/wp-admin/post.php?post=420&action=edit`

## Success Metrics for 30-Post Strategy

✅ All 30 posts have consistent footer CTA  
✅ All 30 posts have featured images  
✅ All 30 posts have SEO-optimized meta descriptions (150-160 chars)  
✅ All 30 posts categorized & tagged (Industries, Features)  
✅ All 30 posts have internal CTA links  
✅ Post 420 displays/organizes all 30 posts  
✅ Sitemap updated with all 30 posts  
✅ Cache purged, all posts live and indexed  
✅ Social media campaign launched (20 new + 10 existing rotation)  
✅ Google Search Console tracking indexing progress  

**Timeline**: 
- Audit & standardize: 2-4 hours (Day 1)
- Configure post 420 hub: 1-2 hours (Day 1)
- Cache purge & testing: 30 minutes (Day 1)
- GSC resubmit: Immediate (Day 1)
- Social campaign: Rolling (Days 2-14)
- Monitor indexing: Ongoing (Weeks 1-8)

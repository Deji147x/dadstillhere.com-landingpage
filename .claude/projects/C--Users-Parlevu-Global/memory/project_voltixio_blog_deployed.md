---
name: project_voltixio_blog_deployed
description: "VoltixIO blog final state (2026-07-09) — 50 unique posts live at voltixio.com/blog/, standardization done, minor edits pending"
metadata:
  node_type: memory
  type: project
  originSessionId: 2b2cf74b-e8d2-42fd-8ca3-8e27f2d6ed73
---

## VoltixIO Blog — Standardization COMPLETE (2026-07-09)

Final state: **50 unique published posts** (NOT 180 — the restored backup contained up to ~11 duplicate copies of many articles; 130 duplicates were trashed across two dedupe passes, recoverable from WP Trash ~30 days).

### Live configuration
- Permalinks: Custom Structure `/blog/%postname%/` — set via **phpMyAdmin SQL** because the admin form won't save it (likely WAF blocking `%postname%` in POST). DB `u628828002_0wl8O`, table prefix `wp_`.
- Blog index: WordPress **Page ID 754**, slug `blog`, contains a Query Loop block grid (12/page, 5 pages). **Do NOT trash this page** — trashing it 404s /blog/ (happened once; restoring it also required rebuilding page content).
- All 50 posts have: featured image (12 rotating Unsplash uploads named `voltixio-blog-*` + 4 branded from Downloads), tags + excerpts, single h1 (duplicate in-content titles stripped from 14), single post-video CTA (broken pre-video fragments removed from 15), identical hotlinked lead image stripped from content (47).
- Footer template part = **post ID 14** (block theme `hostinger-ai-theme`): contacts info@voltixio.com / (443) 853-1405 as **plain text** (user rejected underlined mailto/tel links), 6 social icons (LinkedIn, FB, IG, X, TikTok, Pinterest → /voltixio handles).
- .htaccess hardened (wp-config + .htaccess denied, Options -Indexes; **XML-RPC left OPEN** — publishing pipeline depends on it). Backup: public_html/.htaccess.bak; local source voltixio-site/.htaccess-rewritten.
- sitemap.xml live with 52 URLs (local copy voltixio-site/sitemap.xml).

### Working method
XML-RPC as `admin_voltixio` (password in Hostinger credential vault, not stored here): `wp.editPost`, `wp.getPosts` (supports post_type filter incl. wp_template_part, custom_css, wp_global_styles), `wp.uploadFile` + `post_thumbnail`. REST API is effectively read-only for us. **LiteSpeed OBJECT cache holds wp_options aggressively** — after any DB/options change the user must Purge All in LiteSpeed or the change appears missing.

### Pending ("minor edits tomorrow", 2026-07-10)
1. User to run LiteSpeed **Purge All** — still pending; stale doubled titles/dates visible until then
2. Post-date at bottom of single posts: hide-CSS added to Global Styles (post 19: `.single-post main .wp-block-post-date{display:none}`) and custom_css post 840 — **verify it renders after purge**; if not, next lever is theme_mod `custom_css_post_id` in `theme_mods_hostinger-ai-theme`
3. User to submit sitemap in Google Search Console
4. Social campaign: use **voltixio-site/SOCIAL_MEDIA_POSTS_FINAL.md** (38 links remapped to live slugs; STEP5 file is stale)
5. Recommend installing Yoast/Rank Math (no SEO plugin installed; excerpts ready to feed it)

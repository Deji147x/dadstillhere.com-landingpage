# Memory Index

- [feedback_brand_spelling.md](feedback_brand_spelling.md) — brand is always "VoltixIO" (capital IO) in text; URLs stay lowercase

- [project_voltixio_hosting.md](project_voltixio_hosting.md) — voltixio.com apex+/blog on HOSTINGER (not VPS); GHL pipeline IDs; pit- tokens are v2-only
- [project_voltixio_working_dirs.md](project_voltixio_working_dirs.md) — voltixio-site has 2 clones that have DIVERGED; home copy is current, Downloads is behind; VPS is CPU-only (no GPU)
- [project_voltixio_head_injection.md](project_voltixio_head_injection.md) — 3 separate `<head>` surfaces on voltixio.com; `/` and `/intake/` are STATIC html (mu-plugins do nothing there), only `/blog/` is WordPress; WPCode silently fails

- [project_voltixio_blog_optimized.md](project_voltixio_blog_optimized.md) — all 152 posts got internal link clusters + topic-matched video + VideoObject schema (2026-08-06); optimize_posts.py is idempotent, safe to re-run
- [project_voltixio_blog_deployed.md](project_voltixio_blog_deployed.md) — 50 unique posts standardized & live at voltixio.com/blog/ (2026-07-09); pending: cache purge, GSC, socials; LiteSpeed object-cache gotcha
- [project_voltixio_blog_duplicate_publishing.md](project_voltixio_blog_duplicate_publishing.md) — duplicate-publishing bug FIXED 2026-08-06 (dedup on live slugs + per-run cap); task still off by choice; blog "case studies" use modeled numbers, not real clients
- [project_voltixio_mcp.md](project_voltixio_mcp.md) — VoltixIO MCP server: GHL creds, pipeline stage IDs, local path, build status
- [project_voltixio_social_automation_v2.md](project_voltixio_social_automation_v2.md) — Facebook social automation: SEO-optimized, humanized, trust-focused posts + three deployment paths (manual, Graph API, n8n). Ready to deploy.
- [project_voltixio_ghl_poster_broken.md](project_voltixio_ghl_poster_broken.md) — ghl_poster.js FIXED 2026-08-06 (GHL v2 API, .env creds, account allowlist); still dry-run only, needs approval to go live
- [feedback_dry_run.md](feedback_dry_run.md) — Never flip DRY_RUN=false without explicit user approval
- [project_voltixio_website_restore.md](project_voltixio_website_restore.md) — Landing page LIVE at voltixio.com; source voltixio-site/index.html, repo github.com/Deji147x/voltixio-site; home repo must never be pushed (secret in history)
- [project_parlevu_hosting.md](project_parlevu_hosting.md) — parlevugloballlc.com is on Hostinger; GitHub push does NOT go live yet (no auto-deploy wired up)
- [project_parlevu_deploy_broken.md](project_parlevu_deploy_broken.md) — Hostinger SSH deploy broken 2026-07-28 (publickey denied); SEO fixes on GitHub but NOT live; user must re-add SSH key in hPanel

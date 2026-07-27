---
name: project-parlevu-hosting
description: parlevugloballlc.com hosting provider and deployment gap (git push does not go live)
metadata: 
  node_type: memory
  type: project
  originSessionId: f43ba900-e961-4aea-9002-2d8f4a125fd3
  modified: 2026-07-24T14:56:33.741Z
---

parlevugloballlc.com is hosted on **Hostinger** (confirmed via DNS: `www.parlevugloballlc.com` CNAMEs to `*.cdn.hstgr.net`), same provider as VoltixIO ([[project_voltixio_hosting]]).

As of 2026-07-24, the site does **not** auto-deploy from GitHub (`Deji147x/parlevu-global-services-llc`). The daily blog pipeline (`tools/publish_next.py`) commits and pushes to GitHub and mirrors changed files to `upload-queue/`, but nothing pulls those changes onto the live host — confirmed by `blog-foreclosure-va.html` (published in the repo 2026-07-14) 404ing live 10 days later.

**Why:** `DEPLOYMENT.md`'s own checklist item "confirm deployment method" was never checked off — the auto-deploy assumption in the docs was aspirational, not verified.

**How to apply:** Before trusting any "published" status in `content-calendar.json` as actually live, verify on the real site. Fix in progress: wiring Hostinger hPanel's Git feature (auto-deploy webhook) or a host-side cron `git pull` so pushes go live automatically — see [[project_parlevu_deploy_setup]] once that's written.

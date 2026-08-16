---
name: project-parlevu-deploy-broken
description: Parlevu Hostinger SSH git deploy broken since ~2026-07-28 (publickey denied); SEO fixes committed to GitHub but NOT live
metadata: 
  node_type: memory
  type: project
  originSessionId: ebd1cf4c-e497-48d1-a1fb-cb218af94486
  modified: 2026-07-28T18:50:13.906Z
---

2026-07-28: Hostinger migrated the account to a NEW server: `us-bos-web1535.main-hosting.eu` = 82.197.82.42 (was 82.197.80.123), port 65002, user u628828002. The migration wiped the old SSH authorized_keys, the bare repo `~/repos/parlevu.git`, and the post-receive deploy hook — direct git push deploy is dead.

**New deploy model (in progress):** repo is PUBLIC on GitHub, so Hostinger hPanel → Advanced → GIT can pull it directly (no deploy key). `main` branch upstream now tracks `github/main` so the daily publish cron's bare `git push` goes to GitHub. Pending user action: create the Git deployment in hPanel (repo URL https://github.com/Deji147x/parlevu-global-services-llc, branch main, dir blank = public_html; Hostinger requires target dir empty on first deploy) and add the auto-deploy webhook to GitHub repo settings.

**How to apply:** Deploys = push to `github` remote. Don't rely on `origin` (updated to new IP but no repo exists server-side). SEO fixes commit `c1547ae` is on GitHub awaiting first pull-deploy. Related: [[project-parlevu-hosting]]

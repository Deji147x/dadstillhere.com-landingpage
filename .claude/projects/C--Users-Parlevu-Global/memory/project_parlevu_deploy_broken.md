---
name: project-parlevu-deploy-broken
description: Parlevu Hostinger SSH git deploy broken since ~2026-07-28 (publickey denied); SEO fixes committed to GitHub but NOT live
metadata: 
  node_type: memory
  type: project
  originSessionId: ebd1cf4c-e497-48d1-a1fb-cb218af94486
  modified: 2026-07-28T18:31:25.049Z
---

As of 2026-07-28, `git push origin main` (ssh://u628828002@82.197.80.123:65002/~/repos/parlevu.git) fails with "Permission denied (publickey,password)". User mentioned a hosting "purged location updated" — server may have moved or SSH keys reset. Local key: `~/.ssh/id_ed25519` (pub key comment info@voltixio.com).

**Why:** SEO fixes (single-H1 across 95 pages, sitemap rebuilt to 101 URLs, canonical fix, new MD guide post) are committed on GitHub (`c1547ae`) but NOT deployed to the live site — the live sitemap is still the stale 36-URL version.

**How to apply:** Before any Parlevu deploy, test `ssh -p 65002 u628828002@82.197.80.123`. Fix path: user re-adds the id_ed25519.pub key in Hostinger hPanel → Advanced → SSH Access, or updates the remote URL if the server IP/port changed. Then push origin main to deploy the pending fixes. Related: [[project-parlevu-hosting]]

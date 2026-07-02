---
name: voltixio-website-restore
description: VoltixIO landing page restored and LIVE at voltixio.com (2026-07-01); repo at github.com/Deji147x/voltixio-site
metadata: 
  node_type: memory
  type: project
  originSessionId: df190dee-d459-41c1-bcd2-b9d4dbd35041
---

VoltixIO landing page restore — **COMPLETED and LIVE 2026-07-01**.

- Live: voltixio.com serves the static page (`<title>AI Voice Agents & Conversational AI for Business | VoltixIO</title>`); WordPress still works underneath (wp-login, wp-json intact).
- Local source of truth: `C:\Users\Parlevu_Global\voltixio-site\index.html` (repaired from damaged `Downloads\index.html.html` — CSS block had split `<!DOCTYPE`).
- GitHub backup: **https://github.com/Deji147x/voltixio-site** (private, branch `main`, includes DEPLOY.md guide). Standalone repo — deliberately separate from the home-folder repo, which contains a hardcoded NVIDIA API key in history and must never be pushed.
- Server setup: Hostinger `public_html/index.html` + `DirectoryIndex index.html index.php` as first line of `.htaccess` (above `# BEGIN WordPress`). LiteSpeed cache ~2h; purge after any change.
- Update flow: edit local index.html → commit/push to voltixio-site repo → re-upload to `public_html` via hPanel File Manager → purge cache.
- Rollback: delete remote index.html, remove the DirectoryIndex line (backup: `.htaccess.old-1782928385` on server), purge cache.
- Full guide: `C:\Users\Parlevu_Global\.claude\DEPLOY_VOLTIXIO_HOMEPAGE.md` (also DEPLOY.md in the site repo).

Related: [[voltixio-mcp project]]

**Why:** Homepage had fallen back to a bare WordPress install because the uploaded file was named `index.html.` (trailing dot).
**How to apply:** For any voltixio.com homepage change, follow the update flow above; never push the home-folder git repo to a remote.

---
name: project-voltixio-hosting
description: "voltixio.com (apex + /blog) is on HOSTINGER shared hosting, NOT the VPS"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6b5ed18a-ea32-4e2f-9cfd-44c016daa067
---

Verified 2026-07-16 via response headers (`platform: hostinger`, `panel: hpanel`):
- **voltixio.com apex** (static landing, index.html) AND **voltixio.com/blog** (WordPress, LiteSpeed cache, PHP 8.3) are both on **Hostinger shared hosting** — public_html contains index.html + WordPress side by side.
- The **VPS** only runs techbrief backend (Docker: Postgres/Redis/Ollama/Express) and newsfeed pipeline. Do not look for voltixio.com web roots there.
- Deploys to voltixio.com go through Hostinger hPanel File Manager/FTP. Never overwrite public_html/index.html (live landing page).
- GHL: pipeline `Delta Division` id `2lRqOaimG91aKfBHBHww`; pipeline `voltixio-blog` id `ly3pFm0tQCuuDYHf6iIw` (created 2026-07-14, for blog leads). GHL pit- tokens work on API v2 (services.leadconnectorhq.com + Version header), NOT v1.
- User's GHL pit- token was pasted in chat 2026-07-16 — advised rotation after intake setup.

Intake (live 2026-07-17): form at voltixio.com/intake/ served by mu-style plugin `voltixio-intake-serve` (matches REQUEST_URI, readfile's public_html/intake.html) because the WP "Intake" page is classified as a posts page (body class `blog`) and the theme template has no Post Content block. /intake.html 301→/intake/ (redirect left in place, now harmless). Form POSTs to OperatorBase webhook → GHL. Blog nav: Home/Blog/Demo/Intake.

Related: [[project-voltixio-working-dirs]], [[project_voltixio_website_restore]]

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

---
name: voltixio-head-injection
description: voltixio.com has 3 separate head-injection surfaces; WPCode snippets silently fail — use mu-plugins for WordPress pages
metadata: 
  node_type: memory
  type: project
  originSessionId: 173ec0f2-1567-4a1d-a4d4-622d4b2f4d0d
  modified: 2026-07-27T00:08:42.494Z
---

Adding anything to `<head>` on voltixio.com (verification tags, analytics, pixels) requires **three separate edits** — there is no single place that covers the site.

| Surface | Served by | Where to edit |
|---|---|---|
| `/` homepage | static `index.html` in `public_html/` | edit local `voltixio-site/index.html`, upload via hPanel File Manager |
| `/intake/` | static `intake.html` (`/intake` 301s to `/intake/`; **not** WordPress — no `wp_head`) | same as above |
| `/blog/` + all posts | WordPress (single install at root; `/blog/wp-json/` 404s) | mu-plugin |

**WPCode snippets do not inject on this install.** Verified 2026-07-26: a snippet showed as created with "Run Everywhere" but produced no output on `/blog/` or any post, even with cache bypassed, while `wp_head` was demonstrably running (generator tag present). Do not spend time debugging WPCode here.

Reliable path for WordPress pages: drop a PHP file in `public_html/wp-content/mu-plugins/` (must-use plugins always load, no activation toggle). Working example: `voltixio-site/voltixio-bing-verification.php`. That dir also holds `ghl-webhook-receiver.php`, `elementor-safe-mode.php`, `hostinger-auto-updates.php`.

Always purge LiteSpeed cache after any change, and verify with a cache-busting query string — `X-LiteSpeed-Cache: hit` will otherwise mask the result.

**Why:** Three different rendering paths on one domain make "add a meta tag" look like one task when it's three; and WPCode failing silently sends you debugging the wrong layer.
**How to apply:** For any new head tag, do all three surfaces, then verify each with `curl` + cache-buster before declaring done.

Related: [[voltixio-website-restore]], [[project_voltixio_hosting]]

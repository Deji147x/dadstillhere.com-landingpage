# Deploy VoltixIO Landing Page as voltixio.com Homepage

Full guide to publish the repaired static landing page as the homepage of
voltixio.com, while keeping the existing WordPress install working underneath.

---

## What you're deploying

| Item | Location |
|---|---|
| Repaired page (upload this) | `C:\Users\Parlevu_Global\voltixio-site\index.html` (~176 KiB) |
| Original damaged copy (do not use) | `C:\Users\Parlevu_Global\Downloads\index.html.html` |
| Destination on server | `public_html/index.html` on Hostinger |
| Local preview | `python -m http.server 8765 --directory C:\Users\Parlevu_Global\voltixio-site` → http://localhost:8765 |

**Background:** the server already has a dead file named `index.html.`
(trailing dot) in `public_html` — an earlier upload with a broken filename.
Because of it, the homepage falls through to WordPress (`index.php`).
This deployment fixes that.

---

## Step 0 — Prerequisites (2 min)

1. Log in at https://hpanel.hostinger.com
2. Select the **voltixio.com** website → open **File Manager**
   (it opens the file browser at `srv1388-files.hstgr.io`)
3. Navigate into **`public_html`** — confirm you can see `wp-config.php`,
   `wp-admin/`, `wp-content/`. That's the correct folder.
4. If you don't see `.htaccess`, enable **Show hidden files** in the file
   manager settings.

---

## Step 1 — Park the old broken file

In `public_html`, select the file **`index.html.`** (note the trailing dot,
176.19 KiB, dated ~a month ago) → **Rename** → change to:

```
index.html.old
```

Keep it as an archive; don't delete it.

---

## Step 2 — Back up `.htaccess`

Select `.htaccess` → **Copy/Duplicate** (or Download to your PC) → name the
copy:

```
.htaccess.bak2
```

(There is already an `.htaccess.old-…` from the recent WP reinstall, but make
your own fresh copy — this is your rollback.)

---

## Step 3 — Upload the repaired page

1. Click the **upload icon** (⬆ up-arrow, top-right toolbar) → **File**
2. Select `C:\Users\Parlevu_Global\voltixio-site\index.html`
3. Confirm it appears in `public_html` as `index.html` — **no trailing dot**,
   ~176 KiB.

---

## Step 4 — Make it win over WordPress

Select `.htaccess` → **Edit**. Add this as the **very first line**, above the
`# BEGIN WordPress` block:

```apache
DirectoryIndex index.html index.php
```

Save.

**Why this works:** the server picks `index.html` first for the root URL
(`voltixio.com/`). All other WordPress URLs are untouched — WP's rewrite
rules only handle requests that don't match a real file, so permalinks,
wp-admin, and wp-json keep working.

---

## Step 5 — Purge the cache

The site runs LiteSpeed Cache with a 2-hour max-age; skip this and visitors
keep seeing the old homepage.

- **hPanel:** website dashboard → **Cache Manager** (or Speed section) →
  **Purge / Flush cache**
- **Or in WordPress admin:** LiteSpeed Cache → Toolbox → **Purge All**

---

## Step 6 — Verify

1. Open https://voltixio.com in an **incognito window**.
   Expect the dark landing page: *"AI Voice Agents That Book Appointments,
   Qualify Leads & Close Sales"*.
2. Resize to phone width (or open on your phone) — nav, pricing tabs,
   ROI calculator, and FAQ should all work.
3. Check WordPress still lives underneath:
   - https://voltixio.com/wp-login.php → loads the WP login page
   - https://voltixio.com/wp-json/ → returns JSON
4. Check the booking CTAs point at `api.voltixio.com/widget/booking/…` and
   open correctly.

Command-line check (optional):

```bash
curl -s https://voltixio.com/ | head -c 300
# should start with <!DOCTYPE html> and contain
# <title>AI Voice Agents & Conversational AI for Business | VoltixIO</title>
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Old WP homepage still shows | Purge cache again; hard-refresh (Ctrl+Shift+R); wait up to 2h for edge cache |
| 403/500 after editing `.htaccess` | Restore from `.htaccess.bak2`; re-add only the single `DirectoryIndex` line |
| Logo missing | Confirm `public_html/images/logo.png` exists (it did at deploy time) |
| WP pages broken | They shouldn't be — nothing WP-related was changed. Restore `.htaccess.bak2` to be sure |

---

## Rollback (instant)

1. Delete `public_html/index.html`
2. Rename `.htaccess.bak2` back to `.htaccess` (or remove the
   `DirectoryIndex` line)
3. Purge cache

The WordPress homepage returns immediately.

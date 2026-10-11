#!/bin/bash
# Publish every blog entry whose date has arrived, straight onto the live site.
#
#   bash /opt/dsh/deploy/publish-blog.sh
#
# Why it works this way: build-blog.mjs rebuilds a dist/ tree in place — it needs
# the built pages to inject into and dist/blog/index.html as its entry template.
# The /opt/dsh checkout carries only tools/ and content/, so we borrow the LIVE
# site as that tree, rebuild it, verify, then push back. Idempotent: the script
# replaces the published-posts block rather than appending, so re-running is safe.
set -euo pipefail

SRC=/opt/dsh
LIVE=/var/www/dadstillhere.com
WORK=/opt/site
STAMP=$(date +%Y%m%d-%H%M%S)

[ -d "$LIVE" ] || { echo "no live site at $LIVE"; exit 1; }
[ -f "$LIVE/blog/index.html" ] || { echo "no $LIVE/blog/index.html — is that the right docroot?"; exit 1; }

# A rollback copy before anything is written. Cheap, and the site has been
# emptied twice before by a build that went wrong.
mkdir -p /var/backups/dsh
tar -czf "/var/backups/dsh/site-$STAMP.tgz" -C "$LIVE" . 2>/dev/null
echo "backup:    /var/backups/dsh/site-$STAMP.tgz"

mkdir -p "$WORK"
cd "$WORK"
rm -rf tools content dist
cp -r "$SRC/tools" "$SRC/content" .
mkdir -p dist
rsync -a "$LIVE/" dist/

BEFORE=$(find dist/blog -name '*.html' | wc -l)
node tools/build-blog.mjs
AFTER=$(find dist/blog -name '*.html' | wc -l)
echo "blog pages: $BEFORE -> $AFTER"

# Never push a tree whose homepage lost its body. Both outages started this way.
if [ ! -s dist/index.html ] || ! grep -q '</html>' dist/index.html; then
  echo "dist/index.html looks broken — not deploying"; exit 1
fi

rsync -a dist/ "$LIVE/"
chown -R www-data:www-data "$LIVE" 2>/dev/null || true

for path in / /blog /feed.xml /sitemap.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://dadstillhere.com$path")
  echo "  $code  $path"
done
echo
echo "done. Roll back with:"
echo "  tar -xzf /var/backups/dsh/site-$STAMP.tgz -C $LIVE"

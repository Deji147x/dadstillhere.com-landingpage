#!/usr/bin/env bash
# dsh-backup — everything needed to rebuild the box, encrypted, copied offsite.
# The VPS has been lost once. A backup on the same VPS does not survive that.
#   dsh-run backup /usr/local/bin/dsh-backup
set -euo pipefail
. /etc/dsh/ops.env
[ -n "${BACKUP_PASSPHRASE:-}" ] || { echo "BACKUP_PASSPHRASE not set in /etc/dsh/ops.env"; exit 1; }
DEST=/var/backups/dsh; STAMP=$(date +%F-%H%M); F=$DEST/dsh-$STAMP.tar.gz
mkdir -p "$DEST" /var/lib/dsh
crontab -l > /var/lib/dsh/crontab.root 2>/dev/null || true

tar czf "$F" --ignore-failed-read \
  /var/www/dadstillhere.com /opt/dsh /etc/dsh /var/lib/dsh \
  /etc/nginx/sites-available /etc/nginx/snippets /etc/letsencrypt \
  /usr/local/bin/dsh-* /etc/logrotate.d/dsh /root/.config/rclone 2>/dev/null

tar tzf "$F" | grep -q 'var/www/dadstillhere.com/index.html' || { echo "archive missing homepage — aborting"; exit 1; }
gpg --batch --yes --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" -c --cipher-algo AES256 -o "$F.gpg" "$F"
rm -f "$F"
echo "made $F.gpg ($(du -h "$F.gpg" | cut -f1))"

rclone copy "$F.gpg" "$RCLONE_REMOTE/" --retries 5
rclone lsf "$RCLONE_REMOTE/" | grep -q "dsh-$STAMP" || { echo "offsite copy not found after upload"; exit 1; }
echo "offsite ok: $RCLONE_REMOTE"

find "$DEST" -name 'dsh-*.gpg' -mtime +14 -delete
find "$DEST" -name 'site-*.tgz' -mtime +7 -delete     # publish-blog rollback copies
rclone delete "$RCLONE_REMOTE/" --min-age 90d || true

# Sundays: prove the newest offsite copy actually restores.
if [ "$(date +%u)" = 7 ]; then
  T=$(mktemp -d); rclone copy "$RCLONE_REMOTE/$(basename "$F.gpg")" "$T/"
  gpg --batch --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" -d "$T"/*.gpg | tar xz -C "$T"
  test -s "$T/var/www/dadstillhere.com/index.html" && test -s "$T/opt/dsh/content/posts.json" \
    && echo "restore test ok" || { echo "RESTORE TEST FAILED"; rm -rf "$T"; exit 1; }
  rm -rf "$T"
fi

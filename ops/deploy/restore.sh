#!/usr/bin/env bash
# dsh-restore — bare Ubuntu VPS → dadstillhere.com live, from the newest offsite backup.
# Target: under 30 minutes. Needs only: root SSH, your rclone config, your backup passphrase.
#   curl -fsSL <raw github url>/deploy/restore.sh -o restore.sh && bash restore.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx rsync curl gnupg rclone ufw cron imagemagick >/dev/null
command -v node >/dev/null || { curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null; apt-get install -y -qq nodejs >/dev/null; }
echo "packages ok, node $(node -v)"

if ! rclone listremotes | grep -q .; then
  echo "No rclone remote. Run 'rclone config' now (same provider/bucket as before), then re-run this."; exit 1
fi
read -r -p "rclone remote path [offsite:dsh-backups]: " R; R=${R:-offsite:dsh-backups}
read -r -s -p "Backup passphrase: " PASS; echo
LATEST=$(rclone lsf "$R/" | grep '^dsh-.*\.gpg$' | sort | tail -1)
[ -n "$LATEST" ] || { echo "no backups found at $R"; exit 1; }
echo "restoring $LATEST"
T=$(mktemp -d); rclone copy "$R/$LATEST" "$T/"
gpg --batch --pinentry-mode loopback --passphrase "$PASS" -d "$T/$LATEST" | tar xz -C /
rm -rf "$T"

ln -sf /etc/nginx/sites-available/dadstillhere.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chown -R www-data:www-data /var/www/dadstillhere.com
chmod 700 /etc/dsh; chmod 600 /etc/dsh/*.env
nginx -t && systemctl enable --now nginx && systemctl reload nginx
ufw allow OpenSSH >/dev/null; ufw allow 'Nginx Full' >/dev/null; ufw --force enable >/dev/null

[ -f /var/lib/dsh/crontab.root ] && crontab /var/lib/dsh/crontab.root && echo "crontab restored"
systemctl enable --now cron

IP=$(curl -s -4 ifconfig.me); DNS=$(getent hosts dadstillhere.com | awk '{print $1}' | head -1)
if [ "$IP" != "$DNS" ]; then
  echo; echo "DNS points at $DNS, this box is $IP. Update the A record at Hostinger, wait, then:"
  echo "  certbot --nginx -d dadstillhere.com -d www.dadstillhere.com --keep-until-expiring"
else
  certbot renew --quiet || true
  /usr/local/bin/dsh-watch || true
fi
echo "restore done."

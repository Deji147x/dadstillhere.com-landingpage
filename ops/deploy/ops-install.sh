#!/usr/bin/env bash
# One-time (and safe to re-run): installs the ops layer on the VPS.
#   cd /opt/dsh && bash deploy/ops-install.sh
set -euo pipefail
apt-get install -y -qq gnupg rclone >/dev/null
install -m 755 deploy/dsh-run.sh   /usr/local/bin/dsh-run
install -m 755 deploy/watchdog.sh  /usr/local/bin/dsh-watch
install -m 755 deploy/backup.sh    /usr/local/bin/dsh-backup
install -m 755 deploy/restore.sh   /usr/local/bin/dsh-restore
install -d -m 700 /etc/dsh /var/lib/dsh
install -d -m 755 /var/log/dsh
[ -f /etc/dsh/ops.env ] || { install -m 600 deploy/ops.env.example /etc/dsh/ops.env; echo "EDIT /etc/dsh/ops.env"; }
cat > /etc/logrotate.d/dsh <<'EOF'
/var/log/dsh/*.log /var/log/dsh-*.log {
  weekly
  rotate 8
  compress
  missingok
  notifempty
}
EOF
crontab -l > /var/lib/dsh/crontab.before-ops 2>/dev/null || true
crontab deploy/crontab.txt
echo "installed. crontab replaced (old copy: /var/lib/dsh/crontab.before-ops)."
echo "next: nano /etc/dsh/ops.env  →  rclone config  →  dsh-run backup dsh-backup  →  dsh-watch"

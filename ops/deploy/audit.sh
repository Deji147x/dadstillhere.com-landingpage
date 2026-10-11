#!/usr/bin/env bash
# dsh-audit — read-only security + health audit. Changes nothing. Safe to run any time.
#   bash /opt/dsh/deploy/audit.sh
set -uo pipefail
D=dadstillhere.com; W=/var/www/$D
P=0; F=0; N=0
ok(){ printf '  OK    %s\n' "$1"; P=$((P+1)); }
bad(){ printf '  FAIL  %s\n' "$1"; F=$((F+1)); }
warn(){ printf '  WARN  %s\n' "$1"; N=$((N+1)); }
H=$(curl -sI -m 15 "https://$D/")

echo "== 1. Server access"
S=$(sshd -T 2>/dev/null)
echo "$S" | grep -q '^passwordauthentication no' && ok "SSH password login off" || bad "SSH accepts passwords — run deploy/harden.sh after adding your key"
echo "$S" | grep -qE '^permitrootlogin (prohibit-password|without-password|no)' && ok "root login key-only" || bad "root can log in with a password"
[ -s /root/.ssh/authorized_keys ] && ok "SSH key installed ($(grep -c . /root/.ssh/authorized_keys) key(s))" || warn "no SSH key in /root/.ssh/authorized_keys"
ufw status 2>/dev/null | grep -q 'Status: active' && ok "firewall active" || bad "firewall (ufw) not active"
O=$(ss -tlnH 2>/dev/null | awk '{print $4}' | grep -vE '^(127\.|\[::1\]|localhost)' | sed 's/.*://' | sort -un | tr '\n' ' ')
echo "$O" | grep -qvE '^(22 |80 |443 )*$' && warn "public ports open: $O(expect 22 80 443)" || ok "only ports 22/80/443 public"
systemctl is-active --quiet fail2ban && ok "fail2ban running" || bad "fail2ban not running"
[ -f /etc/apt/apt.conf.d/20auto-upgrades ] && ok "automatic security updates on" || bad "automatic security updates off"
U=$(apt list --upgradable 2>/dev/null | grep -c security); [ "$U" -eq 0 ] && ok "no pending security updates" || warn "$U security updates pending — apt upgrade"
[ -f /var/run/reboot-required ] && warn "reboot required (kernel/libc update waiting)" || ok "no reboot pending"

echo "== 2. Secrets"
for f in /etc/dsh/*.env; do m=$(stat -c %a "$f"); [ "$m" = 600 ] && ok "$(basename $f) mode 600" || bad "$f mode $m (should be 600)"; done
L=$(grep -rlE 'EAA[A-Za-z0-9]{40,}|TH[A-Za-z0-9]{60,}|hcw_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_' $W /opt/dsh --include='*' 2>/dev/null | grep -v '/.git/' | head -5)
[ -z "$L" ] && ok "no tokens in site or repo files" || bad "token-like strings in: $L"
for p in /.env /.git/config /content/posts.json /deploy/harden.sh /tools/post-social.mjs /etc/dsh/social.env /Dad%20Still%20Here%20Website.dc.html /backup.tar.gz; do
  c=$(curl -s -o /dev/null -m 10 -w '%{http_code}' "https://$D$p"); [ "$c" = 200 ] && bad "$p is publicly readable" || ok "$p blocked ($c)"; done

echo "== 3. Web"
for h in strict-transport-security content-security-policy x-content-type-options x-frame-options referrer-policy permissions-policy; do
  echo "$H" | grep -qi "^$h:" && ok "header $h" || bad "missing header $h"; done
echo "$H" | grep -qi '^server: nginx/[0-9]' && warn "nginx version exposed" || ok "server version hidden"
[ "$(curl -s -o /dev/null -w '%{http_code}' http://$D/)" = 301 ] && ok "http → https" || bad "http does not redirect"
[ "$(curl -s -o /dev/null -w '%{redirect_url}' https://www.$D/)" = "https://$D/" ] && ok "www → apex" || warn "www does not redirect to apex"
curl -s -o /dev/null --tlsv1.1 --tls-max 1.1 -m 8 "https://$D/" 2>/dev/null && bad "TLS 1.1 still accepted" || ok "TLS 1.0/1.1 refused"
E=$(echo | openssl s_client -servername $D -connect $D:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
DAYS=$(( ( $(date -d "$E" +%s) - $(date +%s) ) / 86400 )); [ $DAYS -gt 20 ] && ok "certificate valid $DAYS days" || bad "certificate expires in $DAYS days"
certbot renew --dry-run -q 2>/dev/null && ok "certificate auto-renew works" || warn "certbot renew dry-run failed"
[ "$(curl -s -o /dev/null -w '%{http_code}' https://$D/nope-$RANDOM)" = 404 ] && ok "unknown paths 404" || bad "unknown paths not 404 (crawl trap)"
I=$(curl -s https://$D/ | grep -c '<form'); ok "homepage forms: $I"
nginx -t 2>/dev/null && ok "nginx config valid" || bad "nginx config invalid"

echo "== 4. Health"
USE=$(df -P / | awk 'NR==2{print $5}' | tr -d %); [ $USE -lt 80 ] && ok "disk $USE%" || bad "disk $USE%"
MEM=$(free -m | awk '/Mem:/{printf "%d",$3/$2*100}'); [ $MEM -lt 85 ] && ok "memory $MEM%" || warn "memory $MEM%"
for s in nginx cron fail2ban; do systemctl is-active --quiet $s && ok "$s running" || bad "$s down"; done
command -v node >/dev/null && ok "node $(node -v)" || bad "node missing"
for j in blog social archive watch seo; do
  f=/var/log/dsh/$j.log; [ -f "$f" ] || { warn "$j: no log yet"; continue; }
  last=$(grep -E "$j exit" "$f" | tail -1); case "$last" in *"exit 0"*) ok "$j last run ok";; "") warn "$j has not run yet";; *) bad "$j last run: ${last##*── }";; esac; done
crontab -l | grep -c 'dsh-run' | sed 's/^/  INFO  scheduled jobs: /'
. /etc/dsh/ops.env 2>/dev/null; [ -n "${NTFY_TOPIC:-}" ] && ok "phone alerts configured" || bad "no ntfy topic"
grep -q '^HC_URL_' /etc/dsh/ops.env 2>/dev/null && ok "healthchecks.io: $(grep -c '^HC_URL_' /etc/dsh/ops.env) checks" || bad "healthchecks.io not wired"
[ -n "${BACKUP_PASSPHRASE:-}" ] && ok "offsite backup configured" || warn "offsite backup NOT configured (Hostinger weekly only)"
ls /var/backups/dsh/*.tgz >/dev/null 2>&1 && ok "local rollback copies: $(ls /var/backups/dsh/*.tgz | wc -l)" || warn "no local rollback copies"
dsh-watch >/tmp/w.txt 2>&1; grep -E 'CRIT|WARN' /tmp/w.txt | sed 's/^/  watch/' ; grep -q CRIT /tmp/w.txt || ok "watchdog: no critical findings"

echo
echo "== $P passed, $F failed, $N warnings"

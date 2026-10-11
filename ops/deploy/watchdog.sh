#!/usr/bin/env bash
# dsh-watch — checks OUTCOMES, not exit codes. A job can exit 0 and still publish nothing
# (that is exactly how the queue ran dry on 7 Oct unnoticed). Runs 07:00 and 10:00.
#   dsh-run watch /usr/local/bin/dsh-watch
set -uo pipefail
[ -r /etc/dsh/ops.env ] && . /etc/dsh/ops.env
[ -r /etc/dsh/social.env ] && { set -a; . /etc/dsh/social.env; set +a; }
D=dadstillhere.com; SRC=/opt/dsh; LIVE=/var/www/$D; TODAY=$(date +%F); HOUR=$(date +%H)
CRIT=(); WARN=()
crit(){ CRIT+=("$1"); echo "  CRIT  $1"; }
warn(){ WARN+=("$1"); echo "  WARN  $1"; }
ok(){ echo "  OK    $1"; }

for p in / /blog /feed.xml /sitemap.xml /our-story; do
  c=$(curl -sL -o /dev/null -m 15 -w '%{http_code}' "https://$D$p")
  [ "$c" = 200 ] && ok "$p" || crit "$p returned $c"
done

# Every URL in the live sitemap must be 200 — a fixed list missed six lost pages for weeks.
SB=0; ST=0
for L in $(curl -s -m 15 "https://$D/sitemap.xml" | grep -o '<loc>[^<]*' | sed 's/<loc>//'); do
  ST=$((ST+1)); c=$(curl -sL -o /dev/null -m 15 -w '%{http_code}' "$L"); [ "$c" = 200 ] || { SB=$((SB+1)); crit "sitemap URL $c: $L"; }
done
[ "$ST" -gt 0 ] && [ "$SB" -eq 0 ] && ok "sitemap: all $ST URLs 200"
[ "$ST" -eq 0 ] && crit "sitemap.xml empty or unreachable"

# Content runway: today's entry exists, and how many days are left.
read -r TODAY_SLUG LEFT < <(node -e '
  const p=require(process.argv[1]); const a=p.posts||p; const t=process.argv[2];
  const today=a.find(x=>x.date===t); console.log((today&&today.slug)||"-", a.filter(x=>x.date>t).length);
' "$SRC/content/posts.json" "$TODAY" 2>/dev/null || echo "ERR 0")
if [ "$TODAY_SLUG" = ERR ]; then crit "content/posts.json unreadable"
elif [ "$TODAY_SLUG" = - ]; then crit "no entry dated $TODAY — queue is empty, nothing will publish"
else
  [ -f "$LIVE/blog/$TODAY_SLUG/index.html" ] || [ -f "$LIVE/blog/$TODAY_SLUG.html" ] \
    && ok "today's entry live: $TODAY_SLUG" || crit "today's entry $TODAY_SLUG not on the site"
fi
[ "$LEFT" -ge "${RUNWAY_WARN_DAYS:-10}" ] && ok "$LEFT entries queued" || warn "only $LEFT entries queued after today"

# Facebook: ask Graph itself, not our own record. Never print the response — it echoes the token.
if [ -n "${FB_PAGE_TOKEN:-}" ]; then
  RAW=$FB_PAGE_TOKEN; TOK=$(printf %s "$RAW" | tr -d '\r\n"'"'"' ')
  [ "$TOK" != "$RAW" ] && warn "FB_PAGE_TOKEN in social.env has quotes/spaces/CR — strip them (len ${#RAW} -> ${#TOK})"
  r=$(curl -s -m 20 "https://graph.facebook.com/v21.0/${FB_PAGE_ID}/posts?fields=created_time&limit=1" --data-urlencode "access_token=$TOK" -G)
  if echo "$r" | grep -q '"error"'; then
    msg=$(echo "$r" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const e=JSON.parse(s).error;console.log((e.code||"")+" "+(e.type||"")+" "+String(e.message||"").replace(/EA[A-Za-z0-9]{10,}/g,"[token]").slice(0,90))}catch{console.log("unparseable")}})')
    crit "Facebook token rejected: $msg (token length ${#TOK}, starts ${TOK:0:3})"
  elif [ "$HOUR" -ge 10 ] && ! echo "$r" | grep -q "\"created_time\":\"$TODAY"; then warn "no Facebook post yet today"
  else ok "Facebook token valid"; fi
fi

END=$(echo | openssl s_client -servername $D -connect $D:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
DAYS=$(( ( $(date -d "${END:-now}" +%s) - $(date +%s) ) / 86400 ))
[ "$DAYS" -gt 20 ] && ok "TLS $DAYS days" || crit "TLS cert expires in $DAYS days"

USE=$(df -P / | awk 'NR==2{print $5}' | tr -d %)
[ "$USE" -lt 85 ] && ok "disk $USE%" || crit "disk $USE% full"
for s in nginx cron; do systemctl is-active --quiet $s && ok "$s" || crit "$s not running"; done

LAST=$(ls -1t /var/backups/dsh/dsh-*.tar.gz.gpg 2>/dev/null | head -1)
if [ -z "${BACKUP_PASSPHRASE:-}" ]; then echo "  SKIP  offsite backup not set up (Hostinger weekly only)"; elif [ -z "$LAST" ]; then crit "no encrypted backup exists"
else AGE=$(( ( $(date +%s) - $(stat -c %Y "$LAST") ) / 3600 )); [ $AGE -lt 30 ] && ok "backup ${AGE}h old" || crit "last backup ${AGE}h old"; fi

if [ ${#CRIT[@]} -gt 0 ] || [ ${#WARN[@]} -gt 0 ]; then
  P=default; [ ${#CRIT[@]} -gt 0 ] && P=urgent
  MSG=$(printf '%s\n' "${CRIT[@]/#/✗ }" "${WARN[@]/#/• }" | sed '/^[✗•] $/d')
  [ -n "${NTFY_TOPIC:-}" ] && curl -fsS -m 10 -H "Title: dadstillhere needs you" -H "Priority: $P" \
    --data-raw "$MSG" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1
fi
[ ${#CRIT[@]} -eq 0 ]

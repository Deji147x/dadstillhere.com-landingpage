#!/usr/bin/env bash
# dsh-seo — daily, after the 06:05 blog publish. Keeps the sitemap honest and tells
# search engines what changed.
#   1. sitemap.xml is valid XML and every <loc> answers 200
#   2. robots.txt advertises the sitemap
#   3. IndexNow (Bing, Yandex, Seznam, Naver…) gets every URL not yet submitted
# Google retired sitemap "pings" in 2023 — it reads the sitemap from robots.txt and
# Search Console. Submit it there once by hand; this script keeps it correct after.
#   dsh-run seo dsh-seo
set -uo pipefail
[ -r /etc/dsh/ops.env ] && . /etc/dsh/ops.env
D=dadstillhere.com; W=/var/www/$D; SENT=/var/lib/dsh/indexnow-sent.txt; FAIL=0
mkdir -p /var/lib/dsh; touch "$SENT"

XML=$(curl -s -m 20 "https://$D/sitemap.xml")
echo "$XML" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{if(!/^<\?xml/.test(s)||!s.includes("</urlset>")){console.log("  FAIL sitemap is not valid XML");process.exit(1)}const n=(s.match(/<url>/g)||[]).length,l=(s.match(/<loc>/g)||[]).length;if(n!==l){console.log("  FAIL "+n+" <url> but "+l+" <loc>");process.exit(1)}console.log("  OK   sitemap valid, "+n+" URLs")})' || FAIL=1
URLS=$(echo "$XML" | grep -o '<loc>[^<]*' | sed 's/<loc>//')
BAD=0; for L in $URLS; do c=$(curl -sL -o /dev/null -m 15 -w '%{http_code}' "$L"); [ "$c" = 200 ] || { echo "  FAIL $c $L"; BAD=$((BAD+1)); }; done
[ $BAD -eq 0 ] && echo "  OK   every sitemap URL returns 200" || FAIL=1

if ! grep -qi "^Sitemap: https://$D/sitemap.xml" "$W/robots.txt" 2>/dev/null; then
  printf '\nSitemap: https://%s/sitemap.xml\n' "$D" >> "$W/robots.txt"; echo "  FIX  added Sitemap line to robots.txt"
else echo "  OK   robots.txt lists the sitemap"; fi

if [ -z "${INDEXNOW_KEY:-}" ]; then
  INDEXNOW_KEY=$(openssl rand -hex 16); echo "INDEXNOW_KEY=$INDEXNOW_KEY" >> /etc/dsh/ops.env; chmod 600 /etc/dsh/ops.env
  echo "  NEW  IndexNow key created"
fi
printf '%s' "$INDEXNOW_KEY" > "$W/$INDEXNOW_KEY.txt"; chown www-data:www-data "$W/$INDEXNOW_KEY.txt" 2>/dev/null
NEW=$(comm -23 <(echo "$URLS" | sort -u) <(sort -u "$SENT"))
if [ -n "$NEW" ]; then
  BODY=$(echo "$NEW" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.stringify({host:process.argv[1],key:process.argv[2],keyLocation:"https://"+process.argv[1]+"/"+process.argv[2]+".txt",urlList:s.trim().split("\n")})))' "$D" "$INDEXNOW_KEY")
  c=$(curl -s -o /dev/null -m 30 -w '%{http_code}' -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' --data "$BODY")
  N=$(echo "$NEW" | wc -l)
  if [ "$c" = 200 ] || [ "$c" = 202 ]; then echo "$NEW" >> "$SENT"; echo "  OK   IndexNow accepted $N URL(s) ($c)"
  else echo "  FAIL IndexNow answered $c for $N URL(s) — will retry tomorrow"; FAIL=1; fi
else echo "  OK   nothing new for IndexNow"; fi
exit $FAIL

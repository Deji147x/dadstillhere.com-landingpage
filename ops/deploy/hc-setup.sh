#!/usr/bin/env bash
# Creates one healthchecks.io check per cron job (schedule + timezone + all alert integrations)
# via the Management API, and writes each ping URL into /etc/dsh/ops.env. Safe to re-run.
set -euo pipefail
E=/etc/dsh/ops.env
. $E
KEY=${HC_API_KEY:-${HC_PING_KEY:-}}
case "$KEY" in hcw_*) ;; *) echo "need the read-write API key (starts hcw_) in HC_API_KEY"; exit 1;; esac
grep -q '^HC_API_KEY=' $E || echo "HC_API_KEY=$KEY" >> $E
sed -i '/^HC_PING_KEY=/d' $E
TZ_=$(timedatectl show -p Timezone --value 2>/dev/null || echo UTC)
mk(){ # job schedule grace_seconds
  out=$(curl -s -m 20 -X POST https://healthchecks.io/api/v3/checks/ -H "X-Api-Key: $KEY" \
    -d "{\"name\":\"dsh-$1\",\"slug\":\"dsh-$1\",\"schedule\":\"$2\",\"tz\":\"$TZ_\",\"grace\":$3,\"channels\":\"*\",\"unique\":[\"name\"]}")
  url=$(echo "$out" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).ping_url||"")}catch{console.log("")}})')
  [ -n "$url" ] || { echo "  FAIL dsh-$1: $(echo "$out" | head -c 120)"; return 1; }
  v="HC_URL_${1//-/_}"; sed -i "/^$v=/d" $E; echo "$v=$url" >> $E
  echo "  ok   dsh-$1  ($2, $TZ_)"
}
mk blog   "5 6 * * *"   3600
mk watch  "0 7,10 * * *" 1800
mk social "0 9 * * *"   3600
mk backup "15 3 * * *"  7200
mk letter "30 7 * * 0"  7200
chmod 600 $E
echo "done — refresh healthchecks.io"

#!/usr/bin/env bash
# dsh-run <job> <command...> — wraps every cron job: lock, log, retry, dead-man ping, alert on failure.
#   dsh-run blog bash /opt/dsh/deploy/publish-blog.sh
# A job that never starts (cron dead, box down) is caught by healthchecks.io, not by this script.
set -uo pipefail
JOB=$1; shift
[ -r /etc/dsh/ops.env ] && . /etc/dsh/ops.env
RETRIES=${RETRIES:-1}
mkdir -p /var/log/dsh
LOG=/var/log/dsh/$JOB.log
exec 9>/var/lock/dsh-$JOB.lock
flock -n 9 || { echo "$(date -Is) $JOB already running — skipped" >>"$LOG"; exit 0; }

HCV="HC_URL_${JOB//-/_}"; HCU="${!HCV:-}"
hc(){ [ -n "$HCU" ] || return 0
  curl -fsS -m 10 --retry 3 --data-raw "${2:-}" "$HCU$1" >/dev/null 2>&1 || true; }
alert(){ [ -n "${NTFY_TOPIC:-}" ] || return 0
  curl -fsS -m 10 -H "Title: dadstillhere: $JOB failed" -H "Priority: high" -H "Tags: warning" \
    --data-raw "$1" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 || true; }

hc /start
OUT=$(mktemp); rc=1
for i in $(seq 1 "$RETRIES"); do
  echo "── $(date -Is) $JOB start (try $i/$RETRIES)" | tee -a "$LOG" >"$OUT"
  "$@" >>"$OUT" 2>&1; rc=$?
  cat "$OUT" >>"$LOG"
  [ $rc -eq 0 ] && break
  [ "$i" -lt "$RETRIES" ] && sleep $(( i * 120 ))
done
echo "── $(date -Is) $JOB exit $rc" >>"$LOG"
TAIL=$(tail -c 9000 "$OUT"); rm -f "$OUT"
hc "/$rc" "$TAIL"
[ $rc -ne 0 ] && alert "exit $rc on $(hostname) — $(echo "$TAIL" | tail -n 5)"
exit $rc

#!/bin/sh
# Entry point of the `backup` service: one backup a day at BACKUP_HOUR
# (container TZ, default Africa/Tunis). A failed run is logged and retried the
# next day; it never stops the loop.
set -u
HOUR="${BACKUP_HOUR:-3}"

echo "[backup] scheduler started: daily at ${HOUR}:00 ($(date +%Z)), retention ${BACKUP_RETENTION_DAYS:-14} days"
while true; do
  now=$(date +%s)
  next=$(date -d "$(date +%Y-%m-%d) ${HOUR}:00:00" +%s 2>/dev/null || date -D '%Y-%m-%d %H:%M:%S' -d "$(date +%Y-%m-%d) ${HOUR}:00:00" +%s)
  [ "$next" -le "$now" ] && next=$((next + 86400))
  sleep $((next - now))
  sh /scripts/backup.sh || echo "[backup] $(date '+%F %T') FAILED — see output above" >&2
done

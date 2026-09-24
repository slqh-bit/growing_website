#!/bin/sh
# One backup run: PostgreSQL dump (custom format) + media archive, then
# retention. Runs inside the `backup` service (postgres:16-alpine), which has
# pg_dump and reads PG* env vars. Manual run:
#   docker compose exec backup sh /scripts/backup.sh
set -eu

DEST=/backups
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"

# Write to .partial first so a crash never leaves a truncated "valid" backup.
pg_dump --format=custom --no-owner --no-privileges --file="$DEST/db-$STAMP.dump.partial"
mv "$DEST/db-$STAMP.dump.partial" "$DEST/db-$STAMP.dump"

tar -czf "$DEST/media-$STAMP.tar.gz.partial" -C /data/media .
mv "$DEST/media-$STAMP.tar.gz.partial" "$DEST/media-$STAMP.tar.gz"

# Sanity check: the dump's table of contents must be readable.
pg_restore --list "$DEST/db-$STAMP.dump" >/dev/null

find "$DEST" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'media-*.tar.gz' \) -mtime +"$RETENTION_DAYS" -delete
find "$DEST" -maxdepth 1 -type f -name '*.partial' -mmin +360 -delete

echo "[backup] $(date '+%F %T') ok: db-$STAMP.dump ($(du -h "$DEST/db-$STAMP.dump" | cut -f1)), media-$STAMP.tar.gz ($(du -h "$DEST/media-$STAMP.tar.gz" | cut -f1)); kept ${RETENTION_DAYS}d"

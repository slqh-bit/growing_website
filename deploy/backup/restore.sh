#!/bin/sh
# Restore a backup made by backup.sh. Run from the deploy/ directory ON THE HOST:
#
#   ./backup/restore.sh backups/db-20260924-030000.dump backups/media-20260924-030000.tar.gz
#
# Stops the app, replaces the database contents (and the media volume when an
# archive is given), then recreates the app container so no page cached from
# the old data survives. Destructive: take a fresh backup first
#   docker compose exec backup sh /scripts/backup.sh
set -eu

DB_DUMP="${1:-}"
MEDIA_TGZ="${2:-}"
if [ -z "$DB_DUMP" ] || [ ! -f "$DB_DUMP" ]; then
  echo "usage: $0 <backups/db-*.dump> [backups/media-*.tar.gz]" >&2
  exit 1
fi
if [ -n "$MEDIA_TGZ" ] && [ ! -f "$MEDIA_TGZ" ]; then
  echo "media archive not found: $MEDIA_TGZ" >&2
  exit 1
fi

if [ "${RESTORE_YES:-}" != "1" ]; then
  printf 'This REPLACES the live database%s. Type "restore" to continue: ' "${MEDIA_TGZ:+ and all uploaded media}"
  read -r answer
  [ "$answer" = "restore" ] || { echo "aborted"; exit 1; }
fi

echo "→ stopping app"
docker compose stop app

echo "→ restoring database from $DB_DUMP"
# --clean --if-exists drops each object before recreating it; one transaction,
# so a failure leaves the previous data untouched.
docker compose exec -T backup sh -c \
  'pg_restore --clean --if-exists --no-owner --no-privileges --single-transaction --dbname="$PGDATABASE"' \
  < "$DB_DUMP"

if [ -n "$MEDIA_TGZ" ]; then
  echo "→ restoring media from $MEDIA_TGZ"
  # Project name is fixed by `name:` in docker-compose.yml.
  MEDIA_VOLUME="${COMPOSE_PROJECT_NAME:-growingtech}_media"
  docker run --rm \
    -v "$MEDIA_VOLUME:/data/media" \
    -v "$(cd "$(dirname "$MEDIA_TGZ")" && pwd):/restore:ro" \
    postgres:16-alpine \
    sh -c "find /data/media -mindepth 1 -delete && tar -xzf '/restore/$(basename "$MEDIA_TGZ")' -C /data/media && chown -R 1001:1001 /data/media"
fi

echo "→ recreating app (fresh page cache)"
docker compose up -d --force-recreate --no-deps --no-build app
echo "Done."

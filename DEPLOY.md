# Deployment runbook

Production runs on **one VPS** with Docker Compose (files in [`deploy/`](./deploy)):

```
                 :80 / :443 (HTTP/1.1, HTTP/2, HTTP/3)
Internet ──► caddy ──► app (Next.js + Payload, :3000) ──► db (PostgreSQL 16)
             │  automatic Let's Encrypt, www → apex,        │  internal network only
             │  HSTS, X-Real-IP                             │
             └─ volume caddy_data (certificates)            ├─ volume pgdata
                            app ── volumes media, quotes ───┤
                         backup ── nightly pg_dump + media + quotes archives → deploy/backups/
```

| Service  | Image                         | Exposed         | Persistent data         |
| -------- | ----------------------------- | --------------- | ----------------------- |
| `caddy`  | `caddy:2-alpine`              | 80, 443 tcp/udp | `caddy_data` (certs)    |
| `app`    | built from `Dockerfile`       | internal :3000  | `media` (public uploads), `quotes` (private quote PDFs) |
| `db`     | `postgres:16-alpine`          | none            | `pgdata`                |
| `backup` | `postgres:16-alpine`          | none            | `deploy/backups/` (host) |
| `tools`  | `Dockerfile` builder stage    | on demand       | —                       |

---

## 1. Prerequisites

- **VPS:** Ubuntu 24.04 LTS (or Debian 12), **2 vCPU / 4 GB RAM**, 40 GB disk.
  The image is built on the server; with 2 GB RAM add 2 GB of swap first.
- **Domain:** DNS `A` (and `AAAA` if the VPS has IPv6) records for
  `growing-technologies.tn` **and** `www.growing-technologies.tn` → the VPS IP.
- **Firewall:** ports 22, 80 and 443 open (443/udp too for HTTP/3).
- **SMTP account** for quote notifications and admin password resets
  (e.g. the domain's mailbox; set SPF/DKIM for the sending domain).
- Optional: Telegram bot (@BotFather) + chat id, Plausible site.

## 2. First deployment

```bash
# Docker Engine + compose plugin (official convenience script)
curl -fsSL https://get.docker.com | sh
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443 && sudo ufw enable

git clone <repository-url> /opt/growingtech && cd /opt/growingtech/deploy
cp .env.production.example .env && chmod 600 .env
nano .env          # SITE_DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD, PAYLOAD_SECRET, SMTP_*, …
                   # generate secrets with: openssl rand -hex 32

docker compose up -d --build        # first build ≈ 5 min
docker compose ps                   # app and db "healthy", caddy and backup "running"
curl -s https://growing-technologies.tn/api/health   # {"status":"ok","db":"ok",…}
```

On its first start the app applies the database migrations. Then load the
content and create the first admin (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`):

```bash
docker compose --profile tools run --rm tools npm run seed
docker compose up -d --force-recreate app     # serve pages from the fresh content
```

> Run the seed **after** `up -d`: the app container must be the first to use the
> `media` and `quotes` volumes so the upload folders belong to the app user.

Then:

1. Log in at `https://<domain>/admin`, and remove `SEED_ADMIN_PASSWORD` from `.env`.
2. **Site settings:** replace the placeholders — matricule fiscal, phone,
   address, email, map coordinates, stats. They feed the footer, contact page,
   legal pages and the Google business data (JSON-LD).
3. Upload real project photos and team members.
4. **Google Search Console:** add the domain and submit `https://<domain>/sitemap.xml`.
5. **Plausible** (if enabled): add a goal of type *Custom event* named `Devis`.
6. Send a test quote from `/fr/devis` and check the email / Telegram ping.
7. Add an uptime monitor (e.g. UptimeRobot) on `https://<domain>/api/health`.

## 3. Updating

```bash
cd /opt/growingtech && git pull
cd deploy && docker compose up -d --build
```

The new container applies pending migrations on start and begins with an empty
page cache, so every page is re-rendered from the database. Expect a few
seconds of downtime while the container is replaced.

Schema changes are made in development: change the collection, run
`npm run migrate:create -- <name>`, commit the generated file in `src/migrations/`.

**Changing `SITE_DOMAIN`** requires a rebuild (`up -d --build`): canonical URLs,
`hreflang` and the sitemap host are compiled into the pages.

## 4. Backups

The `backup` service runs every night at `BACKUP_HOUR` (Africa/Tunis) and writes
to `deploy/backups/`:

- `db-YYYYMMDD-HHMMSS.dump` — `pg_dump` custom format (verified after writing)
- `media-YYYYMMDD-HHMMSS.tar.gz` — every uploaded image
- `quotes-YYYYMMDD-HHMMSS.tar.gz` — the quote PDFs sent to clients (private:
  treat these archives, like the database dumps, as confidential)

Files older than `BACKUP_RETENTION_DAYS` (default 14) are deleted.

```bash
docker compose exec backup sh /scripts/backup.sh   # backup now
docker compose logs backup                          # history
```

**Off-site copy (strongly recommended):** a server failure takes local backups
with it. Copy the folder elsewhere daily, e.g. from another machine:

```bash
# crontab on a second machine / NAS (pull over SSH)
30 4 * * * rsync -a --delete vps:/opt/growingtech/deploy/backups/ /srv/backups/growingtech/
```

or push to object storage with `rclone copy deploy/backups remote:growingtech`.

## 5. Restoring

From `deploy/`, with the stack running:

```bash
./backup/restore.sh backups/db-20260924-030000.dump backups/media-20260924-030000.tar.gz \
  backups/quotes-20260924-030000.tar.gz
```

It asks for confirmation, stops the app, restores the database in a single
transaction (and the media / quote PDF folders if archives are given — both
optional, in that order), then recreates the
app container so no page cached from the old data survives. To restore on a
**new server**: deploy as in §2 (skip the seed), copy the backup files into
`deploy/backups/`, then run the script.

Practise it once a quarter on a test machine (see §7): an untested backup is
not a backup.

## 6. Operations

| Task                                   | Command (from `deploy/`)                                      |
| -------------------------------------- | ------------------------------------------------------------- |
| Status / health                        | `docker compose ps` · `curl https://<domain>/api/health`      |
| Logs                                   | `docker compose logs -f app` (or `caddy`, `db`, `backup`)     |
| Restart the app                        | `docker compose restart app`                                  |
| Refresh all cached pages               | `docker compose up -d --force-recreate app`                   |
| Migration status                       | `docker compose --profile tools run --rm tools`               |
| Re-run the seed (idempotent)           | `docker compose --profile tools run --rm tools npm run seed`  |
| psql shell                             | `docker compose exec db psql -U growingtech`                  |
| Disk usage                             | `docker system df` · `du -sh backups`                         |
| Clean old images after updates         | `docker image prune -f`                                       |

Edits saved in the admin refresh the affected pages immediately. Changes made
**outside** the admin (seed, SQL, restore) need the "refresh all cached pages"
command.

## 7. Testing the stack without a domain

On any machine with Docker, set `SITE_DOMAIN=localhost` and
`CADDY_GLOBAL_OPTIONS=local_certs` in `deploy/.env`, then `docker compose up -d --build`.
Caddy issues certificates from its own local CA; browse `https://localhost`
(accept the warning) or `curl -k https://localhost/api/health`.

## 8. Troubleshooting

| Symptom | Cause → fix |
| --- | --- |
| Every save in the admin fails with **403** | The admin was opened on another origin than `SERVER_URL` (e.g. `www.`). Use `https://<SITE_DOMAIN>/admin`; `www` redirects there. |
| **No certificate** / browser TLS error | DNS doesn't point to the VPS yet, or port 80/443 is closed. Check `docker compose logs caddy`; Caddy retries automatically. |
| `app` stays **unhealthy** after a start | `docker compose logs app`. If it waits on a migration prompt, the database was once used by `npm run dev` (schema push): `docker compose exec db psql -U growingtech -c "DELETE FROM payload_migrations WHERE batch = -1"` then `docker compose restart app`. |
| **Uploads fail** (permission denied) | The volume was created by another container first: `docker compose run --rm --no-deps --user root --entrypoint chown app -R 1001:1001 /app/media /app/quotes`. |
| **"Devis envoyé" email fails** (quote PDF) | `docker compose logs app \| grep -i "status email"`. The PDF must be attached on the request; if the log says the file is missing, the `quotes` volume was lost — restore it from a `quotes-*.tar.gz` backup. |
| Quote emails not received | `SMTP_*` wrong or missing (emails are then only logged): `docker compose logs app \| grep -i mail`. Leads are always stored in the admin regardless. |
| Old content after a restore or SQL change | Refresh the cached pages (see §6). |

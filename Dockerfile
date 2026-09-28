# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Growing Technologies — production image (Next.js standalone + Payload CMS)
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.tn -t growingtech-web .
#
# Stages:
#   deps     → npm ci (full dependency tree, cached on package-lock.json)
#   builder  → next build; also the "tools" image for seed / migrate / payload CLI
#   runner   → minimal runtime: standalone server, static assets, non-root user
#
# The build never touches the database (pages are ISR, rendered on first
# request), so no database has to be reachable while building.
# ---------------------------------------------------------------------------

# Node ≥ 24.15: earlier releases (and all of 22.x) have a web-streams race that
# logs "controller[kState].transformAlgorithm is not a function" when a client
# disconnects mid-response (nodejs/node#62036).
ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS base
# No extra OS packages: sharp and Next's SWC ship musl (Alpine) binaries.
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- deps ------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- builder ---------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Canonical URLs, hreflang, Open Graph and the sitemap host are inlined at
# build time — this MUST be the public https origin.
ARG NEXT_PUBLIC_SITE_URL
RUN test -n "$NEXT_PUBLIC_SITE_URL" || (echo "Build arg NEXT_PUBLIC_SITE_URL is required" >&2 && exit 1)
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone

# Payload's config reads these at import time; placeholders only — the real
# values are runtime env on the app container and are never baked in.
RUN DATABASE_URI=postgres://build:build@127.0.0.1:1/build \
    PAYLOAD_SECRET=build-time-placeholder \
    npm run build

# --- runner ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs \
 && adduser -S -u 1001 -G nodejs nextjs \
 && mkdir -p /app/media /app/quotes \
 && chown nextjs:nodejs /app/media /app/quotes

COPY --from=builder /app/public ./public
# Standalone output: server.js + only the node_modules files it traces.
# Owned by the app user: ISR writes regenerated pages under .next/.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Uploads live here — mount volumes (see deploy/docker-compose.yml). Quote PDFs
# are private and kept apart from the publicly served media.
VOLUME ["/app/media", "/app/quotes"]

# /api/health also checks the database; generous start period for the first
# boot, which applies pending Payload migrations.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]

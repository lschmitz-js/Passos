# Passos

Garmin step competition dashboard. Family + friends weekly/yearly leaderboard,
served from the same VM as `racha`.

**Parallel-run mode (current).** The old GCP setup keeps running at
`passos.lbschmitz.ca` (via `storage.googleapis.com/passos.lbschmitz.ca/...`)
while this new VM-hosted version runs at **`zoologico.lbschmitz.ca`**. Cutover
is a DNS swap when you're confident — see "Cutover" below.

## Stack

- Hono on Node.js 20 (API + static SPA host)
- SQLite via `better-sqlite3` (data)
- Python sidecar runs `collector/collect.py` every 6h to pull from Garmin
  Connect and upsert per-day step counts.

## Layout

- `apps/api` — Hono + SQLite backend. Serves `/data/leaderboard.js` in the
  shape that the existing `zoo.html` already expects, so no frontend change
  was needed at cutover.
- `apps/web` — Static pages: `index.html`, `zoo.html`, `dashboard.html`,
  `faces/`. Same files as the old GCS bucket.
- `collector/` — Python script + Docker image for the Garmin pull loop.
- `data/` — Mounted volume: `passos.db`, `.garminconnect/` tokens,
  `names.json`.

## Deploy (parallel run)

1. Seed tokens: log in to Garmin once on a laptop with `python collector/collect.py`,
   then `scp -r ~/.garminconnect/ vm:~/Perso/Passos/data/`.
2. Append the block from `Caddyfile.snippet` to the racha stack's Caddyfile.
3. `docker compose up --build -d`
4. `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` (from
   the racha stack) — Caddy issues a cert and `zoologico.lbschmitz.ca` is live.
5. Backfill: `docker compose run --rm passos-collector python collect.py --since 2025-12-29`

The old GCP collector + Cloud Scheduler stay running through all of this. Both
collectors hit Garmin independently with the same account; the only shared
state is your Garmin login.

## Cutover

When you trust the VM version:

1. GoDaddy DNS: change A record for `passos` to the VM IP (was previously the
   GCS path).
2. Add a `passos.lbschmitz.ca { ... }` block to the Caddyfile and reload.
3. `gcloud scheduler jobs pause garmin-daily-collect --location=us-central1`
4. After a few days of no regressions: delete the Cloud Function, the
   `garmin-steps-data` bucket, the `passos.lbschmitz.ca` GCS bucket, and the
   `zoologico` Caddy block + DNS record.

## Daily counts

The collector calls Garmin's leaderboard endpoint with
`startDate=endDate=YYYY-MM-DD` once per day per friend to get true daily
counts (no inference from cumulative totals). Today's row is re-upserted on
every run; historical rows stay frozen.

## Garmin tokens

Tokens live on the data volume at `data/.garminconnect/` and are refreshed
silently by the `garminconnect` library on each run. When they fully expire,
re-run `python collect.py` interactively on a laptop, then copy the new
`~/.garminconnect/` over `data/.garminconnect/` on the VM. The GCS-stored
tokens used by the GCP collector are independent — refresh both sides as long
as parallel mode is on.

## Weekly family report

`scripts/weekly-report.mjs` computes the facts behind the weekly WhatsApp
announcement — standings, the winning margin ranked against every completed
week, win/podium droughts, personal records, streaks, day-by-day totals and the
monthly trophy race. It deliberately emits JSON rather than prose: the numbers
need to be exact, but which story leads is judgment.

```sh
node scripts/weekly-report.mjs            # last completed week, family, JSON
node scripts/weekly-report.mjs --pretty   # readable summary
node scripts/weekly-report.mjs --group todos --week 34
```

In Claude Code, `/weekly` runs it and writes the announcement in pt-BR.

## Champion stories

The Galeria de Campeões shows a hand-written story and photo per champion. Like
runforbeer's `notes.json`, these live on the data volume rather than in the
database, so a collector run or a restore can never clobber them:

```
data/champions.json              # keyed by month: "2026-08": { photo, lead, acts[], closing }
data/champions/<photo>.jpg       # served via /api/champions/photo/<file>
```

Written in whatever language the family writes in and shown as-is in every
locale — it is someone's own account of their month, not UI copy to translate.
A month with no entry still renders; the trophy stands in for a missing photo.

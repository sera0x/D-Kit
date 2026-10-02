# D-KIT

**SECRETS. CRON. MONITORS. LOGS.**

Secrets manager, scheduled jobs, uptime checks and a log drain for your projects. Self-hosted. One CLI, one dashboard, one API.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/excelottah6/D-Kit/main/install.sh | sh
```

Checksum verified. Needs curl, tar, node — nothing else.

```bash
npm install -g dkit-cli
```

Plain JS, no install scripts. Works with `npm ci --ignore-scripts` and pnpm defaults.

## What it does

- **Keys hashed at rest.** Shown once. A leaked database is not a leaked key ring.
- **Environments.** dev / staging / prod — `env:diff`, `env:copy`, per-key rollback.
- **No .env on disk.** `dkit run -- npm start` injects secrets into the process. Nothing written.
- **Masked by default.** Listing never sends values. Revealing one is explicit, and audited.
- **Cron.** `30s`, `5m`, `daily 09:30` — HTTP calls on a schedule, with run history. No server awake.
- **Monitors.** One email on down, one on recovery. Not one per failed check.
- **Logs.** Ship lines or JSON batches. Tail with filters. 7-day retention.
- **Key-value store.** JSON, TTL, atomic increments. If your code writes it, it goes here.
- **Teams.** Owner / admin / member. Share projects, not accounts.
- **Audit trail.** Every write, delete and rollback — actor and IP recorded.
- **Deletes type-to-confirm.** Like a terminal.

## Self-host

```bash
git clone https://github.com/excelottah6/D-Kit.git
cd D-Kit
cp backend/.env.example backend/.env
./scripts/start.sh
```

Node 18+, Postgres, Redis. Schema creates itself. Dashboard on `localhost:3001`.

| Variable | What it is |
|---|---|
| `DB_PASSWORD` | Password for the `dkituser` Postgres role |
| `JWT_SECRET` | Signs session tokens — `openssl rand -hex 32` |
| `RESEND_API_KEY` | Sends codes, invites and alerts |

Full VPS walkthrough: [VPS-SETUP.md](VPS-SETUP.md).

## Layout

| Path | What it is |
|---|---|
| `backend/` | Express API + job runner (cron, monitors, status) |
| `website/` | React dashboard, served by the backend |
| `cli/` | The `dkit` CLI + 4 scaffolding templates |
| `scripts/` | Start, release packaging, email previews |
| `install.sh` | The installer |

## Commands

| Command | What it does |
|---|---|
| `dkit login` / `logout` | One-time code sign-in; revoke the device |
| `dkit new <name>` | Scaffold a project and link this folder |
| `dkit projects:create <name>` | Create a project |
| `dkit keys:rotate` | New API key — old one dies instantly |
| `dkit env:set <key> <value>` | Set a var (`-e` picks the environment) |
| `dkit env:get` / `env:list` | Read one; list all (masked unless `--show`) |
| `dkit env:rollback <key>` | Undo. Feed in `env:history` |
| `dkit env:diff <a> <b>` / `env:copy <a> <b>` | Compare or sync environments |
| `dkit env:pull` / `env:push <file>` | `.env` out, `.env` in |
| `dkit run -- <command>` | Secrets injected, nothing on disk |
| `dkit store:set/get/incr` | Runtime KV: JSON, TTL, atomic |
| `dkit cron:add <name> <url> -s "daily 03:00"` | Schedule an HTTP call |
| `dkit cron:runs` / `cron:pause` / `cron:rm` | Inspect, pause, delete |
| `dkit monitor:add <name> <url>` | Watch a URL |
| `dkit logs:ship` / `logs:tail` | In, out |
| `dkit doctor [--fix]` | Diagnose everything, fix the safe parts |

Full reference: `/docs`.

## Security, briefly

- Keys and refresh tokens stored as SHA-256 hashes. Plaintext exists once, in the response that issued it.
- Refresh tokens rotate on every use.
- Env listings masked server-side. History keeps lengths, not values.
- Codes and invites rate-limited.

## License

MIT.

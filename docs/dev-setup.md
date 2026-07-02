# Developer Setup

Local development for the Blumenthal Systems CRM on **Windows** or **macOS**.

## Prerequisites

| Tool           | Version                                                               |
| -------------- | --------------------------------------------------------------------- |
| Node.js        | ≥ 20 (`node -v`)                                                      |
| pnpm           | 9+ (`pnpm -v`)                                                        |
| Docker Desktop | For `pnpm db:start` (optional — remote Supabase works without Docker) |
| Git            | —                                                                     |
| Editor         | VS Code or Cursor (optional: `.vscode/extensions.json`)               |

## 1. Clone and install

```bash
git clone https://github.com/dennisxbu/crm.git
cd crm
pnpm install
```

## 2. Environment

```bash
cp .env.example .env.local
```

Fill `.env.local` — never commit this file.

### Option A: Remote Supabase project (hosted)

Use values from **Supabase Dashboard → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://fzormgxabytjfnqjtruy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

### Option B: Local Supabase (Docker)

Start local stack first (see section 3), then:

| Variable                        | Local value                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`             | `http://127.0.0.1:54321`                                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | From `pnpm exec supabase status` after `db:start` (anon/publishable key) |

`VITE_SUPABASE_PUBLISHABLE_KEY` is the public publishable key — safe to expose in the browser because Row Level Security (RLS) enforces access control. Never add a secret key or service role key here.

**Connection verification:** [docs/supabase-connection-check.md](supabase-connection-check.md)

## 3. Start Supabase locally (optional — Docker required)

Skip this section if you use the remote project (Option A).

```bash
pnpm db:start
pnpm exec supabase status   # copy publishable/anon key into .env.local
pnpm db:reset               # apply migrations (first time or after pull)
```

| Service  | URL                    |
| -------- | ---------------------- |
| API      | http://127.0.0.1:54321 |
| Studio   | http://127.0.0.1:54323 |
| Postgres | localhost:54322        |

## 4. Run frontend

```bash
pnpm dev
```

Open http://localhost:5173 — Phase 2 auth/workspace shell with Supabase health check.

**Remote project:** apply migrations before first login:

```bash
npx supabase link --project-ref fzormgxabytjfnqjtruy
npx supabase db push
```

## Scripts

| Command                     | Description                  |
| --------------------------- | ---------------------------- |
| `pnpm dev`                  | Vite dev server              |
| `pnpm build`                | Typecheck + production build |
| `pnpm lint`                 | ESLint                       |
| `pnpm format`               | Prettier write               |
| `pnpm db:start` / `db:stop` | Supabase local               |
| `pnpm db:reset`             | Reset DB + run migrations    |

Pre-commit: lint-staged, `pnpm audit --audit-level=high`, Secretlint.

## Troubleshooting

| Problem                              | Fix                                                    |
| ------------------------------------ | ------------------------------------------------------ |
| `Docker Desktop` error on `db:start` | Start Docker Desktop or use remote Supabase (Option A) |
| Health check: missing env            | Fill `.env.local` — see section 2                      |
| Health check: schema missing         | `pnpm db:reset` (local) or apply migrations to remote  |
| Port 5173 in use                     | Stop other Vite instance                               |

## Further reading

- [docs/supabase-connection-check.md](supabase-connection-check.md) — Connection verification checklist
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Git, PRs, agents
- [docs/adr/README.md](adr/README.md) — Architecture decisions
- [docs/implementation-roadmap.md](implementation-roadmap.md) — Current phase scope

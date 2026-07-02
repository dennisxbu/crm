# Developer Setup

Local development for the Blumenthal Systems CRM on **Windows** or **macOS**.

## Prerequisites

| Tool           | Version                                                 |
| -------------- | ------------------------------------------------------- |
| Node.js        | ≥ 20 (`node -v`)                                        |
| pnpm           | 9+ (`pnpm -v`)                                          |
| Docker Desktop | For `pnpm db:start`                                     |
| Git            | —                                                       |
| Editor         | VS Code or Cursor (optional: `.vscode/extensions.json`) |

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

| Variable                               | Local value                                                                |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `http://127.0.0.1:54321`                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | From `pnpm exec supabase status` after `db:start` (anon / publishable key) |

Never commit `.env.local`.

## 3. Start Supabase (Docker required)

```bash
pnpm db:start
pnpm exec supabase status   # copy anon key into .env.local
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

Open http://localhost:5173 — Phase 1 status page with Supabase health check.

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

| Problem                              | Fix                                      |
| ------------------------------------ | ---------------------------------------- |
| `Docker Desktop` error on `db:start` | Start Docker Desktop                     |
| Health check: missing env            | Fill `.env.local` from `supabase status` |
| Health check: schema missing         | `pnpm db:reset`                          |
| Port 5173 in use                     | Stop other Vite instance                 |

## Further reading

- [CONTRIBUTING.md](../CONTRIBUTING.md) — Git, PRs, agents
- [docs/adr/README.md](adr/README.md) — Architecture decisions
- [docs/implementation-roadmap.md](implementation-roadmap.md) — Current phase scope

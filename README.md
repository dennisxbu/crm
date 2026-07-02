# Blumenthal Systems CRM

Privates, professionelles **company-first B2B-Akquise-CRM** für Blumenthal Systems — Workflow-Automatisierung und Akquise im DACH-Raum für Personalberatungen und Headhunter.

**Kernidee:** Unternehmen zuerst — Kontakt und Deal optional. Metadata-driven: Pipelines, Custom Fields und Views aus der Datenbank, nicht aus Code.

## Project status

|                  |                                           |
| ---------------- | ----------------------------------------- |
| **Phase**        | 1 — Stack + Supabase foundation           |
| **Version**      | `0.1.0` (pre-release)                     |
| **Product code** | Foundation scaffold — no CRM features yet |
| **Architecture** | [ADRs 001–006](docs/adr/README.md)        |
| **Next**         | Phase 2 — Auth, Workspaces, Profiles      |

## Stack

| Area            | Technology                            |
| --------------- | ------------------------------------- |
| Frontend        | React 19, TypeScript (strict), Vite 6 |
| Backend / DB    | Supabase (PostgreSQL), CLI migrations |
| Auth            | Supabase Auth (Phase 2)               |
| Validation      | Zod (Phase 3+)                        |
| Package manager | pnpm (Node.js ≥ 20)                   |

## Quick start

**Requirements:** Node.js ≥ 20, pnpm, Docker Desktop

```bash
pnpm install
cp .env.example .env.local   # fill after db:start
pnpm db:start
pnpm exec supabase status    # copy anon key to .env.local
pnpm db:reset
pnpm dev
```

Open http://localhost:5173 — Phase 1 status + Supabase health check.

Full setup: **[docs/dev-setup.md](docs/dev-setup.md)**

## Scripts

| Command                                  | Description        |
| ---------------------------------------- | ------------------ |
| `pnpm dev`                               | Development server |
| `pnpm build`                             | Production build   |
| `pnpm lint`                              | ESLint             |
| `pnpm db:start` / `db:stop` / `db:reset` | Supabase local     |

Pre-commit: lint-staged, audit, Secretlint — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository layout

```
src/
  app/                    App shell (Phase 1 status page)
  shared/lib/supabase/    Client + health check
supabase/
  migrations/             SQL + RLS
docs/
  adr/                    Architecture Decision Records
  *.md                    Product & technical specs
.cursor/rules/            Cursor agent rules (.mdc)
```

## Documentation

| Document                                                         | Purpose                         |
| ---------------------------------------------------------------- | ------------------------------- |
| [AGENTS.md](AGENTS.md)                                           | **AI agents entry** (all tools) |
| [docs/adr/README.md](docs/adr/README.md)                         | Architecture decisions          |
| [docs/product-spec.md](docs/product-spec.md)                     | Product vision & MVP            |
| [docs/implementation-roadmap.md](docs/implementation-roadmap.md) | Phases 0–11                     |
| [CONTRIBUTING.md](CONTRIBUTING.md)                               | Git, PRs, agent rules           |

## Contributing

Work on `feat/*`, `fix/*`, `chore/*`, or `docs/*` branches. Merge to `main` via PR. See **CONTRIBUTING.md**.

## License

Private project — not for public distribution.

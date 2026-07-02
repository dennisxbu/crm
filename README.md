# Blumenthal Systems CRM

Privates, professionelles **company-first B2B-Akquise-CRM** für Blumenthal Systems — Workflow-Automatisierung und Akquise im DACH-Raum für Personalberatungen und Headhunter.

**Kernidee:** Unternehmen zuerst — Kontakt und Deal optional. Metadata-driven: Pipelines, Custom Fields und Views aus der Datenbank, nicht aus Code.

## Project status

|                  |                                                |
| ---------------- | ---------------------------------------------- |
| **Phase**        | 3 — Company-Core                               |
| **Version**      | `0.1.0` (pre-release)                          |
| **Product code** | Company CRUD foundation — no Custom Fields yet |
| **Architecture** | [ADRs 001–012](docs/adr/README.md)             |
| **Next**         | Phase 4 — Custom Fields Core                   |

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
cp .env.example .env.local   # fill with Supabase project URL + publishable key
pnpm dev
```

Open http://localhost:5173 — Phase 3 company core (login, workspace, companies).

**Apply migrations** (required):

```bash
# Local:
pnpm db:reset

# Remote:
npx supabase link --project-ref fzormgxabytjfnqjtruy
npx supabase db push
```

**Optional (local Supabase via Docker):** `pnpm db:start` → copy keys from `pnpm exec supabase status` → `pnpm db:reset`

Full setup: **[docs/dev-setup.md](docs/dev-setup.md)** · Connection check: **[docs/supabase-connection-check.md](docs/supabase-connection-check.md)**

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
  app/                    App shell + providers
  features/auth/          Auth form, API, types
  features/workspaces/    Workspace API, types
  features/companies/     Company API, form, list, detail (Phase 3)
  shared/lib/supabase/    Client + health check
supabase/
  migrations/             SQL + RLS
docs/
  adr/                    Architecture Decision Records
  *.md                    Product & technical specs
.cursor/rules/            Cursor agent rules (.mdc)
```

## Documentation

| Document                                                         | Purpose                                         |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                           | **AI agents entry** (all tools); project status |
| [docs/product-principles.md](docs/product-principles.md)         | **Nordstern**: Produktgefühl, Litmus-Test       |
| [docs/adr/README.md](docs/adr/README.md)                         | Architecture decisions                          |
| [docs/product-spec.md](docs/product-spec.md)                     | Product vision & MVP                            |
| [docs/implementation-roadmap.md](docs/implementation-roadmap.md) | Phases 0–11                                     |
| [CONTRIBUTING.md](CONTRIBUTING.md)                               | Git, PRs, agent rules                           |

## Contributing

Work on `feat/*`, `fix/*`, `chore/*`, or `docs/*` branches. Merge to `main` via PR. See **CONTRIBUTING.md**.

## License

Private project — not for public distribution.

# AGENTS.md — Anleitung für AI-Agenten

**Gilt für:** Cursor, Claude Code, ChatGPT Codex und andere Coding-Agents.

Dies ist die **kanonische Einstiegsdatei** für alle Tools. Tool-spezifische Regeln: Cursor → [`.cursor/rules/`](.cursor/rules/) (`.mdc`). Architektur-„Warum" → [`docs/adr/`](docs/adr/README.md).

## Projektziel

Professionelles, **company-first B2B-Akquise-CRM** für Blumenthal Systems. Unternehmen sind das primäre Lead-Objekt. Kontakte und Deals sind optional. **Metadata-driven:** Pipelines, Stages, Custom Fields und Views kommen aus der Datenbank.

## Projektstatus

|                   |                                                                  |
| ----------------- | ---------------------------------------------------------------- |
| **Phase**         | 3 — Company-Core (abgeschlossen)                                 |
| **Nächste Phase** | 4 — Custom Fields Core                                           |
| **Version**       | `0.1.0` (pre-release)                                            |
| **Roadmap**       | [docs/implementation-roadmap.md](docs/implementation-roadmap.md) |
| **ADRs**          | [docs/adr/README.md](docs/adr/README.md)                         |

## Lesereihenfolge (vor Implementierung)

1. Diese Datei
2. [docs/implementation-roadmap.md](docs/implementation-roadmap.md) — **aktive Phase**
3. [docs/adr/README.md](docs/adr/README.md) — bindende Entscheidungen
4. [docs/product-spec.md](docs/product-spec.md) — Produktscope
5. Relevante Detail-Specs: `architecture.md`, `data-model.md`, `custom-fields.md`, `pipelines-and-views.md`, `supabase-and-rls.md`
6. [docs/definitions-of-done.md](docs/definitions-of-done.md)
7. Cursor only: [`.cursor/rules/`](.cursor/rules/)

## Workflow (alle Agents)

Vollständig: [CONTRIBUTING.md](CONTRIBUTING.md) · Lokal: [docs/dev-setup.md](docs/dev-setup.md)

- **Nicht** direkt auf `main` pushen — Branch + PR
- **Conventional Commits** (English)
- Ein Thema pro Commit
- `pnpm lint` + `pnpm build` vor Code-Commits
- **Docs/ADRs vor Code** bei Architektur- oder Schema-Änderungen
- Keine Secrets committen

## Phase 1 — Was existiert

- Vite + React + TypeScript App, Supabase Client, Health Check
- Migration: `profiles` stub + RLS + Grants

## Phase 2 — Was existiert

- Supabase Auth (Login/Register/Logout, Session)
- Migration: `workspaces`, `workspace_members`, RLS helpers, `create_initial_workspace` RPC
- AuthProvider + WorkspaceProvider
- Temporäre Auth-/Workspace-Shell (kein CRM)

## Phase 3 — Was existiert

- `companies` Tabelle + RLS (workspace-scoped)
- Company API-Layer + minimale List/Create/Edit/Archive UI
- Company-first: ohne Kontakt, ohne Deal

## Was ohne explizite Anweisung nicht gebaut wird

- CRM-Features außerhalb der aktiven Roadmap-Phase
- Companies / Contacts / Deals CRUD (bis Phase 3+)
- Custom Fields, Pipelines, Views UI (bis Phase 4–7)
- Hardcoded Stages, Spalten, Feldlisten
- Finales UI/Design-System vor UX-Spec ([docs/ui-ux-brief-for-claude.md](docs/ui-ux-brief-for-claude.md))

**Erlaubt:** Funktionale Shells in frühen Phasen (z.B. Statusseite, Auth-Shell Phase 2).

## UI/UX

Visuelles Design separat mit Claude — siehe `docs/ui-ux-brief-for-claude.md`. Kein Design-System erfinden.

## Sprache

- Docs & User-UI: **Deutsch**
- Code, Tabellen, Commits: **Englisch**

## Bei Unsicherheit

1. ADRs und Specs lesen — nicht raten
2. Lücke dokumentieren oder Nutzer fragen
3. Langfristig saubere Lösung — keine Tutorial-Abkürzungen

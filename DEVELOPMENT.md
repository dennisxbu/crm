# DEVELOPMENT.md

Entwicklungsrichtlinien für das Blumenthal Systems CRM.

## Voraussetzungen

| Tool | Version (Stand Phase 1) | Zweck |
|------|-------------------------|-------|
| Node.js | 22 LTS | Frontend-Tooling |
| pnpm | 9.x | Package Manager |
| Supabase CLI | via `pnpm exec supabase` (2.x) | Lokale DB, Migrationen |
| Docker Desktop | aktuell | Supabase local dev (`pnpm db:start`) |
| Git | — | Versionskontrolle |

## Schnellstart (lokal)

```bash
pnpm install
pnpm db:start          # Docker muss laufen
```

Nach `db:start` erscheinen API URL und anon key in der CLI-Ausgabe. Diese in `.env.local` eintragen:

```bash
cp .env.example .env.local
# VITE_SUPABASE_ANON_KEY aus `pnpm exec supabase status` übernehmen
```

```bash
pnpm dev               # http://localhost:5173
```

Die App zeigt einen **Supabase Health Check** (Phase-1-Statusseite, kein CRM).

## NPM Scripts

| Script | Beschreibung |
|--------|--------------|
| `pnpm dev` | Vite Dev Server |
| `pnpm build` | TypeScript + Production Build |
| `pnpm preview` | Production Build lokal preview |
| `pnpm db:start` | Supabase lokal starten |
| `pnpm db:stop` | Supabase lokal stoppen |
| `pnpm db:reset` | DB zurücksetzen + Migrationen anwenden |

## Stack (Phase 1 — final)

| Schicht | Wahl |
|---------|------|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 |
| Backend / DB | Supabase (Postgres 15) |
| Client | `@supabase/supabase-js` |
| Package Manager | pnpm |

Details: `docs/architecture.md`.

## Projektstruktur (App)

```
src/
├── app/                 # App shell (Phase 1: status page)
├── shared/lib/supabase/ # Client + health check
└── main.tsx
```

Geplante Erweiterung ab Phase 2: `features/`, generische Field Renderer — siehe `docs/architecture.md`.

## Supabase

- **Postgres** als einzige Datenquelle für CRM-Daten
- **Supabase Auth** ab Phase 2
- **Row Level Security** — erste Policies auf `profiles` (Phase 1 Migration)
- **Migrationen** in `supabase/migrations/` — keine manuelle Schema-Änderung im Dashboard

Phase-1-Migration: `20260701120000_phase1_extensions_and_profiles.sql` (extensions + profiles stub).

Details: `docs/supabase-and-rls.md`.

## Environment Variables

| Variable | Beschreibung |
|----------|--------------|
| `VITE_SUPABASE_URL` | Supabase API URL (lokal: `http://127.0.0.1:54321`) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (RLS-geschützt) |

Lokalen anon key abrufen:

```bash
pnpm exec supabase status
```

**Niemals** committen oder ins Frontend-Bundle:

- Service Role Key
- DB Connection Strings mit Superuser-Rechten

`.env.local` ist in `.gitignore`.

## Branch-Konventionen

| Präfix | Verwendung |
|--------|------------|
| `feat/` | Neues Feature innerhalb einer Roadmap-Phase |
| `fix/` | Bugfix |
| `docs/` | Nur Dokumentation |
| `chore/` | Tooling, Config ohne Feature-Logik |

Beispiel: `feat/phase-3-company-core`

## Commit-Konventionen

Kurze, imperative Subject-Zeile. Fokus auf **warum**, nicht nur was.

```
feat(companies): add workspace-scoped company list query

Enables Phase 3 company table without hardcoded fields.
Refs docs/data-model.md companies table.
```

## Neue Features planen

1. **Phase prüfen** — `docs/implementation-roadmap.md`
2. **Spec prüfen** — `docs/product-spec.md`
3. **Architektur prüfen** — metadata-driven, company-first
4. **Docs zuerst** bei Schema-/Architekturänderungen
5. **Definition of Done** — `docs/definitions-of-done.md`
6. **Implementieren** — Scope der Phase nicht überschreiten

## AI-gestützte Entwicklung

Siehe `docs/ai-development-workflow.md` und `.cursor/rules/`.

## Tests

Test-Framework: Vitest (geplant Phase 11). Struktur: `tests/README.md`.

## Aktuelle Phase

**Phase 1** — Stack + Supabase-Grundintegration (kein CRM, kein Auth-UI).

Nächste Phase: **Phase 2** — Auth, Workspaces, Profiles.

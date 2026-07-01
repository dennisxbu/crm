# supabase/

Supabase-Integration für das Blumenthal Systems CRM.

## Struktur

```
supabase/
├── config.toml          # Supabase CLI Konfiguration (project_id: crm)
├── migrations/          # SQL-Migrationen
│   └── 20260701120000_phase1_extensions_and_profiles.sql
└── .gitignore
```

## Befehle (via pnpm)

```bash
pnpm db:start    # Lokale Instanz starten (Docker erforderlich)
pnpm db:stop     # Stoppen
pnpm db:reset    # Migrationen neu anwenden
pnpm exec supabase status   # URLs und Keys anzeigen
```

## Phase 1 Migration

`phase1_extensions_and_profiles.sql`:

- Extension `pgcrypto`
- Tabelle `profiles` (Stub für Phase 2)
- RLS Policies für authenticated users (eigenes Profil)
- `updated_at` Trigger

Keine CRM-Tabellen (companies, pipelines, …) — kommen in späteren Phasen.

## Lokale URLs (Standard)

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| DB | localhost:54322 |

Konzept: `docs/supabase-and-rls.md`.

# supabase/

Platzhalter für die Supabase-Integration ab **Phase 1**.

## Geplante Struktur

```
supabase/
├── config.toml          # Supabase CLI Konfiguration
├── migrations/          # SQL-Migrationen (Schema, RLS, Functions)
└── seed.sql             # Default Pipelines, Views (Seed-Konzept)
```

## Phase 0

In Phase 0 existiert **kein** Supabase-Projekt und **keine** Migrationen.

Konzept und RLS-Design: `docs/supabase-and-rls.md`, `docs/data-model.md`.

## Phase 1 Start

1. `supabase init`
2. Erste Migration (extensions, profiles stub)
3. Lokale Entwicklung: `supabase start`

Siehe `DEVELOPMENT.md` und `docs/implementation-roadmap.md` Phase 1.

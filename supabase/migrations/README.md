# supabase/migrations/

SQL-Migrationen für Schema, RLS Policies, Indexes und DB Functions.

## Regeln

- Jede Schema-Änderung = neue Migration-Datei
- Keine manuellen Produktiv-Änderungen im Supabase Dashboard
- Migrationen lokal testen: `supabase db reset`
- RLS Policies in derselben Migration wie Tabelle (oder unmittelbar folgend)

## Namenskonvention

```
YYYYMMDDHHMMSS_descriptive_name.sql
```

Beispiel: `20260701120000_create_companies.sql`

## Phase 0

Noch keine Migrationen vorhanden. Datenmodell-Spezifikation: `docs/data-model.md`.

# Supabase and Security

## Regeln

- **Supabase/Postgres** als einzige CRM-Datenbasis
- **RLS** auf allen CRM-Tabellen — Workspace-Isolation via `workspace_id`
- **Keine Service Role Keys** im Frontend oder Client-Bundle
- Schema-Änderungen nur via **Migrationen** in `supabase/migrations/`
- Anon Key + Session + RLS = Zugriffskontrolle
- Vor DB-Arbeit: `docs/supabase-and-rls.md` lesen

## Nicht tun

- Service Role in `.env` fürs Frontend
- Tabellen im Dashboard manuell für produktives Schema
- CRM-Queries ohne Workspace-Scope
- Öffentliche Policies ohne Auth-Check
- Secrets in Git committen

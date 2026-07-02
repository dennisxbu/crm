# Supabase und Row Level Security

Supabase ist das geplante **Backend**: Postgres-Datenbank, Auth, auto-generierte API. Das Frontend spricht ausschließlich über den **anon key** mit dem Supabase Client — geschützt durch Row Level Security.

## Architektur-Rolle

| Komponente               | Funktion                              |
| ------------------------ | ------------------------------------- |
| **PostgreSQL**           | Persistenz, Constraints, RLS Policies |
| **Supabase Auth**        | User Management, JWT Sessions         |
| **PostgREST**            | REST API aus Schema                   |
| **Supabase Client (JS)** | Frontend SDK                          |
| **Supabase CLI**         | Lokale Entwicklung, Migrationen       |

Kein separates Custom-Backend in MVP — Business Logic primär in Postgres (RLS, Constraints) und Frontend (Validation, View Logic).

## Auth

### Flow (Phase 2 — implementiert)

1. User registriert / loggt ein via Supabase Auth
2. Trigger `handle_new_user()` erstellt `profiles` Row (`id = auth.uid()`)
3. `create_initial_workspace()` RPC legt Workspace + Owner-Membership an (idempotent)
4. JWT enthält `sub` = user id
5. RLS Policies nutzen `auth.uid()` und `is_workspace_member()` / `is_workspace_owner()`

### Auth-Methoden (Phase 2)

- E-Mail + Passwort (implementiert)
- Magic Link (nicht Phase 2)
- OAuth (nicht MVP)

## Workspace-basierte Zugriffskontrolle

Alle CRM-Daten sind an `workspace_id` gebunden. Ein User darf nur Daten sehen und ändern, wenn er über `workspace_members` Mitglied dieses Workspace ist.

```
auth.uid() → workspace_members → workspace_id → CRM rows
```

Kein `workspace_id` im JWT nötig — Membership wird in Policy per Subquery geprüft.

## Row Level Security (RLS)

### Grundregel

**RLS enabled on all CRM tables.** Keine öffentliche Schreib-Lese ohne Policy.

### Policy-Muster (Konzept)

```sql
-- Konzept — keine produktive Migration in Phase 0
CREATE POLICY "workspace members can access companies"
ON companies
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

Gleiches Muster für: contacts, deals, pipelines, pipeline_stages, entity_pipeline_positions, custom_fields, custom_field_options, custom_field_values, views, activities, tags, entity_tags.

### Tabellen mit RLS

| Tabelle                   | RLS                                             |
| ------------------------- | ----------------------------------------------- |
| profiles                  | Own profile read/update; auto-created on signup |
| workspaces                | Member read; owner update (Phase 2)             |
| workspace_members         | Own + workspace member read (Phase 2)           |
| companies                 | workspace-scoped                                |
| contacts                  | workspace-scoped                                |
| deals                     | workspace-scoped                                |
| pipelines                 | workspace-scoped                                |
| pipeline_stages           | workspace-scoped                                |
| entity_pipeline_positions | workspace-scoped                                |
| custom_fields             | workspace-scoped                                |
| custom_field_options      | workspace-scoped                                |
| custom_field_values       | workspace-scoped                                |
| views                     | workspace-scoped                                |
| activities                | workspace-scoped                                |
| tags                      | workspace-scoped                                |
| entity_tags               | workspace-scoped                                |

### Was RLS nicht ersetzt

- Input-Validierung (Frontend + DB Constraints)
- Business Rules (z.B. stage gehört zu pipeline) — CHECK/Trigger/App
- Rate Limiting — Supabase Platform

## Service Role Key

| Regel                   | Detail                                                   |
| ----------------------- | -------------------------------------------------------- |
| **Niemals im Frontend** | Weder in Code noch in `.env` committed für Client Bundle |
| **Nur server-side**     | Edge Functions, Admin-Scripts, CI — wenn überhaupt       |
| MVP                     | Kein Service Role im Frontend-Build                      |

Anon Key ist **öffentlich** — Sicherheit durch RLS, nicht durch Key-Geheimhaltung.

## Migrationen

### Prinzip

Schema-Änderungen **nur** via SQL-Migrationen in `supabase/migrations/`.

Kein:

- Manuelles Erstellen produktiver Tabellen im Dashboard
- Schema-Drift zwischen lokal und remote
- „Quick fix" direkt in Production SQL Editor

### Workflow (ab Phase 1)

```bash
supabase migration new descriptive_name
# SQL editieren
supabase db reset   # lokal testen
supabase db push    # remote (wenn eingerichtet)
```

Migrationen enthalten: Tabellen, Indexes, RLS Policies, Functions, Triggers.

## Profiles und auth.users

- `auth.users` — Supabase verwaltet
- `profiles` — App-Tabelle, `id` FK zu `auth.users`
- Trigger `on auth.user created` → insert profile (Phase 2: `handle_new_user`)

Profile enthält keine CRM-Business-Daten — nur User-Metadaten.

## Lokale Entwicklung

### Setup (perspektivisch, Phase 1)

1. Supabase CLI installieren
2. `supabase init` im Repo
3. `supabase start` — lokaler Postgres + Auth
4. `.env.local` mit lokaler URL und anon key aus CLI output

### Lokale URLs (Standard Supabase CLI)

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`

Werte in `.env.example` bleiben leer — Entwickler trägt lokale oder Remote-Werte in `.env.local` ein.

## Environment Variables

Siehe `.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

| Variable                        | Verwendung                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase Project URL                                                         |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Öffentlicher Publishable Key — Zugriffsschutz erfolgt ausschließlich via RLS |

`VITE_SUPABASE_PUBLISHABLE_KEY` ist der öffentliche Publishable Key aus dem Supabase Dashboard — sicher im Browser exponierbar, weil RLS den tatsächlichen Datenzugriff kontrolliert. Niemals den Secret Key oder Service Role Key ins Frontend.

**Verbindung prüfen:** [docs/supabase-connection-check.md](supabase-connection-check.md)

**Nicht in `.env.example`:**

- `SUPABASE_SERVICE_ROLE_KEY`
- Database passwords
- JWT secrets

## Sicherheits-Checkliste (vor Go-Live)

- [ ] RLS auf allen CRM-Tabellen enabled
- [ ] Policies für SELECT, INSERT, UPDATE, DELETE getestet
- [ ] Cross-workspace Zugriff unmöglich (Integrationstest)
- [ ] Kein Service Role im Frontend Bundle
- [ ] `.env` in `.gitignore`
- [ ] Anon key allein erlaubt keinen Datenzugriff ohne gültige Session + Policy

## Realtime (optional, später)

Kanban Multi-User-Sync via Supabase Realtime — nicht MVP. Wenn aktiviert: nur auf `entity_pipeline_positions` subscriben, weiterhin RLS-respektierend.

## Backup und Recovery

Supabase Pro/Team: automatische Backups. Für Solo-Projekt: regelmäßig `pg_dump` oder Supabase Dashboard Backups — Betriebsentscheidung vor Production.

## Implementierungsstand

| Phase | Migrationen                                                                 |
| ----- | --------------------------------------------------------------------------- |
| 1     | `profiles` stub — `20260701120000_phase1_extensions_and_profiles.sql`       |
| 2     | workspaces, workspace_members — `20260702140000_phase2_auth_workspaces.sql` |
| 3     | companies — `20260703140000_phase3_companies.sql`                           |
| 4+    | custom_fields, pipelines, views — geplant                                   |

### companies (Phase 3)

RLS über `is_workspace_member(workspace_id)`:

- SELECT / INSERT / UPDATE für Workspace-Members
- Kein DELETE für `authenticated` — Archivierung via `archived_at`
- `created_by` und `owner_id` idealerweise `auth.uid()` (Policy-geprüft)

Detail: [docs/adr/012-company-core-system-fields.md](adr/012-company-core-system-fields.md)

Lokale Entwicklung: [docs/dev-setup.md](dev-setup.md). ADR: [adr/004-workspaces-rls.md](adr/004-workspaces-rls.md).

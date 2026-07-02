# ADR-011: Auth, Workspace & Profile Foundation

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 2 — sichere Basis vor CRM-Daten

## Context

Phase 3+ führt workspace-scoped CRM-Daten ein (Companies, Custom Fields, Pipelines, Views). Ohne saubere Auth-, Profil- und Workspace-Grundlage würden spätere Features unsicher oder ad-hoc an die App geklebt.

Phase 2 liefert ausschließlich die technische Foundation — keine CRM-UI, keine Business-Entitäten.

## Decision

### 1. Supabase Auth für Identität

- E-Mail/Passwort Login und Registrierung
- JWT-Session im Frontend via `@supabase/supabase-js`
- Kein Custom-Auth-Backend in MVP

### 2. `profiles` neben `auth.users`

- `auth.users` wird von Supabase verwaltet
- `profiles.id` = `auth.users.id` (1:1)
- App-relevante Metadaten (`full_name`, `avatar_url`) in `profiles`
- Automatische Profilerstellung via Trigger `handle_new_user()` auf `auth.users after insert`

### 3. `workspaces` als oberste Isolationseinheit

- Alle zukünftigen CRM-Tabellen erhalten `workspace_id`
- RLS prüft Membership über `workspace_members`
- Solo-Nutzung: ein initialer Workspace pro User reicht; Architektur ist multi-workspace-fähig

### 4. `workspace_members` für Zugriffskontrolle

- Verknüpft `profiles` mit `workspaces`
- Rolle: `owner` | `member` (Phase 2: nur Owner bei Onboarding)
- RLS-Helper `is_workspace_member()` / `is_workspace_owner()` als `security definer` — vermeidet Policy-Rekursion

### 5. Initial Workspace via RPC

- `create_initial_workspace()` erstellt Workspace + Owner-Membership idempotent
- Frontend ruft RPC auf statt mehrere direkte Inserts — weniger Race Conditions, zentrale Logik
- Keine Invite-Logik in Phase 2

### 6. Keine CRM-Tabellen vor Phase 3

- Keine `companies`, `pipelines`, `custom_fields`, `views`
- Phase-2-App-Shell zeigt nur Session/Workspace-Status — keine CRM-Navigation

## Consequences

### Positive

- Klare Security-Grenze vor CRM-Implementierung
- RLS-Muster steht für alle späteren Tabellen
- Workspace-Kontext im Frontend bereit für Phase 3 Queries

### Negative

- Remote-Projekt benötigt Migration-Push (`supabase db push`) bevor Auth/Workspace funktioniert
- `.env.local` mit gültigen Supabase-Credentials erforderlich

## Alternatives considered

| Option                          | Pro                    | Contra                           | Outcome      |
| ------------------------------- | ---------------------- | -------------------------------- | ------------ |
| Workspace nur im Frontend-State | Schneller Start        | Keine DB-Isolation               | Rejected     |
| Direkte Inserts statt RPC       | Einfacher SQL          | Race Conditions, verteilte Logik | Rejected     |
| Auth + Workspace + RPC (this)   | Idempotent, RLS-sauber | Mehr SQL upfront                 | **Accepted** |

## Detail documentation

- Migration: `supabase/migrations/20260702140000_phase2_auth_workspaces.sql`
- Test checklist: [docs/phase-2-test-checklist.md](../phase-2-test-checklist.md)
- RLS: [docs/supabase-and-rls.md](../supabase-and-rls.md)

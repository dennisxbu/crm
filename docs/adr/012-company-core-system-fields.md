# ADR-012: Company Core System Fields

**Status:** Accepted  
**Date:** 2026-07-03  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 3 — erstes echtes CRM-Objekt

## Context

Nach Auth/Workspace-Foundation (Phase 2) braucht das CRM ein primäres Lead-Objekt.
Companies sind company-first: ohne Kontakt, ohne Deal, ohne Pipeline-Position.

Custom Fields, Pipelines und Views kommen metadata-driven in späteren Phasen.

## Decision

### 1. `companies` als erstes CRM-Objekt

- Workspace-scoped via `workspace_id` (Pflicht)
- RLS über `is_workspace_member(workspace_id)`
- Kein Hard Delete in Phase 3 — Archivierung via `archived_at`

### 2. Company ohne Contact / Deal

- Kein FK zu `contacts` oder `deals`
- Kein Constraint, der Kontakt oder Deal erzwingt
- Create mit nur `name` ist gültig

### 3. System Fields vs. Default Custom Fields

**System Fields (Phase 3 Migration):**

- Identität: `name`, `website`, `domain`, `linkedin_url`, `phone`, `email`, `city`, `country`, `industry`, `employee_count_range`
- Workflow: `contact_discovery_status`, `lifecycle_status`
- Ownership/Timing: `owner_id`, `next_action_at`, `last_activity_at`, `last_contacted_at`
- Meta: `notes_summary`, `created_by`, `archived_at`, timestamps

**Default Custom Fields (Phase 4 Seed, nicht Phase 3):**

- `lead_source`, `priority`, `fit_score`, `pain_score`, `research_status`, etc.

### 4. `contact_discovery_status` Enum (Phase 3)

`unknown`, `not_started`, `researching`, `partial_contacts_found`, `decision_maker_identified`, `no_contact_found`

Ersetzt ältere 4-Werte-Skizze (`found`, `not_applicable`) für granulareren Akquise-Workflow.

### 5. Soft Archive

- `archived_at` setzen + optional `lifecycle_status = archived`
- Keine DELETE-Policy für `authenticated` in Phase 3

### 6. Keine Pipelines / Custom Fields in Phase 3

- Keine `pipelines`, `pipeline_stages`, `entity_pipeline_positions`
- Keine `custom_fields` / `custom_field_values`
- Keine `views` Tabelle

## Consequences

### Positive

- Sauberes Company-Objekt als Basis für Phase 4–6
- RLS-Muster wiederverwendbar
- Company-first ohne versteckte Abhängigkeiten

### Negative

- UI ist bewusst minimal — finale UX kommt später
- `owner_id` RLS in Phase 3 auf `auth.uid()` beschränkt (Multi-User-Zuweisung später)

## Detail documentation

- Migration: `supabase/migrations/20260703140000_phase3_companies.sql`
- Test checklist: [docs/phase-3-test-checklist.md](../phase-3-test-checklist.md)
- Data model: [docs/data-model.md](../data-model.md)

# ADR-006: Pipelines & Views from Configuration

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 5–7 preparation

## Context

Kanban columns and table columns must not be hardcoded arrays in React. Users configure pipelines, stages, and views in Settings; seed data is allowed but must remain editable.

## Decision

1. **Kanban columns** = `pipeline_stages` for the view's pipeline
2. **Entity position** = `entity_pipeline_positions` (not columns on `companies`)
3. **Table columns / kanban card fields / filters / sort** = `views.config` JSON referencing `field_ref`
4. **Default pipelines** seeded via SQL (`supabase/seed.sql` when introduced) — not TypeScript enums
5. **Won/Lost** via `pipeline_stages.stage_type` (`open`, `won`, `lost`)

## Consequences

### Positive

- monday/Pipedrive-like configurability without their price tag
- Same view engine for companies (later deals)

### Negative / trade-offs

- View config schema must be versioned carefully if structure evolves

## Alternatives considered

| Option                             | Pro                  | Contra                 | Outcome      |
| ---------------------------------- | -------------------- | ---------------------- | ------------ |
| Hardcoded stages in code           | Fast kanban demo     | Not a real CRM product | Rejected     |
| DB-driven pipelines + views (this) | True configurability | View engine complexity | **Accepted** |

## Open follow-up

- **Proposed:** JSONB `views.config` vs. normalized `view_columns` table — decide in Phase 5 ADR update or new ADR-007

## Detail documentation

- [docs/pipelines-and-views.md](../pipelines-and-views.md)
- [docs/definitions-of-done.md](../definitions-of-done.md) — Pipelines, Views sections

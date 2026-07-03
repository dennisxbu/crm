# ADR-013: Custom Fields Core (Phase 4)

**Status:** Accepted  
**Date:** 2026-07-03  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 4 — metadata-driven Custom Fields foundation

## Context

Custom Fields are not an add-on — they are the mechanism that later Table View, Kanban, Filters, and Settings personalization build on. Phase 3 delivered company-first CRUD; Phase 4 must introduce the field abstraction before Views (Phase 5–6).

Prior risk: hardcoded “priority columns” or field-name switches that become permanent debt.

## Decision

1. **Three tables now:** `custom_fields`, `custom_field_options`, `custom_field_values` with workspace RLS (ADR-004, ADR-005).
2. **Typed value columns** — not a single text blob (see ADR-005).
3. **Field Type Registry** — one handler per `field_type`; forbidden: `switch(field.name)` / `if (field.key === "priority")`.
4. **Phase 4 UI scope:** Settings (create/edit/archive fields + options) + Company Detail (display/edit values). No Table, Kanban, Pipelines, Views.
5. **Default company fields as seed data** via idempotent RPC `ensure_default_company_custom_fields`, hooked into `create_initial_workspace`. Not frontend constants.
6. **Empty values:** delete `custom_field_values` row (not null blob storage).
7. **Archive, not hard delete** for field definitions and options (`is_archived`).

## Why Settings + Detail in Phase 4

Without Settings, Custom Fields would be fake (hardcoded or migration-only). Without Detail integration, there is no proof the registry works end-to-end. Table/Kanban can wait — they consume the same handlers later.

## Why Table/Kanban wait until Phase 5/6

Views need `views` config and a View Engine. Building columns before the field registry exists repeats the “glued on” anti-pattern.

## MVP UI field types (Phase 4)

Full handlers: `text`, `long_text`, `number`, `date`, `boolean`, `select`, `multi_select`, `email`, `phone`, `url`, `rating`.

Prepared in DB/registry only (UI “later”): `currency`, `datetime`, `checkbox`, `percentage`, `user`, `relation`.

`rating` is in MVP because default fields `fit_score` and `pain_score` depend on it — omitting it would force a special case.

## Consequences

### Positive

- Single pipeline for all custom fields including defaults
- Phase 5+ reuses handlers for table cells and filters
- Default Blumenthal workflow fields editable like any other field

### Negative / trade-offs

- Large Phase 4 scope — mitigated by explicit non-goals (no Views/Pipelines)
- EAV query complexity — mitigated by typed columns + indexes

## Alternatives considered

| Option                         | Pro                    | Contra                         | Outcome      |
| ------------------------------ | ---------------------- | ------------------------------ | ------------ |
| Hardcode default fields in UI  | Fast demo              | Violates metadata-driven model | Rejected     |
| Custom Fields only in Settings | Smaller Phase 4        | No proof of value storage      | Rejected     |
| All 17 types in UI now         | Complete               | Scope creep, delays Views      | Rejected     |
| Registry + Settings + Detail   | Foundation for Phase 5 | Larger Phase 4                 | **Accepted** |

## Detail documentation

- [docs/custom-fields.md](../custom-fields.md)
- [docs/data-model.md](../data-model.md)
- [docs/phase-4-test-checklist.md](../phase-4-test-checklist.md)
- ADR-005, ADR-009

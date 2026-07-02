# ADR-002: Metadata-Driven CRM Architecture

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 0 architecture

## Context

A hardcoded CRUD app with fixed columns and pipeline stages would require code deploys for every workflow change and would not reach monday/Pipedrive-level configurability. Configuration must be a product feature from day one.

## Decision

1. **Pipelines, stages, custom fields, and views** are stored in PostgreSQL, not frontend constants
2. **System fields** live on entity tables; **custom fields** use `custom_fields` + `custom_field_values`
3. **Views** reference fields via `field_ref` (`system:column`, `custom:uuid`)
4. Frontend uses generic **Field Registry** and **View Engine** — one renderer per `field_type`
5. **UI state** (column width, panel open) is separate from business data and view definition

## Consequences

### Positive

- Settings changes without deploy
- Single abstraction for table, kanban, detail, filters

### Negative / trade-offs

- Higher upfront engineering (Phase 4–7) before feature parity feels complete

## Alternatives considered

| Option                    | Pro                       | Contra                               | Outcome      |
| ------------------------- | ------------------------- | ------------------------------------ | ------------ |
| Hardcoded fields + stages | Fast MVP demo             | Fake configurability, refactor later | Rejected     |
| Metadata-driven (this)    | Long-term product quality | Slower initial delivery              | **Accepted** |

## Detail documentation

- [docs/architecture.md](../architecture.md)
- [docs/data-model.md](../data-model.md)
- [docs/pipelines-and-views.md](../pipelines-and-views.md)

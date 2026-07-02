# ADR-005: Custom Fields — Typed Storage

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 4 preparation

## Context

Storing all custom values as plain text breaks sorting, filtering, validation, and display (dates, currency, select options). Custom fields are core product value, not an add-on.

## Decision

1. **Field metadata** in `custom_fields` with `field_type` enum
2. **Select options** in `custom_field_options`
3. **Values** in `custom_field_values` using **typed columns** (`value_text`, `value_number`, `value_boolean`, `value_date`, `value_datetime`, `value_json`) — not a single text blob for all types
4. **One Field Type Handler** per type in frontend (display, edit, filter, sort adapters)
5. MVP field types: text, long_text, number, date, boolean, select, multi_select, url, email, phone — others per roadmap

## Consequences

### Positive

- Correct sort/filter/display per type
- Extensible without schema change per custom field

### Negative / trade-offs

- EAV complexity — mitigated by typed columns and indexes on `(custom_field_id, value_*)`

## Alternatives considered

| Option                     | Pro               | Contra                      | Outcome      |
| -------------------------- | ----------------- | --------------------------- | ------------ |
| All values as JSONB text   | Flexible          | Wrong sort/filter semantics | Rejected     |
| Typed value columns (this) | Correct semantics | More validation logic       | **Accepted** |

## Detail documentation

- [docs/custom-fields.md](../custom-fields.md)
- [docs/definitions-of-done.md](../definitions-of-done.md) — Custom Fields section

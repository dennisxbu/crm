# ADR-004: Workspaces & Row Level Security

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 1–2 foundation

## Context

All CRM data must be isolated per workspace (solo use: one workspace per user, architecture ready for expansion). Security must not rely on frontend filtering alone.

## Decision

1. **Workspace** is the top-level tenant boundary (`workspace_id` on CRM tables)
2. **RLS enabled** on every CRM and config table
3. Policies check membership via `workspace_members` and `auth.uid()`
4. **Frontend uses only anon key** — never service role in client
5. **Schema changes only via migrations** in `supabase/migrations/`
6. **Explicit GRANTs** on new tables for `authenticated` (and `anon` where needed); `auto_expose_new_tables` stays off

## Consequences

### Positive

- Defense in depth for private CRM data
- Clear pattern for all future tables

### Negative / trade-offs

- Every migration must include RLS + grants — discipline required

## Alternatives considered

| Option                    | Pro               | Contra               | Outcome      |
| ------------------------- | ----------------- | -------------------- | ------------ |
| App-layer filtering only  | Simpler queries   | Unsafe if bug in app | Rejected     |
| RLS + workspace_id (this) | Postgres-enforced | More SQL per table   | **Accepted** |

## Detail documentation

- [docs/supabase-and-rls.md](../supabase-and-rls.md)
- [docs/data-model.md](../data-model.md) — workspaces, workspace_members

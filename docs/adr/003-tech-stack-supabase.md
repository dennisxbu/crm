# ADR-003: Tech Stack — Vite, React, Supabase

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Phase 1

## Context

Phase 1 requires a lean frontend scaffold and managed Postgres with auth path for Phase 2. The stack must support solo development, AI-assisted coding, and German DACH deployment without over-engineering infrastructure early.

## Decision

| Layer           | Choice                                      |
| --------------- | ------------------------------------------- |
| Frontend        | React 19 + TypeScript (strict) + Vite 6     |
| Package manager | pnpm, Node.js ≥ 20                          |
| Backend / DB    | Supabase (PostgreSQL 15+, CLI migrations)   |
| API client      | `@supabase/supabase-js` with anon key + RLS |
| Validation      | Zod (from Phase 3)                          |
| Hosting         | TBD (not blocking Phase 1–7)                |

## Consequences

### Positive

- Fast local dev, built-in auth path, RLS in Postgres
- Matches team skillset and existing Supabase docs in repo

### Negative / trade-offs

- Vendor coupling to Supabase — acceptable for private solo CRM
- Not the same sovereign/self-hosted stack as Atlas (intentionally different product)

## Alternatives considered

| Option                        | Pro                       | Contra                        | Outcome                   |
| ----------------------------- | ------------------------- | ----------------------------- | ------------------------- |
| Next.js + Drizzle self-hosted | Full control (see Atlas)  | More ops for solo private CRM | Rejected for this project |
| Vite + Supabase (this)        | Speed to configurable CRM | Supabase dependency           | **Accepted**              |

## Follow-up

- Document hosting ADR when production deploy is planned

## Detail documentation

- [DEVELOPMENT.md](../../DEVELOPMENT.md)
- [docs/dev-setup.md](../dev-setup.md)

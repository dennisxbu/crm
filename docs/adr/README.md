# Architecture Decision Records (ADR)

Significant architecture choices for the Blumenthal Systems CRM. Process: [ADR-000](000-record-architecture-decisions.md). Template: [template.md](template.md).

**Detailed specs** (product behaviour, field types, data model tables) remain in `docs/*.md`. ADRs record **why** and **binding decisions**.

| ADR                                                | Title                                             | Status   | Date       |
| -------------------------------------------------- | ------------------------------------------------- | -------- | ---------- |
| [000](000-record-architecture-decisions.md)        | Record Architecture Decisions                     | Accepted | 2026-07-01 |
| [001](001-company-first-product-model.md)          | Company-First Product Model                       | Accepted | 2026-07-01 |
| [002](002-metadata-driven-architecture.md)         | Metadata-Driven CRM Architecture                  | Accepted | 2026-07-01 |
| [003](003-tech-stack-supabase.md)                  | Tech Stack — Vite, React, Supabase                | Accepted | 2026-07-01 |
| [004](004-workspaces-rls.md)                       | Workspaces & Row Level Security                   | Accepted | 2026-07-01 |
| [005](005-custom-fields-typed-storage.md)          | Custom Fields — Typed Storage                     | Accepted | 2026-07-01 |
| [006](006-pipelines-views-configuration.md)        | Pipelines & Views from Configuration              | Accepted | 2026-07-01 |
| [007](007-vite-env-vars.md)                        | Vite Environment Variable Naming (`VITE_` Prefix) | Accepted | 2026-07-02 |
| [008](008-temporary-status-shell.md)               | Phase-1-Statusseite als temporäre Shell           | Accepted | 2026-07-02 |
| [009](009-field-type-contract.md)                  | Field Type Contract für Custom Fields             | Accepted | 2026-07-02 |
| [010](010-company-acquisition-operating-fields.md) | Company Akquise-Operative Felder                  | Accepted | 2026-07-02 |
| [011](011-auth-workspace-profile-foundation.md)    | Auth, Workspace & Profile Foundation              | Accepted | 2026-07-02 |
| [012](012-company-core-system-fields.md)           | Company Core System Fields                        | Accepted | 2026-07-03 |
| [013](013-custom-fields-core.md)                   | Custom Fields Core (Phase 4)                      | Accepted | 2026-07-03 |

## Open decisions (document in new ADR before implementation)

| Topic                                    | Decide by | Notes                             |
| ---------------------------------------- | --------- | --------------------------------- |
| View config JSONB vs. normalized columns | Phase 5   | See `docs/architecture.md`        |
| Styling framework                        | UX phase  | After `ui-ux-brief-for-claude.md` |
| Soft delete vs. hard delete              | Phase 3   | Entities                          |
| Supabase Realtime for Kanban             | Phase 6+  | Optional                          |

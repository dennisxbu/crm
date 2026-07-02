# Architecture Decision Records (ADR)

Significant architecture choices for the Blumenthal Systems CRM. Process: [ADR-000](000-record-architecture-decisions.md). Template: [template.md](template.md).

**Detailed specs** (product behaviour, field types, data model tables) remain in `docs/*.md`. ADRs record **why** and **binding decisions**.

| ADR                                         | Title                                | Status   | Date       |
| ------------------------------------------- | ------------------------------------ | -------- | ---------- |
| [000](000-record-architecture-decisions.md) | Record Architecture Decisions        | Accepted | 2026-07-01 |
| [001](001-company-first-product-model.md)   | Company-First Product Model          | Accepted | 2026-07-01 |
| [002](002-metadata-driven-architecture.md)  | Metadata-Driven CRM Architecture     | Accepted | 2026-07-01 |
| [003](003-tech-stack-supabase.md)           | Tech Stack — Vite, React, Supabase   | Accepted | 2026-07-01 |
| [004](004-workspaces-rls.md)                | Workspaces & Row Level Security      | Accepted | 2026-07-01 |
| [005](005-custom-fields-typed-storage.md)   | Custom Fields — Typed Storage        | Accepted | 2026-07-01 |
| [006](006-pipelines-views-configuration.md) | Pipelines & Views from Configuration | Accepted | 2026-07-01 |

## Open decisions (document in new ADR before implementation)

| Topic                                    | Decide by | Notes                             |
| ---------------------------------------- | --------- | --------------------------------- |
| View config JSONB vs. normalized columns | Phase 5   | See `docs/architecture.md`        |
| Styling framework                        | UX phase  | After `ui-ux-brief-for-claude.md` |
| Soft delete vs. hard delete              | Phase 3   | Entities                          |
| Supabase Realtime for Kanban             | Phase 6+  | Optional                          |

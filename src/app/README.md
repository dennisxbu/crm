# src/app — App Shell

## Phase 3: Temporäre Company-Core-Shell

`App.tsx` ist eine **technische Company-Core-Shell** — keine finale CRM-UI.

**Was es ist:**

- Auth (Login/Register/Logout) + Workspace-Kontext
- Minimale Company List / Create / Edit / Archive
- AuthProvider + WorkspaceProvider

**Was es nicht ist:**

- Kein finales CRM-Layout, keine Sidebar, kein Dashboard
- Keine Custom Fields, Pipelines, Kanban oder konfigurierbare Views
- Keine Basis für das visuelle Design des Produkts

## Struktur (Phase 3)

```
src/app/
  App.tsx                    Phase-3-Shell
  providers/
    AuthProvider.tsx
    WorkspaceProvider.tsx
src/features/companies/      Company API, Form, List, Detail
src/features/auth/
src/features/workspaces/
```

## Leitlinien für AI-Agenten

- Shell minimal halten — keine Features aus späteren Phasen vorziehen
- Company-Queries immer workspace-scoped
- Company ohne Contact/Deal ist Pflicht
- UX-Entscheidungen folgen `docs/ui-ux-brief-for-claude.md`
- Roadmap: `docs/implementation-roadmap.md`

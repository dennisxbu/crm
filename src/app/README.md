# src/app — App Shell

## Temporäre Phase-5-Shell

`App.tsx` ist eine **technische App-Shell** — keine finale CRM-UI.

**Was es ist:**

- Auth (Login/Register/Logout) + Workspace-Kontext
- Company List als **metadata-driven Table View** (`views.config`)
- Company Create / Detail / Edit / Archive
- Custom Field Settings + Detail-Integration (Phase 4)
- AuthProvider + WorkspaceProvider

**Was es nicht ist:**

- Kein finales CRM-Layout, keine Sidebar, kein Dashboard
- Kein Kanban, keine Pipelines, kein View Editor
- Keine Basis für das visuelle Design des Produkts

## Struktur

```
src/app/
  App.tsx
  providers/
    AuthProvider.tsx
    WorkspaceProvider.tsx
src/features/companies/      Company API, Form, Detail
src/features/custom-fields/  Field registry, Settings, Values
src/features/views/          View config, Table View engine
src/features/auth/
src/features/workspaces/
```

## Leitlinien für AI-Agenten

- Shell minimal halten — keine Features aus späteren Phasen vorziehen
- Tabellen-Spalten aus `views.config`, nicht hardcoded in JSX
- Company-Queries immer workspace-scoped
- Company ohne Contact/Deal ist Pflicht
- UX-Entscheidungen folgen `docs/ui-ux-brief-for-claude.md`
- Roadmap: `docs/implementation-roadmap.md`

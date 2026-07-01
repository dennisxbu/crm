# Technische Architektur

## Überblick

Das CRM folgt einer **metadata-driven, Supabase-zentrierten Architektur** mit klarem Frontend für Präsentation und Interaktion und Postgres als Single Source of Truth für Business-Daten und Konfiguration.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                        │
│  Views · Kanban · Table · Settings · Detail              │
│  Liest/schreibt via Supabase Client (anon key + RLS)     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Supabase                              │
│  Auth · PostgREST · Realtime (optional später)           │
│  Row Level Security (workspace-scoped)                   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    PostgreSQL                            │
│  Entities · Custom Fields · Pipelines · Views Config     │
└─────────────────────────────────────────────────────────┘
```

## Empfohlener Stack (Phase 1 — implementiert)

| Komponente | Wahl | Version (Stand Phase 1) |
|------------|------|-------------------------|
| Frontend | React + TypeScript + Vite | React 19, TS 5.8, Vite 6 |
| Styling | Minimal CSS (Phase 1 Statusseite) | UI/UX Phase später |
| State | React + URL state (später React Query) | — |
| Backend | Supabase | CLI 2.x, `@supabase/supabase-js` 2.x |
| Validierung | Zod | geplant ab Phase 3 |
| Tests | Vitest + Testing Library | geplant Phase 11 |
| Package Manager | pnpm | 9.x |

Setup und Befehle: `DEVELOPMENT.md`.

## Frontend-/Backend-Verantwortlichkeiten

### Frontend

- Rendering von Table, Kanban, Detail, Settings
- View-Config interpretieren (welche Spalten, Filter, Sort)
- Custom Field Typen rendern (Input + Display)
- Client-seitige Validierung (ergänzend, nicht ersetzend)
- Auth Session Handling (Supabase Auth)
- UI State (Spaltenbreiten, Panel offen/zu, …) — **nicht** in CRM-Entity-Tabellen

### Supabase / Postgres

- Persistenz aller CRM-Daten und Konfiguration
- RLS durchsetzen (Workspace-Isolation)
- Constraints (FK, unique, check)
- Migrationen für Schema-Evolution
- Optional: DB Functions für komplexe Queries (sparsam einsetzen)

### Was nicht ins Frontend

- Service Role Key
- Business Rules, die Sicherheit betreffen (nur RLS/DB)
- Hardcoded Pipeline-Stages oder Custom Field Definitionen

## Supabase-Rolle

- **Auth:** E-Mail/Passwort oder Magic Link (Entscheidung Phase 2)
- **Database:** Postgres mit Migrationen in `supabase/migrations/`
- **API:** Auto-generierte REST via PostgREST (Supabase Client)
- **Storage:** Optional später für Anhänge — nicht MVP
- **Edge Functions:** Nur wenn nötig — MVP bevorzugt RLS + Client

## Postgres-Rolle

Postgres ist die **einzige Quelle** für:

- Entity-Daten (companies, contacts, deals)
- Konfiguration (pipelines, stages, custom_fields, views)
- Custom Field Values
- Pipeline-Positionen
- Activities, Tags

Kein paralleles Config-JSON im Repo für produktive Pipelines/Fields.

## Auth-Konzept

```
auth.users (Supabase)
    ↕
profiles (id = auth.users.id)
    ↕
workspace_members
    ↕
workspaces
```

- Jeder authentifizierte Nutzer hat ein `profiles`-Record
- CRM-Daten sind immer `workspace_id`-scoped
- RLS Policies prüfen Workspace-Mitgliedschaft
- Session im Frontend via Supabase Auth SDK

## Workspace-Konzept

- Alle CRM-Tabellen (companies, pipelines, custom_fields, …) haben `workspace_id`
- Solo-Nutzung: ein Workspace pro Nutzer (initial)
- Architektur erlaubt später mehrere Workspaces oder Team-Mitglieder
- Kein Cross-Workspace-Zugriff ohne explizite Policy

## Metadata-driven Architektur

Drei Schichten:

| Schicht | Beispiel | Speicherort |
|---------|----------|-------------|
| **System Fields** | `companies.name`, `companies.website` | Entity-Tabelle (Spalten) |
| **Custom Fields** | „LinkedIn-Follower", „ICP-Score" | `custom_fields` + `custom_field_values` |
| **View Config** | Sichtbare Spalten, Filter, Kanban cards | `views` (JSON oder normalisiert) |

Frontend rendert **generisch** basierend auf Metadata — nicht `if (fieldName === 'website')`.

## Trennung: System Fields vs. Custom Fields

**System Fields:**

- Fest im Schema definiert
- Für Kern-Workflow unverzichtbar (name, pipeline position, contact discovery status)
- Indizierbar, typisiert, in Migrationen verwaltet
- In Views referenzierbar via `field_key` (z.B. `system:website`)

**Custom Fields:**

- Vom Nutzer in Settings definierbar
- Typ aus `custom_fields.field_type`
- Werte in EAV-ähnlicher Struktur (`custom_field_values`) mit typgerechten Spalten oder JSONB + Typ-Constraint
- In Views referenzierbar via `custom:{uuid}`

Details: `docs/custom-fields.md`, `docs/data-model.md`.

## Trennung: Daten, Konfiguration, UI-State

| Kategorie | Beispiele | Persistenz |
|-----------|-----------|------------|
| **Business Data** | Company name, Custom Field Value | Postgres CRM-Tabellen |
| **Configuration** | Pipeline, Stage, View definition | Postgres Config-Tabellen |
| **UI State** | Spaltenbreite, Sidebar collapsed | localStorage oder `user_preferences` (später) |

View-**Definition** (welche Felder sichtbar) = Configuration.
Aktuell gewählte View = UI State (URL param oder Session).

## Geplante Ordnerstruktur (ab Phase 1)

```
src/
├── app/                    # App shell, routing, providers
├── features/
│   ├── auth/
│   ├── companies/
│   ├── contacts/           # Phase 8+
│   ├── deals/              # Phase 9+
│   ├── activities/         # Phase 10+
│   └── settings/
│       ├── pipelines/
│       ├── custom-fields/
│       └── views/
├── shared/
│   ├── components/         # Generic field renderers, layout
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   └── validation/
│   └── types/
└── main.tsx

supabase/
├── migrations/
├── seed.sql                # Default pipelines (Seed-Konzept)
└── config.toml

tests/
├── unit/
└── integration/
```

Feature-Ordner spiegeln **Domänen**, nicht UI-Patterns (kein `components/kanban/` als Top-Level ohne `features/companies/`).

## Generische Field-Pipeline (Konzept)

```
View Config → list of field references
    ↓
Field Registry (system + custom metadata)
    ↓
Field Renderer (by field_type)
    ↓
Display / Edit / Filter / Sort adapters
```

Einmal implementierte Field-Type-Handler werden überall wiederverwendet: Detail, Table, Kanban Card, Filter Builder, Settings Preview.

## Implementierungsphasen (Architektur-Relevanz)

| Phase | Architektur-Meilenstein |
|-------|-------------------------|
| 0 | Docs, Rules — keine Code |
| 1 | Stack init, Supabase CLI, Supabase Client stub |
| 2 | Auth flow, workspace context in app |
| 3 | companies table + RLS + basic queries |
| 4 | custom_fields + values + field registry |
| 5 | view engine for table |
| 6 | pipeline positions + kanban view engine |
| 7 | settings CRUD for all config entities |
| 8–10 | contacts, deals, activities — same patterns |
| 11 | security review, test coverage, polish |

## Architektur-Prinzipien (verbindlich)

1. **Configuration over code** — Pipelines, Fields, Views aus DB
2. **Company-first data model** — companies nicht von contacts abhängig
3. **Workspace isolation** — RLS auf allen CRM-Tabellen
4. **Typed custom fields** — kein „alles ist string"
5. **Generic renderers** — ein Field-Type-Handler pro Typ
6. **No half features** — Modul erst nach Definition of Done
7. **Docs before code** — Schema-Änderungen dokumentieren

## Risiken und Mitigationen

| Risiko | Mitigation |
|--------|------------|
| EAV-Performance bei Custom Fields | Typisierte value-Spalten, Index auf (entity_id, field_id), später Materialized Views |
| View-Config-Komplexität | Start mit JSONB config + klares Schema in Docs; normalisieren wenn nötig |
| Hardcoding-Druck („schnell demo") | Cursor Rules + Definition of Done + Code Review |
| Over-engineering | MVP-Scope in Roadmap; generische Renderer, aber nicht premature abstraction |

## Offene Entscheidungen (Phase 1)

- Exaktes Styling-Framework
- View config als JSONB vs. normalisierte `view_columns` Tabelle
- Realtime für Kanban (ja/nein, wann)
- Soft delete vs. hard delete für Entities
- `custom_field_values` Speicherstrategie (typed columns vs. JSONB per type)

Diese Entscheidungen werden in Phase 1/4 dokumentiert, bevor implementiert.

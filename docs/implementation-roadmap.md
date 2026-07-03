# Implementierungs-Roadmap

Phasenweise Umsetzung des Blumenthal Systems CRM. Jede Phase hat klaren Scope, explizite Nicht-Ziele und Akzeptanzkriterien.

**Aktueller Stand: Phase 5 abgeschlossen (Company Table View). Nächste Phase: Phase 6.**

---

## Phase 0: Repository-Fundament

### Ziel

Professionelle Basis: Docs, Architektur, AI-Regeln, Projektstruktur — ohne App-Code.

### Scope

- README, AGENTS.md, DEVELOPMENT.md
- docs/ Spezifikationen
- .cursor/rules/
- .env.example, .gitignore
- Platzhalterordner mit READMEs

### Explizit nicht im Scope

- Stack-Initialisierung
- Supabase-Projekt
- UI
- CRM-Features

### Akzeptanzkriterien

- [x] Vollständige Docs-Struktur
- [x] Cursor Rules für alle Kernprinzipien
- [x] Keine Feature-Implementierung
- [x] AI-Agent kann aus Docs weiterarbeiten

### Risiken

- Docs veralten — Mitigation: Docs-before-code Regel

---

## Phase 1: Stack-Initialisierung und Supabase-Grundintegration

### Ziel

Technisches Gerüst: Frontend-Projekt, Supabase CLI, leere Migration-Struktur, Client-Verbindung (ohne CRM-Features).

### Scope

- Vite + React + TypeScript init (Empfehlung)
- Supabase CLI init, `config.toml`
- Erste Migration: extensions, leere Struktur oder profiles stub
- Supabase Client im Frontend
- Environment Setup dokumentiert in DEVELOPMENT.md

### Explizit nicht im Scope

- Auth UI
- Companies CRUD
- Custom Fields
- Views/Kanban

### Akzeptanzkriterien

- [x] `pnpm dev` startet leere App (Phase-1-Statusseite)
- [x] Supabase CLI init + `config.toml`
- [x] Erste Migration (extensions + profiles stub)
- [x] Supabase Client + Health Check im Frontend
- [x] Migrationen reproduzierbar via `pnpm db:reset` (mit Docker)
- [x] Stack in `architecture.md` und `DEVELOPMENT.md` dokumentiert

Hinweis: `pnpm db:start` erfordert **Docker Desktop**. Ohne Docker: Frontend läuft, Health Check zeigt fehlende Env/Verbindung.

### Risiken

- Stack-Entscheidung zu früh festzurren — Empfehlung dokumentieren, bewusst wählen

---

## Phase 2: Auth, Workspaces, Profiles

### Ziel

Nutzer kann sich anmelden. Workspace-Kontext existiert. RLS-Grundgerüst für Membership.

### Scope

- Supabase Auth (Login/Logout/Register)
- `profiles`, `workspaces`, `workspace_members` Migrationen + RLS
- Onboarding: Workspace bei erstem Login
- App: Auth Guard, Workspace Context Provider

### Explizit nicht im Scope

- Companies
- Settings
- CRM UI beyond Auth shell

### Akzeptanzkriterien

- [x] User kann Account erstellen und einloggen
- [x] Profile wird automatisch angelegt
- [x] Workspace + Membership existieren
- [x] RLS verhindert Cross-Workspace-Zugriff (Policy-Grundlage)
- [x] Logout funktioniert

Test checklist: [docs/phase-2-test-checklist.md](phase-2-test-checklist.md)

### Risiken

- RLS-Fehler blockieren alle späteren Phasen — früh Integrationstests

---

## Phase 3: Company-Core

### Ziel

Unternehmen als vollwertiges Lead-Objekt — CRUD mit Systemfeldern, ohne Custom Fields und ohne Views.

### Scope

- `companies` Tabelle + RLS
- Company list (einfach) + Detail + Create/Edit
- Systemfelder inkl. `contact_discovery_status`
- API Queries via Supabase Client

### Explizit nicht im Scope

- Custom Fields
- Pipelines/Kanban
- Konfigurierbare Table View
- Contacts, Deals

### Akzeptanzkriterien

- [x] Company ohne Kontakt anlegbar
- [x] Company ohne Deal anlegbar
- [x] Alle Systemfelder editierbar
- [x] Workspace-Isolation (RLS)
- [x] Keine hardcoded Custom Fields

Test checklist: [docs/phase-3-test-checklist.md](phase-3-test-checklist.md)

### Risiken

- Zu früh UI-Komplexität — einfache List/Detail reicht

---

## Phase 4: Custom Fields Core

### Ziel

Metadata-driven Custom Fields — Settings, Speicherung, Detail-Integration.

### Scope

- `custom_fields`, `custom_field_options`, `custom_field_values` + RLS
- Settings UI: Feld anlegen, Typ wählen, Optionen (select/multi)
- Field Type Handlers (MVP-Typen)
- Detailansicht: Custom Fields anzeigen/editieren

### Explizit nicht im Scope

- Table/Kanban Integration
- Alle 17 Feldtypen in UI (MVP-Subset ok)
- Contacts/Deals Custom Fields

### Akzeptanzkriterien

- [x] Definition of Done Custom Fields (Detail + Settings, Phase-4-Minimum) erfüllt
- [x] Typgerechte Validierung und Speicherung
- [x] Select-Optionen verwaltbar
- [x] Generic Renderer, kein hardcoded Field Name Switch

Test checklist: [docs/phase-4-test-checklist.md](phase-4-test-checklist.md)

### Risiken

- EAV-Komplexität — typed columns laut data-model.md

---

## Phase 5: Company Table View

### Ziel

Konfigurierbare Tabellenansicht für Companies.

### Scope

- `views` Tabelle + RLS
- View Engine: columns, sort, filter aus config
- System + Custom Fields in Spalten
- Default Table View (Seed)

### Explizit nicht im Scope

- Kanban
- View Editor UI (minimal: Default View reicht erstmal)
- Deals/Contacts Views

### Akzeptanzkriterien

- [x] Definition of Done Views (Table-Teil, Phase-5-Minimum) erfüllt
- [x] Spalten aus DB-Config, nicht hardcoded
- [x] Sort/Filter auf System- und Custom Fields (client-side MVP; Custom-Sort eingeschränkt dokumentiert)
- [x] Company ohne Kontakt in Tabelle sichtbar

Test checklist: [docs/phase-5-test-checklist.md](phase-5-test-checklist.md)

### Risiken

- Filter-Query-Komplexität — iterativ starten (wenige Operatoren)

---

## Phase 6: Company Kanban View

### Ziel

Pipeline-basiertes Kanban für Companies.

### Scope

- `pipelines`, `pipeline_stages`, `entity_pipeline_positions` + RLS
- Default Company Pipeline (Seed)
- Kanban UI: Spalten aus Stages, Drag & Drop
- `card_fields` aus View config

### Explizit nicht im Scope

- Deal Pipeline UI
- Realtime Sync
- Automatisierungen bei Stage-Wechsel

### Akzeptanzkriterien

- [ ] Definition of Done Pipelines erfüllt
- [ ] Kanban-Spalten aus DB
- [ ] Drag & Drop aktualisiert Position
- [ ] Company ohne Kontakt im Kanban

### Risiken

- DnD UX — UI/UX Brief beachten wenn Design vorliegt

---

## Phase 7: Settings für Pipelines, Stages, Custom Fields, Views

### Ziel

Vollständige Konfigurierbarkeit ohne Code-Deploy.

### Scope

- Settings: Pipelines CRUD, Stages reorder/rename/color
- Settings: Custom Fields CRUD (erweitert)
- Settings: Views CRUD (columns, filters, card_fields, default)
- Won/Lost Stage Markierung

### Explizit nicht im Scope

- Contacts/Deals Settings
- Import/Export
- Audit Log

### Akzeptanzkriterien

- [ ] Alle Definition of Done für Settings, Pipelines, Views, Custom Fields
- [ ] Änderungen sofort in Table/Kanban sichtbar
- [ ] Keine hardcoded Defaults im Frontend

### Risiken

- Settings-UX unübersichtlich — progressive disclosure (UX Phase)

---

## Phase 8: Contacts (optional)

### Ziel

Kontakte als optionale Erweiterung von Companies.

### Scope

- `contacts` Tabelle + RLS
- Contact CRUD am Company Detail
- `is_primary` Logik
- Optional: Contact Custom Fields

### Explizit nicht im Scope

- Contact Pipeline
- Contact-eigene Views

### Akzeptanzkriterien

- [ ] Definition of Done Contacts
- [ ] Company funktioniert weiterhin ohne Contacts
- [ ] Primary Contact eindeutig

---

## Phase 9: Deals (optional)

### Ziel

Verkaufschancen mit eigener Deal-Pipeline.

### Scope

- `deals` + Deal Pipeline (Seed)
- Deal CRUD, Pipeline Position
- Deal Kanban/Table Views (Wiederverwendung View Engine)

### Akzeptanzkriterien

- [ ] Definition of Done Deals
- [ ] Deal optional, nicht bei Company-Erstellung erzwungen

---

## Phase 10: Activities, Notes, Follow-ups

### Ziel

Aktivitäten-Timeline und Aufgaben.

### Scope

- `activities` Tabelle
- Timeline am Company Detail
- Activity Types: note, call, email, meeting, task
- Due dates / completed

### Akzeptanzkriterien

- [ ] Definition of Done Activities
- [ ] Activities an Company ohne Contact

---

## Phase 11: Polish, Security Review, Testing

### Ziel

Production-Readiness für Solo-Nutzung.

### Scope

- Security Review (RLS, Auth)
- Test Coverage kritische Pfade
- Performance (Listen, Filter)
- Error Handling, Empty States
- DEVELOPMENT.md finalisieren

### Akzeptanzkriterien

- [ ] RLS Integrationstests grün
- [ ] Keine bekannten Security Issues
- [ ] Core User Journeys manuell getestet
- [ ] Docs aktuell

---

## Abhängigkeiten (Diagramm)

```
Phase 0 (Docs)
    ↓
Phase 1 (Stack)
    ↓
Phase 2 (Auth/Workspace)
    ↓
Phase 3 (Companies)
    ↓
Phase 4 (Custom Fields)
    ↓
Phase 5 (Table View) ──→ Phase 7 (Settings)
    ↓
Phase 6 (Kanban)
    ↓
Phase 8 (Contacts) → Phase 9 (Deals) → Phase 10 (Activities)
    ↓
Phase 11 (Polish)
```

Phase 5 und 6 können teilweise parallel nach Phase 4, aber Settings (7) setzt beide voraus.

## MVP-Grenze

**MVP = Phase 7 abgeschlossen.** Phasen 8–11 erweitern, sind aber nicht für ersten produktiven Company-Workflow nötig.

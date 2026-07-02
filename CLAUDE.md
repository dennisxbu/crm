# CLAUDE.md — Blumenthal Systems CRM

Primäres Kontextdokument für Claude Code. Ergänzt [AGENTS.md](AGENTS.md) mit Claude-Code-spezifischer Tiefe.

---

## Projektziel

Privates, professionelles **company-first B2B-Akquise-CRM** für Blumenthal Systems (Dennis Blumenthal, Solo-Berater). Zielkunden der Akquise: Personalberatungen, Headhunter, Executive-Search-Firmen im DACH-Raum.

**Kernprinzip:** Unternehmen sind das primäre Lead-Objekt. Kontakte und Deals sind optional. Das System ist **metadata-driven**: Pipelines, Stages, Custom Fields und Views kommen aus der Datenbank — nicht aus hardcoded Frontend-Konstanten.

---

## Aktueller Stand

> **Kanonische Quelle für den Projektstatus:** [AGENTS.md](AGENTS.md) — immer dort zuerst prüfen.

Phase 3 (Company-Core) abgeschlossen — Auth, Workspaces, Company-CRUD mit RLS sind implementiert.  
**Nächste Phase: 4 — Custom Fields Core.**

Vollständige Roadmap: [docs/implementation-roadmap.md](docs/implementation-roadmap.md)

---

## Lesereihenfolge für neue Aufgaben

Vor jeder Implementierung in dieser Reihenfolge lesen:

1. [AGENTS.md](AGENTS.md) — kanonischer Einstieg für alle Tools; Projektstatus
2. `docs/implementation-roadmap.md` — aktive Phase und Scope
3. `docs/adr/README.md` — bindende Architektur-Entscheidungen
4. `docs/product-spec.md` — Produktscope und Nicht-Ziele
5. `docs/product-principles.md` — **Nordstern**: Produktgefühl, Litmus-Test, Betriebsmodell
6. `docs/definitions-of-done.md` — Akzeptanzkriterien pro Modul
7. Relevante Detail-Specs: `docs/data-model.md`, `docs/custom-fields.md`, `docs/pipelines-and-views.md`, `docs/supabase-and-rls.md`
8. `docs/ui-ux-brief-for-claude.md` — wenn UI/Design betroffen

---

## Tech Stack (verbindlich, keine Abweichung ohne ADR)

| Bereich         | Technologie                                                         |
| --------------- | ------------------------------------------------------------------- |
| Frontend        | React 19 + TypeScript strict + Vite 6                               |
| Styling         | Minimal CSS bis UX-Spec; dann laut `docs/ui-ux-brief-for-claude.md` |
| State           | React + URL state (später React Query)                              |
| Backend / DB    | Supabase (PostgreSQL) + Supabase CLI Migrationen                    |
| Client          | `@supabase/supabase-js` v2 (anon key only im Frontend)              |
| Auth            | Supabase Auth (ab Phase 2)                                          |
| Validierung     | Zod (ab Phase 3+)                                                   |
| Tests           | Vitest + Testing Library (Phase 11)                                 |
| Package Manager | pnpm (Node ≥ 20)                                                    |

**ADR:** [docs/adr/003-tech-stack-supabase.md](docs/adr/003-tech-stack-supabase.md)

---

## Architektur-Prinzipien

> Vollständig in [docs/architecture.md](docs/architecture.md) + [docs/adr/README.md](docs/adr/README.md).  
> Nordstern (Produktgefühl + Litmus-Test): [docs/product-principles.md](docs/product-principles.md).

Kurzreferenz für den Alltag:

- **Company-first** — Companies vollwertig ohne Contact/Deal. Kein Create-Flow erzwingt sie.
- **Metadata-driven** — Pipelines, Stages, Custom Fields, Views → DB, nie TypeScript-Konstanten. `switch(field_type)` erlaubt, `switch(field.name)` verboten.
- **Workspace-scoped** — alle CRM-Tabellen mit `workspace_id` + RLS. Kein Service Role Key im Frontend.
- **Generic Field Pipeline** — ein `FieldTypeHandler` pro `field_type`, Registry-basiert, wiederverwendbar in Detail/Table/Kanban/Filter/Settings.
- **field_ref-Format** — `system:<column_name>` oder `custom:<uuid>` in View Config.

**Litmus-Test** (on-vision wenn alle 4 zutreffen): → [docs/product-principles.md §5](docs/product-principles.md)

---

## Supabase & Datenbank

**Detail:** [docs/supabase-and-rls.md](docs/supabase-and-rls.md) · **ADR:** [docs/adr/004-workspaces-rls.md](docs/adr/004-workspaces-rls.md)

### Migrations-Regeln

- Schema **ausschließlich** via `supabase/migrations/` — kein produktives Dashboard-Schema
- Lokal testen: `pnpm db:reset`
- Neue Migrationen: `supabase migration new <name>` → SQL editieren → `pnpm db:reset`

### Jede neue CRM-Tabelle braucht

1. `workspace_id uuid FK` — denormalisiert für RLS
2. `alter table ... enable row level security;`
3. RLS Policy über `workspace_members` (`auth.uid()`)
4. Explizite Grants (`auto_expose_new_tables = false` in config):
   ```sql
   grant select, insert, update, delete on public.<table> to authenticated;
   grant all on public.<table> to service_role;
   ```

### RLS-Policy-Muster

```sql
CREATE POLICY "workspace members can access <table>"
ON <table> FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

### Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

- Präfix immer `VITE_` — niemals `NEXT_PUBLIC_*` (das ist Next.js, nicht Vite) — **ADR-007**
- `VITE_SUPABASE_PUBLISHABLE_KEY` ist der öffentliche Publishable Key — sicher exponierbar, Schutz durch RLS
- Niemals `SERVICE_ROLE_KEY` ins Frontend-Bundle

---

## Ordnerstruktur (Ziel)

```
src/
├── app/                    # App Shell, Routing, Providers
├── features/
│   ├── auth/               # Phase 2
│   ├── companies/          # Phase 3+
│   ├── contacts/           # Phase 8+
│   ├── deals/              # Phase 9+
│   ├── activities/         # Phase 10+
│   └── settings/
│       ├── pipelines/
│       ├── custom-fields/
│       └── views/
├── shared/
│   ├── components/         # Generic Field Renderers, Layout — Phase 4+
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/       # Client, Queries
│   │   └── validation/     # Zod Schemas — Phase 3+
│   └── types/
└── main.tsx

supabase/
├── migrations/             # Alle SQL-Migrationen
└── config.toml

tests/
├── unit/
└── integration/
```

Feature-Ordner spiegeln Domänen, nicht UI-Patterns. Kein `components/kanban/` als Top-Level.

---

## Code-Konventionen

### Sprache

- **Code, Commits, Tabellen, field_keys, Kommentare:** Englisch
- **User-facing Text, Docs:** Deutsch

### TypeScript

- `strict: true` — kein `any`, kein `@ts-ignore` ohne Kommentar + Begründung
- Types aus Zod ab Einführung: `z.infer<typeof schema>`
- Queries immer workspace-scoped; RLS ist die Sicherheitsschicht

### Supabase Client

- Nur `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- Kein Service Role im Frontend
- Queries immer mit `.select()` — nie `*` ohne Begründung in Production

---

## Git Workflow

**Detail:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Branches

| Branch          | Zweck                              |
| --------------- | ---------------------------------- |
| `main`          | Stable — nur via PR mergen         |
| `feat/<scope>`  | Feature oder Roadmap-Phasenschritt |
| `fix/<scope>`   | Bugfix                             |
| `chore/<scope>` | Tooling, Deps, Rules               |
| `docs/<scope>`  | Nur Dokumentation                  |

**Niemals direkt auf `main` pushen.**

### Commits (Conventional Commits, Englisch)

```
<type>(<scope>): <imperative subject>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`

- Ein logisches Thema pro Commit
- Vor Code-Commits: `pnpm lint` und `pnpm build` müssen grün sein
- Keine Secrets committen (Secretlint läuft im pre-commit)

### Pull Requests

- Jedes Merge zu `main` via PR (auch Solo-Dev — PR = Review-Checkpoint)
- Kein Mix von unverwandten Änderungen in einem Commit
- **Docs vor Code** bei Schema- oder Architektur-Änderungen
- ADRs aktualisieren wenn Architektur sich ändert

---

## Was NICHT gebaut wird (ohne explizite Anweisung)

- CRM-Features außerhalb der aktiven Roadmap-Phase
- Companies / Contacts / Deals CRUD (erst ab Phase 3+)
- Custom Fields, Pipelines, Views in der App (erst Phase 4–7)
- Hardcoded Stages, Tabellenspalten, Feldlisten, Kanban-Kartenfelder
- Finales UI/Design-System (separate UX-Phase — `docs/ui-ux-brief-for-claude.md`)
- Demo-Dashboards oder Tutorial-CRUD

**Erlaubt in frühen Phasen:** Funktionale Shells (z.B. Statusseite Phase 1, Auth-Shell Phase 2).

---

## Nicht-Ziele (Produkt)

- Kein Multi-Tenant-SaaS für externe Kunden
- Kein E-Mail-Client-Ersatz
- Kein Marketing-Automation-Hub
- Kein Contact-first CRM
- Keine Fake-Konfigurierbarkeit (Settings-UI ohne Backend-Wirkung)
- Keine Sammlung hardcoded CRUD-Tabellen

---

## Definition of Done

Vollständige Kriterien: [docs/definitions-of-done.md](docs/definitions-of-done.md)

**Kein Merge wenn:**

- Hardcoded Pipeline-Stages im Source
- Hardcoded Table-Spalten
- Custom Field als plain string ohne Typ
- Feature gegen company-first Prinzip
- Halbes Feature mit Dummy-Button
- Docs widersprechen Implementierung und wurden nicht aktualisiert

**Custom Fields gelten erst fertig wenn:** Settings, Detail, Table, Kanban, Filter alle funktionieren — kein Partial-Implementation.

---

## Roadmap (Phasen-Überblick)

| Phase | Meilenstein                                             | Status              |
| ----- | ------------------------------------------------------- | ------------------- |
| 0     | Docs, Rules, Repository-Fundament                       | ✅                  |
| 1     | Stack init, Supabase CLI, Client, Migration `profiles`  | ✅                  |
| **2** | **Auth, Workspaces, Profiles, RLS-Grundgerüst**         | **← Nächste Phase** |
| 3     | Companies CRUD + Systemfelder                           |                     |
| 4     | Custom Fields Core (Settings + Detail)                  |                     |
| 5     | Company Table View (View Engine)                        |                     |
| 6     | Company Kanban View (Pipeline-basiert)                  |                     |
| 7     | Settings CRUD (Pipelines, Stages, Custom Fields, Views) |                     |
| 8     | Contacts (optional)                                     |                     |
| 9     | Deals (optional)                                        |                     |
| 10    | Activities, Timeline, Follow-ups                        |                     |
| 11    | Polish, Security Review, Tests                          |                     |

**MVP-Grenze:** Phase 7 abgeschlossen.

---

## Bei Unsicherheit

1. ADRs lesen (`docs/adr/`) — bindendes „Warum"
2. Detail-Specs lesen (`docs/`) — „Was" im Detail
3. Roadmap-Phase prüfen — ist das im Scope?
4. Lücke dokumentieren oder Dennis fragen
5. Niemals raten oder abkürzen — lieber fragen

---

## Nützliche Befehle

```bash
pnpm dev          # Frontend starten
pnpm build        # Build + TypeCheck
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm db:start     # Supabase lokal starten (braucht Docker)
pnpm db:stop      # Supabase stoppen
pnpm db:reset     # DB zurücksetzen + alle Migrationen neu anwenden
```

Lokales Setup-Detail: [docs/dev-setup.md](docs/dev-setup.md)

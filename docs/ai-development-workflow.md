# AI Development Workflow

Leitfaden für die Nutzung von AI-Coding-Tools (Cursor, Claude Code, etc.) in diesem Repository.

## Grundprinzip

**Specs und Architektur führen, AI implementiert.** AI-Agenten sollen nicht improvisieren oder Tutorial-Patterns einführen, die gegen die dokumentierte Produktvision verstoßen.

## Pflicht-Lese-Reihenfolge vor Implementierung

1. `README.md` — Phase und Kontext
2. `AGENTS.md` — **kanonisch für alle AI-Tools**
3. `docs/implementation-roadmap.md` — **aktive Phase**
4. `docs/adr/README.md` — bindende Architektur-Entscheidungen
5. `docs/product-spec.md` — Scope und Nicht-Ziele
6. `docs/architecture.md` — technische Leitplanken
7. Relevante Detail-Docs:
   - Custom Fields → `docs/custom-fields.md`
   - Pipelines/Views → `docs/pipelines-and-views.md`
   - Datenmodell → `docs/data-model.md`
   - Supabase → `docs/supabase-and-rls.md`
8. `docs/definitions-of-done.md` — Akzeptanzkriterien
9. `.cursor/rules/` — Cursor `.mdc` rules (optional für non-Cursor: AGENTS.md reicht)

## Architektur-Entscheidungen (ADRs)

Bindende **Warum**-Entscheidungen: [docs/adr/README.md](adr/README.md).  
Detaillierte Specs bleiben in `docs/*.md`.

## Cursor Rules

Rules in [`.cursor/rules/`](../.cursor/rules/) als **`.mdc`** mit Frontmatter (Atlas-style).  
**Kanonisch für alle AI-Tools:** [AGENTS.md](../AGENTS.md) und ADRs.

| Rule                    | Wann                     |
| ----------------------- | ------------------------ |
| `project-context.mdc`   | Immer — Phase, Scope     |
| `workflow.mdc`          | Immer — Git, PRs         |
| `tech-stack.mdc`        | Immer                    |
| `architecture.mdc`      | Immer                    |
| `quality-bar.mdc`       | Immer                    |
| `supabase-database.mdc` | DB, SQL, Supabase client |
| `custom-fields.mdc`     | Custom fields work       |
| `typescript.mdc`        | `*.ts`, `*.tsx`          |

## Regeln für AI-Implementierung

### Do

- Aktive Roadmap-Phase respektieren — nicht Phase 9 bauen in Phase 3
- Metadata-driven Patterns verwenden (Field Registry, View Config)
- Docs **vor** Schema-Änderungen aktualisieren
- Kleine, reviewbare PRs/Commits
- Definition of Done als Checkliste
- Bei Unsicherheit: langfristig saubere Lösung, in Docs festhalten
- Bestehende Konventionen im Code lesen (ab Phase 1)

### Don't

- Keine Implementierung ohne Bezug zu Docs
- Keine Features gegen Company-first oder Metadata-driven Prinzipien
- Keine hardcoded Business-Logik (Stages, Columns, Field Lists)
- Keine halben Features („Button kommt später")
- Keine Demo-Apps oder Mock-Dashboards
- Keine Contact-first Flows
- Keine Service Role Keys im Frontend
- Keine Supabase-Schema-Änderungen nur im Dashboard
- Keine UI-Implementierung vor UX-Spec (außer funktionale Shell in early Phases — minimal)

## Feature-Workflow

```
1. User ordnet Phase/Feature an
2. Agent liest Docs + Rules
3. Agent prüft: In Scope? Nicht-Ziele?
4. Bei Datenmodell-Änderung: data-model.md zuerst
5. Implementierung
6. Definition of Done prüfen
7. Docs aktualisieren falls nötig
```

## Große Features

Features, die mehrere Module berühren (z.B. View Engine):

1. **Planen** — kurzer Plan in Chat oder Doc-Abschnitt
2. **Datenmodell** — prüfen/ergänzen
3. **Schichtweise** — DB → Query Layer → Generic Components → Feature UI
4. **Nicht** — alles in einem Screen hardcoden

## Typische AI-Fehler (verhindern)

| Fehler                              | Richtig                                |
| ----------------------------------- | -------------------------------------- |
| `const columns = ['Name', 'Email']` | Columns aus `views.config`             |
| Contact required on Company create  | Company allein anlegbar                |
| Custom field als string             | Typed storage + Field Type Handler     |
| Pipeline stages als enum            | `pipeline_stages` Tabelle              |
| Schnelles Kanban mit mock data      | Kanban aus DB + RLS                    |
| „Erstmal alles in einer Komponente" | Feature-Ordner, shared Field Renderers |

## UI/UX und AI

- Visuelles Design: **Claude UX Phase** — siehe `docs/ui-ux-brief-for-claude.md`
- Cursor implementiert UI nach Spec — erfindet kein Design-System von Grund auf ohne Brief
- Funktionale Shells in frühen Phasen ok (minimal styling), aber keine Wegwerf-UI ohne Plan

## Phase 0 vs. später

| Phase 0            | Phase 1+                           |
| ------------------ | ---------------------------------- |
| Nur Docs und Rules | Code erlaubt im Roadmap-Scope      |
| Kein package.json  | Stack init                         |
| Keine Migrationen  | Migrationen in supabase/migrations |

Agent in Phase 0: **nur** Fundament — keine „Vorbereitung" durch Feature-Code.

## Commit-Messages (AI-generiert)

Klar, Phase/Modul erwähnen, Doc-Referenz wenn relevant:

```
docs(data-model): add entity_pipeline_positions spec

feat(companies): workspace-scoped list query — Phase 3
```

## Wenn Specs lückenhaft sind

1. Nicht raten mit quick hack
2. Lücke in Doc ergänzen (oder User fragen)
3. Dann implementieren

## Review-Checkliste (Agent vor Abschluss)

- [ ] Roadmap-Phase eingehalten?
- [ ] Definition of Done erfüllt?
- [ ] Kein Hardcoding von Config?
- [ ] Company-first respektiert?
- [ ] RLS bedacht?
- [ ] Docs synchron?

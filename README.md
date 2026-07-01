# Blumenthal Systems CRM

Privates, professionelles B2B-Akquise-CRM für **Blumenthal Systems** — Solo-Beratung für Workflow-Automatisierung, KI-Prozesse und Prozessoptimierung im DACH-Raum, spezialisiert auf Personalberatungen, Personalvermittler, Headhunter und Executive-Search-Firmen.

## Warum dieses Projekt existiert

Standard-CRMs (monday, HubSpot, Pipedrive) sind für diesen Use Case entweder zu teuer, zu kontaktzentriert oder passen nicht zum tatsächlichen Akquise-Workflow. In der Praxis entsteht ein Lead oft zuerst als **Unternehmen** — mit Website, Impressum, LinkedIn-Seite — lange bevor ein konkreter Ansprechpartner oder Entscheider bekannt ist.

Dieses CRM ist deshalb **company-first**: Unternehmen sind das primäre Lead-Objekt. Kontakte und Deals sind optional, nicht Voraussetzung.

## Das company-first Problem

Klassische CRMs modellieren:

```
Kontakt → Unternehmen → Deal
```

Blumenthal Systems arbeitet eher so:

```
Unternehmen → Bewertung/Recherchestatus → Ansprechpartner (optional) → Outreach → Deal (optional)
```

Ein Unternehmen muss ein vollwertiger Lead sein können — auch ohne Kontakt, ohne Entscheider und ohne Deal. Es muss durch Pipelines laufen, bewertet, gefiltert und bearbeitet werden können, solange nur Basisinformationen wie Website oder Impressum-Mail vorliegen.

## Produktprinzipien

1. **Company-first** statt Contact-first
2. **Metadata-driven** statt hardcoded
3. **Konfigurierbarkeit ist Kern**, kein späteres Add-on
4. **Custom Fields** mit echten Feldtypen, nicht nur Text
5. **Views, Pipelines, Phasen, Tabellen-Spalten und Kanban-Karten** kommen aus Konfiguration, nicht aus Code
6. **Settings** als professioneller Produktbereich
7. Weniger Features, aber richtig durchdacht
8. Keine halben Features, keine Fake-Konfigurierbarkeit
9. Architektur, die später kein massives Refactoring erzwingt

## Aktuelle Phase: Phase 0

**Dieses Repository befindet sich in Phase 0 — Repository-Fundament.**

In Phase 0 existiert bewusst **keine App-Funktionalität**. Es wurden keine UI-Komponenten, keine Supabase-Migrationen, kein Auth und kein CRUD implementiert.

Phase 0 liefert:

- Produkt- und Architekturspezifikation
- Datenmodell auf Spezifikationsebene
- Supabase- und RLS-Konzept
- Custom-Fields- und Pipeline-/View-Konzept
- AI-Coding-Regeln für Cursor
- Implementierungs-Roadmap und Definition of Done
- Projektstruktur mit Platzhalterordnern

## Was bewusst noch nicht implementiert ist

- Keine Frontend-App (React/Vite/Next o.ä.)
- Keine UI-Komponenten oder Design-System-Implementierung
- Keine Supabase-Migrationen oder produktiven Datenbanktabellen
- Kein Auth, kein Login
- Kein Companies-, Contacts- oder Deals-CRUD
- Keine Tabellen-, Kanban- oder Dashboard-Ansichten
- Keine hardcoded CRM-Felder oder Demo-Daten

UI/UX wird in einer separaten Phase mit Claude spezifiziert. Siehe `docs/ui-ux-brief-for-claude.md`.

## Geplanter Tech-Stack (Empfehlung, nicht final implementiert)

| Schicht | Empfehlung |
|---------|------------|
| Frontend | React + TypeScript + Vite |
| Backend / DB | Supabase (Postgres) |
| Auth | Supabase Auth |
| Hosting | TBD (z.B. Vercel/Netlify für Frontend) |

Finale Stack-Entscheidungen werden in Phase 1 getroffen und dokumentiert.

## Repository-Struktur

```
crm/
├── README.md                 # Dieses Dokument
├── AGENTS.md                 # Anleitung für AI-Agenten
├── DEVELOPMENT.md            # Entwicklungsrichtlinien
├── .env.example              # Environment-Variable-Platzhalter
├── docs/                     # Produktspezifikation und Architektur
│   ├── product-spec.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── custom-fields.md
│   ├── pipelines-and-views.md
│   ├── supabase-and-rls.md
│   ├── implementation-roadmap.md
│   ├── definitions-of-done.md
│   ├── ui-ux-brief-for-claude.md
│   ├── ai-development-workflow.md
│   └── glossary.md
├── .cursor/rules/            # Cursor Project Rules
├── supabase/                 # Platzhalter für spätere Supabase-Integration
├── src/                      # Platzhalter für späteren App-Code
└── tests/                    # Platzhalter für spätere Tests
```

## Wie spätere Entwicklung ablaufen soll

1. **Specs lesen** — `docs/product-spec.md`, `docs/architecture.md`, relevante Detail-Docs
2. **Cursor Rules prüfen** — `.cursor/rules/`
3. **Phase aus Roadmap wählen** — `docs/implementation-roadmap.md`
4. **Definition of Done prüfen** — `docs/definitions-of-done.md`
5. **Implementieren** — nur im Scope der aktiven Phase
6. **Docs aktualisieren** — bei Architektur- oder Modelländerungen

Details: `docs/ai-development-workflow.md` und `DEVELOPMENT.md`.

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [product-spec.md](docs/product-spec.md) | Produktvision, Kernobjekte, MVP-Grenze |
| [architecture.md](docs/architecture.md) | Technische Architektur, Schichten, Ordnerstruktur |
| [data-model.md](docs/data-model.md) | Geplantes Postgres-Datenmodell |
| [custom-fields.md](docs/custom-fields.md) | Custom-Fields-System, Feldtypen |
| [pipelines-and-views.md](docs/pipelines-and-views.md) | Pipelines, Stages, Views, Kanban, Tabellen |
| [supabase-and-rls.md](docs/supabase-and-rls.md) | Supabase, Auth, RLS, Migrationen |
| [implementation-roadmap.md](docs/implementation-roadmap.md) | Phasen 0–11 |
| [definitions-of-done.md](docs/definitions-of-done.md) | Qualitätskriterien pro Modul |
| [glossary.md](docs/glossary.md) | Fachbegriffe |

## Lizenz und Nutzung

Privates Projekt für Blumenthal Systems. Nicht für öffentliche Distribution vorgesehen.

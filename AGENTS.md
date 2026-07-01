# AGENTS.md — Anleitung für AI-Agenten

Dieses Dokument richtet sich an AI-Coding-Agenten (Cursor, Claude Code, etc.), die an diesem Repository arbeiten.

## Projektziel

Professionelles, **company-first B2B-Akquise-CRM** für Blumenthal Systems. Unternehmen sind das primäre Lead-Objekt. Kontakte und Deals sind optional. Das System ist **metadata-driven**: Pipelines, Stages, Custom Fields und Views kommen aus der Datenbank, nicht aus hardcoded Code.

## Aktuelle Phase: Phase 1

Phase 0 (Docs) und Phase 1 (Stack + Supabase) sind umgesetzt.

Phase 1 erlaubt **kein CRM** — nur technisches Gerüst und Health Check.

Phase 2 beginnt mit Auth, Workspaces, Profiles.

## Wichtigste Docs (in dieser Reihenfolge lesen)

1. `README.md` — Projektkontext und Phase
2. `docs/product-spec.md` — Was das Produkt ist und nicht ist
3. `docs/architecture.md` — Technische Leitplanken
4. `docs/data-model.md` — Geplantes Datenmodell
5. `docs/custom-fields.md` — Custom Fields als Kernsystem
6. `docs/pipelines-and-views.md` — Pipelines, Views, Kanban
7. `docs/supabase-and-rls.md` — Backend, Auth, Sicherheit
8. `docs/implementation-roadmap.md` — Aktuelle und nächste Phase
9. `docs/definitions-of-done.md` — Wann ein Modul wirklich fertig ist
10. `docs/ai-development-workflow.md` — Arbeitsweise mit AI

## Cursor Rules

Vor jeder Implementierung die relevanten Rules in `.cursor/rules/` prüfen:

| Rule | Zweck |
|------|-------|
| `001-product-principles` | Company-first, Produktqualität |
| `002-architecture-principles` | Metadata-driven, Schichttrennung |
| `003-supabase-and-security` | RLS, Workspace-Isolation |
| `004-custom-fields` | Feldtypen, Integration |
| `005-company-first-crm` | Unternehmen ohne Kontakt/Deal |
| `006-no-hardcoding` | Keine hardcoded Konfiguration |
| `007-quality-bar` | Keine halben Features |

## Was nicht gebaut werden darf (ohne explizite Anweisung)

- Keine UI-Komponenten oder Screens
- Kein Design-System
- Keine Supabase-Migrationen (bis Phase 1+)
- Kein Auth (bis Phase 2)
- Kein Companies/Contacts/Deals CRUD (bis Phase 3+)
- Keine Tabellen- oder Kanban-Ansichten (bis Phase 5/6)
- Keine hardcoded Pipelines, Stages, Custom Fields oder View-Spalten
- Keine Demo-Apps, Mock-Dashboards oder Tutorial-Code
- Keine vereinfachte „Contacts → Companies → Deals"-Logik

## Wie spätere Implementierung erfolgen soll

1. Aktive Phase in `docs/implementation-roadmap.md` identifizieren
2. Scope und Nicht-Scope der Phase respektieren
3. Akzeptanzkriterien und Definition of Done erfüllen
4. Architektur- und Datenmodell-Docs bei Abweichungen zuerst aktualisieren
5. Kleine, reviewbare Schritte — kein Big-Bang
6. Professionelle, langlebige Lösungen statt schneller Abkürzungen

## UI/UX

UI/UX wird **separat mit Claude** spezifiziert. Siehe `docs/ui-ux-brief-for-claude.md`.

Agenten sollen **keine visuelle UI designen oder implementieren**, bis UI/UX-Spezifikation vorliegt und die entsprechende Implementierungsphase aktiv ist.

## Sprache

Dokumentation und Kommentare: Deutsch bevorzugt (Produktkontext DACH). Code-Identifikatoren (Variablen, Tabellen, API): Englisch.

## Bei Unsicherheit

- Specs und Architecture Docs erneut lesen
- Langfristig saubere Lösung bevorzugen
- Nicht raten — dokumentieren und nachfragen
- Keine halben Features liefern

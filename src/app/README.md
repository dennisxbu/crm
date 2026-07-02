# src/app — App Shell

## Phase 1: Temporäre Status-Shell

`App.tsx` ist eine **technische Statusseite** — kein CRM-UI und keine Basis für spätere Screens.

**Was es ist:** Supabase-Health-Check + Env-Konfigurationsanzeige für die Entwicklungsumgebung.

**Was es nicht ist:**

- Kein finales CRM-Layout
- Kein Design-System-Seed
- Keine Vorlage für Company-Listen, Kanban oder Settings
- Keine Basis für das visuelle Design des Produkts

## Was hier ab Phase 2 entstehen wird

Ab Phase 2 wird in diesem Ordner die echte App-Shell aufgebaut:

- Auth Guard (prüft Session)
- Workspace Context Provider
- App-Routing (React Router oder ähnliches)
- Sidebar-Navigation (Companies, Settings, …)

Diese Shell wird **von Grund auf neu** nach `docs/ui-ux-brief-for-claude.md` gestaltet — nicht durch Erweiterung der Statusseite.

## Leitlinien für AI-Agenten

- Die Phase-1-Statusseite bleibt minimal bis Phase 2 explizit startet
- Kein Design-System, keine Component Library einführen
- Kein CRM-Screen aus `App.tsx` herauswachsen lassen
- UX-Entscheidungen folgen erst `docs/ui-ux-brief-for-claude.md`
- Roadmap-Phase immer prüfen: `docs/implementation-roadmap.md`

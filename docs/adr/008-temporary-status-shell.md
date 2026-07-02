# ADR-008: Phase-1-Statusseite als temporäre Shell

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Foundation Hardening vor Phase 2

## Context

Phase 1 etabliert eine technische Statusseite (`src/app/App.tsx`) für den lokalen Entwicklungs-Health-Check. Diese Seite zeigt Env-Konfiguration und Supabase-Verbindungsstatus.

Ohne explizite Dokumentation besteht das Risiko, dass AI-Agenten oder Entwickler diese Statusseite als Ausgangspunkt für CRM-UI-Entwicklung missverstehen und daraus Screens, Komponenten oder Designentscheidungen ableiten.

## Decision

`src/app/App.tsx` ist eine **temporäre technische Shell** ohne Produktcharakter:

1. Der Quellcode wird mit einem expliziten Kommentar markiert
2. `src/app/README.md` dokumentiert den temporären Charakter und die Leitlinien
3. Alle AI-Regeln (Cursor Rules, AGENTS.md, CLAUDE.md) enthalten den Hinweis
4. Die Statusseite bleibt minimal bis Phase 2 explizit startet

Die echte App-Shell entsteht in Phase 2 von Grund auf — basierend auf Auth Guard, Workspace Context und später dem UI/UX-Brief (`docs/ui-ux-brief-for-claude.md`).

## Consequences

### Positive

- Keine versehentliche Design-Ableitung aus der Statusseite
- Klare Orientierung für AI-Agenten: Statusseite = Foundation, nicht Produkt
- UI/UX-Qualitätsstandard bleibt unberührt von frühem Scaffolding

### Negative

- Kein visueller Fortschritt sichtbar bis Phase 2+ — akzeptabel für private Solo-Entwicklung

## Follow-up

- Phase 2 startet die App-Shell neu: Auth Guard, Workspace Provider, Navigation
- UX-Phase nach Phase 7: visuelles Design nach `docs/ui-ux-brief-for-claude.md`

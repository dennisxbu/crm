# ADR-007: Vite Environment Variable Naming

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Foundation Hardening vor Phase 2

## Context

Das Projekt nutzt **Vite** als Build-Tool, verwendete aber fälschlicherweise das `NEXT_PUBLIC_`-Präfix für Umgebungsvariablen. Dieses Präfix ist eine Next.js-Konvention und nicht mit Vite kompatibel — Vite erwartet standardmäßig `VITE_` als Präfix (oder ein explizit konfiguriertes `envPrefix`).

Der bisherige Workaround (`envPrefix: "NEXT_PUBLIC_"` in `vite.config.ts`) war funktional, aber irreführend für jeden Entwickler (und AI-Agenten), der Next.js-Konventionen erkennt und falsche Schlüsse über den Stack zieht.

## Decision

Alle Umgebungsvariablen dieses Projekts nutzen das **`VITE_`-Präfix**:

| Alt (falsch)                           | Neu (korrekt)            |
| -------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | `VITE_SUPABASE_URL`      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `VITE_SUPABASE_ANON_KEY` |

Gleichzeitig wird der Variablenname von `PUBLISHABLE_KEY` auf `ANON_KEY` korrigiert — „anon key" ist die offizielle Supabase-Bezeichnung, „publishable" war eine kurze Umbenennung durch Supabase, die nicht durchgesetzt wurde.

`vite.config.ts` nutzt kein `envPrefix` mehr (Standard: `VITE_`).

## Consequences

### Positive

- Konsistent mit Vite-Konventionen und Supabase-Dokumentation
- Keine Verwirrung für neue Entwickler oder AI-Agenten
- `import.meta.env.VITE_*` entspricht der Vite-Standard-TypeScript-Integration
- AI-Agenten erkennen den Stack korrekt als Vite-Projekt

### Negative

- Breaking für bestehende `.env.local`-Dateien — Entwickler müssen Variablennamen aktualisieren
- Einmaliger Migrationsaufwand (gering, da Phase 1)

## Follow-up

- Entwickler müssen `.env.local` aktualisieren: alte Keys umbenennen
- Remote Supabase-Projekte müssen entsprechend konfiguriert werden wenn deployed

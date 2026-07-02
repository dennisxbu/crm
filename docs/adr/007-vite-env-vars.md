# ADR-007: Vite Environment Variable Naming

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Foundation Hardening vor Phase 2; Supabase Remote-Projekt-Anbindung

## Context

Das Projekt nutzt **Vite** als Build-Tool, verwendete aber fälschlicherweise das `NEXT_PUBLIC_`-Präfix für Umgebungsvariablen. Dieses Präfix ist eine Next.js-Konvention und nicht mit Vite kompatibel — Vite erwartet standardmäßig `VITE_` als Präfix (oder ein explizit konfiguriertes `envPrefix`).

Der bisherige Workaround (`envPrefix: "NEXT_PUBLIC_"` in `vite.config.ts`) war funktional, aber irreführend für jeden Entwickler (und AI-Agenten), der Next.js-Konventionen erkennt und falsche Schlüsse über den Stack zieht.

Für die Anbindung an das gehostete Supabase-Projekt (`fzormgxabytjfnqjtruy`) nutzt das Dashboard den Begriff **Publishable key**. Die Env-Variable heißt daher `VITE_SUPABASE_PUBLISHABLE_KEY` — konsistent mit Supabase Project Settings, nicht mit dem internen API-Namen „anon key".

## Decision

Alle Umgebungsvariablen dieses Projekts nutzen das **`VITE_`-Präfix**:

| Alt (falsch)                             | Neu (korrekt)                   |
| ---------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`               | `VITE_SUPABASE_URL`             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`          | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_ANON_KEY` (Zwischenstand) | `VITE_SUPABASE_PUBLISHABLE_KEY` |

Frontend-Client (`src/shared/lib/supabase/client.ts`):

```ts
import.meta.env.VITE_SUPABASE_URL;
import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

`vite.config.ts` nutzt kein `envPrefix` mehr (Standard: `VITE_`).

Der Publishable Key ist öffentlich im Browser-Bundle — Zugriffsschutz erfolgt ausschließlich via Row Level Security (RLS). Niemals Secret Key oder Service Role Key ins Frontend.

## Consequences

### Positive

- Konsistent mit Vite-Konventionen und Supabase Dashboard (Publishable key)
- Keine Verwirrung für neue Entwickler oder AI-Agenten
- `import.meta.env.VITE_*` entspricht der Vite-Standard-TypeScript-Integration
- AI-Agenten erkennen den Stack korrekt als Vite-Projekt

### Negative

- Breaking für bestehende `.env.local`-Dateien — Entwickler müssen `VITE_SUPABASE_ANON_KEY` in `VITE_SUPABASE_PUBLISHABLE_KEY` umbenennen
- Einmaliger Migrationsaufwand (gering, da Phase 1)

## Follow-up

- Entwickler müssen `.env.local` aktualisieren: Key-Variable umbenennen
- Checkliste: [docs/supabase-connection-check.md](../supabase-connection-check.md)

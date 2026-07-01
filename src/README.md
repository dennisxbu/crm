# src/

Platzhalter für Anwendungscode ab **Phase 1**.

## Geplante Struktur

Siehe `docs/architecture.md`:

```
src/
├── app/                 # Routing, Providers, App Shell
├── features/            # Domänen: companies, settings, auth, …
├── shared/              # Components, hooks, lib, types
└── main.tsx
```

## Phase 0

**Kein App-Code.** Kein `package.json`, kein Framework init.

Stack-Empfehlung (Phase 1): React + TypeScript + Vite + Supabase Client.

## Prinzipien beim Start

- Feature-Ordner nach Domäne, nicht nach UI-Pattern alone
- Generic Field Renderers in `shared/`
- Keine hardcoded CRM-Konfiguration in Components

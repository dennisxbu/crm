# tests/

Platzhalter für Tests ab **Phase 1/11**.

## Geplante Struktur

```
tests/
├── unit/                # Field validation, view config parsing, …
└── integration/         # Supabase queries + RLS
```

## Prioritäten (Phase 11)

1. RLS — Cross-workspace Zugriff unmöglich
2. Custom Field typed storage
3. View config load/apply
4. Pipeline position updates

## Phase 0

Keine Tests. Test-Framework wird mit Stack in Phase 1 gewählt (Empfehlung: Vitest).

Definition of Done für Test-Expectations: `docs/definitions-of-done.md`.

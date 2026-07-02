# ADR-009: Field Type Contract für Custom Fields

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Dennis (Solo-Dev)  
**Context:** Foundation Hardening vor Phase 2

## Context

Das Custom-Field-System ist metadata-driven: Feldtypen (`text`, `select`, `rating`, …) steuern Rendering, Validierung und Filterlogik. Ohne klaren Contract für jeden Feldtyp besteht das Risiko, dass:

- Neue Feldtypen als Sonderfall hinzugefügt werden statt systematisch integriert zu werden
- Implementierungen in Detail, Table, Kanban, Filter divergieren
- MVP-Typen sauber implementiert sind, Nicht-MVP-Typen aber später einen Architekturbruch erfordern
- AI-Agenten `switch(field.label)` statt `switch(field.field_type)` implementieren

## Decision

Jeder Feldtyp muss einen vollständigen, verbindlichen **Field Type Contract** erfüllen:

| Contract-Aspekt           | Beschreibung                        |
| ------------------------- | ----------------------------------- |
| `storage_column`          | Welche `custom_field_values`-Spalte |
| `input_component`         | Edit-Widget-Verantwortlichkeit      |
| `display_component`       | Display-Renderer-Verantwortlichkeit |
| `validation_rules`        | Client-seitig vor Persistenz        |
| `filter_operators`        | Erlaubte Operatoren aus Registry    |
| `sort_behavior`           | Sortier-Logik oder `none`           |
| `empty_state`             | Anzeige bei null/fehlendem Wert     |
| `settings_behavior`       | Konfigurierbar in Settings          |
| `migration_compatibility` | Wertmigration bei Feldänderungen    |

### Implementation

- Eine `FieldTypeHandler`-Implementierung pro `field_type`
- Registry keyed by `field_type` — kein `switch(fieldName)`, kein `if (field.label === ...)`
- DB-Schema (`custom_field_values`) ist vollständig vorbereitet für alle 17 Feldtypen
- MVP bietet nur einen Subset in der UI an — DB und TypeScript sind für alle vorbereitet

### Neue Feldtypen

Neue Feldtypen:

1. Contract vollständig definieren (in `docs/custom-fields.md`)
2. `FieldTypeHandler` implementieren
3. In Field Registry registrieren
4. Implementation Matrix aktualisieren

**Niemals:** Sonderfall-Code außerhalb der Registry.

## Consequences

### Positive

- Konsistente Implementierung über alle UI-Bereiche hinweg
- Neue Feldtypen ohne Architekturbruch ergänzbar
- AI-Agenten erkennen das Muster und folgen es korrekt
- DB-Schema muss nicht pro Feldtyp erweitert werden

### Negative

- Mehr Upfront-Spec-Arbeit für Feldtypen, die erst später UI-seitig implementiert werden
- Contract muss bei jedem Feldtyp vollständig sein, auch wenn Details erst in späteren Phasen finalisiert werden

## Detail-Dokumentation

`docs/custom-fields.md` — Sektion „Field Type Contract" und „Field Type Implementation Matrix"

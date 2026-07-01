# No Hardcoding

Konfiguration muss aus **Datenbank/Views** kommen, nicht aus Code-Konstanten.

## Regeln

- Keine hardcoded **Pipelines** oder **Stages** (Seed-Daten in DB ok)
- Keine hardcoded **Custom Field** Definitionen im Frontend
- Keine hardcoded **Tabellen-Spalten** oder **Kanban-Kartenfelder**
- Kanban-Spalten = `pipeline_stages`; Spalten = `views.config.columns`
- Default Views als Seed — danach editierbar
- Vor Views/Pipelines: `docs/pipelines-and-views.md`

## Nicht tun

```typescript
// VERBOTEN als einzige Quelle
const STAGES = ['Rohlead', 'Qualifiziert', ...];
const COLUMNS = ['name', 'website', 'email'];
```

## Erlaubt

- Seed SQL für initiale Defaults
- Field Registry die Metadata **lädt**, nicht ersetzt

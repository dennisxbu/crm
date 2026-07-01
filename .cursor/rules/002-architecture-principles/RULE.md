# Architecture Principles

## Regeln

- **Metadata-driven:** Pipelines, Stages, Custom Fields, Views aus DB — nicht hardcoded
- **Konfiguration aus DB**, nicht aus Frontend-Konstanten
- Trennung: **System Fields** | **Custom Fields** | **View Config** | **UI State**
- Weniger Features, aber sauber und generisch (Field Registry, View Engine)
- Vor Implementierung: `docs/architecture.md` und `docs/data-model.md` lesen

## Nicht tun

- Pipeline-Stages als TypeScript-Enum als einzige Quelle
- View-Spalten fest in Komponenten verdrahten
- Custom Field Werte als untypisierte Strings speichern
- UI State in CRM-Entity-Tabellen mischen

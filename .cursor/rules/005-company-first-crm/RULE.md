# Company-first CRM

## Regeln

- Unternehmen dürfen **ohne Kontakt** existieren und durch Pipelines laufen
- Unternehmen dürfen **ohne Deal** existieren — normal in frühen Phasen
- **Activities** dürfen direkt am Unternehmen hängen
- **Contact Discovery Status** ist Teil des Workflows (`unknown`, `researching`, `found`, …)
- **Deals** entstehen erst bei konkreter Verkaufschance — nicht bei Lead-Erfassung
- Vor Implementierung: `docs/product-spec.md`, `docs/pipelines-and-views.md`

## Nicht tun

- Wizard „Schritt 1: Contact anlegen"
- Pipeline-Fortschritt an Contact koppeln
- Deal-Pflicht bei Company Create
- Empty Contact als Blocker für Kanban/Table

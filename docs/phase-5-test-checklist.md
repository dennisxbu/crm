# Phase 5 — Test Checklist (Company Table View)

Manuelle Prüfung nach Abschluss von Phase 5.

## Voraussetzungen

- [ ] Migration `20260703170000_phase5_views.sql` angewendet
- [ ] `.env.local` mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `pnpm lint` grün
- [ ] `pnpm build` grün

## Auth & Workspace

- [ ] Login funktioniert
- [ ] Workspace-Kontext funktioniert
- [ ] Default Company Table View wird erstellt/geladen (`ensure_default_company_table_view`)

## Table View

- [ ] Companies werden geladen (ohne Contact/Deal)
- [ ] Spalten kommen aus `views.config.columns` (nicht hardcoded JSX)
- [ ] Systemfelder rendern korrekt (name, website, contact_discovery_status, created_at)
- [ ] Custom Field Spalte rendern, wenn in `views.config` eingetragen
- [ ] Ungültige/gelöschte `custom:<uuid>` refs crashen nicht („Fehlendes Feld")
- [ ] Klick auf Firmenname öffnet Detail
- [ ] Sortierung per Spaltenkopf funktioniert (mindestens Systemfelder)
- [ ] Filter aus `views.config.filters` werden angewendet (wenn konfiguriert)

## Regression Phase 4

- [ ] Custom Field Settings funktionieren weiter
- [ ] Company Detail + Custom Fields funktionieren weiter
- [ ] Company ohne Custom Field Values bleibt nutzbar

## Scope-Check

- [ ] Kein Kanban
- [ ] Keine Pipelines
- [ ] Kein View Editor UI
- [ ] Keine Contacts/Deals

## Security

- [ ] RLS: Views nur im eigenen Workspace sichtbar
- [ ] Kein Service Role Key im Frontend

## Ergebnis

| Datum | Tester | Ergebnis | Notizen |
| ----- | ------ | -------- | ------- |
|       |        |          |         |

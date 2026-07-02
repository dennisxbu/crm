# Phase 3 — Test Checklist

Manuelle Prüfung des Company-Core. Keine Custom Fields, Pipelines oder Views erwartet.

## Voraussetzungen

1. `.env.local` korrekt gesetzt (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
2. Migration angewendet:

```bash
# Lokal:
pnpm db:reset

# Remote:
npx supabase db push
```

## Build checks

```bash
pnpm install
pnpm lint
pnpm build
```

## Dev server

```bash
pnpm dev
```

## Auth & Workspace (Voraussetzung)

- [ ] User registrieren / einloggen
- [ ] Initial Workspace vorhanden
- [ ] Session bleibt nach Reload erhalten

## Company Create

- [ ] Company mit **nur Name** anlegen (keine weiteren Felder)
- [ ] Company erscheint in der Liste
- [ ] Default `contact_discovery_status = unknown`
- [ ] Default `lifecycle_status = lead`
- [ ] `created_by` und `owner_id` gesetzt

## Company-first

- [ ] Kein Kontakt erforderlich
- [ ] Kein Deal erforderlich
- [ ] Kein versteckter Zwang zu Contacts/Deals im Formular oder Code

## Company Edit

- [ ] Company aus Liste auswählen
- [ ] Felder bearbeiten und speichern
- [ ] `updated_at` ändert sich
- [ ] Nach Reload sind Änderungen sichtbar

## Company Archive

- [ ] Archivieren setzt `archived_at`
- [ ] Archivierte Company verschwindet aus Standard-Liste
- [ ] Kein Hard Delete in UI

## RLS (grob)

- [ ] User A sieht keine Companies von User B (anderer Workspace)
- [ ] Anonymer Zugriff auf `companies` ohne Policy schlägt fehl

## Scope check

- [ ] Keine Contacts-UI oder -Tabelle
- [ ] Keine Deals
- [ ] Keine Custom Fields
- [ ] Keine Pipelines / Kanban / konfigurierbare Views
- [ ] Keine Settings-UI
- [ ] Keine Activities

## Security grep

```bash
grep -R "NEXT_PUBLIC_SUPABASE" .
grep -R "VITE_SUPABASE_ANON_KEY" .
grep -R "service_role" src .env.example README.md DEVELOPMENT.md docs
```

## Scope grep

```bash
grep -R "custom_fields\|pipeline_stages\|entity_pipeline_positions\|contacts\|deals" src supabase/migrations
```

Erwartung: keine Implementierung dieser Features — Doku-Erwähnungen ok.

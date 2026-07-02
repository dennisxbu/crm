# Phase 4 — Test Checklist (Custom Fields Core)

Manuelle Prüfung nach Abschluss von Phase 4. Kein Ersatz für spätere automatisierte Tests (Phase 11).

## Voraussetzungen

- [ ] Migration `20260703160000_phase4_custom_fields.sql` angewendet (`pnpm db:reset` lokal oder `npx supabase db push` remote)
- [ ] `.env.local` mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `pnpm lint` grün
- [ ] `pnpm build` grün

## Auth & Workspace

- [ ] User login funktioniert
- [ ] Workspace vorhanden
- [ ] Default Company Custom Fields angelegt (automatisch bei neuem Workspace oder Button „Default-Felder sicherstellen“)

## Custom Field Settings

- [ ] Liste aller Company Custom Fields sichtbar (sortiert nach `order_index`)
- [ ] Neues Custom Field erstellen (Name, Key, Typ)
- [ ] Feld bearbeiten (Name, Beschreibung, Required, …)
- [ ] Feld archivieren — verschwindet aus Standardliste, Werte bleiben
- [ ] Select-Feld: Option hinzufügen
- [ ] Select-Feld: Option umbenennen (value stabil)
- [ ] Select-Feld: Option archivieren

## Feldtypen — Werte speichern (Company Detail)

- [ ] Text Field speichern
- [ ] Number Field speichern
- [ ] Date Field speichern
- [ ] Boolean Field speichern
- [ ] Select Field mit Option speichern
- [ ] Multi Select Field speichern
- [ ] Email Field validieren und speichern
- [ ] Phone Field speichern und als `tel:`-Link anzeigen
- [ ] URL Field normalisieren (`https://`) und als Link anzeigen
- [ ] Rating Field speichern (Default: Fit Score / Pain Score)

## Company Detail Integration

- [ ] System Fields und Custom Fields getrennt, konsistent dargestellt
- [ ] Custom Fields generisch über Field Type Handler gerendert
- [ ] Leerer Wert löscht Value-Row (kein Fake-Null in UI)
- [ ] Company ohne Custom Field Values bleibt voll nutzbar
- [ ] Company ohne Contact/Deal bleibt nutzbar

## Default Fields (generisch, kein Sonderfall)

- [ ] `priority`, `fit_score`, `pain_score` verhalten sich wie jedes andere Custom Field
- [ ] Kein hardcoded Rendering nach Feldname im Source (`grep` siehe unten)

## Scope-Check (bewusst nicht gebaut)

- [ ] Keine Table View / View Engine
- [ ] Kein Kanban
- [ ] Keine Pipelines / Stages
- [ ] Keine Contacts/Deals Custom Fields in UI

## Security / Env Greps

```bash
grep -R "NEXT_PUBLIC_SUPABASE" .
grep -R "VITE_SUPABASE_ANON_KEY" . --include="*.ts" --include="*.tsx" --include="*.md" --include="*.mdc"
grep -R "service_role" src .env.example README.md DEVELOPMENT.md docs AGENTS.md CLAUDE.md .cursor || true
```

Erwartung: Keine aktiven `NEXT_PUBLIC_*` im Code; aktive Docs/Code nutzen `VITE_SUPABASE_PUBLISHABLE_KEY`; kein Service Role im Frontend.

## Hardcoding Greps

```bash
grep -R "field.key ===" src/features/custom-fields src/features/companies || true
grep -R "field.name ===" src/features/custom-fields src/features/companies || true
grep -R "priority" src/features/custom-fields src/features/companies || true
grep -R "fit_score" src/features/custom-fields src/features/companies || true
grep -R "pain_score" src/features/custom-fields src/features/companies || true
```

Erwartung: `priority`, `fit_score`, `pain_score` nur in Migration/Seed/Docs — nicht in Rendering oder Save-Logik.

## Ergebnis

| Datum | Tester | Ergebnis | Notizen |
| ----- | ------ | -------- | ------- |
|       |        |          |         |

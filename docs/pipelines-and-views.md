# Pipelines und Views

Pipelines steuern **Prozessfortschritt** (Kanban). Views steuern **Darstellung** (Tabelle, Kanban-Kartenlayout, Filter, Sort). Beides kommt aus der Datenbank — nichts davon ist hardcoded im Frontend.

## Pipeline-Konzept

### Entity-Typen mit Pipelines

| Entity | Pipeline | Beispiel |
|--------|----------|----------|
| `company` | Company-Pipeline | Akquise-Workflow |
| `deal` | Deal-Pipeline | Verkaufsprozess |

Contacts haben **keine** eigene Pipeline in MVP. Kontakt-Recherche läuft über `contact_discovery_status` am Company.

### Pipeline-Struktur

```
pipelines (entity_type, is_default)
    └── pipeline_stages (name, color, sort_order, stage_type)
            └── entity_pipeline_positions (entity_id, sort_order)
```

- Eine Entity kann pro Pipeline genau **eine** Position haben
- Kanban-Spalten = `pipeline_stages` der gewählten Pipeline, sortiert nach `sort_order`
- Karten in einer Spalte sortiert nach `entity_pipeline_positions.sort_order`

### Stage Types

| stage_type | Bedeutung |
|------------|-----------|
| `open` | Aktive Phase |
| `won` | Erfolgreich abgeschlossen (z.B. Kunde) |
| `lost` | Disqualifiziert / verloren |

Won/Lost-Stages ermöglichen Filter („alle offenen Leads") und später Reporting.

## entity_pipeline_positions

Verknüpft beliebige Entity (`company`, `deal`) mit Stage.

**Drag & Drop im Kanban:**

1. User zieht Karte von Stage A nach Stage B
2. Update `pipeline_stage_id`, `sort_order`, `entered_at`
3. Optional: Activity log „Stage gewechselt"

**Ohne Deal, ohne Kontakt:** Company kann in Company-Pipeline sein — Position hängt nur an `company.id`.

## Company-Pipelines vs. Deal-Pipelines

Unabhängig voneinander:

- Company in „Rohlead" (Company-Pipeline)
- Später Deal in „Angebot erstellt" (Deal-Pipeline)

Ein Unternehmen kann in late-stage Company-Pipeline sein ohne jemals einen Deal zu haben (z.B. „Kunde" als Company Won-Stage für Retainer-Kunden ohne klassischen Deal).

## Kanban-Logik

### Datenfluss

```
View (view_type=kanban, pipeline_id=X)
    → load pipeline_stages for X
    → load entity_pipeline_positions grouped by stage_id
    → load entities (companies) with field values for card_fields
    → render columns + cards
```

### Kanban-Kartenfelder (`card_fields`)

Kommen aus `views.config.card_fields` — Liste von `field_ref`:

```json
"card_fields": [
  "system:website",
  "system:contact_discovery_status",
  "custom:abc-123-uuid"
]
```

Kein hardcoded „zeige immer Website". Default View kann per Seed `card_fields` setzen — danach editierbar in Settings.

### Leere Spalten

Stages ohne Entities zeigen Empty Column State — Spalte bleibt sichtbar (Stage existiert in DB).

## Tabellenansichten

### Spalten aus View-Config

```json
"columns": [
  { "field_ref": "system:name", "width": 260, "visible": true },
  { "field_ref": "system:website", "width": 180, "visible": true },
  { "field_ref": "custom:uuid", "width": 100, "visible": true }
]
```

Table Component iteriert `columns`, resolved Field Metadata, rendert Zelle via Field Type Handler.

### Sortierung

Gespeichert in `views.config.sort`:

```json
"sort": [
  { "field_ref": "system:created_at", "direction": "desc" }
]
```

Sort muss System- und Custom Fields unterstützen (Custom via join/index auf value columns).

### Filter

Gespeichert in `views.config.filters`:

```json
"filters": [
  {
    "field_ref": "system:contact_discovery_status",
    "operator": "is",
    "value": "unknown"
  },
  {
    "field_ref": "custom:uuid",
    "operator": "gte",
    "value": 7
  }
]
```

Filter-Operatoren abhängig von `field_type` (siehe custom-fields.md).

### Gruppierung

Optional später:

```json
"group_by": { "field_ref": "custom:industry_field" }
```

Nicht MVP-kritisch — in Spec reserviert.

## Gespeicherte Views

| Eigenschaft | Beschreibung |
|-------------|--------------|
| `name` | „Meine qualifizierten Leads" |
| `entity_type` | `company` |
| `view_type` | `table` oder `kanban` |
| `pipeline_id` | Pflicht bei kanban |
| `is_default` | Eine Default-View pro entity+view_type |
| `config` | columns, filters, sort, card_fields |

Nutzer kann mehrere Views anlegen. Wechsel = UI State (kein neues DB-Objekt).

## Default Views

Bei Workspace-Setup (Seed):

1. **Companies — Table (Default)** — Spalten: name, website, contact_discovery_status, pipeline stage, created_at
2. **Companies — Kanban (Default)** — Default Company Pipeline, card_fields: website, contact_discovery_status

Defaults sind **Daten**, nicht Code. Nutzer kann Spalten entfernen, Filter hinzufügen, View umbenennen.

## System Fields in Views

Referenzformat: `system:{column_name}`

Beispiele:

- `system:name`
- `system:website`
- `system:contact_discovery_status`
- `system:pipeline_stage` — virtual: resolved via join auf entity_pipeline_positions
- `system:created_at`

Virtual Fields (pipeline_stage) brauchen Field Registry Eintrag mit custom resolver — trotzdem metadata-driven, nicht hardcoded Spaltenliste.

## Custom Fields in Views

Referenzformat: `custom:{custom_field_id}`

Metadata aus `custom_fields` join. Gelöschte/deaktivierte Fields: Spalte in View als „Feld nicht mehr verfügbar" oder auto-remove — Produktentscheidung Phase 7.

## Seed-Konzept: Default Company Pipeline

| sort_order | name | stage_type | Farbe (Beispiel) |
|------------|------|------------|------------------|
| 0 | Rohlead | open | gray |
| 1 | Qualifiziert | open | blue |
| 2 | Ready to Call | open | cyan |
| 3 | Nicht erreicht | open | orange |
| 4 | In Gespräch | open | purple |
| 5 | Follow-up | open | yellow |
| 6 | Disqualifiziert | lost | red |
| 7 | Kunde / Gewonnen | won | green |

Seed in `supabase/seed.sql` (Phase 1+) — **nicht** als Enum im Code.

## Seed-Konzept: Default Deal Pipeline

| sort_order | name | stage_type |
|------------|------|------------|
| 0 | Bedarf erkannt | open |
| 1 | Erstgespräch geplant | open |
| 2 | Analyse / Diagnose | open |
| 3 | Angebot erstellt | open |
| 4 | Verhandlung | open |
| 5 | Closed Won | won |
| 6 | Closed Lost | lost |

Phase 9 relevant — Seed kann früher angelegt werden, UI erst später.

## Settings-Integration

| Setting | Verwaltet |
|---------|-----------|
| Pipelines | Name, entity_type, default flag |
| Stages | Name, Farbe, Reihenfolge, won/lost |
| Views | Name, Typ, Spalten, Filter, card_fields |
| Custom Fields | siehe custom-fields.md |

Reihenfolge in Settings-Navigation (UX Phase): Pipelines → Custom Fields → Views.

## Anti-Patterns

- `const STAGES = ['Rohlead', ...]` im Frontend
- Kanban-Spalten aus hardcoded Array
- Table columns als feste `<th>Name</th><th>Website</th>`
- Filter nur client-side auf hardcoded Felder
- View-Wechsel ändert hardcoded Layout statt config

## Akzeptanz (Pipeline + View)

Siehe `docs/definitions-of-done.md` — Kurzfassung:

- Neue Stage in Settings → erscheint in Kanban ohne Deploy
- Neue Custom Field + in View config → erscheint in Tabelle
- Filter speichern und laden reproduzierbar
- Company ohne Kontakt in Kanban voll funktionsfähig

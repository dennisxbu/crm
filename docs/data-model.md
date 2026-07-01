# Datenmodell — Spezifikation

Dieses Dokument beschreibt das **geplante** Postgres-Datenmodell auf Spezifikationsebene. Es sind noch keine Migrationen implementiert. Tabellen- und Spaltennamen sind Englisch (Konvention für Code und DB).

## Design-Prinzipien

1. **Workspace-scoped** — fast alle CRM-Tabellen haben `workspace_id`
2. **Company-first** — `companies` unabhängig von `contacts` und `deals`
3. **Metadata-driven** — Pipelines, Custom Fields, Views in Config-Tabellen
4. **Typed custom values** — keine reinen Text-Blobs für alle Feldtypen
5. **RLS auf allen CRM-Daten** — siehe `docs/supabase-and-rls.md`

## Entity-Relationship (vereinfacht)

```
workspaces
├── profiles (via workspace_members)
├── companies ──┬── contacts (optional)
│               ├── deals (optional)
│               ├── entity_pipeline_positions
│               ├── custom_field_values
│               ├── entity_tags
│               └── activities
├── pipelines → pipeline_stages
├── custom_fields → custom_field_options
└── views
```

---

## 1. workspaces

### Zweck

Oberste Isolationseinheit. Alle CRM-Daten gehören zu genau einem Workspace.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `name` | text | Anzeigename |
| `slug` | text unique | URL-freundlich |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Beziehungen

- 1:n zu allen CRM-Entitäten
- n:m zu `profiles` über `workspace_members`

### Constraints

- `slug` unique, not null
- `name` not null

### Index-Ideen

- `slug` (unique index)

### RLS

- Nutzer sieht nur Workspaces, in denen er Member ist

### Produktnutzung

Solo-Nutzung: ein Workspace. Technische Basis für spätere Erweiterung.

---

## 2. profiles

### Zweck

Erweiterung von `auth.users` mit CRM-relevanten Profildaten.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | Spiegel aus Auth |
| `full_name` | text | Anzeigename |
| `avatar_url` | text nullable | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Beziehungen

- 1:1 mit `auth.users`
- n:m mit `workspaces` über `workspace_members`

### Constraints

- `id` FK → `auth.users(id)` on delete cascade

### RLS

- Nutzer liest/aktualisiert eigenes Profil
- Workspace-Members sehen ggf. Namen anderer Members (später)

### Produktnutzung

Anzeige in UI, Zuordnung bei `user`-Typ Custom Fields.

---

## workspace_members (Hilfstabelle)

| Feld | Typ |
|------|-----|
| `workspace_id` | uuid FK |
| `user_id` | uuid FK → profiles |
| `role` | text enum (`owner`, `member`) |
| PK | (workspace_id, user_id) |

---

## 3. companies

### Zweck

**Primäres Lead-Objekt.** Ein Unternehmen ist ein vollwertiger Lead — mit oder ohne Kontakt, mit oder ohne Deal.

### Wichtige Felder (System Fields)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `name` | text | Firmenname (required) |
| `website` | text nullable | |
| `phone` | text nullable | Zentrale / Impressum |
| `email` | text nullable | Generische / Impressum-Mail |
| `linkedin_url` | text nullable | Firmen-LinkedIn |
| `industry` | text nullable | Branche |
| `employee_count_range` | text nullable | z.B. „1-10", „11-50" |
| `contact_discovery_status` | text enum | `unknown`, `researching`, `found`, `not_applicable` |
| `lifecycle_status` | text enum nullable | z.B. `lead`, `prospect`, `customer`, `disqualified` |
| `notes_summary` | text nullable | Kurznotiz (Detail: Activities) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `created_by` | uuid FK → profiles nullable | |

### Beziehungen

- n:1 `workspaces`
- 1:n `contacts` (optional)
- 1:n `deals` (optional)
- 1:n `activities`
- 1:n `custom_field_values`
- 1:n `entity_pipeline_positions` (typisch 1 active company pipeline)
- n:m `tags` via `entity_tags`

### Constraints

- `workspace_id`, `name` not null
- `contact_discovery_status` check constraint oder enum
- Unique optional: `(workspace_id, name)` — Produktentscheidung (Duplikat-Warnung vs. erlaubt)

### Index-Ideen

- `(workspace_id, created_at desc)` — Listen
- `(workspace_id, name)` — Suche
- `(workspace_id, contact_discovery_status)` — Filter
- GIN/trigram auf `name` für Suche (später)

### RLS

- Workspace-Member CRUD innerhalb eigenes workspace_id

### Produktnutzung

Zentrale Entity für Akquise. Kann allein durch Pipeline laufen. `contact_discovery_status` abbildet Recherche-Workflow ohne erzwungenen Kontakt.

---

## 4. contacts

### Zweck

Optionale Personen an einem Unternehmen. Nicht Voraussetzung für Company-Lead-Status.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | Denormalisiert für RLS |
| `company_id` | uuid FK → companies | Required |
| `first_name` | text | |
| `last_name` | text | |
| `email` | text nullable | |
| `phone` | text nullable | |
| `job_title` | text nullable | |
| `linkedin_url` | text nullable | |
| `is_primary` | boolean default false | Hauptansprechpartner |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Beziehungen

- n:1 `companies`
- 1:n `activities` (optional)
- 1:n `deals` als primary_contact (optional)

### Constraints

- `company_id` not null
- Max one `is_primary = true` per company (partial unique index)

### RLS

- Via workspace_id

### Produktnutzung

Phase 8+. Outreach kann später an Kontakt gebunden werden, muss aber nicht.

---

## 5. deals

### Zweck

Optionale Verkaufschance. Entsteht bei erkennbarem Bedarf — nicht bei jedem Company-Lead.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `company_id` | uuid FK | Required |
| `contact_id` | uuid FK nullable | |
| `title` | text | Deal-Name |
| `value` | numeric nullable | Betrag |
| `currency` | text default 'EUR' | |
| `expected_close_date` | date nullable | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Pipeline-Position über `entity_pipeline_positions` (entity_type = `deal`).

### Beziehungen

- n:1 `companies`
- n:1 `contacts` (optional)
- 1:n `activities`
- 1:n `custom_field_values`

### RLS

- workspace-scoped

### Produktnutzung

Phase 9+. Eigene Deal-Pipeline unabhängig von Company-Pipeline.

---

## 6. pipelines

### Zweck

Konfigurierbare Prozessketten pro Entity-Typ. **Nicht hardcoded.**

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `name` | text | z.B. „Company Akquise" |
| `entity_type` | text enum | `company`, `deal` |
| `is_default` | boolean | Default-Pipeline für Entity-Typ |
| `sort_order` | int | |
| `created_at` | timestamptz | |

### Beziehungen

- 1:n `pipeline_stages`
- 1:n `entity_pipeline_positions`

### Constraints

- `(workspace_id, entity_type)` where is_default — max one default (partial unique)
- `entity_type` check

### Produktnutzung

Settings: Pipeline anlegen, umbenennen. Kanban-Spalten kommen aus zugehöriger Pipeline.

---

## 7. pipeline_stages

### Zweck

Phasen innerhalb einer Pipeline. Kanban-Spalten = Stages dieser Pipeline.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `pipeline_id` | uuid FK | |
| `workspace_id` | uuid FK | Denormalisiert für RLS |
| `name` | text | z.B. „Rohlead" |
| `color` | text | Hex oder Token |
| `sort_order` | int | Spaltenreihenfolge |
| `stage_type` | text enum | `open`, `won`, `lost` |
| `created_at` | timestamptz | |

### Constraints

- `sort_order` unique per pipeline
- Mindestens eine `open` stage pro pipeline

### Index-Ideen

- `(pipeline_id, sort_order)`

### Produktnutzung

Drag & Drop zwischen Stages aktualisiert `entity_pipeline_positions`. Won/Lost für Reporting und Filter.

---

## 8. entity_pipeline_positions

### Zweck

Position einer Entity in einer Pipeline-Stage. Trennt Pipeline-Logik von Entity-Tabelle.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `entity_type` | text | `company`, `deal` |
| `entity_id` | uuid | Polymorphic ref |
| `pipeline_id` | uuid FK | |
| `pipeline_stage_id` | uuid FK | |
| `sort_order` | int | Order innerhalb Spalte |
| `entered_at` | timestamptz | Stage-Wechsel |
| `updated_at` | timestamptz | |

### Constraints

- Unique `(entity_type, entity_id, pipeline_id)` — eine Position pro Pipeline
- FK pipeline_stage muss zur pipeline_id gehören (check via trigger oder app)

### Index-Ideen

- `(pipeline_stage_id, sort_order)` — Kanban column query
- `(entity_type, entity_id)`

### Produktnutzung

Kanban drag updates `pipeline_stage_id` + `sort_order`. Company kann in Company-Pipeline sein ohne Deal.

---

## 9. custom_fields

### Zweck

Metadaten definierter Custom Fields pro Entity-Typ. **Kern des metadata-driven Systems.**

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `entity_type` | text | `company`, `contact`, `deal` |
| `field_key` | text | Stable key, z.B. `icp_score` |
| `label` | text | Anzeigename |
| `field_type` | text enum | siehe custom-fields.md |
| `description` | text nullable | Hilfetext |
| `is_required` | boolean | |
| `is_filterable` | boolean | Override default |
| `is_sortable` | boolean | |
| `config` | jsonb | Typ-spezifisch (rating max, currency default, …) |
| `sort_order` | int | Settings-Reihenfolge |
| `created_at` | timestamptz | |

### Constraints

- Unique `(workspace_id, entity_type, field_key)`

### Produktnutzung

Settings → Custom Fields. Frontend lädt Metadata und rendert generisch.

---

## 10. custom_field_options

### Zweck

Optionen für `select` und `multi_select` Custom Fields.

### Wichtige Felder

| Feld | Typ |
|------|-----|
| `id` | uuid PK |
| `custom_field_id` | uuid FK |
| `workspace_id` | uuid FK |
| `label` | text |
| `value` | text | Stable value |
| `color` | text nullable |
| `sort_order` | int |

### Constraints

- Unique `(custom_field_id, value)`
- FK cascade on field delete — Produktentscheidung: soft delete field statt hard delete

### Produktnutzung

Optionen in Settings verwalten. Bestehende Werte bei Label-Änderung erhalten.

---

## 11. custom_field_values

### Zweck

Typgerechte Werte pro Entity-Instanz.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `custom_field_id` | uuid FK | |
| `entity_type` | text | |
| `entity_id` | uuid | |
| `value_text` | text nullable | text, email, phone, url, select value |
| `value_number` | numeric nullable | number, currency, percentage, rating |
| `value_boolean` | boolean nullable | |
| `value_date` | date nullable | |
| `value_datetime` | timestamptz nullable | |
| `value_json` | jsonb nullable | multi_select, relation, complex |
| `updated_at` | timestamptz | |

### Constraints

- Unique `(custom_field_id, entity_type, entity_id)`
- Check: genau eine value-Spalte passend zum field_type (DB trigger oder app validation)

### Index-Ideen

- `(entity_type, entity_id)` — load all values for entity
- `(custom_field_id, value_number)` — sort/filter numbers
- `(custom_field_id, value_date)` — date filters

### Produktnutzung

Detail edit, table cell, kanban card field, filter queries.

---

## 12. views

### Zweck

Gespeicherte Ansichtskonfiguration für Table oder Kanban.

### Wichtige Felder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | uuid PK | |
| `workspace_id` | uuid FK | |
| `name` | text | |
| `entity_type` | text | `company`, `deal`, … |
| `view_type` | text enum | `table`, `kanban` |
| `pipeline_id` | uuid FK nullable | Required for kanban |
| `is_default` | boolean | |
| `config` | jsonb | Siehe pipelines-and-views.md |
| `created_by` | uuid FK |
| `created_at` | timestamptz | |

### config (JSONB Struktur — Spezifikation)

```json
{
  "columns": [
    { "field_ref": "system:name", "width": 240, "visible": true },
    { "field_ref": "custom:uuid", "width": 120, "visible": true }
  ],
  "card_fields": ["system:website", "custom:uuid"],
  "filters": [],
  "sort": [{ "field_ref": "system:created_at", "direction": "desc" }],
  "group_by": null
}
```

### Constraints

- Max one default per (workspace, entity_type, view_type) optional

### Produktnutzung

Nutzer wählt View → UI rendert aus config. Keine hardcoded Spalten im Code.

---

## 13. activities

### Zweck

Aktivitäten, Notizen, Follow-ups — primär am Unternehmen.

### Wichtige Felder

| Feld | Typ |
|------|-----|
| `id` | uuid PK |
| `workspace_id` | uuid FK |
| `entity_type` | text | `company`, `contact`, `deal` |
| `entity_id` | uuid |
| `activity_type` | text enum | `note`, `call`, `email`, `meeting`, `task` |
| `subject` | text nullable |
| `body` | text nullable |
| `due_at` | timestamptz nullable |
| `completed_at` | timestamptz nullable |
| `created_by` | uuid FK |
| `created_at` | timestamptz |

### Produktnutzung

Phase 10+. Timeline auf Company-Detail. Follow-up Tasks.

---

## 14. tags

### Zweck

Workspace-weite Labels.

| Feld | Typ |
|------|-----|
| `id` | uuid PK |
| `workspace_id` | uuid FK |
| `name` | text |
| `color` | text nullable |

Unique `(workspace_id, name)`.

---

## 15. entity_tags

### Zweck

Many-to-many Tags ↔ Entities.

| Feld | Typ |
|------|-----|
| `tag_id` | uuid FK |
| `entity_type` | text |
| `entity_id` | uuid |
| `workspace_id` | uuid FK |
| PK | (tag_id, entity_type, entity_id) |

---

## RLS-Übersicht

Alle Tabellen ab `companies` (inkl. config): Policy `workspace_id IN (user's workspaces)`.

Ausnahmen:

- `profiles` — eigenes Profil
- `workspace_members` — eigene Memberships

Details: `docs/supabase-and-rls.md`.

## Seed-Daten (Konzept, keine Migration in Phase 0)

Bei Workspace-Erstellung optional seeden:

- Default Company Pipeline + Stages (siehe pipelines-and-views.md)
- Default Deal Pipeline + Stages
- Default Table View für Companies

Seed = Daten, nicht Code. Stages dürfen vom Nutzer danach ändern/löschen.

# Custom Fields — Kernsystem

Custom Fields sind **kein Add-on**, sondern das metadata-driven Rückgrat des CRM. Pipelines und Views bauen auf derselben Field-Abstraktion auf: System Fields und Custom Fields werden über ein gemeinsames `field_ref`-Modell angesprochen.

## Warum metadata-driven

Hardcoded Felder im Frontend führen zu:

- Jedes neue Feld = Code-Deploy
- Tabellen-, Kanban- und Filter-Logik divergiert
- Settings-UI wird Fake-Konfiguration
- Spätere Erweiterung erzwingt Refactoring

Metadata-driven bedeutet: Felddefinitionen leben in `custom_fields`, Werte in `custom_field_values`. Das Frontend rendert **generisch** nach `field_type`.

## Warum Feldtypen von Anfang an sauber geplant werden müssen

„Alles als Text speichern" scheitert bei:

- **Sortierung** — Zahlen alphabetisch statt numerisch
- **Filter** — Datumsbereiche, Boolean-Filter
- **Validierung** — E-Mails, URLs, Telefonnummern
- **Anzeige** — Links klickbar, Währung formatiert, Rating als Sterne
- **Select** — Optionen brauchen eigenes Modell

Feldtypen müssen deshalb bei Einführung des Custom-Field-Systems (Phase 4) vollständig spezifiziert sein — auch wenn MVP nicht alle Typen sofort in der UI anbietet.

## System Fields vs. Custom Fields

| Aspekt | System Field | Custom Field |
|--------|--------------|--------------|
| Definition | DB-Spalte auf Entity-Tabelle | `custom_fields` Row |
| Änderung | Migration | Settings UI |
| Referenz in Views | `system:{column_name}` | `custom:{uuid}` |
| Beispiele | name, website, contact_discovery_status | ICP-Score, LinkedIn-Follower |

Beide erscheinen in:

- Detailansicht (Field List)
- Tabellenansicht (Spalten)
- Kanban-Karte (`card_fields`)
- Filter Builder
- Sort Dropdown

## Integration in UI-Bereiche (Anforderungen)

| Bereich | Anforderung |
|---------|-------------|
| **Settings** | Feld anlegen, Typ wählen, Optionen pflegen, Required/Filterable/Sortable |
| **Detail** | Typgerechtes Edit-Widget, Validierung inline |
| **Tabelle** | Zelle rendert Display-Format, sortierbar/filterbar wenn erlaubt |
| **Kanban** | `card_fields` aus View-Config, kompakte Display-Form |
| **Filter** | Typgerechter Filter (Range für Date, Options für Select, …) |

Kein Sonderfall-Code pro Custom Field Name — nur pro `field_type`.

---

## Feldtypen — Spezifikation

### text

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Single-line Input |
| Speicher | `value_text` |
| Anzeige | Plain text, truncate in Table |
| Validierung | max length (config, default 255) |
| Filterbar | contains, equals, is empty |
| Sortierbar | alphabetisch |
| Besonderheiten | Default-Typ für kurze Strings |

### long_text

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Textarea, optional Markdown (später) |
| Speicher | `value_text` |
| Anzeige | Expand in Detail, preview in Table |
| Validierung | max length höher (z.B. 10000) |
| Filterbar | contains |
| Sortierbar | nein (oder optional) |

### number

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Numeric input, locale-aware display |
| Speicher | `value_number` |
| Anzeige | Formatierte Zahl |
| Validierung | min/max in config |
| Filterbar | eq, gt, lt, between |
| Sortierbar | numerisch |
| Besonderheiten | Keine Währungssymbole |

### currency

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Numeric + Währung aus config (default EUR) |
| Speicher | `value_number` + currency in field config |
| Anzeige | `1.234,56 €` (locale DACH) |
| Validierung | >= 0 unless config allows negative |
| Filterbar | wie number |
| Sortierbar | numerisch |

### date

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Date picker |
| Speicher | `value_date` |
| Anzeige | `DD.MM.YYYY` (locale) |
| Validierung | valid date |
| Filterbar | before, after, between, is empty |
| Sortierbar | chronologisch |

### datetime

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Date + time picker |
| Speicher | `value_datetime` (UTC) |
| Anzeige | Local timezone |
| Validierung | valid datetime |
| Filterbar | range |
| Sortierbar | chronologisch |

### boolean

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Toggle |
| Speicher | `value_boolean` |
| Anzeige | Ja/Nein oder Icon |
| Filterbar | is true / is false |
| Sortierbar | true first / false first |

### checkbox

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Checkbox (visuell anders als Toggle — UX Phase) |
| Speicher | `value_boolean` |
| Anzeige | Checked state |
| Filterbar | wie boolean |
| Sortierbar | wie boolean |
| Besonderheiten | Semantisch „bestätigt" vs. boolean „ aktiv" — Label entscheidet |

### select

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Single-select dropdown |
| Speicher | `value_text` = option `value` |
| Anzeige | Label aus `custom_field_options`, optional Badge mit Farbe |
| Validierung | value must exist in options |
| Filterbar | is, is any of, is empty |
| Sortierbar | by option sort_order |
| Besonderheiten | Optionen in `custom_field_options` |

### multi_select

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Multi-select, Tags |
| Speicher | `value_json` array of option values |
| Anzeige | Multiple Badges |
| Validierung | all values in options |
| Filterbar | contains any, contains all |
| Sortierbar | schwierig — default nein |

### email

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Email input |
| Speicher | `value_text`, normalized lowercase |
| Anzeige | `mailto:` Link |
| Validierung | RFC-pragmatic email format |
| Filterbar | contains, equals |
| Sortierbar | alphabetisch |

### phone

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Phone input, optional country code |
| Speicher | `value_text`, normalized E.164 wenn möglich |
| Anzeige | Formatiert, `tel:` Link |
| Validierung | min digits |
| Filterbar | contains |
| Sortierbar | nein |

### url

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | URL input |
| Speicher | `value_text`, prepend https if missing |
| Anzeige | Klickbarer Link, external icon |
| Validierung | valid URL |
| Filterbar | contains |
| Sortierbar | alphabetisch |

### percentage

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Number 0–100 oder 0–1 (config) |
| Speicher | `value_number` |
| Anzeige | `42 %` |
| Validierung | range 0–100 |
| Filterbar | numeric |
| Sortierbar | numerisch |

### rating

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Star rating oder number stepper |
| Speicher | `value_number` |
| Anzeige | Stars / `4/5` |
| Validierung | 1..max in config (default 5) |
| Filterbar | gte, lte |
| Sortierbar | numerisch |
| Besonderheiten | Skala in `config.max` |

### user

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | User picker (Workspace members) |
| Speicher | `value_text` = profile uuid |
| Anzeige | Avatar + Name |
| Validierung | user in workspace |
| Filterbar | is, is any of |
| Sortierbar | by name |

### relation

| Aspekt | Spezifikation |
|--------|---------------|
| Eingabe | Entity picker (config: target entity_type) |
| Speicher | `value_json` { entity_type, entity_id } |
| Anzeige | Link zur Entity |
| Validierung | entity exists in workspace |
| Filterbar | is |
| Sortierbar | by related entity name (join) |
| Besonderheiten | Phase 8+ für contact/deal relations |

---

## MVP-Feldtypen (Phase 4 Empfehlung)

Minimum für „fertig" laut Definition of Done:

- text, long_text, number, date, boolean, select, multi_select, url, email, phone

Später: currency, datetime, checkbox, percentage, rating, user, relation

## Änderungen an Felddefinitionen

| Änderung | Verhalten |
|----------|-----------|
| Label ändern | Sofort in UI, Werte unberührt |
| Option label ändern | Werte (value key) unberührt |
| Option löschen | Warnung wenn Werte existieren; Werte orphaned markieren oder blockieren |
| field_type ändern | Nur wenn kompatibel oder Werte migriert — default: blockieren |
| Feld löschen | Soft delete + hide; Werte archivieren |

**Regel:** Bestehende Werte dürfen nicht stillschweigend zerstört werden.

## Architektur: Field Registry (Frontend)

```typescript
// Konzept — nicht implementiert in Phase 0
type FieldDefinition = SystemFieldDef | CustomFieldDef;

interface FieldTypeHandler {
  renderDisplay(value, config): ReactNode;
  renderEdit(value, onChange, config): ReactNode;
  validate(value, config): ValidationResult;
  toSortKey(value): string | number | null;
  filterOperators(): FilterOperator[];
}
```

Registry keyed by `field_type`. Custom Field Metadata wird mit System Field Metadata in unified List gemerged für Views.

## Anti-Patterns (verboten)

- `switch (field.label)` statt `switch (field.field_type)`
- Custom Field Werte nur in JSON ohne Typ-Spalten
- Select ohne Options-Tabelle
- Table-Spalten hardcoded in Component
- Filter nur für System Fields

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

| Aspekt            | System Field                            | Custom Field                 |
| ----------------- | --------------------------------------- | ---------------------------- |
| Definition        | DB-Spalte auf Entity-Tabelle            | `custom_fields` Row          |
| Änderung          | Migration                               | Settings UI                  |
| Referenz in Views | `system:{column_name}`                  | `custom:{uuid}`              |
| Beispiele         | name, website, contact_discovery_status | ICP-Score, LinkedIn-Follower |

Beide erscheinen in:

- Detailansicht (Field List)
- Tabellenansicht (Spalten)
- Kanban-Karte (`card_fields`)
- Filter Builder
- Sort Dropdown

## Integration in UI-Bereiche (Anforderungen)

| Bereich      | Anforderung                                                              |
| ------------ | ------------------------------------------------------------------------ |
| **Settings** | Feld anlegen, Typ wählen, Optionen pflegen, Required/Filterable/Sortable |
| **Detail**   | Typgerechtes Edit-Widget, Validierung inline                             |
| **Tabelle**  | Zelle rendert Display-Format, sortierbar/filterbar wenn erlaubt          |
| **Kanban**   | `card_fields` aus View-Config, kompakte Display-Form                     |
| **Filter**   | Typgerechter Filter (Range für Date, Options für Select, …)              |

Kein Sonderfall-Code pro Custom Field Name — nur pro `field_type`.

---

## Feldtypen — Spezifikation

### text

| Aspekt         | Spezifikation                    |
| -------------- | -------------------------------- |
| Eingabe        | Single-line Input                |
| Speicher       | `value_text`                     |
| Anzeige        | Plain text, truncate in Table    |
| Validierung    | max length (config, default 255) |
| Filterbar      | contains, equals, is empty       |
| Sortierbar     | alphabetisch                     |
| Besonderheiten | Default-Typ für kurze Strings    |

### long_text

| Aspekt      | Spezifikation                        |
| ----------- | ------------------------------------ |
| Eingabe     | Textarea, optional Markdown (später) |
| Speicher    | `value_text`                         |
| Anzeige     | Expand in Detail, preview in Table   |
| Validierung | max length höher (z.B. 10000)        |
| Filterbar   | contains                             |
| Sortierbar  | nein (oder optional)                 |

### number

| Aspekt         | Spezifikation                       |
| -------------- | ----------------------------------- |
| Eingabe        | Numeric input, locale-aware display |
| Speicher       | `value_number`                      |
| Anzeige        | Formatierte Zahl                    |
| Validierung    | min/max in config                   |
| Filterbar      | eq, gt, lt, between                 |
| Sortierbar     | numerisch                           |
| Besonderheiten | Keine Währungssymbole               |

### currency

| Aspekt      | Spezifikation                              |
| ----------- | ------------------------------------------ |
| Eingabe     | Numeric + Währung aus config (default EUR) |
| Speicher    | `value_number` + currency in field config  |
| Anzeige     | `1.234,56 €` (locale DACH)                 |
| Validierung | >= 0 unless config allows negative         |
| Filterbar   | wie number                                 |
| Sortierbar  | numerisch                                  |

### date

| Aspekt      | Spezifikation                    |
| ----------- | -------------------------------- |
| Eingabe     | Date picker                      |
| Speicher    | `value_date`                     |
| Anzeige     | `DD.MM.YYYY` (locale)            |
| Validierung | valid date                       |
| Filterbar   | before, after, between, is empty |
| Sortierbar  | chronologisch                    |

### datetime

| Aspekt      | Spezifikation          |
| ----------- | ---------------------- |
| Eingabe     | Date + time picker     |
| Speicher    | `value_datetime` (UTC) |
| Anzeige     | Local timezone         |
| Validierung | valid datetime         |
| Filterbar   | range                  |
| Sortierbar  | chronologisch          |

### boolean

| Aspekt     | Spezifikation            |
| ---------- | ------------------------ |
| Eingabe    | Toggle                   |
| Speicher   | `value_boolean`          |
| Anzeige    | Ja/Nein oder Icon        |
| Filterbar  | is true / is false       |
| Sortierbar | true first / false first |

### checkbox

| Aspekt         | Spezifikation                                                   |
| -------------- | --------------------------------------------------------------- |
| Eingabe        | Checkbox (visuell anders als Toggle — UX Phase)                 |
| Speicher       | `value_boolean`                                                 |
| Anzeige        | Checked state                                                   |
| Filterbar      | wie boolean                                                     |
| Sortierbar     | wie boolean                                                     |
| Besonderheiten | Semantisch „bestätigt" vs. boolean „ aktiv" — Label entscheidet |

### select

| Aspekt         | Spezifikation                                              |
| -------------- | ---------------------------------------------------------- |
| Eingabe        | Single-select dropdown                                     |
| Speicher       | `value_text` = option `value`                              |
| Anzeige        | Label aus `custom_field_options`, optional Badge mit Farbe |
| Validierung    | value must exist in options                                |
| Filterbar      | is, is any of, is empty                                    |
| Sortierbar     | by option sort_order                                       |
| Besonderheiten | Optionen in `custom_field_options`                         |

### multi_select

| Aspekt      | Spezifikation                       |
| ----------- | ----------------------------------- |
| Eingabe     | Multi-select, Tags                  |
| Speicher    | `value_json` array of option values |
| Anzeige     | Multiple Badges                     |
| Validierung | all values in options               |
| Filterbar   | contains any, contains all          |
| Sortierbar  | schwierig — default nein            |

### email

| Aspekt      | Spezifikation                      |
| ----------- | ---------------------------------- |
| Eingabe     | Email input                        |
| Speicher    | `value_text`, normalized lowercase |
| Anzeige     | `mailto:` Link                     |
| Validierung | RFC-pragmatic email format         |
| Filterbar   | contains, equals                   |
| Sortierbar  | alphabetisch                       |

### phone

| Aspekt      | Spezifikation                               |
| ----------- | ------------------------------------------- |
| Eingabe     | Phone input, optional country code          |
| Speicher    | `value_text`, normalized E.164 wenn möglich |
| Anzeige     | Formatiert, `tel:` Link                     |
| Validierung | min digits                                  |
| Filterbar   | contains                                    |
| Sortierbar  | nein                                        |

### url

| Aspekt      | Spezifikation                          |
| ----------- | -------------------------------------- |
| Eingabe     | URL input                              |
| Speicher    | `value_text`, prepend https if missing |
| Anzeige     | Klickbarer Link, external icon         |
| Validierung | valid URL                              |
| Filterbar   | contains                               |
| Sortierbar  | alphabetisch                           |

### percentage

| Aspekt      | Spezifikation                  |
| ----------- | ------------------------------ |
| Eingabe     | Number 0–100 oder 0–1 (config) |
| Speicher    | `value_number`                 |
| Anzeige     | `42 %`                         |
| Validierung | range 0–100                    |
| Filterbar   | numeric                        |
| Sortierbar  | numerisch                      |

### rating

| Aspekt         | Spezifikation                   |
| -------------- | ------------------------------- |
| Eingabe        | Star rating oder number stepper |
| Speicher       | `value_number`                  |
| Anzeige        | Stars / `4/5`                   |
| Validierung    | 1..max in config (default 5)    |
| Filterbar      | gte, lte                        |
| Sortierbar     | numerisch                       |
| Besonderheiten | Skala in `config.max`           |

### user

| Aspekt      | Spezifikation                   |
| ----------- | ------------------------------- |
| Eingabe     | User picker (Workspace members) |
| Speicher    | `value_text` = profile uuid     |
| Anzeige     | Avatar + Name                   |
| Validierung | user in workspace               |
| Filterbar   | is, is any of                   |
| Sortierbar  | by name                         |

### relation

| Aspekt         | Spezifikation                              |
| -------------- | ------------------------------------------ |
| Eingabe        | Entity picker (config: target entity_type) |
| Speicher       | `value_json` { entity_type, entity_id }    |
| Anzeige        | Link zur Entity                            |
| Validierung    | entity exists in workspace                 |
| Filterbar      | is                                         |
| Sortierbar     | by related entity name (join)              |
| Besonderheiten | Phase 8+ für contact/deal relations        |

---

## MVP-Feldtypen (Phase 4 Empfehlung)

Minimum für „fertig" laut Definition of Done:

- text, long_text, number, date, boolean, select, multi_select, url, email, phone

Später: currency, datetime, checkbox, percentage, rating, user, relation

## Änderungen an Felddefinitionen

| Änderung            | Verhalten                                                               |
| ------------------- | ----------------------------------------------------------------------- |
| Label ändern        | Sofort in UI, Werte unberührt                                           |
| Option label ändern | Werte (value key) unberührt                                             |
| Option löschen      | Warnung wenn Werte existieren; Werte orphaned markieren oder blockieren |
| field_type ändern   | Nur wenn kompatibel oder Werte migriert — default: blockieren           |
| Feld löschen        | Soft delete + hide; Werte archivieren                                   |

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

---

## Field Type Contract

Jeder Feldtyp erfüllt einen vollständigen, verbindlichen Contract. Neue Feldtypen werden **nicht** als Sonderfall hinzugefügt — sie implementieren denselben Contract.

**Konsequenz:** Auch wenn ein Feldtyp im MVP noch nicht vollständig in der UI angeboten wird, müssen DB-Struktur, TypeScript-Typen und Field Registry so vorbereitet sein, dass er später ohne Architekturbruch ergänzt werden kann.

### Contract-Felder pro Feldtyp

| Contract-Aspekt             | Beschreibung                                                  |
| --------------------------- | ------------------------------------------------------------- |
| **storage_column**          | Welche `custom_field_values`-Spalte wird verwendet            |
| **input_component**         | Verantwortlichkeit des Edit-Widgets                           |
| **display_component**       | Verantwortlichkeit des Display-Renderers                      |
| **validation_rules**        | Client-seitige Regeln vor Persistenz                          |
| **filter_operators**        | Erlaubte Filter-Operatoren (aus `FilterOperator` Registry)    |
| **sort_behavior**           | Wie wird sortiert; `none` wenn nicht sinnvoll                 |
| **empty_state**             | Was wird angezeigt wenn kein Wert vorhanden                   |
| **settings_behavior**       | Was in Settings konfigurierbar ist                            |
| **migration_compatibility** | Wie field_type-Änderungen oder Wertmigration behandelt werden |

### TypeScript-Interface (Konzept, Phase 4)

```typescript
interface FieldTypeHandler<TValue = unknown> {
  storageColumn: keyof CustomFieldValueRow;
  renderDisplay(value: TValue | null, config: FieldConfig): ReactNode;
  renderEdit(
    value: TValue | null,
    onChange: (v: TValue | null) => void,
    config: FieldConfig,
  ): ReactNode;
  renderEmpty(): ReactNode;
  validate(value: TValue | null, config: FieldConfig): ValidationResult;
  toSortKey(value: TValue | null): string | number | null;
  filterOperators(): FilterOperator[];
  settingsSchema(): FieldSettingsSchema;
}
```

Registry keyed by `field_type` — kein `switch(fieldName)`, kein `if (field.label === 'Website')`.

### Kompatibilitätsregeln

| Aktion              | Verhalten                                                            |
| ------------------- | -------------------------------------------------------------------- |
| Label ändern        | Sofort in UI, Werte unberührt                                        |
| Option-Label ändern | Stable `value` key unberührt                                         |
| Option löschen      | Warnung wenn existierende Werte; Werte orphaned oder blockieren      |
| `field_type` ändern | Nur wenn kompatibel (z.B. text → long_text); sonst blockieren        |
| Feld löschen        | Soft delete; Werte archivieren; UI zeigt „Feld nicht mehr verfügbar" |

**Bestehende Werte dürfen niemals stillschweigend zerstört werden.**

---

## Field Type Implementation Matrix

Status-Spalten: `✅ ja` / `⬜ nein` / `🔜 später`

| field_type     | MVP UI | DB storage       | display handler | edit handler | filter                        | sort           | settings               | notes                               |
| -------------- | ------ | ---------------- | --------------- | ------------ | ----------------------------- | -------------- | ---------------------- | ----------------------------------- |
| `text`         | ✅     | `value_text`     | ✅              | ✅           | contains, eq, empty           | alpha          | label, required        | Default-Typ                         |
| `long_text`    | ✅     | `value_text`     | ✅              | ✅           | contains                      | ⬜             | label, required        | Textarea; Markdown später           |
| `number`       | ✅     | `value_number`   | ✅              | ✅           | eq, gt, lt, between           | num            | label, min, max        |                                     |
| `currency`     | 🔜     | `value_number`   | 🔜              | 🔜           | wie number                    | num            | label, currency        | DACH: EUR default                   |
| `date`         | ✅     | `value_date`     | ✅              | ✅           | before, after, between, empty | chrono         | label, required        | DD.MM.YYYY                          |
| `datetime`     | 🔜     | `value_datetime` | 🔜              | 🔜           | range                         | chrono         | label                  | UTC storage, local display          |
| `boolean`      | ✅     | `value_boolean`  | ✅              | ✅           | is true/false                 | true-first     | label                  | Toggle                              |
| `checkbox`     | 🔜     | `value_boolean`  | 🔜              | 🔜           | wie boolean                   | true-first     | label                  | Visuell anders als boolean          |
| `select`       | ✅     | `value_text`     | ✅              | ✅           | is, any of, empty             | option order   | label, options, colors | Options in `custom_field_options`   |
| `multi_select` | ✅     | `value_json`     | ✅              | ✅           | contains any/all              | ⬜             | label, options, colors | JSON array of option values         |
| `email`        | ✅     | `value_text`     | ✅              | ✅           | contains, eq                  | alpha          | label                  | mailto: link in display             |
| `phone`        | ✅     | `value_text`     | ✅              | ✅           | contains                      | ⬜             | label                  | tel: link; E.164 normalisierung     |
| `url`          | ✅     | `value_text`     | ✅              | ✅           | contains                      | alpha          | label                  | https:// prepend; external link     |
| `percentage`   | 🔜     | `value_number`   | 🔜              | 🔜           | numeric                       | num            | label, range           | 0–100                               |
| `rating`       | ✅     | `value_number`   | ✅              | ✅           | gte, lte                      | num            | label, max             | Phase 4 MVP; max in validation_json |
| `user`         | 🔜     | `value_text`     | 🔜              | 🔜           | is, any of                    | by name        | label                  | profile uuid; workspace-scoped      |
| `relation`     | 🔜     | `value_json`     | 🔜              | 🔜           | is                            | by entity name | label, target_entity   | Phase 8+; entity_type + entity_id   |

**Legende:**

- `MVP UI` — im MVP (Phase 4–7) vollständig in Settings + Detail + Table + Kanban + Filter angeboten
- `DB storage ready` — `custom_field_values`-Schema unterstützt diesen Typ bereits mit Phase-1-Migration (alle typed columns sind vorbereitet)
- `🔜 später` — DB-Schema vorbereitet, UI-Handler folgt in späterem Release

**Wichtig:** Alle Feldtypen teilen dieselbe DB-Struktur (`custom_field_values`) — keine Schema-Änderung nötig wenn ein neuer Typ aktiviert wird. Nur ein neuer `FieldTypeHandler` in der Registry.

**ADR:** [docs/adr/009-field-type-contract.md](adr/009-field-type-contract.md)

# Custom Fields

Custom Fields sind **Kernfeature**, kein späteres Add-on.

## Regeln

- Feldtypen ernst nehmen — **nicht nur Textfelder**
- Select/Multi-Select brauchen `custom_field_options`
- Werte **typgerecht** speichern (`value_number`, `value_date`, …)
- Rendering über **Field Type Handler** — ein Handler pro Typ
- Integration in: Settings, Detail, Tabelle, Kanban, Filter, Views
- Vor Implementierung: `docs/custom-fields.md` lesen

## Nicht tun

- `switch (fieldName)` statt `switch (fieldType)`
- Select ohne Options-Tabelle
- Custom Fields nur in Detail, nicht in Views
- „Alles als string" speichern

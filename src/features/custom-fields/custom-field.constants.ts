import type { EntityType, FieldType } from "./custom-field.types";

export const CUSTOM_FIELD_COLUMNS =
  "id, workspace_id, entity_type, name, key, description, field_type, placeholder, help_text, is_required, is_unique, is_system, is_hidden, is_archived, default_value_json, validation_json, display_json, order_index, created_at, updated_at";

export const CUSTOM_FIELD_OPTION_COLUMNS =
  "id, workspace_id, custom_field_id, label, value, color, order_index, is_archived, created_at, updated_at";

export const CUSTOM_FIELD_VALUE_COLUMNS =
  "id, workspace_id, entity_type, entity_id, custom_field_id, value_text, value_number, value_boolean, value_date, value_datetime, value_json, created_at, updated_at";

export const MVP_FIELD_TYPES: FieldType[] = [
  "text",
  "long_text",
  "number",
  "date",
  "boolean",
  "select",
  "multi_select",
  "email",
  "phone",
  "url",
  "rating",
];

export const FUTURE_FIELD_TYPES: FieldType[] = [
  "currency",
  "datetime",
  "checkbox",
  "percentage",
  "user",
  "relation",
];

export const ALL_FIELD_TYPES: FieldType[] = [
  ...MVP_FIELD_TYPES,
  ...FUTURE_FIELD_TYPES,
];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  long_text: "Langtext",
  number: "Zahl",
  currency: "Währung",
  date: "Datum",
  datetime: "Datum/Uhrzeit",
  boolean: "Ja/Nein",
  checkbox: "Checkbox",
  select: "Auswahl",
  multi_select: "Mehrfachauswahl",
  email: "E-Mail",
  phone: "Telefon",
  url: "URL",
  percentage: "Prozent",
  rating: "Bewertung",
  user: "Benutzer",
  relation: "Verknüpfung",
};

export const PHASE4_ENTITY_TYPE: EntityType = "company";

export function slugifyFieldKey(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  if (!normalized) {
    return "field";
  }

  return /^[a-z]/.test(normalized) ? normalized : `field_${normalized}`;
}

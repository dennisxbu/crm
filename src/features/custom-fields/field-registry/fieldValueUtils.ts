import type {
  CustomField,
  CustomFieldOption,
  CustomFieldValue,
  NormalizedFieldValue,
} from "../custom-field.types";
import { getFieldTypeHandler } from "./fieldTypeRegistry";

export function readValueFromRow(
  field: CustomField,
  row: CustomFieldValue | null,
): unknown {
  if (!row) {
    return null;
  }

  const handler = getFieldTypeHandler(field.field_type);
  const column = handler.storageColumn;

  switch (column) {
    case "value_text":
      return row.value_text;
    case "value_number":
      return row.value_number;
    case "value_boolean":
      return row.value_boolean;
    case "value_date":
      return row.value_date;
    case "value_datetime":
      return row.value_datetime;
    case "value_json":
      return row.value_json;
    default:
      return null;
  }
}

export function buildUpsertPayload(
  normalized: NormalizedFieldValue,
): Pick<
  CustomFieldValue,
  | "value_text"
  | "value_number"
  | "value_boolean"
  | "value_date"
  | "value_datetime"
  | "value_json"
> {
  return {
    value_text:
      normalized.storageColumn === "value_text" ? normalized.value_text : null,
    value_number:
      normalized.storageColumn === "value_number"
        ? normalized.value_number
        : null,
    value_boolean:
      normalized.storageColumn === "value_boolean"
        ? normalized.value_boolean
        : null,
    value_date:
      normalized.storageColumn === "value_date" ? normalized.value_date : null,
    value_datetime:
      normalized.storageColumn === "value_datetime"
        ? normalized.value_datetime
        : null,
    value_json:
      normalized.storageColumn === "value_json" ? normalized.value_json : null,
  };
}

export function getOptionLabel(
  options: CustomFieldOption[],
  value: string,
): string {
  const option = options.find(
    (entry) => entry.value === value && !entry.is_archived,
  );
  return option?.label ?? value;
}

export function getActiveOptions(
  options: CustomFieldOption[],
): CustomFieldOption[] {
  return options
    .filter((option) => !option.is_archived)
    .sort((left, right) => left.order_index - right.order_index);
}

export function getValidationNumber(
  field: CustomField,
  key: "min" | "max",
  fallback: number,
): number {
  const raw = field.validation_json[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}

export function getValidationMaxLength(
  field: CustomField,
  fallback: number,
): number {
  const raw = field.validation_json.maxLength;
  return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}

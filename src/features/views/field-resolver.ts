import type {
  CustomField,
  CustomFieldOption,
} from "../custom-fields/custom-field.types";
import type {
  FieldRef,
  ResolvedTableField,
  ViewColumnConfig,
} from "./view.types";
import {
  parseSystemFieldKey,
  SYSTEM_COMPANY_FIELDS,
} from "./system-field-registry";

export function resolveTableFields(
  columns: ViewColumnConfig[],
  customFields: CustomField[],
  customFieldOptions: CustomFieldOption[],
): ResolvedTableField[] {
  const customFieldById = new Map(
    customFields.map((field) => [field.id, field]),
  );

  return columns.map((column) => {
    const fieldRef = column.field_ref;

    if (fieldRef.startsWith("system:")) {
      const systemKey = parseSystemFieldKey(fieldRef);

      if (!systemKey) {
        return {
          fieldRef,
          source: "system",
          label: "Unbekanntes Systemfeld",
          sortable: false,
          filterable: false,
          missing: true,
        };
      }

      const definition = SYSTEM_COMPANY_FIELDS[systemKey];

      return {
        fieldRef,
        source: "system",
        label: definition.label,
        sortable: definition.sortable,
        filterable: definition.filterable,
        systemKey,
        fieldType: definition.fieldType,
      };
    }

    if (fieldRef.startsWith("custom:")) {
      const customFieldId = fieldRef.slice("custom:".length);
      const customField = customFieldById.get(customFieldId);

      if (!customField || customField.is_archived) {
        return {
          fieldRef,
          source: "custom",
          label: "Fehlendes Feld",
          sortable: false,
          filterable: false,
          missing: true,
          customFieldId,
        };
      }

      const hasOptions = customFieldOptions.some(
        (option) => option.custom_field_id === customField.id,
      );

      const sortable =
        customField.field_type === "text" ||
        customField.field_type === "number" ||
        customField.field_type === "date" ||
        customField.field_type === "select" ||
        customField.field_type === "rating";

      const filterable =
        customField.field_type === "text" ||
        customField.field_type === "email" ||
        customField.field_type === "phone" ||
        customField.field_type === "url" ||
        customField.field_type === "select" ||
        customField.field_type === "long_text" ||
        hasOptions;

      return {
        fieldRef,
        source: "custom",
        label: customField.name,
        sortable,
        filterable,
        customFieldId: customField.id,
        fieldType: customField.field_type,
      };
    }

    return {
      fieldRef,
      source: "system",
      label: "Ungültige Spalte",
      sortable: false,
      filterable: false,
      missing: true,
    };
  });
}

export function getCustomFieldIdsFromColumns(
  columns: ViewColumnConfig[],
): string[] {
  return columns
    .map((column) => column.field_ref)
    .filter((fieldRef): fieldRef is FieldRef => fieldRef.startsWith("custom:"))
    .map((fieldRef) => fieldRef.slice("custom:".length));
}

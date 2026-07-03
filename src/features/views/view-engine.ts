import type { Company } from "../companies/company.types";
import type {
  CustomField,
  CustomFieldOption,
  CustomFieldValue,
} from "../custom-fields/custom-field.types";
import {
  getOptionLabel,
  readValueFromRow,
} from "../custom-fields/field-registry/fieldValueUtils";
import type {
  ResolvedTableField,
  TableSortState,
  ViewConfig,
} from "./view.types";
import {
  getPrimarySort,
  isEmptyFilterValue,
  matchesFilterOperator,
} from "./view.utils";
import { SYSTEM_COMPANY_FIELDS } from "./system-field-registry";

export function getCellSortText(
  company: Company,
  field: ResolvedTableField,
  customFields: CustomField[],
  customFieldOptions: CustomFieldOption[],
  valuesByCompanyId: Map<string, Map<string, CustomFieldValue>>,
): string {
  if (field.missing) {
    return "";
  }

  if (field.source === "system" && field.systemKey) {
    const definition =
      SYSTEM_COMPANY_FIELDS[
        field.systemKey as keyof typeof SYSTEM_COMPANY_FIELDS
      ];
    return definition.formatDisplay(definition.getValue(company));
  }

  if (field.source === "custom" && field.customFieldId) {
    const customField = customFields.find(
      (entry) => entry.id === field.customFieldId,
    );
    if (!customField) {
      return "";
    }

    const companyValues = valuesByCompanyId.get(company.id);
    const valueRow = companyValues?.get(field.customFieldId) ?? null;
    const rawValue = readValueFromRow(customField, valueRow);

    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return "";
    }

    if (customField.field_type === "select") {
      return getOptionLabel(
        customFieldOptions.filter(
          (option) => option.custom_field_id === customField.id,
        ),
        String(rawValue),
      );
    }

    if (customField.field_type === "multi_select" && Array.isArray(rawValue)) {
      return rawValue
        .map((entry) =>
          getOptionLabel(
            customFieldOptions.filter(
              (option) => option.custom_field_id === customField.id,
            ),
            String(entry),
          ),
        )
        .join(", ");
    }

    if (typeof rawValue === "number") {
      return String(rawValue);
    }

    if (typeof rawValue === "boolean") {
      return rawValue ? "ja" : "nein";
    }

    return String(rawValue);
  }

  return "";
}

export function getCellDisplayValue(
  company: Company,
  field: ResolvedTableField,
  customFields: CustomField[],
  _customFieldOptions: CustomFieldOption[],
  valuesByCompanyId: Map<string, Map<string, CustomFieldValue>>,
): unknown {
  if (field.missing) {
    return null;
  }

  if (field.source === "system" && field.systemKey) {
    return SYSTEM_COMPANY_FIELDS[
      field.systemKey as keyof typeof SYSTEM_COMPANY_FIELDS
    ].getValue(company);
  }

  if (field.source === "custom" && field.customFieldId) {
    const customField = customFields.find(
      (entry) => entry.id === field.customFieldId,
    );
    if (!customField) {
      return null;
    }

    const companyValues = valuesByCompanyId.get(company.id);
    const valueRow = companyValues?.get(field.customFieldId) ?? null;
    return readValueFromRow(customField, valueRow);
  }

  return null;
}

function compareSortValues(left: string, right: string): number {
  return left.localeCompare(right, "de", {
    sensitivity: "base",
    numeric: true,
  });
}

export function applyViewEngine(
  companies: Company[],
  config: ViewConfig,
  resolvedFields: ResolvedTableField[],
  customFields: CustomField[],
  customFieldOptions: CustomFieldOption[],
  valuesByCompanyId: Map<string, Map<string, CustomFieldValue>>,
  sortOverride?: TableSortState | null,
): Company[] {
  const fieldByRef = new Map(
    resolvedFields.map((field) => [field.fieldRef, field]),
  );
  let result = [...companies];

  for (const filter of config.filters) {
    const field = fieldByRef.get(filter.field_ref);
    if (!field || !field.filterable) {
      continue;
    }

    result = result.filter((company) => {
      const cellText = getCellSortText(
        company,
        field,
        customFields,
        customFieldOptions,
        valuesByCompanyId,
      );

      if (filter.operator === "is_empty") {
        return isEmptyFilterValue(cellText) || cellText === "—";
      }

      return matchesFilterOperator(cellText, filter.operator, filter.value);
    });
  }

  const activeSort = sortOverride ?? getPrimarySort(config);
  if (!activeSort) {
    return result;
  }

  const sortField = fieldByRef.get(activeSort.field_ref);
  if (!sortField || !sortField.sortable) {
    return result;
  }

  const direction = activeSort.direction === "asc" ? 1 : -1;

  return result.sort((left, right) => {
    const leftText = getCellSortText(
      left,
      sortField,
      customFields,
      customFieldOptions,
      valuesByCompanyId,
    );
    const rightText = getCellSortText(
      right,
      sortField,
      customFields,
      customFieldOptions,
      valuesByCompanyId,
    );

    return compareSortValues(leftText, rightText) * direction;
  });
}

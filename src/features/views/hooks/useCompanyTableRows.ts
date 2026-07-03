import { useEffect, useMemo, useState } from "react";
import type { Company } from "../../companies/company.types";
import {
  fetchCustomFieldOptions,
  fetchCustomFieldValuesForCompanies,
} from "../../custom-fields/api/customFields";
import type {
  CustomField,
  CustomFieldOption,
  CustomFieldValue,
} from "../../custom-fields/custom-field.types";
import { PHASE4_ENTITY_TYPE } from "../../custom-fields/custom-field.constants";
import {
  getCustomFieldIdsFromColumns,
  resolveTableFields,
} from "../field-resolver";
import { applyViewEngine } from "../view-engine";
import type { TableSortState, View } from "../view.types";
import { getPrimarySort, getVisibleColumns } from "../view.utils";

export function useCompanyTableRows(
  companies: Company[],
  view: View | null,
  customFields: CustomField[],
  sortOverride: TableSortState | null,
) {
  const [options, setOptions] = useState<CustomFieldOption[]>([]);
  const [values, setValues] = useState<CustomFieldValue[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(false);
  const [valuesError, setValuesError] = useState<string | null>(null);

  const visibleColumns = useMemo(
    () => (view ? getVisibleColumns(view.config) : []),
    [view],
  );

  const resolvedFields = useMemo(
    () => resolveTableFields(visibleColumns, customFields, options),
    [visibleColumns, customFields, options],
  );

  const customFieldIds = useMemo(
    () => getCustomFieldIdsFromColumns(visibleColumns),
    [visibleColumns],
  );

  useEffect(() => {
    if (!view) {
      setOptions([]);
      return;
    }

    const workspaceId = view.workspace_id;
    const fieldIds = getCustomFieldIdsFromColumns(
      getVisibleColumns(view.config),
    );

    if (fieldIds.length === 0) {
      setOptions([]);
      return;
    }

    void fetchCustomFieldOptions(workspaceId, fieldIds, true)
      .then(setOptions)
      .catch(() => setOptions([]));
  }, [view, customFields]);

  useEffect(() => {
    if (!view || companies.length === 0) {
      setValues([]);
      return;
    }

    setIsLoadingValues(true);
    setValuesError(null);

    void fetchCustomFieldValuesForCompanies(
      view.workspace_id,
      PHASE4_ENTITY_TYPE,
      companies.map((company) => company.id),
      customFieldIds.length > 0 ? customFieldIds : undefined,
    )
      .then(setValues)
      .catch((error) => {
        setValuesError(
          error instanceof Error
            ? error.message
            : "Custom Field Werte konnten nicht geladen werden.",
        );
        setValues([]);
      })
      .finally(() => setIsLoadingValues(false));
  }, [view, companies, customFieldIds]);

  const valuesByCompanyId = useMemo(() => {
    const map = new Map<string, Map<string, CustomFieldValue>>();

    for (const value of values) {
      const companyMap = map.get(value.entity_id) ?? new Map();
      companyMap.set(value.custom_field_id, value);
      map.set(value.entity_id, companyMap);
    }

    return map;
  }, [values]);

  const displayCompanies = useMemo(() => {
    if (!view) {
      return companies;
    }

    return applyViewEngine(
      companies,
      view.config,
      resolvedFields,
      customFields,
      options,
      valuesByCompanyId,
      sortOverride,
    );
  }, [
    companies,
    view,
    resolvedFields,
    customFields,
    options,
    valuesByCompanyId,
    sortOverride,
  ]);

  const initialSort = view ? getPrimarySort(view.config) : null;

  return {
    visibleColumns,
    resolvedFields,
    displayCompanies,
    valuesByCompanyId,
    customFieldOptions: options,
    isLoadingValues,
    valuesError,
    initialSort,
  };
}

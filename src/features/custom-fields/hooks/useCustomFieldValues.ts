import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCustomFieldOptions,
  fetchCustomFieldValues,
  upsertCustomFieldValue,
} from "../api/customFields";
import { PHASE4_ENTITY_TYPE } from "../custom-field.constants";
import type {
  CustomField,
  CustomFieldOption,
  CustomFieldValue,
} from "../custom-field.types";
import { getFieldTypeHandler } from "../field-registry/fieldTypeRegistry";
import { readValueFromRow } from "../field-registry/fieldValueUtils";

export function useCustomFieldValues(
  workspaceId: string | undefined,
  entityId: string | undefined,
  fields: CustomField[],
) {
  const [values, setValues] = useState<CustomFieldValue[]>([]);
  const [options, setOptions] = useState<CustomFieldOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!workspaceId || !entityId) {
      setValues([]);
      setOptions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextValues = await fetchCustomFieldValues(
        workspaceId,
        PHASE4_ENTITY_TYPE,
        entityId,
      );
      setValues(nextValues);

      const fieldIds = fields.map((field) => field.id);
      const nextOptions = await fetchCustomFieldOptions(
        workspaceId,
        fieldIds,
        true,
      );
      setOptions(nextOptions);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Custom Field Werte konnten nicht geladen werden.",
      );
      setValues([]);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, entityId, fields]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const valueByFieldId = useMemo(() => {
    const map = new Map<string, CustomFieldValue>();
    for (const value of values) {
      map.set(value.custom_field_id, value);
    }
    return map;
  }, [values]);

  const optionsByFieldId = useMemo(() => {
    const map = new Map<string, CustomFieldOption[]>();
    for (const option of options) {
      const list = map.get(option.custom_field_id) ?? [];
      list.push(option);
      map.set(option.custom_field_id, list);
    }
    return map;
  }, [options]);

  const getDisplayValue = useCallback(
    (field: CustomField) => {
      const row = valueByFieldId.get(field.id) ?? null;
      return readValueFromRow(field, row);
    },
    [valueByFieldId],
  );

  const saveFieldValue = useCallback(
    async (field: CustomField, rawValue: unknown) => {
      if (!workspaceId || !entityId) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const handler = getFieldTypeHandler(field.field_type);
        const fieldOptions = optionsByFieldId.get(field.id) ?? [];
        const normalized = handler.normalizeInput(
          rawValue,
          field,
          fieldOptions,
        );

        await upsertCustomFieldValue(
          workspaceId,
          PHASE4_ENTITY_TYPE,
          entityId,
          field,
          normalized,
          fieldOptions,
        );

        await refresh();
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Wert konnte nicht gespeichert werden.",
        );
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    [workspaceId, entityId, optionsByFieldId, refresh],
  );

  return {
    values,
    options,
    isLoading,
    isSaving,
    error,
    refresh,
    valueByFieldId,
    optionsByFieldId,
    getDisplayValue,
    saveFieldValue,
  };
}

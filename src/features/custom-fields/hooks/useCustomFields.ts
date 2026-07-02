import { useCallback, useEffect, useState } from "react";
import {
  archiveCustomField,
  createCustomField,
  createCustomFieldOption,
  archiveCustomFieldOption,
  ensureDefaultCompanyCustomFields,
  fetchCustomFieldOptions,
  fetchCustomFields,
  updateCustomField,
  updateCustomFieldOption,
} from "../api/customFields";
import { PHASE4_ENTITY_TYPE } from "../custom-field.constants";
import type {
  CustomField,
  CustomFieldCreateInput,
  CustomFieldOption,
  CustomFieldOptionCreateInput,
  CustomFieldOptionUpdateInput,
  CustomFieldUpdateInput,
} from "../custom-field.types";

export function useCustomFields(workspaceId: string | undefined) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [options, setOptions] = useState<CustomFieldOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setFields([]);
      setOptions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextFields = await fetchCustomFields(
        workspaceId,
        PHASE4_ENTITY_TYPE,
      );
      setFields(nextFields);

      const fieldIds = nextFields.map((field) => field.id);
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
          : "Custom Fields konnten nicht geladen werden.",
      );
      setFields([]);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ensureDefaults = useCallback(async () => {
    if (!workspaceId) {
      return;
    }

    await ensureDefaultCompanyCustomFields(workspaceId);
    await refresh();
  }, [workspaceId, refresh]);

  const addField = useCallback(
    async (input: CustomFieldCreateInput) => {
      if (!workspaceId) {
        return;
      }

      await createCustomField(workspaceId, input);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const editField = useCallback(
    async (fieldId: string, input: CustomFieldUpdateInput) => {
      if (!workspaceId) {
        return;
      }

      await updateCustomField(workspaceId, fieldId, input);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const removeField = useCallback(
    async (fieldId: string) => {
      if (!workspaceId) {
        return;
      }

      await archiveCustomField(workspaceId, fieldId);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const addOption = useCallback(
    async (fieldId: string, input: CustomFieldOptionCreateInput) => {
      if (!workspaceId) {
        return;
      }

      await createCustomFieldOption(workspaceId, fieldId, input);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const editOption = useCallback(
    async (optionId: string, input: CustomFieldOptionUpdateInput) => {
      if (!workspaceId) {
        return;
      }

      await updateCustomFieldOption(workspaceId, optionId, input);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const removeOption = useCallback(
    async (optionId: string) => {
      if (!workspaceId) {
        return;
      }

      await archiveCustomFieldOption(workspaceId, optionId);
      await refresh();
    },
    [workspaceId, refresh],
  );

  const getOptionsForField = useCallback(
    (fieldId: string) =>
      options.filter((option) => option.custom_field_id === fieldId),
    [options],
  );

  return {
    fields,
    options,
    isLoading,
    error,
    refresh,
    ensureDefaults,
    addField,
    editField,
    removeField,
    addOption,
    editOption,
    removeOption,
    getOptionsForField,
  };
}

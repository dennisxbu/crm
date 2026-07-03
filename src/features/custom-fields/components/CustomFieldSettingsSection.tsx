// PHASE 4 — Custom Field settings shell section
import { useWorkspace } from "../../../app/providers/WorkspaceProvider";
import { useCustomFields } from "../hooks/useCustomFields";
import { CustomFieldSettings } from "./CustomFieldSettings";

export function CustomFieldSettingsSection() {
  const { activeWorkspace } = useWorkspace();
  const {
    fields,
    isLoading,
    error,
    ensureDefaults,
    addField,
    editField,
    removeField,
    addOption,
    editOption,
    removeOption,
    getOptionsForField,
  } = useCustomFields(activeWorkspace?.id);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <CustomFieldSettings
      fields={fields}
      getOptionsForField={getOptionsForField}
      isLoading={isLoading}
      error={error}
      onEnsureDefaults={ensureDefaults}
      onCreateField={addField}
      onUpdateField={editField}
      onArchiveField={removeField}
      onAddOption={async (fieldId, label, value) => {
        await addOption(fieldId, { label, value });
      }}
      onRenameOption={async (optionId, label) => {
        await editOption(optionId, { label });
      }}
      onArchiveOption={removeOption}
    />
  );
}

import { supabase } from "../../../shared/lib/supabase/client";
import {
  CUSTOM_FIELD_COLUMNS,
  CUSTOM_FIELD_OPTION_COLUMNS,
  CUSTOM_FIELD_VALUE_COLUMNS,
  PHASE4_ENTITY_TYPE,
} from "../custom-field.constants";
import type {
  CustomField,
  CustomFieldCreateInput,
  CustomFieldOption,
  CustomFieldOptionCreateInput,
  CustomFieldOptionUpdateInput,
  CustomFieldUpdateInput,
  CustomFieldValue,
  EntityType,
  NormalizedFieldValue,
} from "../custom-field.types";
import { getFieldTypeHandler } from "../field-registry/fieldTypeRegistry";
import { buildUpsertPayload } from "../field-registry/fieldValueUtils";

function getClient() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase;
}

function normalizeOptionalText(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function fetchCustomFields(
  workspaceId: string,
  entityType: EntityType = PHASE4_ENTITY_TYPE,
  includeArchived = false,
): Promise<CustomField[]> {
  const client = getClient();

  let query = client
    .from("custom_fields")
    .select(CUSTOM_FIELD_COLUMNS)
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .order("order_index", { ascending: true });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomField[];
}

export async function createCustomField(
  workspaceId: string,
  input: CustomFieldCreateInput,
  entityType: EntityType = PHASE4_ENTITY_TYPE,
): Promise<CustomField> {
  const client = getClient();
  const name = input.name.trim();
  const key = input.key.trim();

  if (!name) {
    throw new Error("Der Feldname ist erforderlich.");
  }

  if (!key) {
    throw new Error("Der Feldschlüssel ist erforderlich.");
  }

  const { data, error } = await client
    .from("custom_fields")
    .insert({
      workspace_id: workspaceId,
      entity_type: entityType,
      name,
      key,
      field_type: input.field_type,
      description: normalizeOptionalText(input.description),
      placeholder: normalizeOptionalText(input.placeholder),
      help_text: normalizeOptionalText(input.help_text),
      is_required: input.is_required ?? false,
      validation_json: input.validation_json ?? {},
      display_json: input.display_json ?? {},
      order_index: input.order_index ?? 0,
    })
    .select(CUSTOM_FIELD_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomField;
}

export async function updateCustomField(
  workspaceId: string,
  fieldId: string,
  input: CustomFieldUpdateInput,
): Promise<CustomField> {
  const client = getClient();
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Der Feldname ist erforderlich.");
    }
    payload.name = name;
  }

  if (input.field_type !== undefined) {
    const { count, error: countError } = await client
      .from("custom_field_values")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("custom_field_id", fieldId);

    if (countError) {
      throw countError;
    }

    if ((count ?? 0) > 0) {
      throw new Error(
        "Feldtyp kann nicht geändert werden, solange Werte existieren.",
      );
    }

    payload.field_type = input.field_type;
  }

  if (input.description !== undefined) {
    payload.description = normalizeOptionalText(input.description);
  }
  if (input.placeholder !== undefined) {
    payload.placeholder = normalizeOptionalText(input.placeholder);
  }
  if (input.help_text !== undefined) {
    payload.help_text = normalizeOptionalText(input.help_text);
  }
  if (input.is_required !== undefined) {
    payload.is_required = input.is_required;
  }
  if (input.validation_json !== undefined) {
    payload.validation_json = input.validation_json;
  }
  if (input.display_json !== undefined) {
    payload.display_json = input.display_json;
  }
  if (input.order_index !== undefined) {
    payload.order_index = input.order_index;
  }
  if (input.is_archived !== undefined) {
    payload.is_archived = input.is_archived;
  }

  const { data, error } = await client
    .from("custom_fields")
    .update(payload)
    .eq("id", fieldId)
    .eq("workspace_id", workspaceId)
    .select(CUSTOM_FIELD_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomField;
}

export async function archiveCustomField(
  workspaceId: string,
  fieldId: string,
): Promise<CustomField> {
  return updateCustomField(workspaceId, fieldId, { is_archived: true });
}

export async function fetchCustomFieldOptions(
  workspaceId: string,
  fieldIds: string[],
  includeArchived = false,
): Promise<CustomFieldOption[]> {
  if (fieldIds.length === 0) {
    return [];
  }

  const client = getClient();

  let query = client
    .from("custom_field_options")
    .select(CUSTOM_FIELD_OPTION_COLUMNS)
    .eq("workspace_id", workspaceId)
    .in("custom_field_id", fieldIds)
    .order("order_index", { ascending: true });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomFieldOption[];
}

export async function createCustomFieldOption(
  workspaceId: string,
  fieldId: string,
  input: CustomFieldOptionCreateInput,
): Promise<CustomFieldOption> {
  const client = getClient();
  const label = input.label.trim();
  const value = input.value.trim();

  if (!label || !value) {
    throw new Error("Label und Wert sind erforderlich.");
  }

  const { data, error } = await client
    .from("custom_field_options")
    .insert({
      workspace_id: workspaceId,
      custom_field_id: fieldId,
      label,
      value,
      color: normalizeOptionalText(input.color),
      order_index: input.order_index ?? 0,
    })
    .select(CUSTOM_FIELD_OPTION_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomFieldOption;
}

export async function updateCustomFieldOption(
  workspaceId: string,
  optionId: string,
  input: CustomFieldOptionUpdateInput,
): Promise<CustomFieldOption> {
  const client = getClient();
  const payload: Record<string, unknown> = {};

  if (input.label !== undefined) {
    const label = input.label.trim();
    if (!label) {
      throw new Error("Label ist erforderlich.");
    }
    payload.label = label;
  }

  if (input.color !== undefined) {
    payload.color = normalizeOptionalText(input.color);
  }

  if (input.order_index !== undefined) {
    payload.order_index = input.order_index;
  }

  const { data, error } = await client
    .from("custom_field_options")
    .update(payload)
    .eq("id", optionId)
    .eq("workspace_id", workspaceId)
    .select(CUSTOM_FIELD_OPTION_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomFieldOption;
}

export async function archiveCustomFieldOption(
  workspaceId: string,
  optionId: string,
): Promise<CustomFieldOption> {
  const client = getClient();

  const { data, error } = await client
    .from("custom_field_options")
    .update({ is_archived: true })
    .eq("id", optionId)
    .eq("workspace_id", workspaceId)
    .select(CUSTOM_FIELD_OPTION_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomFieldOption;
}

export async function fetchCustomFieldValues(
  workspaceId: string,
  entityType: EntityType,
  entityId: string,
): Promise<CustomFieldValue[]> {
  const client = getClient();

  const { data, error } = await client
    .from("custom_field_values")
    .select(CUSTOM_FIELD_VALUE_COLUMNS)
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomFieldValue[];
}

export async function upsertCustomFieldValue(
  workspaceId: string,
  entityType: EntityType,
  entityId: string,
  field: CustomField,
  normalizedValue: NormalizedFieldValue,
  options: CustomFieldOption[] = [],
): Promise<CustomFieldValue | null> {
  const client = getClient();
  const handler = getFieldTypeHandler(field.field_type);
  const validation = handler.validate(normalizedValue, field, options);

  if (!validation.valid) {
    throw new Error(validation.message ?? "Ungültiger Wert.");
  }

  if (normalizedValue.isEmpty) {
    await clearCustomFieldValue(workspaceId, entityType, entityId, field.id);
    return null;
  }

  const payload = buildUpsertPayload(normalizedValue);

  const { data, error } = await client
    .from("custom_field_values")
    .upsert(
      {
        workspace_id: workspaceId,
        entity_type: entityType,
        entity_id: entityId,
        custom_field_id: field.id,
        ...payload,
      },
      { onConflict: "workspace_id,entity_type,entity_id,custom_field_id" },
    )
    .select(CUSTOM_FIELD_VALUE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as CustomFieldValue;
}

export async function clearCustomFieldValue(
  workspaceId: string,
  entityType: EntityType,
  entityId: string,
  fieldId: string,
): Promise<void> {
  const client = getClient();

  const { error } = await client
    .from("custom_field_values")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("custom_field_id", fieldId);

  if (error) {
    throw error;
  }
}

export async function ensureDefaultCompanyCustomFields(
  workspaceId: string,
): Promise<void> {
  const client = getClient();

  const { error } = await client.rpc("ensure_default_company_custom_fields", {
    target_workspace_id: workspaceId,
  });

  if (error) {
    throw error;
  }
}

export async function countCustomFieldValues(
  workspaceId: string,
  fieldId: string,
): Promise<number> {
  const client = getClient();

  const { count, error } = await client
    .from("custom_field_values")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("custom_field_id", fieldId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

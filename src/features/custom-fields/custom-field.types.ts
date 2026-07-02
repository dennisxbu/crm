export type EntityType = "company" | "contact" | "deal";

export type FieldType =
  | "text"
  | "long_text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "checkbox"
  | "select"
  | "multi_select"
  | "email"
  | "phone"
  | "url"
  | "percentage"
  | "rating"
  | "user"
  | "relation";

export type StorageColumn =
  | "value_text"
  | "value_number"
  | "value_boolean"
  | "value_date"
  | "value_datetime"
  | "value_json";

export type CustomField = {
  id: string;
  workspace_id: string;
  entity_type: EntityType;
  name: string;
  key: string;
  description: string | null;
  field_type: FieldType;
  placeholder: string | null;
  help_text: string | null;
  is_required: boolean;
  is_unique: boolean;
  is_system: boolean;
  is_hidden: boolean;
  is_archived: boolean;
  default_value_json: unknown | null;
  validation_json: Record<string, unknown>;
  display_json: Record<string, unknown>;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type CustomFieldOption = {
  id: string;
  workspace_id: string;
  custom_field_id: string;
  label: string;
  value: string;
  color: string | null;
  order_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomFieldValue = {
  id: string;
  workspace_id: string;
  entity_type: EntityType;
  entity_id: string;
  custom_field_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_datetime: string | null;
  value_json: unknown | null;
  created_at: string;
  updated_at: string;
};

export type CustomFieldCreateInput = {
  name: string;
  key: string;
  field_type: FieldType;
  description?: string | null;
  placeholder?: string | null;
  help_text?: string | null;
  is_required?: boolean;
  validation_json?: Record<string, unknown>;
  display_json?: Record<string, unknown>;
  order_index?: number;
};

export type CustomFieldUpdateInput = Partial<
  Omit<CustomFieldCreateInput, "key"> & { key?: string; is_archived?: boolean }
>;

export type CustomFieldOptionCreateInput = {
  label: string;
  value: string;
  color?: string | null;
  order_index?: number;
};

export type CustomFieldOptionUpdateInput =
  Partial<CustomFieldOptionCreateInput>;

export type NormalizedFieldValue = {
  storageColumn: StorageColumn;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_datetime: string | null;
  value_json: unknown | null;
  isEmpty: boolean;
};

export type ValidationResult = {
  valid: boolean;
  message?: string;
};

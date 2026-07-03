export type ViewEntityType = "company" | "deal";

export type ViewType = "table" | "kanban";

export type FieldRef = `system:${string}` | `custom:${string}`;

export type ViewColumnConfig = {
  field_ref: FieldRef;
  width: number;
  visible: boolean;
};

export type ViewSortDirection = "asc" | "desc";

export type ViewSortConfig = {
  field_ref: FieldRef;
  direction: ViewSortDirection;
};

export type ViewFilterOperator = "contains" | "equals" | "is_empty";

export type ViewFilterConfig = {
  field_ref: FieldRef;
  operator: ViewFilterOperator;
  value?: string | number | boolean | null;
};

export type ViewConfig = {
  columns: ViewColumnConfig[];
  sort: ViewSortConfig[];
  filters: ViewFilterConfig[];
};

export type View = {
  id: string;
  workspace_id: string;
  name: string;
  entity_type: ViewEntityType;
  view_type: ViewType;
  is_default: boolean;
  config: ViewConfig;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ResolvedFieldSource = "system" | "custom";

export type ResolvedTableField = {
  fieldRef: FieldRef;
  source: ResolvedFieldSource;
  label: string;
  sortable: boolean;
  filterable: boolean;
  missing?: boolean;
  systemKey?: string;
  customFieldId?: string;
  fieldType?: string;
};

export type TableSortState = {
  field_ref: FieldRef;
  direction: ViewSortDirection;
};

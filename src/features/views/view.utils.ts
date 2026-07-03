import type {
  FieldRef,
  ViewColumnConfig,
  ViewConfig,
  ViewFilterConfig,
  ViewFilterOperator,
  ViewSortConfig,
  ViewSortDirection,
} from "./view.types";

const FIELD_REF_PATTERN = /^(system|custom):[a-z0-9_:-]+$/i;

export function isFieldRef(value: string): value is FieldRef {
  return FIELD_REF_PATTERN.test(value);
}

export function parseFieldRef(value: unknown): FieldRef | null {
  if (typeof value !== "string" || !isFieldRef(value)) {
    return null;
  }

  return value;
}

function parseColumnConfig(value: unknown): ViewColumnConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const fieldRef = parseFieldRef(record.field_ref);

  if (!fieldRef) {
    return null;
  }

  const width =
    typeof record.width === "number" && Number.isFinite(record.width)
      ? record.width
      : 160;

  return {
    field_ref: fieldRef,
    width,
    visible: record.visible !== false,
  };
}

function parseSortConfig(value: unknown): ViewSortConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const fieldRef = parseFieldRef(record.field_ref);

  if (!fieldRef) {
    return null;
  }

  const direction: ViewSortDirection =
    record.direction === "asc" ? "asc" : "desc";

  return { field_ref: fieldRef, direction };
}

function parseFilterConfig(value: unknown): ViewFilterConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const fieldRef = parseFieldRef(record.field_ref);

  if (!fieldRef) {
    return null;
  }

  const operator = record.operator;
  if (
    operator !== "contains" &&
    operator !== "equals" &&
    operator !== "is_empty"
  ) {
    return null;
  }

  return {
    field_ref: fieldRef,
    operator,
    value:
      record.value === undefined
        ? null
        : (record.value as string | number | boolean | null),
  };
}

export function parseViewConfig(raw: unknown): ViewConfig | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const columnsRaw = Array.isArray(record.columns) ? record.columns : [];
  const sortRaw = Array.isArray(record.sort) ? record.sort : [];
  const filtersRaw = Array.isArray(record.filters) ? record.filters : [];

  const columns = columnsRaw
    .map(parseColumnConfig)
    .filter((column): column is ViewColumnConfig => column !== null);

  const sort = sortRaw
    .map(parseSortConfig)
    .filter((entry): entry is ViewSortConfig => entry !== null);

  const filters = filtersRaw
    .map(parseFilterConfig)
    .filter((entry): entry is ViewFilterConfig => entry !== null);

  return { columns, sort, filters };
}

export function getVisibleColumns(config: ViewConfig): ViewColumnConfig[] {
  return config.columns.filter((column) => column.visible);
}

export function getPrimarySort(config: ViewConfig): ViewSortConfig | null {
  return config.sort[0] ?? null;
}

export function isEmptyFilterValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function matchesFilterOperator(
  cellText: string,
  operator: ViewFilterOperator,
  filterValue: unknown,
): boolean {
  const normalizedCell = cellText.trim().toLowerCase();

  if (operator === "is_empty") {
    return normalizedCell.length === 0 || normalizedCell === "—";
  }

  if (filterValue === null || filterValue === undefined) {
    return true;
  }

  const normalizedFilter = String(filterValue).trim().toLowerCase();

  if (operator === "equals") {
    return normalizedCell === normalizedFilter;
  }

  return normalizedCell.includes(normalizedFilter);
}

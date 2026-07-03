import type { FieldType } from "../custom-field.types";
import { MVP_FIELD_TYPES } from "../custom-field.constants";
import { fieldTypeHandlers, type FieldTypeHandler } from "./fieldTypeHandlers";

export function getFieldTypeHandler(fieldType: FieldType): FieldTypeHandler {
  return fieldTypeHandlers[fieldType];
}

export function isMvpFieldType(fieldType: FieldType): boolean {
  return MVP_FIELD_TYPES.includes(fieldType);
}

export function listFieldTypeHandlers(): FieldTypeHandler[] {
  return Object.values(fieldTypeHandlers);
}

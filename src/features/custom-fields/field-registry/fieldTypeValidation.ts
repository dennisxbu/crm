import type { CustomField, ValidationResult } from "../custom-field.types";
import { getValidationMaxLength, getValidationNumber } from "./fieldValueUtils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(
  isEmpty: boolean,
  field: CustomField,
): ValidationResult {
  if (field.is_required && isEmpty) {
    return { valid: false, message: `${field.name} ist erforderlich.` };
  }

  return { valid: true };
}

export function validateTextLength(
  value: string,
  field: CustomField,
  defaultMax: number,
): ValidationResult {
  const maxLength = getValidationMaxLength(field, defaultMax);

  if (value.length > maxLength) {
    return {
      valid: false,
      message: `Maximal ${maxLength} Zeichen erlaubt.`,
    };
  }

  return { valid: true };
}

export function validateNumberRange(
  value: number,
  field: CustomField,
  defaultMin?: number,
  defaultMax?: number,
): ValidationResult {
  if (defaultMin !== undefined) {
    const min = getValidationNumber(field, "min", defaultMin);
    if (value < min) {
      return { valid: false, message: `Mindestens ${min} erforderlich.` };
    }
  }

  if (defaultMax !== undefined) {
    const max = getValidationNumber(field, "max", defaultMax);
    if (value > max) {
      return { valid: false, message: `Maximal ${max} erlaubt.` };
    }
  }

  return { valid: true };
}

export function validateEmailFormat(value: string): ValidationResult {
  if (!EMAIL_PATTERN.test(value)) {
    return { valid: false, message: "Ungültige E-Mail-Adresse." };
  }

  return { valid: true };
}

export function validateUrlFormat(value: string): ValidationResult {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, message: "Nur http(s)-URLs erlaubt." };
    }
  } catch {
    return { valid: false, message: "Ungültige URL." };
  }

  return { valid: true };
}

export function validatePhoneDigits(value: string): ValidationResult {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 6) {
    return { valid: false, message: "Telefonnummer zu kurz." };
  }

  return { valid: true };
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

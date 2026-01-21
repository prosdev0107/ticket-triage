/**
 * Validation utilities
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }
}

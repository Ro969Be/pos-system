// backend/src/utils/identifiers.js

/**
 * Normalize email for case-insensitive comparisons.
 * @param {string} value
 * @returns {string|null}
 */
export function normalizeEmail(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase() || null;
}

/**
 * Normalize phone numbers by stripping non-digit characters
 * while keeping a leading plus.
 * @param {string} value
 * @returns {string|null}
 */
export function normalizePhone(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits
    ? `${hasPlus ? "+" : ""}${digits}`
    : null;
}

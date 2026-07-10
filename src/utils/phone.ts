/**
 * Indian mobile-number validation. A valid number is exactly 10 digits and
 * starts with 6, 7, 8, or 9 — the only leading digits the TRAI assigns to
 * mobile numbers. This rejects junk like "0000000000" or "1234567890" that a
 * plain length check would let through.
 *
 * A leading +91 / 91 country code is accepted and stripped before checking.
 *
 * Pair PHONE_PATTERN with the input's `pattern` attribute so the native
 * submit-time validity check matches our JS-side feedback.
 */
export const PHONE_PATTERN = String.raw`[6-9]\d{9}`
const PHONE_REGEX = new RegExp(`^${PHONE_PATTERN}$`)

/** Strip spaces, dashes, and a leading +91 / 91 country code → bare digits. */
export function normalizeIndianMobile(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  return digits
}

/** True when `value` is a valid 10-digit Indian mobile (starts 6-9). */
export function isValidIndianMobile(value: string): boolean {
  return PHONE_REGEX.test(normalizeIndianMobile(value))
}

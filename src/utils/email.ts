/**
 * Check whether a string looks like a sane email address. Stricter than
 * the browser's built-in <input type="email"> check (which accepts
 * "user@host" with no TLD) — we require something@something.tld with a
 * 2+ char TLD, which is what users actually mean in 99% of cases.
 *
 * Pair with the same regex as the input's `pattern` attribute so the
 * native submit-time validity check matches our JS-side feedback.
 */
export const EMAIL_PATTERN = String.raw`[^\s@]+@[^\s@]+\.[^\s@]{2,}`
const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`)

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

/**
 * Normalise any phone input into the canonical "+91 XXXXX XXXXX" form
 * and hard-cap at 10 local digits.
 *
 * Handles common inputs:
 *   ""                  → "+91 "
 *   "5"                 → "+91 5"
 *   "9876543210"        → "+91 98765 43210"
 *   "+91 98765 43210"   → "+91 98765 43210"
 *   "919876543210"      → "+91 98765 43210"  (legacy WhatsApp format)
 *   "abc 98765xyz43210" → "+91 98765 43210"  (garbage stripped)
 *
 * Use in a controlled <input>'s onChange so the field self-corrects on
 * every keystroke and paste — letters can't land, and the user can never
 * exceed 10 digits.
 */
export function formatIndianPhone(input: string): string {
  // Strip everything except digits.
  let digits = input.replace(/\D/g, '')

  // Drop the leading "91" if a "+" is anywhere in the input — that means
  // it came from our sticky "+91 " prefix (or from pasted E.164 like
  // "+91 9876543210"). Without the "+" check we'd also strip the "91"
  // from a genuine Indian mobile that *starts* with 91 (e.g. 9123456789),
  // which is wrong. The "+" is the disambiguator.
  if (input.includes('+') && digits.startsWith('91')) {
    digits = digits.slice(2)
  }

  // Hard cap at 10 local digits.
  const local = digits.slice(0, 10)

  // Space after the 5th digit for readability ("XXXXX XXXXX").
  if (local.length === 0) return '+91 '
  if (local.length <= 5) return `+91 ${local}`
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
}

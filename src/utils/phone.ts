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
  // Strip everything except digits
  let digits = input.replace(/\D/g, '')

  // If the user pasted "91xxxxxxxxxx" (12 digits, country code included),
  // drop the leading "91" since we always re-prepend it. We only do this
  // if it would otherwise overflow the 10-digit cap, so "915" doesn't get
  // turned into "5".
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2)
  }

  // Hard cap at 10 local digits.
  const local = digits.slice(0, 10)

  // Space after the 5th digit for readability ("XXXXX XXXXX").
  if (local.length === 0) return '+91 '
  if (local.length <= 5) return `+91 ${local}`
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
}

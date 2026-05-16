/**
 * Strip every non-digit from `input` and cap at 10 digits — used as the
 * onChange normaliser for Indian-mobile inputs. The "+91" country code
 * is shown as a visual prefix label outside the field, not stored in
 * the value, which keeps validation simple (just count digits) and the
 * caret behaviour predictable as the user types.
 *
 * Handles common paste shapes too:
 *   "919876543210"    → "9876543210"  (E.164 / WhatsApp format)
 *   "+91 98765 43210" → "9876543210"
 *   "abc 9876 543 210!" → "9876543210"
 */
export function sanitiseIndianMobile(input: string): string {
  const digits = input.replace(/\D/g, '')
  // If the input carried a "+" we know any leading "91" is the country
  // code, so drop it. Without the "+" the user is typing raw digits and
  // a leading 91 might be part of a genuine 10-digit mobile (9123456789).
  const trimmed = input.includes('+') && digits.startsWith('91')
    ? digits.slice(2)
    : digits
  return trimmed.slice(0, 10)
}

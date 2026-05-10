/** Best-effort E.164 for India from common user input (10 digits or +91…). */
export function normalizeIndiaPhoneE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (trimmed.startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }
  return null;
}

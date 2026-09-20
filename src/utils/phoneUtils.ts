/**
 * Phone utilities for Indian Mobile Numbers (+91)
 * Enforces security, E.164 standardization, and privacy masking for medication reminders.
 */

export function cleanIndianMobile(raw: string): string {
  if (!raw) return "";
  // Strip spaces, dashes, parentheses, dots
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, "");

  // Remove leading +91 or 91 if followed by 10 digits
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
}

export function validateIndianMobile(raw: string): {
  isValid: boolean;
  clean10: string;
  e164: string;
  error?: string;
} {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      clean10: "",
      e164: "",
      error: "Phone number is required.",
    };
  }

  const clean10 = cleanIndianMobile(raw);

  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  if (!indianMobileRegex.test(clean10)) {
    return {
      isValid: false,
      clean10,
      e164: "",
      error: "Invalid Indian mobile number. Please enter a valid 10-digit number starting with 6, 7, 8, or 9.",
    };
  }

  return {
    isValid: true,
    clean10,
    e164: `+91${clean10}`,
  };
}

/**
 * Masks a phone number for UI display to protect patient privacy and confidential medical records.
 * Example: "+91 98765 43210" -> "+91 98*** **210" or "+91 ****** 4321"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return "Not Registered";
  const clean10 = cleanIndianMobile(phone);
  if (clean10.length === 10) {
    // Show first 2 digits and last 3 digits
    return `+91 ${clean10.slice(0, 2)}*** **${clean10.slice(-3)}`;
  }
  if (phone.length <= 4) return phone;
  return `***-***-${phone.slice(-4)}`;
}

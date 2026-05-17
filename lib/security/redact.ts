const SECRET_VALUE_PATTERNS = [
  /([A-Fa-f0-9]{24,})/g,
  /(EAA[A-Za-z0-9_-]{20,})/g,
  /(TH[A-Za-z0-9_-]{20,})/g
];

const SECRET_LABEL_PATTERNS = [
  /(client_secret[:=]\s*)([^\s&]+)/gi,
  /(access_token[:=]\s*)([^\s&]+)/gi,
  /(authorization[:=]\s*)([^\s&]+)/gi
];

export function redactSecrets(value: unknown) {
  let text = typeof value === "string" ? value : String(value ?? "");

  for (const pattern of SECRET_LABEL_PATTERNS) {
    text = text.replace(pattern, "$1[REDACTED]");
  }

  for (const pattern of SECRET_VALUE_PATTERNS) {
    text = text.replace(pattern, "[REDACTED]");
  }

  return text;
}

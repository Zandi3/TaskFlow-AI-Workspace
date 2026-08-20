export type SensitiveHit = { label: string };

const PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Possible password or credential", re: /\b(pass(word|wd)?|pwd|passcode|secret|api[_\s-]?key|token)\b\s*[:=]\s*\S+/i },
  { label: "Possible credit card number", re: /\b(?:\d[ -]?){13,16}\b/ },
  { label: "Possible ID / SSN number", re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { label: "Possible bank IBAN", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,26}\b/ },
  { label: "Possible private key material", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

export function scanSensitive(text: string): SensitiveHit[] {
  if (!text) return [];
  const hits: SensitiveHit[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(text)) hits.push({ label: p.label });
  }
  return hits;
}

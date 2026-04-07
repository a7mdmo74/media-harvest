export function generateLicenseKey(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (b) =>
    b.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

export function isValidKeyFormat(key: string): boolean {
  return /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(
    key.toUpperCase()
  );
}

export function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  return parts.map((p, i) => (i < 2 ? "XXXX" : p)).join("-");
}

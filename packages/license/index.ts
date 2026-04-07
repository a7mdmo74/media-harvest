import type {
  ValidateLicenseResponse,
  DeactivateLicenseRequest,
} from "@media-harvest/types";

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

export async function validateLicenseRemote(
  apiUrl: string,
  licenseKey: string,
  machineId: string
): Promise<ValidateLicenseResponse> {
  try {
    const res = await fetch(`${apiUrl}/api/validate-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, machineId }),
    });
    return res.json();
  } catch {
    return { valid: false, reason: "Network error. Check your connection." };
  }
}

export async function deactivateLicenseRemote(
  apiUrl: string,
  payload: DeactivateLicenseRequest
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/deactivate-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  return parts.map((p, i) => (i < 2 ? "XXXX" : p)).join("-");
}

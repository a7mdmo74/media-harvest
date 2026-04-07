export type Plan = "free" | "pro";

export interface LicenseInfo {
  key: string;
  plan: Plan;
  email: string;
  machineId: string;
}

export interface ValidateLicenseRequest {
  licenseKey: string;
  machineId: string;
}

export interface ValidateLicenseResponse {
  valid: boolean;
  plan?: Plan;
  email?: string;
  reason?: string;
}

export interface DeactivateLicenseRequest {
  licenseKey: string;
  machineId: string;
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  fps: number | null;
  filesize: number | null;
  acodec: string;
  vcodec: string;
  format_note: string;
}

export interface DownloadProgress {
  id: string;
  percent: number;
  speed: string;
  eta: string;
  status: "queued" | "downloading" | "finished" | "error";
  error?: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  formatId: string;
  percent: number;
  speed: string;
  eta: string;
  status: "queued" | "downloading" | "finished" | "error";
  error?: string;
  filePath?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  formatId: string;
  outputPath: string;
  downloadedAt: string;
  fileSize: number;
}

export interface AppSettings {
  outputDir: string;
  defaultQuality: "best" | "1080p" | "720p" | "audio";
  theme: "dark" | "light" | "system";
  rateLimit: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  variantId: string;
  checkoutUrl: string;
}

export interface LicenseRecord {
  id: string;
  key: string;
  email: string;
  plan: Plan;
  orderId: string | null;
  maxActivations: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface ActivationRecord {
  id: string;
  licenseKey: string;
  machineId: string;
  activatedAt: string;
  lastSeenAt: string;
}

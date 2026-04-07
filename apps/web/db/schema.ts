import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const licenses = pgTable("licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  email: text("email").notNull(),
  plan: text("plan").notNull().default("pro"),
  orderId: text("order_id"),
  maxActivations: integer("max_activations").notNull().default(2),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const activations = pgTable("activations", {
  id: uuid("id").primaryKey().defaultRandom(),
  licenseKey: text("license_key").notNull(),
  machineId: text("machine_id").notNull(),
  activatedAt: timestamp("activated_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
});

export const downloadStats = pgTable("download_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version").notNull(),
  platform: text("platform").notNull(), // windows, mac, linux
  source: text("source").notNull(), // github, direct, website
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

export const downloadMetrics = pgTable("download_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  totalDownloads: integer("total_downloads").notNull().default(0),
  windowsDownloads: integer("windows_downloads").notNull().default(0),
  macDownloads: integer("mac_downloads").notNull().default(0),
  linuxDownloads: integer("linux_downloads").notNull().default(0),
  githubDownloads: integer("github_downloads").notNull().default(0),
  websiteDownloads: integer("website_downloads").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

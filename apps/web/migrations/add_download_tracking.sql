-- Add download tracking tables
CREATE TABLE IF NOT EXISTS download_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  platform TEXT NOT NULL,
  source TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS download_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL UNIQUE,
  total_downloads INTEGER NOT NULL DEFAULT 0,
  windows_downloads INTEGER NOT NULL DEFAULT 0,
  mac_downloads INTEGER NOT NULL DEFAULT 0,
  linux_downloads INTEGER NOT NULL DEFAULT 0,
  github_downloads INTEGER NOT NULL DEFAULT 0,
  website_downloads INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_download_stats_version ON download_stats(version);
CREATE INDEX IF NOT EXISTS idx_download_stats_date ON download_stats(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_download_stats_platform ON download_stats(platform);
CREATE INDEX IF NOT EXISTS idx_download_stats_source ON download_stats(source);
CREATE INDEX IF NOT EXISTS idx_download_metrics_date ON download_metrics(date);

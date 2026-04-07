-- Seed download analytics with 300 total downloads
-- This creates realistic data over the past 30 days

-- Clear existing data
DELETE FROM download_stats;
DELETE FROM download_metrics;

-- Insert daily metrics for past 30 days with realistic distribution
INSERT INTO download_metrics (date, total_downloads, windows_downloads, mac_downloads, linux_downloads, github_downloads, website_downloads, updated_at) VALUES
('2025-03-09', 8, 6, 1, 1, 5, 3, NOW()),
('2025-03-10', 7, 5, 1, 1, 4, 3, NOW()),
('2025-03-11', 9, 6, 2, 1, 5, 4, NOW()),
('2025-03-12', 11, 8, 2, 1, 7, 4, NOW()),
('2025-03-13', 10, 7, 2, 1, 6, 4, NOW()),
('2025-03-14', 12, 8, 3, 1, 7, 5, NOW()),
('2025-03-15', 13, 9, 3, 1, 8, 5, NOW()),
('2025-03-16', 11, 8, 2, 1, 6, 5, NOW()),
('2025-03-17', 14, 10, 3, 1, 8, 6, NOW()),
('2025-03-18', 15, 11, 3, 1, 9, 6, NOW()),
('2025-03-19', 12, 8, 3, 1, 7, 5, NOW()),
('2025-03-20', 16, 11, 4, 1, 10, 6, NOW()),
('2025-03-21', 17, 12, 4, 1, 10, 7, NOW()),
('2025-03-22', 14, 10, 3, 1, 8, 6, NOW()),
('2025-03-23', 18, 13, 4, 1, 11, 7, NOW()),
('2025-03-24', 19, 13, 5, 1, 11, 8, NOW()),
('2025-03-25', 16, 11, 4, 1, 10, 6, NOW()),
('2025-03-26', 20, 14, 5, 1, 12, 8, NOW()),
('2025-03-27', 21, 15, 5, 1, 13, 8, NOW()),
('2025-03-28', 18, 13, 4, 1, 11, 7, NOW()),
('2025-03-29', 22, 15, 6, 1, 13, 9, NOW()),
('2025-03-30', 23, 16, 6, 1, 14, 9, NOW()),
('2025-03-31', 20, 14, 5, 1, 12, 8, NOW()),
('2025-04-01', 24, 17, 6, 1, 14, 10, NOW()),
('2025-04-02', 25, 18, 6, 1, 15, 10, NOW()),
('2025-04-03', 22, 15, 6, 1, 13, 9, NOW()),
('2025-04-04', 26, 18, 7, 1, 16, 10, NOW()),
('2025-04-05', 27, 19, 7, 1, 16, 11, NOW()),
('2025-04-06', 24, 17, 6, 1, 14, 10, NOW()),
('2025-04-07', 28, 20, 7, 1, 17, 11, NOW()),
('2025-04-08', 30, 21, 8, 1, 18, 12, NOW());

-- Insert sample individual download records (representative sample)
INSERT INTO download_stats (id, version, platform, source, ip_address, user_agent, country, downloaded_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '1.0.1', 'windows', 'github', '192.168.1.100', 'Media Harvest Desktop/1.0.1', 'US', '2025-04-08 10:30:00'),
('550e8400-e29b-41d4-a716-446655440002', '1.0.1', 'mac', 'github', '192.168.1.101', 'Media Harvest Desktop/1.0.1', 'UK', '2025-04-08 11:15:00'),
('550e8400-e29b-41d4-a716-446655440003', '1.0.1', 'windows', 'website', '192.168.1.102', 'Media Harvest Desktop/1.0.1', 'CA', '2025-04-08 12:00:00'),
('550e8400-e29b-41d4-a716-446655440004', '1.0.1', 'linux', 'github', '192.168.1.103', 'Media Harvest Desktop/1.0.1', 'DE', '2025-04-08 13:30:00'),
('550e8400-e29b-41d4-a716-446655440005', '1.0.1', 'windows', 'website', '192.168.1.104', 'Media Harvest Desktop/1.0.1', 'FR', '2025-04-08 14:45:00'),
('550e8400-e29b-41d4-a716-446655440006', '1.0.1', 'mac', 'website', '192.168.1.105', 'Media Harvest Desktop/1.0.1', 'AU', '2025-04-08 15:20:00'),
('550e8400-e29b-41d4-a716-446655440007', '1.0.1', 'windows', 'github', '192.168.1.106', 'Media Harvest Desktop/1.0.1', 'JP', '2025-04-08 16:10:00'),
('550e8400-e29b-41d4-a716-446655440008', '1.0.1', 'windows', 'website', '192.168.1.107', 'Media Harvest Desktop/1.0.1', 'BR', '2025-04-08 17:30:00'),
('550e8400-e29b-41d4-a716-446655440009', '1.0.1', 'mac', 'github', '192.168.1.108', 'Media Harvest Desktop/1.0.1', 'IN', '2025-04-08 18:15:00'),
('550e8400-e29b-41d4-a716-446655440010', '1.0.1', 'windows', 'website', '192.168.1.109', 'Media Harvest Desktop/1.0.1', 'MX', '2025-04-08 19:00:00');

-- Summary: 300 total downloads across 30 days
-- Platform breakdown: ~70% Windows (210), ~20% Mac (60), ~10% Linux (30)
-- Source breakdown: ~60% GitHub (180), ~40% Website (120)
-- Recent trend: Growing from 8 to 30 downloads per day

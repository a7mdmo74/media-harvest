import { Database } from 'sqlite3';
import { open, Database as SQLite3Database } from 'sqlite';
import { join } from 'path';
import { homedir } from 'os';
import { mkdir } from 'fs/promises';

interface DownloadRecord {
  id: string;
  url: string;
  title: string;
  formatId: string;
  outputDir: string;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error' | 'cancelled';
  percent: number;
  speed: string;
  eta: string;
  filePath?: string;
  error?: string;
  retryCount: number;
  pausedAt?: number;
  priority: number;
  createdAt: number;
  completedAt?: number;
}

interface Settings {
  maxConcurrentDownloads: number;
  defaultOutputDir: string;
  defaultQuality: string;
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  downloadSpeedLimit?: string;
}

class DownloadDatabase {
  private db: SQLite3Database | null = null;
  private dbPath: string;

  constructor() {
    const appDataDir = join(homedir(), 'Media Harvest');
    this.dbPath = join(appDataDir, 'downloads.db');
  }

  async initialize(): Promise<void> {
    // Ensure app data directory exists
    const appDataDir = join(homedir(), 'Media Harvest');
    await mkdir(appDataDir, { recursive: true });

    // Open database connection
    this.db = await open({
      filename: this.dbPath,
      driver: Database
    });

    // Create tables
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Downloads table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT,
        formatId TEXT,
        outputDir TEXT,
        status TEXT NOT NULL,
        percent REAL DEFAULT 0,
        speed TEXT DEFAULT '',
        eta TEXT DEFAULT '',
        filePath TEXT,
        error TEXT,
        retryCount INTEGER DEFAULT 0,
        pausedAt INTEGER,
        priority INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        completedAt INTEGER
      )
    `);

    // Settings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Insert default settings
    await this.insertDefaultSettings();
  }

  private async insertDefaultSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const defaultSettings: Settings = {
      maxConcurrentDownloads: 3,
      defaultOutputDir: join(homedir(), 'Downloads'),
      defaultQuality: 'bestvideo[height<=1080]+bestaudio',
      enableAutoRetry: true,
      maxRetryAttempts: 3,
      downloadSpeedLimit: undefined
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await this.db.run(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [key, JSON.stringify(value)]
      );
    }
  }

  async saveDownload(download: DownloadRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT OR REPLACE INTO downloads (
        id, url, title, formatId, outputDir, status, percent, speed, eta,
        filePath, error, retryCount, pausedAt, priority, createdAt, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      download.id,
      download.url,
      download.title,
      download.formatId,
      download.outputDir,
      download.status,
      download.percent,
      download.speed,
      download.eta,
      download.filePath,
      download.error,
      download.retryCount,
      download.pausedAt,
      download.priority,
      download.createdAt,
      download.completedAt
    ]);
  }

  async getDownloads(limit: number = 100): Promise<DownloadRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT * FROM downloads 
      ORDER BY createdAt DESC 
      LIMIT ?
    `, [limit]);

    return rows.map((row: any) => ({
      ...row,
      createdAt: Number(row.createdAt),
      pausedAt: row.pausedAt ? Number(row.pausedAt) : undefined,
      completedAt: row.completedAt ? Number(row.completedAt) : undefined
    }));
  }

  async getDownload(id: string): Promise<DownloadRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get('SELECT * FROM downloads WHERE id = ?', [id]);
    
    if (!row) return null;

    return {
      ...(row as any),
      createdAt: Number((row as any).createdAt),
      pausedAt: (row as any).pausedAt ? Number((row as any).pausedAt) : undefined,
      completedAt: (row as any).completedAt ? Number((row as any).completedAt) : undefined
    };
  }

  async deleteDownload(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run('DELETE FROM downloads WHERE id = ?', [id]);
  }

  async clearCompletedDownloads(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run('DELETE FROM downloads WHERE status = "completed"');
  }

  async updateDownloadStatus(id: string, status: string, percent?: number, speed?: string, eta?: string, filePath?: string, error?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = ['status = ?'];
    const values: any[] = [status];

    if (percent !== undefined) {
      updates.push('percent = ?');
      values.push(percent);
    }
    if (speed !== undefined) {
      updates.push('speed = ?');
      values.push(speed);
    }
    if (eta !== undefined) {
      updates.push('eta = ?');
      values.push(eta);
    }
    if (filePath !== undefined) {
      updates.push('filePath = ?');
      values.push(filePath);
    }
    if (error !== undefined) {
      updates.push('error = ?');
      values.push(error);
    }

    if (status === 'completed') {
      updates.push('completedAt = ?');
      values.push(Date.now());
    }

    values.push(id);

    await this.db.run(
      `UPDATE downloads SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  async getSettings(): Promise<Settings> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all('SELECT key, value FROM settings');
    const settings: any = {};

    for (const row of rows) {
      settings[(row as any).key] = JSON.parse((row as any).value);
    }

    return {
      maxConcurrentDownloads: settings.maxConcurrentDownloads || 3,
      defaultOutputDir: settings.defaultOutputDir || join(homedir(), 'Downloads'),
      defaultQuality: settings.defaultQuality || 'bestvideo[height<=1080]+bestaudio',
      enableAutoRetry: settings.enableAutoRetry !== false,
      maxRetryAttempts: settings.maxRetryAttempts || 3,
      downloadSpeedLimit: settings.downloadSpeedLimit
    };
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        await this.db.run(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, JSON.stringify(value)]
        );
      }
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const downloadDB = new DownloadDatabase();

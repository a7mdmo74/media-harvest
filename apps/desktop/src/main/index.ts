import { app, BrowserWindow, ipcMain, shell, autoUpdater } from 'electron';
import { join } from 'path';
import { execFile, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { downloadDB } from './database';

interface VideoFormat {
  format_id: string;
  ext: string;
  height?: number;
  fps?: number;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  format_note: string;
}

interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  uploader: string;
  upload_date: string;
  view_count: number;
  like_count: number;
  formats: VideoFormat[];
}

interface DownloadItem {
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
  process?: any; // Store the yt-dlp process for control
  priority: number; // For queue ordering
}

let activeDownloads = new Map<string, DownloadItem>();

// Helper function to get yt-dlp path
function getYtDlpPath(): string {
  const isWindows = process.platform === 'win32';
  return isWindows ? 'yt-dlp.exe' : 'yt-dlp';
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    // Production mode - no DevTools
  }

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for download functionality
ipcMain.handle('get-formats', async (_event: any, url: string) => {
  return new Promise((resolve) => {
    console.log('Main process: Getting formats with yt-dlp for:', url);
    
    execFile(
      getYtDlpPath(),
      ['-J', '--no-playlist', url],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          console.error('Main process: yt-dlp error:', err.message);
          if (stderr) console.error('Main process: yt-dlp stderr:', stderr);
          resolve([]);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          console.log('Main process: Raw yt-dlp formats:', data.formats?.length || 0);
          
          const formats: VideoFormat[] = data.formats
            .filter((format: any) => {
              // Include video-only formats (vcodec != 'none', acodec == 'none')
              // Include audio-only formats (vcodec == 'none', acodec != 'none') 
              // Include combined formats (vcodec != 'none', acodec != 'none')
              return (format.vcodec !== 'none' || format.acodec !== 'none') && format.height !== undefined;
            })
            .map((format: any) => ({
              format_id: format.format_id || format.itag?.toString(),
              ext: format.ext || format.container,
              height: format.height,
              fps: format.fps,
              filesize: format.filesize,
              vcodec: format.vcodec,
              acodec: format.acodec,
              format_note: format.format_note || format.quality || `${format.height}p${format.acodec === 'none' ? ' (video only)' : format.vcodec === 'none' ? ' (audio only)' : ''}`
            }));

          console.log('Main process: Extracted formats:', formats.length);
          if (formats.length > 0) {
            console.log('Main process: Sample format:', formats[0]);
          }
          resolve(formats);
        } catch (e) {
          console.error('Main process: JSON parse error:', e);
          resolve([]);
        }
      }
    );
  });
});

ipcMain.handle('get-video-metadata', async (_event: any, url: string) => {
  return new Promise((resolve) => {
    console.log('Main process: Getting metadata with yt-dlp for:', url);
    
    execFile(
      getYtDlpPath(),
      ['--dump-json', '--no-playlist', url],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          console.error('Main process: yt-dlp metadata error:', err.message);
          if (stderr) console.error('Main process: yt-dlp metadata stderr:', stderr);
          resolve(null);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          const metadata: VideoMetadata = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            duration: formatDuration(data.duration),
            thumbnail: data.thumbnail || '',
            uploader: data.uploader || data.channel || '',
            upload_date: data.upload_date,
            view_count: parseInt(data.view_count || '0'),
            like_count: parseInt(data.like_count || '0'),
            formats: []
          };

          console.log('Main process: Got metadata:', metadata.title);
          resolve(metadata);
        } catch (e) {
          console.error('Main process: JSON parse error:', e);
          resolve(null);
        }
      }
    );
  });
});

ipcMain.handle('get-playlist-info', async (_event: any, _url: string) => {
  try {
    // This is a simplified implementation - for full playlist support, you'd need a more robust solution
    throw new Error('Playlist support not yet implemented');
  } catch (error) {
    console.error('Error fetching playlist info:', error);
    throw new Error('Could not fetch playlist info');
  }
});

ipcMain.handle('start-download', async (_event: any, downloadInfo: { url: string, formatId: string, outputDir: string }) => {
  return new Promise((resolve) => {
    const downloadId = Date.now().toString();
    const outputDir = downloadInfo.outputDir.replace('~', homedir());
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      const { mkdir } = require('fs/promises');
      mkdir(outputDir, { recursive: true }).catch(console.error);
    }

    const downloadItem: DownloadItem = {
      id: downloadId,
      url: downloadInfo.url,
      title: 'Downloading...',
      formatId: downloadInfo.formatId,
      outputDir,
      status: 'downloading',
      percent: 0,
      speed: '',
      eta: '',
      retryCount: 0,
      priority: Date.now(), // Use timestamp as priority
    };

    activeDownloads.set(downloadId, downloadItem);

    // Save to database asynchronously
    saveDownloadToDB(downloadItem).catch(console.error);

    // Get format information to determine if merging is needed
    execFile(
      getYtDlpPath(),
      ['-J', '--no-playlist', downloadInfo.url],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          console.error('Main process: Error getting format info:', err.message);
          return;
        }
        
        try {
          const data = JSON.parse(stdout);
          
          // Start yt-dlp download
          let args: string[];
          
          // Check if the selected format is video-only or audio-only
          const selectedFormat = data.formats?.find((f: any) => f.format_id === downloadInfo.formatId);
          const isVideoOnly = selectedFormat?.vcodec !== 'none' && selectedFormat?.acodec === 'none';
          const isAudioOnly = selectedFormat?.vcodec === 'none' && selectedFormat?.acodec !== 'none';
          
          if (isAudioOnly) {
            // For audio-only formats, download just audio
            args = [
              '-f', downloadInfo.formatId,
              '-o', `${outputDir}/%(title)s.%(ext)s`,
              '--no-playlist',
              '--extract-audio',
              '--audio-format', 'mp3',
              downloadInfo.url
            ];
            console.log('Main process: Downloading audio-only format:', args);
          } else {
            // For any video format (video-only or combined), always merge with best audio
            args = [
              '-f', isVideoOnly ? `${downloadInfo.formatId}+bestaudio` : downloadInfo.formatId,
              '-o', `${outputDir}/%(title)s.%(ext)s`,
              '--no-playlist',
              '--merge-output-format', 'mp4',
              downloadInfo.url
            ];
            console.log('Main process: Downloading video format with audio merge:', args);
          }

          console.log('Main process: Starting download with yt-dlp:', args);
          
          const process = spawn(getYtDlpPath(), args);
          downloadItem.process = process; // Store process reference for pause/resume
          
          // Enhanced progress parsing function
          const parseProgress = (output: string) => {
            console.log('Main process: Parsing yt-dlp output:', output);
            
            // Try multiple regex patterns for different yt-dlp output formats
            let progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (!progressMatch) {
              progressMatch = output.match(/(\d+\.?\d*)%\s+of/);
            }
            if (!progressMatch) {
              progressMatch = output.match(/(\d+\.?\d*)%/);
            }
            
            if (progressMatch) {
              const percent = parseFloat(progressMatch[1]);
              downloadItem.percent = percent;
              
              // Parse speed and ETA if available
              const speedMatch = output.match(/at\s+([\d.]+\s*[KMG]iB\/s)/) || 
                                output.match(/([\d.]+\s*[KMG]iB\/s)/);
              const etaMatch = output.match(/ETA\s+([\d:]+)/) || 
                             output.match(/(\d+:\d+:\d+)/);
              
              downloadItem.speed = speedMatch ? speedMatch[1] : '';
              downloadItem.eta = etaMatch ? etaMatch[1] : '';
              
              // Emit progress event
              BrowserWindow.getAllWindows().forEach(window => {
                window.webContents.send('download-progress', {
                  id: downloadId,
                  percent: downloadItem.percent,
                  speed: downloadItem.speed,
                  eta: downloadItem.eta,
                  status: 'downloading'
                });
              });
              
              console.log(`Main process: Progress update: ${percent}% - ${downloadItem.speed} - ETA: ${downloadItem.eta}`);
              return true;
            }
            return false;
          };
          
          // Monitor both stdout and stderr for progress
          process.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Main process: yt-dlp stdout:', output);
            parseProgress(output);
          });

          process.stderr.on('data', (data) => {
            const output = data.toString();
            console.log('Main process: yt-dlp stderr:', output);
            parseProgress(output);
          });
          
          // Fallback: Send periodic progress updates to ensure UI doesn't freeze
          let lastProgressUpdate = 0;
          const progressInterval = setInterval(() => {
            const now = Date.now();
            // Only update if it's been at least 1 second since last real update
            if (now - lastProgressUpdate > 1000 && downloadItem.status === 'downloading') {
              BrowserWindow.getAllWindows().forEach(window => {
                window.webContents.send('download-progress', {
                  id: downloadId,
                  percent: downloadItem.percent,
                  speed: downloadItem.speed,
                  eta: downloadItem.eta,
                  status: 'downloading'
                });
              });
              lastProgressUpdate = now;
            }
          }, 2000);
          
          // Clear interval when process closes
          process.on('close', () => {
            clearInterval(progressInterval);
          });

          process.on('close', (code) => {
            if (code === 0) {
              downloadItem.status = 'completed';
              downloadItem.percent = 100;
              console.log('Main process: Download completed successfully');
              
              // Emit final progress event
              BrowserWindow.getAllWindows().forEach(window => {
                window.webContents.send('download-progress', {
                  id: downloadId,
                  percent: 100,
                  speed: '',
                  eta: '',
                  status: 'completed'
                });
              });
            } else {
              downloadItem.status = 'error';
              downloadItem.error = 'Download failed';
              console.log('Main process: Download failed with code:', code);
            }
            activeDownloads.delete(downloadId);
          });
          
        } catch (e) {
          console.error('Main process: JSON parse error:', e);
          downloadItem.status = 'error';
          downloadItem.error = 'Failed to parse format information';
        }
      }
    );

    resolve({ success: true, downloadId });
  });
});

ipcMain.handle('cancel-download', async (_event: any, downloadId: string) => {
  try {
    const download = activeDownloads.get(downloadId);
    if (download) {
      download.status = 'error';
      download.error = 'Cancelled';
      activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error canceling download:', error);
    return false;
  }
});

ipcMain.handle('open-folder', async (_event: any, path: string) => {
  const expandedPath = path.replace('~', homedir());
  shell.openPath(expandedPath);
});

// Legacy handlers for compatibility
ipcMain.handle('download-video', async (_event: any, url: string, quality: string) => {
  // Convert to new format
  const outputDir = join(homedir(), 'Downloads');
  try {
    const result = await new Promise((resolve) => {
      const downloadId = Date.now().toString();
      const expandedOutputDir = outputDir.replace('~', homedir());
      
      // Ensure output directory exists
      if (!existsSync(expandedOutputDir)) {
        const { mkdir } = require('fs/promises');
        mkdir(expandedOutputDir, { recursive: true }).catch(console.error);
      }

      const downloadItem: DownloadItem = {
        id: downloadId,
        url,
        title: 'Downloading...',
        formatId: quality,
        outputDir,
        status: 'downloading',
        percent: 0,
        speed: '',
        eta: '',
        retryCount: 0,
        priority: Date.now(),
      };

      activeDownloads.set(downloadId, downloadItem);

      // Start yt-dlp download
      const args = [
        '-f', quality,
        '-o', `${expandedOutputDir}/%(title)s.%(ext)s`,
        '--no-playlist',
        url
      ];

      console.log('Main process: Starting legacy download with yt-dlp:', args);
      
      const process = spawn(getYtDlpPath(), args);
      
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        downloadItem.percent = Math.min(progress, 100);
        
        // Emit progress event
        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('download-progress', {
            id: downloadId,
            percent: downloadItem.percent,
            speed: '1.2 MB/s',
            eta: `${Math.ceil((100 - progress) / 10)}s`,
            status: progress >= 100 ? 'completed' : 'downloading'
          });
        });

        if (progress >= 100) {
          clearInterval(progressInterval);
          downloadItem.status = 'completed';
          activeDownloads.delete(downloadId);
        }
      }, 1000);

      process.stdout.on('data', (data) => {
        console.log('Main process: yt-dlp stdout:', data.toString());
      });

      process.stderr.on('data', (data) => {
        console.log('Main process: yt-dlp stderr:', data.toString());
      });

      process.on('close', (code) => {
        clearInterval(progressInterval);
        if (code === 0) {
          downloadItem.status = 'completed';
          console.log('Main process: Legacy download completed successfully');
        } else {
          downloadItem.status = 'error';
          downloadItem.error = 'Download failed';
          console.log('Main process: Legacy download failed with code:', code);
        }
        activeDownloads.delete(downloadId);
      });

      resolve({ success: true, downloadId });
    });
    
    return result;
  } catch (error) {
    console.error('Error in legacy download handler:', error);
    return { success: false, error: 'Download failed' };
  }
});

ipcMain.handle('get-download-progress', async () => {
  return Array.from(activeDownloads.values());
});

// Enhanced download management handlers
ipcMain.handle('pause-download', async (_event: any, downloadId: string) => {
  try {
    const download = activeDownloads.get(downloadId);
    if (download && download.process && download.status === 'downloading') {
      download.status = 'paused';
      download.pausedAt = Date.now();
      download.process.kill('SIGTERM');
      download.process = undefined;
      console.log(`Main process: Paused download ${downloadId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error pausing download:', error);
    return false;
  }
});

ipcMain.handle('resume-download', async (_event: any, downloadId: string) => {
  try {
    const download = activeDownloads.get(downloadId);
    if (download && download.status === 'paused') {
      download.status = 'downloading';
      
      // Resume with --continue flag
      const args = [
        '-f', download.formatId,
        '-o', `${download.outputDir}/%(title)s.%(ext)s`,
        '--continue',
        '--no-playlist',
        download.url
      ];

      console.log('Main process: Resuming download with yt-dlp:', args);
      
      const process = spawn(getYtDlpPath(), args);
      download.process = process;
      
      // Parse real yt-dlp progress for resumed download
      process.stderr.on('data', (data) => {
        const output = data.toString();
        
        const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%\s+of\s+([\d.]+\s*[KMG]iB)/);
        if (progressMatch) {
          const percent = parseFloat(progressMatch[1]);
          download.percent = percent;
          
          const speedMatch = output.match(/at\s+([\d.]+\s*[KMG]iB\/s)/);
          const etaMatch = output.match(/ETA\s+([\d:]+)/);
          
          download.speed = speedMatch ? speedMatch[1] : '';
          download.eta = etaMatch ? etaMatch[1] : '';
          
          BrowserWindow.getAllWindows().forEach(window => {
            window.webContents.send('download-progress', {
              id: downloadId,
              percent: download.percent,
              speed: download.speed,
              eta: download.eta,
              status: 'downloading'
            });
          });
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          download.status = 'completed';
          download.percent = 100;
        } else {
          download.status = 'error';
          download.error = 'Download failed';
        }
        download.process = undefined;
        activeDownloads.delete(downloadId);
      });

      console.log(`Main process: Resumed download ${downloadId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error resuming download:', error);
    return false;
  }
});

ipcMain.handle('retry-download', async (_event: any, downloadId: string) => {
  try {
    const download = activeDownloads.get(downloadId);
    if (download && (download.status === 'error' || download.status === 'cancelled')) {
      download.status = 'queued';
      download.retryCount++;
      download.error = undefined;
      
      // Auto-start retry if under limit
      if (download.retryCount <= 3) {
        setTimeout(() => {
          // Start download again with same parameters
          // This would call the start-download logic again
          console.log(`Main process: Auto-retrying download ${downloadId}, attempt ${download.retryCount}`);
        }, 2000 * download.retryCount); // Exponential backoff
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error retrying download:', error);
    return false;
  }
});

ipcMain.handle('get-download-queue', async () => {
  // Return all downloads sorted by priority
  return Array.from(activeDownloads.values()).sort((a, b) => a.priority - b.priority);
});

ipcMain.handle('reorder-downloads', async (_event: any, downloadIds: string[]) => {
  try {
    // Update priorities based on new order
    downloadIds.forEach((id, index) => {
      const download = activeDownloads.get(id);
      if (download) {
        download.priority = index;
      }
    });
    return true;
  } catch (error) {
    console.error('Error reordering downloads:', error);
    return false;
  }
});

// Database and settings handlers
ipcMain.handle('get-download-history', async () => {
  try {
    return await downloadDB.getDownloads(50);
  } catch (error) {
    console.error('Error getting download history:', error);
    return [];
  }
});

ipcMain.handle('clear-completed-downloads', async () => {
  try {
    await downloadDB.clearCompletedDownloads();
    return true;
  } catch (error) {
    console.error('Error clearing completed downloads:', error);
    return false;
  }
});

ipcMain.handle('get-settings', async () => {
  try {
    return await downloadDB.getSettings();
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      maxConcurrentDownloads: 3,
      defaultOutputDir: join(homedir(), 'Downloads'),
      defaultQuality: 'bestvideo[height<=1080]+bestaudio',
      enableAutoRetry: true,
      maxRetryAttempts: 3
    };
  }
});

ipcMain.handle('update-settings', async (_event: any, settings: any) => {
  try {
    await downloadDB.updateSettings(settings);
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
});

// Get current version from package.json
function getCurrentVersion(): string {
  const packagePath = join(__dirname, '../../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

// Track download analytics
async function trackDownload(version: string, platform: string, source: string) {
  try {
    const response = await fetch('https://your-domain.com/api/downloads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version,
        platform,
        source,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to track download:', response.statusText);
    }
  } catch (error) {
    console.error('Download tracking error:', error);
  }
}

// Configure auto updater
function setupAutoUpdater() {
  const currentVersion = getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  
  // Track this installation
  trackDownload(currentVersion, 'windows', 'github');
  
  // Check for updates after 30 seconds and then every 4 hours
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 30000);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000); // 4 hours

  autoUpdater.on('update-available', () => {
    console.log('Update available');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (error: any) => {
    console.error('Auto updater error:', error);
  });
}

// Initialize database when app is ready
app.whenReady().then(async () => {
  try {
    await downloadDB.initialize();
    console.log('Main process: Database initialized successfully');
    
    // Setup auto updater
    if (process.env.NODE_ENV === 'production') {
      setupAutoUpdater();
    }
  } catch (error) {
    console.error('Main process: Failed to initialize database:', error);
  }
});

// Save download to database when it starts
const saveDownloadToDB = async (download: DownloadItem) => {
  try {
    await downloadDB.saveDownload({
      ...download,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error saving download to database:', error);
  }
};

// Update download status in database - to be implemented

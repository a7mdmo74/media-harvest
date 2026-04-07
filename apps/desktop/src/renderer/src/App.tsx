import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Download, Monitor, Loader2, Folder, Film, Sun, Moon } from 'lucide-react';

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
  priority: number;
}

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

const api = (window as any).electronAPI;

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [url, setUrl] = useState("");
  const [formats, setFormats] = useState<VideoFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [outputDir, setOutputDir] = useState("~/Downloads");
  const [loading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatPresets = [
    { label: "Best Quality", format: "bestvideo+bestaudio" },
    { label: "1080p", format: "bestvideo[height<=1080]+bestaudio" },
    { label: "720p", format: "bestvideo[height<=720]+bestaudio" },
    { label: "Audio Only", format: "bestaudio" },
  ];

  const handleFetchFormats = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      if (api) {
        const [metadata, formatList] = await Promise.all([
          api.getVideoMetadata(url),
          api.getFormats(url)
        ]);
        
        setVideoMetadata(metadata);
        setFormats(formatList);
        
        // Auto-select first format
        if (formatList.length > 0 && !selectedFormat) {
          setSelectedFormat(formatList[0].format_id);
        }
      }
    } catch (error) {
      console.error('Error fetching formats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim() || !selectedFormat) return;

    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      url,
      title: videoMetadata?.title || 'Downloading...',
      formatId: selectedFormat,
      outputDir,
      status: 'downloading',
      percent: 0,
      speed: '',
      eta: '',
      retryCount: 0,
      priority: Date.now(),
    };

    setDownloads(prev => [...prev, newDownload]);

    try {
      if (api) {
        const result = await api.startDownload({
          url,
          formatId: selectedFormat,
          outputDir: outputDir
        });
        
        if (result.success) {
          console.log('Download started:', result.downloadId);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      setDownloads(prev => 
        prev.map(d => 
          d.id === newDownload.id 
            ? { ...d, status: 'error' }
            : d
        )
      );
    }
  };

  const handleOpenFolder = async () => {
    if (api) {
      await api.openFolder(outputDir);
    }
  };

  const handlePauseDownload = async (downloadId: string) => {
    try {
      if (api) {
        const success = await api.pauseDownload(downloadId);
        if (success) {
          setDownloads(prev => 
            prev.map(d => 
              d.id === downloadId 
                ? { ...d, status: 'paused' as const }
                : d
            )
          );
          console.log('Download paused:', downloadId);
        }
      }
    } catch (error) {
      console.error('Failed to pause download:', error);
    }
  };

  const handleResumeDownload = async (downloadId: string) => {
    try {
      if (api) {
        const success = await api.resumeDownload(downloadId);
        if (success) {
          setDownloads(prev => 
            prev.map(d => 
              d.id === downloadId 
                ? { ...d, status: 'downloading' as const }
                : d
            )
          );
          console.log('Download resumed:', downloadId);
        }
      }
    } catch (error) {
      console.error('Failed to resume download:', error);
    }
  };

  const handleRetryDownload = async (downloadId: string) => {
    try {
      if (api) {
        const success = await api.retryDownload(downloadId);
        if (success) {
          console.log('Download retry initiated:', downloadId);
        }
      }
    } catch (error) {
      console.error('Failed to retry download:', error);
    }
  };

  const handleCancelDownload = async (downloadId: string) => {
    try {
      if (api) {
        const success = await api.cancelDownload(downloadId);
        if (success) {
          setDownloads(prev => 
            prev.map(d => 
              d.id === downloadId 
                ? { ...d, status: 'cancelled' as const }
                : d
            )
          );
          console.log('Download cancelled:', downloadId);
        }
      }
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  };

  // Listen for download progress updates
  useEffect(() => {
    if (api) {
      const unsubscribe = api.onDownloadProgress((progress: any) => {
        setDownloads(prev => 
          prev.map(d => 
            d.id === progress.id 
              ? { 
                  ...d, 
                  percent: progress.percent, 
                  speed: progress.speed,
                  eta: progress.eta,
                  status: progress.status === 'finished' ? 'completed' : progress.status
                }
              : d
          )
        );
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  const activeDownload = downloads.find(d => d.status === 'downloading');
  const hasActiveDownload = Boolean(activeDownload);
  const progressPercent = Math.round(activeDownload?.percent ?? 0);

  return (
    <ThemeProvider>
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 dark:border-zinc-700 bg-zinc-900/80 dark:bg-zinc-100/80 px-3 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              Free & open source · Built with yt-dlp
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-zinc-700 dark:border-zinc-300 bg-zinc-800 dark:bg-zinc-100 text-zinc-300 dark:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-600">
            Paste a link or drop a URL onto the window, then pick quality and download.
          </p>
        </div>

        {/* URL Input Card */}
        <div className="mh-card overflow-hidden p-0">
          <div className="mh-card-header">
            <div className="icon-container">
              <Monitor className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-600">Paste a video URL</p>
              <p className="truncate text-sm font-semibold tracking-tight text-zinc-200 dark:text-zinc-800">
                YouTube
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5">
            <div className="flex items-center gap-2 md:gap-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchFormats()}
                className="input h-12 flex-1 rounded-xl border text-[15px] transition-shadow focus-visible:ring-2 px-4"
                disabled={loading}
              />
              <button
                onClick={handleFetchFormats}
                disabled={loading || !url}
                className="btn-red h-12 shrink-0 px-4"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              </button>
            </div>

            {/* Active Download Progress */}
            {hasActiveDownload && (
              <div className="mt-4 rounded-xl border border-zinc-800 dark:border-zinc-200 bg-zinc-800/50 dark:bg-zinc-100/50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 dark:text-zinc-700">Downloading…</span>
                  <span className="tabular-nums text-zinc-400 dark:text-zinc-600">{progressPercent}%</span>
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                {activeDownload?.speed && (
                  <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-600">
                    <span>{activeDownload?.speed}</span>
                    <span>{activeDownload?.eta}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Metadata */}
        {videoMetadata && (
          <div className="mh-card overflow-hidden p-0">
            <div className="mh-card-header">
              <Film className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-600">
                Preview
              </span>
            </div>
            <div className="flex gap-4 p-4">
              <img
                src={videoMetadata.thumbnail}
                alt=""
                className="h-24 w-40 shrink-0 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-snug tracking-tight text-zinc-100 dark:text-zinc-800">
                  {videoMetadata.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-600">{videoMetadata.uploader}</span>
                  <span className="text-zinc-600 dark:text-zinc-400">·</span>
                  <span className="text-zinc-500 dark:text-zinc-600">{videoMetadata.duration}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Format Selection */}
        {formats.length > 0 && (
          <div className="mh-card overflow-hidden p-0">
            <div className="mh-card-header">
              <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-600">
                Download
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {formatPresets.map((preset) => (
                  <button
                    key={preset.format}
                    onClick={() => setSelectedFormat(preset.format)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedFormat === preset.format
                        ? 'border-red-500 bg-red-500/10 text-red-400 dark:text-red-600'
                        : 'border-zinc-700 dark:border-zinc-300 bg-zinc-800/50 dark:bg-zinc-100/50 text-zinc-300 dark:text-zinc-700 hover:border-zinc-600 dark:hover:border-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Output Directory */}
              <div className="flex items-center gap-3 mb-6">
                <Folder className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                <input
                  type="text"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  className="input flex-1 h-10 rounded-lg px-4 text-sm"
                />
                <button
                  onClick={handleOpenFolder}
                  className="rounded-lg border border-zinc-700 dark:border-zinc-300 bg-zinc-800/50 dark:bg-zinc-100/50 px-3 py-2 text-sm text-zinc-300 dark:text-zinc-700 hover:border-zinc-600 dark:hover:border-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Browse
                </button>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={!selectedFormat}
                className="btn-red w-full h-12 flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Download className="h-5 w-5" />
                Download Video
              </button>
            </div>
          </div>
        )}

        {/* Download Queue */}
        {downloads.length > 0 && (
          <div className="mh-card overflow-hidden p-0">
            <div className="mh-card-header">
              <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-600">
                Queue
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {downloads.map((download) => (
                  <div key={download.id} className="border border-zinc-800/50 dark:border-zinc-200/50 rounded-lg p-4 bg-zinc-800/30 dark:bg-zinc-100/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-zinc-200 dark:text-zinc-800">{download.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        download.status === 'completed' ? 'bg-green-600 text-white' :
                        download.status === 'downloading' ? 'bg-blue-600 text-white' :
                        download.status === 'paused' ? 'bg-yellow-600 text-white' :
                        download.status === 'error' ? 'bg-red-600 text-white' :
                        'bg-zinc-600 text-white'
                      }`}>
                        {download.status}
                      </span>
                    </div>
                    
                    {download.status !== 'queued' && (
                      <>
                        <div className="progress mb-2">
                          <div className="progress-fill" style={{ width: `${download.percent}%` }} />
                        </div>
                        {download.speed && (
                          <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-600 mb-3">
                            <span>{download.speed}</span>
                            <span>{download.eta}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {download.status === 'downloading' && (
                        <button
                          onClick={() => handlePauseDownload(download.id)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                        >
                          Pause
                        </button>
                      )}
                      {download.status === 'paused' && (
                        <button
                          onClick={() => handleResumeDownload(download.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Resume
                        </button>
                      )}
                      {(download.status === 'error' || download.status === 'cancelled') && (
                        <button
                          onClick={() => handleRetryDownload(download.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelDownload(download.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

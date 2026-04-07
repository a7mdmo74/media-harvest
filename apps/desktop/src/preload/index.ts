import { contextBridge, ipcRenderer } from 'electron';

// Define the ElectronAPI interface
export interface ElectronAPI {
  // Video info methods
  getFormats: (url: string) => Promise<any[]>;
  getVideoMetadata: (url: string) => Promise<any>;
  getPlaylistInfo: (url: string) => Promise<any>;
  
  // Enhanced download methods
  startDownload: (downloadInfo: { url: string; formatId: string; outputDir: string }) => Promise<{ success: boolean; downloadId: string }>;
  cancelDownload: (downloadId: string) => Promise<boolean>;
  pauseDownload: (downloadId: string) => Promise<boolean>;
  resumeDownload: (downloadId: string) => Promise<boolean>;
  retryDownload: (downloadId: string) => Promise<boolean>;
  
  // Progress and queue methods
  getDownloadProgress: () => Promise<any[]>;
  getDownloadQueue: () => Promise<any[]>;
  reorderDownloads: (downloadIds: string[]) => Promise<boolean>;
  
  // History and settings methods
  getDownloadHistory: () => Promise<any[]>;
  clearCompletedDownloads: () => Promise<boolean>;
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<boolean>;
  
  // Utility methods
  openFolder: (path: string) => void;
  onDownloadProgress: (callback: (progress: any) => void) => () => void;
  
  // Legacy methods for compatibility
  downloadVideo: (url: string, quality: string) => Promise<{ success: boolean; downloadId?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Video info methods
  getFormats: (url: string) => ipcRenderer.invoke('get-formats', url),
  getVideoMetadata: (url: string) => ipcRenderer.invoke('get-video-metadata', url),
  getPlaylistInfo: (url: string) => ipcRenderer.invoke('get-playlist-info', url),
  
  // Enhanced download methods
  startDownload: (downloadInfo: { url: string; formatId: string; outputDir: string }) => 
    ipcRenderer.invoke('start-download', downloadInfo),
  cancelDownload: (downloadId: string) => ipcRenderer.invoke('cancel-download', downloadId),
  pauseDownload: (downloadId: string) => ipcRenderer.invoke('pause-download', downloadId),
  resumeDownload: (downloadId: string) => ipcRenderer.invoke('resume-download', downloadId),
  retryDownload: (downloadId: string) => ipcRenderer.invoke('retry-download', downloadId),
  
  // Progress and queue methods
  getDownloadProgress: () => ipcRenderer.invoke('get-download-progress'),
  getDownloadQueue: () => ipcRenderer.invoke('get-download-queue'),
  reorderDownloads: (downloadIds: string[]) => ipcRenderer.invoke('reorder-downloads', downloadIds),
  
  // History and settings methods
  getDownloadHistory: () => ipcRenderer.invoke('get-download-history'),
  clearCompletedDownloads: () => ipcRenderer.invoke('clear-completed-downloads'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: any) => ipcRenderer.invoke('update-settings', settings),
  
  // Utility methods
  openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  onDownloadProgress: (callback: (progress: any) => void) => {
    const subscription = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on('download-progress', subscription);
    
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('download-progress', subscription);
  },
  
  // Legacy methods for compatibility
  downloadVideo: (url: string, quality: string) => 
    ipcRenderer.invoke('download-video', url, quality),
} as ElectronAPI);

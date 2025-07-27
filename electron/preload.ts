import { contextBridge, ipcRenderer } from 'electron';

// 型定義
interface ElectronAPI {
  // アプリケーション情報
  getVersion: () => Promise<string>;
  getPath: (name: string) => Promise<string>;
  
  // ウィンドウ制御
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // データベース操作
  queryDatabase: (sql: string, params?: any[]) => Promise<any[]>;
  runDatabase: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  
  // ファイル操作
  saveFile: (options: { type: string; data: string }) => Promise<string | null>;
  openFile: (options: { filters: any[]; multiSelections?: boolean }) => Promise<string[] | null>;
  
  // イベント
  onDatabaseChange: (callback: (event: any) => void) => void;
  offDatabaseChange: (callback: (event: any) => void) => void;
}

// レンダラープロセスに公開するAPI
const electronAPI: ElectronAPI = {
  // アプリケーション情報
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
  
  // ウィンドウ制御
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  
  // データベース操作
  queryDatabase: (sql: string, params: any[] = []) => 
    ipcRenderer.invoke('db:query', { sql, params }),
  runDatabase: (sql: string, params: any[] = []) => 
    ipcRenderer.invoke('db:run', { sql, params }),
  
  // ファイル操作
  saveFile: (options) => ipcRenderer.invoke('file:save', options),
  openFile: (options) => ipcRenderer.invoke('file:open', options),
  
  // イベントリスナー
  onDatabaseChange: (callback) => {
    const handler = (_: any, event: any) => callback(event);
    ipcRenderer.on('db:change', handler);
  },
  offDatabaseChange: (callback) => {
    ipcRenderer.removeListener('db:change', callback);
  },
};

// コンテキストブリッジを使用してAPIを公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript用の型定義をグローバルに追加
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
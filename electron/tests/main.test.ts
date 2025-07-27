import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWindow, app, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';

// Electronモジュールのモック
vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    quit: vi.fn(),
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    getName: vi.fn().mockReturnValue('CareTrack'),
    getVersion: vi.fn().mockReturnValue('1.0.0'),
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    webContents: {
      on: vi.fn(),
      openDevTools: vi.fn(),
      send: vi.fn(),
    },
    isMaximized: vi.fn().mockReturnValue(false),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    minimize: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  Menu: {
    buildFromTemplate: vi.fn().mockReturnValue({}),
    setApplicationMenu: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
    showErrorBox: vi.fn(),
  },
}));

// データベースモジュールのモック
vi.mock('../db/database', () => ({
  initializeDatabase: vi.fn().mockResolvedValue(undefined),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDatabasePath: vi.fn().mockReturnValue('/mock/userData/caretrack.db'),
}));

describe('Electron Main Process', () => {
  let createWindow: () => Promise<void>;
  let mainWindow: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mainWindow = null;
  });

  afterEach(() => {
    if (mainWindow) {
      mainWindow.destroy();
    }
  });

  describe('アプリケーション起動', () => {
    it('app.whenReady()でウィンドウが作成される', async () => {
      const { initApp } = await import('../main');
      
      await initApp();

      expect(app.whenReady).toHaveBeenCalled();
      expect(app.on).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
      expect(app.on).toHaveBeenCalledWith('activate', expect.any(Function));
    });

    it('データベースが初期化される', async () => {
      const { initializeDatabase } = await import('../db/database');
      const { initApp } = await import('../main');
      
      await initApp();

      expect(initializeDatabase).toHaveBeenCalled();
    });
  });

  describe('メインウィンドウ', () => {
    it('正しい設定でBrowserWindowが作成される', async () => {
      const { createMainWindow } = await import('../main');
      
      const window = await createMainWindow();

      expect(BrowserWindow).toHaveBeenCalledWith({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: expect.stringContaining('preload.js'),
        },
        icon: expect.stringContaining('icon'),
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        frame: process.platform !== 'darwin',
      });
    });

    it('開発環境では指定URLをロードする', async () => {
      process.env.NODE_ENV = 'development';
      process.env.ELECTRON_RENDERER_URL = 'http://localhost:3000';
      
      const { createMainWindow } = await import('../main');
      const window = await createMainWindow();

      expect(window.loadURL).toHaveBeenCalledWith('http://localhost:3000');
      expect(window.webContents.openDevTools).toHaveBeenCalled();
    });

    it('本番環境では静的ファイルをロードする', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ELECTRON_RENDERER_URL;
      
      const { createMainWindow } = await import('../main');
      const window = await createMainWindow();

      expect(window.loadFile).toHaveBeenCalledWith(
        expect.stringContaining('index.html')
      );
    });
  });

  describe('IPC通信', () => {
    it('app:get-versionハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith('app:get-version', expect.any(Function));
    });

    it('app:get-pathハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith('app:get-path', expect.any(Function));
    });

    it('db:queryハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith('db:query', expect.any(Function));
    });

    it('db:runハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith('db:run', expect.any(Function));
    });

    it('window:minimizeハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.on).toHaveBeenCalledWith('window:minimize', expect.any(Function));
    });

    it('window:maximizeハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.on).toHaveBeenCalledWith('window:maximize', expect.any(Function));
    });

    it('window:closeハンドラーが登録される', async () => {
      const { setupIpcHandlers } = await import('../main');
      
      await setupIpcHandlers();

      expect(ipcMain.on).toHaveBeenCalledWith('window:close', expect.any(Function));
    });
  });

  describe('メニュー', () => {
    it('アプリケーションメニューが設定される', async () => {
      const { createMenu } = await import('../main');
      
      await createMenu();

      expect(Menu.buildFromTemplate).toHaveBeenCalled();
      expect(Menu.setApplicationMenu).toHaveBeenCalled();
    });

    it('macOSでは特別なメニュー項目が含まれる', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true,
      });

      const { createMenu } = await import('../main');
      await createMenu();

      const menuTemplate = (Menu.buildFromTemplate as any).mock.calls[0][0];
      expect(menuTemplate[0].label).toBe('CareTrack');
      expect(menuTemplate[0].submenu).toContainEqual(
        expect.objectContaining({ role: 'about' })
      );

      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });
  });

  describe('ファイルダイアログ', () => {
    it('CSV エクスポートダイアログが表示される', async () => {
      const { handleFileDialog } = await import('../main');
      const mockPath = '/Users/test/export.csv';
      
      (dialog.showSaveDialog as any).mockResolvedValue({
        filePath: mockPath,
        canceled: false,
      });

      const result = await handleFileDialog('export-csv');

      expect(dialog.showSaveDialog).toHaveBeenCalledWith({
        title: 'CSVファイルを保存',
        defaultPath: expect.stringContaining('.csv'),
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      expect(result).toBe(mockPath);
    });

    it('PDF エクスポートダイアログが表示される', async () => {
      const { handleFileDialog } = await import('../main');
      const mockPath = '/Users/test/report.pdf';
      
      (dialog.showSaveDialog as any).mockResolvedValue({
        filePath: mockPath,
        canceled: false,
      });

      const result = await handleFileDialog('export-pdf');

      expect(dialog.showSaveDialog).toHaveBeenCalledWith({
        title: 'PDFファイルを保存',
        defaultPath: expect.stringContaining('.pdf'),
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      expect(result).toBe(mockPath);
    });

    it('ファイル選択がキャンセルされた場合nullを返す', async () => {
      const { handleFileDialog } = await import('../main');
      
      (dialog.showSaveDialog as any).mockResolvedValue({
        filePath: undefined,
        canceled: true,
      });

      const result = await handleFileDialog('export-csv');

      expect(result).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('未処理のエラーが適切に処理される', async () => {
      const { setupErrorHandlers } = await import('../main');
      
      setupErrorHandlers();

      const errorHandler = (process.on as any).mock.calls.find(
        (call: any) => call[0] === 'uncaughtException'
      )?.[1];

      const testError = new Error('Test error');
      errorHandler(testError);

      expect(dialog.showErrorBox).toHaveBeenCalledWith(
        'エラーが発生しました',
        'Test error'
      );
    });

    it('未処理のPromiseリジェクションが適切に処理される', async () => {
      const { setupErrorHandlers } = await import('../main');
      
      setupErrorHandlers();

      const rejectionHandler = (process.on as any).mock.calls.find(
        (call: any) => call[0] === 'unhandledRejection'
      )?.[1];

      const testReason = 'Test rejection';
      rejectionHandler(testReason);

      expect(dialog.showErrorBox).toHaveBeenCalledWith(
        'エラーが発生しました',
        'Test rejection'
      );
    });
  });

  describe('アプリケーション終了', () => {
    it('全てのウィンドウが閉じられたらアプリが終了する', async () => {
      const { setupAppEventHandlers } = await import('../main');
      
      setupAppEventHandlers();

      const closeHandler = (app.on as any).mock.calls.find(
        (call: any) => call[0] === 'window-all-closed'
      )?.[1];

      closeHandler();

      expect(app.quit).toHaveBeenCalled();
    });

    it('macOSでは全ウィンドウを閉じてもアプリは終了しない', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true,
      });

      const { setupAppEventHandlers } = await import('../main');
      setupAppEventHandlers();

      const closeHandler = (app.on as any).mock.calls.find(
        (call: any) => call[0] === 'window-all-closed'
      )?.[1];

      closeHandler();

      expect(app.quit).not.toHaveBeenCalled();

      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });

    it('before-quitイベントでデータベースが閉じられる', async () => {
      const { closeDatabase } = await import('../db/database');
      const { setupAppEventHandlers } = await import('../main');
      
      setupAppEventHandlers();

      const quitHandler = (app.on as any).mock.calls.find(
        (call: any) => call[0] === 'before-quit'
      )?.[1];

      await quitHandler();

      expect(closeDatabase).toHaveBeenCalled();
    });
  });
});
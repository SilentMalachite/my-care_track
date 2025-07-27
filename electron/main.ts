import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import * as path from 'path';
import { Database } from './db/database';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM対応
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let database: Database | null = null;

// データベースインスタンスを初期化
async function initializeDatabase(): Promise<void> {
  try {
    database = new Database();
    await database.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    dialog.showErrorBox('データベースエラー', 'データベースの初期化に失敗しました。');
    app.quit();
  }
}

// メインウィンドウを作成
export async function createMainWindow(): Promise<BrowserWindow> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
  });

  // 開発環境と本番環境でのURL設定
  if (process.env.NODE_ENV === 'development' && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// IPCハンドラーをセットアップ
export async function setupIpcHandlers(): Promise<void> {
  // アプリケーション情報
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:get-path', (_, name: string) => {
    return app.getPath(name as any);
  });

  // データベース操作
  ipcMain.handle('db:query', async (_, { sql, params }) => {
    if (!database) throw new Error('Database not initialized');
    return await database.query(sql, params);
  });

  ipcMain.handle('db:run', async (_, { sql, params }) => {
    if (!database) throw new Error('Database not initialized');
    return await database.run(sql, params);
  });

  // ウィンドウ制御
  ipcMain.on('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  // ファイル操作
  ipcMain.handle('file:save', async (_, options) => {
    const result = await handleFileDialog(options.type);
    if (result && options.data) {
      // ここでファイル保存処理を実装
      const fs = await import('fs/promises');
      await fs.writeFile(result, options.data);
    }
    return result;
  });

  ipcMain.handle('file:open', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      filters: options.filters,
      properties: options.multiSelections ? ['openFile', 'multiSelections'] : ['openFile'],
    });
    return result.canceled ? null : result.filePaths;
  });
}

// ファイルダイアログ処理
export async function handleFileDialog(type: string): Promise<string | null> {
  const options: any = {
    title: type === 'export-csv' ? 'CSVファイルを保存' : 'PDFファイルを保存',
    defaultPath: `caretrack_${type}_${new Date().toISOString().split('T')[0]}`,
    filters: [],
  };

  if (type === 'export-csv') {
    options.filters = [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] },
    ];
  } else if (type === 'export-pdf') {
    options.filters = [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ];
  }

  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result.canceled ? null : result.filePath!;
}

// メニューを作成
export async function createMenu(): Promise<void> {
  const template: any[] = [];

  // macOS用のアプリケーションメニュー
  if (process.platform === 'darwin') {
    template.push({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  // ファイルメニュー
  template.push({
    label: 'ファイル',
    submenu: [
      {
        label: 'CSVエクスポート',
        accelerator: 'CmdOrCtrl+E',
        click: async () => {
          if (mainWindow) {
            mainWindow.webContents.send('menu:export-csv');
          }
        },
      },
      {
        label: 'PDFエクスポート',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: async () => {
          if (mainWindow) {
            mainWindow.webContents.send('menu:export-pdf');
          }
        },
      },
      { type: 'separator' },
      process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
    ],
  });

  // 編集メニュー
  template.push({
    label: '編集',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  });

  // 表示メニュー
  template.push({
    label: '表示',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  });

  // ヘルプメニュー
  template.push({
    label: 'ヘルプ',
    submenu: [
      {
        label: 'オンラインヘルプ',
        click: async () => {
          await shell.openExternal('https://caretrack.example.com/help');
        },
      },
      {
        label: 'バージョン情報',
        click: () => {
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'バージョン情報',
            message: `CareTrack v${app.getVersion()}`,
            detail: '障害者支援クライアント管理システム',
            buttons: ['OK'],
          });
        },
      },
    ],
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// エラーハンドラーをセットアップ
export function setupErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    dialog.showErrorBox('エラーが発生しました', error.message);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    dialog.showErrorBox('エラーが発生しました', String(reason));
  });
}

// アプリケーションイベントハンドラーをセットアップ
export function setupAppEventHandlers(): void {
  // 全てのウィンドウが閉じられたとき
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // アプリケーションがアクティブになったとき（macOS）
  app.on('activate', () => {
    if (mainWindow === null) {
      createMainWindow();
    }
  });

  // アプリケーションが終了する前
  app.on('before-quit', async () => {
    if (database) {
      await database.close();
    }
  });
}

// アプリケーションを初期化
export async function initApp(): Promise<void> {
  // エラーハンドラーをセットアップ
  setupErrorHandlers();

  // アプリケーションイベントハンドラーをセットアップ
  setupAppEventHandlers();

  // Electronの準備が完了したら
  await app.whenReady();

  // データベースを初期化
  await initializeDatabase();

  // IPCハンドラーをセットアップ
  await setupIpcHandlers();

  // メインウィンドウを作成
  await createMainWindow();

  // メニューを作成
  await createMenu();
}

// 開発環境でない場合のみアプリを起動
if (process.env.NODE_ENV !== 'test') {
  initApp();
}
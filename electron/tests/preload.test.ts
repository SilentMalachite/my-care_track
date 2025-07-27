import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contextBridge, ipcRenderer } from 'electron';

// Electronモジュールのモック
vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));

describe('Electron Preload Script', () => {
  let electronAPI: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // contextBridge.exposeInMainWorldのモックを設定
    (contextBridge.exposeInMainWorld as any).mockImplementation((apiName: string, api: any) => {
      if (apiName === 'electronAPI') {
        electronAPI = api;
      }
    });
  });

  describe('API公開', () => {
    it('electronAPIが正しく公開される', async () => {
      await import('../preload');

      expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electronAPI', expect.any(Object));
      expect(electronAPI).toBeDefined();
    });

    it('必要なメソッドが全て含まれている', async () => {
      await import('../preload');

      expect(electronAPI).toHaveProperty('getVersion');
      expect(electronAPI).toHaveProperty('getPath');
      expect(electronAPI).toHaveProperty('minimizeWindow');
      expect(electronAPI).toHaveProperty('maximizeWindow');
      expect(electronAPI).toHaveProperty('closeWindow');
      expect(electronAPI).toHaveProperty('queryDatabase');
      expect(electronAPI).toHaveProperty('runDatabase');
      expect(electronAPI).toHaveProperty('saveFile');
      expect(electronAPI).toHaveProperty('openFile');
      expect(electronAPI).toHaveProperty('onDatabaseChange');
      expect(electronAPI).toHaveProperty('offDatabaseChange');
    });
  });

  describe('アプリケーション情報', () => {
    it('getVersionがIPCを通じてバージョンを取得する', async () => {
      await import('../preload');
      
      (ipcRenderer.invoke as any).mockResolvedValue('1.0.0');
      const version = await electronAPI.getVersion();

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('app:get-version');
      expect(version).toBe('1.0.0');
    });

    it('getPathがIPCを通じてパスを取得する', async () => {
      await import('../preload');
      
      const mockPath = '/Users/test/userData';
      (ipcRenderer.invoke as any).mockResolvedValue(mockPath);
      
      const path = await electronAPI.getPath('userData');

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('app:get-path', 'userData');
      expect(path).toBe(mockPath);
    });
  });

  describe('ウィンドウ制御', () => {
    it('minimizeWindowがIPCメッセージを送信する', async () => {
      await import('../preload');
      
      electronAPI.minimizeWindow();

      expect(ipcRenderer.send).toHaveBeenCalledWith('window:minimize');
    });

    it('maximizeWindowがIPCメッセージを送信する', async () => {
      await import('../preload');
      
      electronAPI.maximizeWindow();

      expect(ipcRenderer.send).toHaveBeenCalledWith('window:maximize');
    });

    it('closeWindowがIPCメッセージを送信する', async () => {
      await import('../preload');
      
      electronAPI.closeWindow();

      expect(ipcRenderer.send).toHaveBeenCalledWith('window:close');
    });
  });

  describe('データベース操作', () => {
    it('queryDatabaseがIPCを通じてクエリを実行する', async () => {
      await import('../preload');
      
      const mockResult = [
        { id: 1, name: 'テストクライアント' },
        { id: 2, name: 'テストクライアント2' },
      ];
      (ipcRenderer.invoke as any).mockResolvedValue(mockResult);

      const sql = 'SELECT * FROM clients';
      const params = [];
      const result = await electronAPI.queryDatabase(sql, params);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('db:query', { sql, params });
      expect(result).toEqual(mockResult);
    });

    it('queryDatabaseがパラメータ付きクエリを実行する', async () => {
      await import('../preload');
      
      const mockResult = [{ id: 1, name: 'テストクライアント' }];
      (ipcRenderer.invoke as any).mockResolvedValue(mockResult);

      const sql = 'SELECT * FROM clients WHERE id = ?';
      const params = [1];
      const result = await electronAPI.queryDatabase(sql, params);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('db:query', { sql, params });
      expect(result).toEqual(mockResult);
    });

    it('runDatabaseがIPCを通じて更新クエリを実行する', async () => {
      await import('../preload');
      
      const mockResult = { changes: 1, lastID: 10 };
      (ipcRenderer.invoke as any).mockResolvedValue(mockResult);

      const sql = 'INSERT INTO clients (name, email) VALUES (?, ?)';
      const params = ['新規クライアント', 'test@example.com'];
      const result = await electronAPI.runDatabase(sql, params);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('db:run', { sql, params });
      expect(result).toEqual(mockResult);
    });

    it('データベースエラーが適切に処理される', async () => {
      await import('../preload');
      
      const dbError = new Error('Database connection failed');
      (ipcRenderer.invoke as any).mockRejectedValue(dbError);

      await expect(electronAPI.queryDatabase('SELECT * FROM clients')).rejects.toThrow('Database connection failed');
    });
  });

  describe('ファイル操作', () => {
    it('saveFileがIPCを通じてファイル保存ダイアログを表示する', async () => {
      await import('../preload');
      
      const mockPath = '/Users/test/export.csv';
      (ipcRenderer.invoke as any).mockResolvedValue(mockPath);

      const options = {
        type: 'csv',
        data: 'id,name\n1,test',
      };
      const result = await electronAPI.saveFile(options);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:save', options);
      expect(result).toBe(mockPath);
    });

    it('openFileがIPCを通じてファイル選択ダイアログを表示する', async () => {
      await import('../preload');
      
      const mockPaths = ['/Users/test/import.csv'];
      (ipcRenderer.invoke as any).mockResolvedValue(mockPaths);

      const options = {
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
        ],
        multiSelections: false,
      };
      const result = await electronAPI.openFile(options);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith('file:open', options);
      expect(result).toEqual(mockPaths);
    });

    it('ファイル操作がキャンセルされた場合nullを返す', async () => {
      await import('../preload');
      
      (ipcRenderer.invoke as any).mockResolvedValue(null);

      const result = await electronAPI.saveFile({ type: 'csv', data: 'test' });

      expect(result).toBeNull();
    });
  });

  describe('データベース変更通知', () => {
    it('onDatabaseChangeがリスナーを登録する', async () => {
      await import('../preload');
      
      const callback = vi.fn();
      electronAPI.onDatabaseChange(callback);

      expect(ipcRenderer.on).toHaveBeenCalledWith('db:change', expect.any(Function));
    });

    it('offDatabaseChangeがリスナーを削除する', async () => {
      await import('../preload');
      
      const callback = vi.fn();
      electronAPI.offDatabaseChange(callback);

      expect(ipcRenderer.removeListener).toHaveBeenCalledWith('db:change', callback);
    });

    it('データベース変更イベントが正しくコールバックに渡される', async () => {
      await import('../preload');
      
      const callback = vi.fn();
      let eventHandler: any;

      (ipcRenderer.on as any).mockImplementation((channel: string, handler: any) => {
        if (channel === 'db:change') {
          eventHandler = handler;
        }
      });

      electronAPI.onDatabaseChange(callback);

      const changeEvent = {
        type: 'insert',
        table: 'clients',
        id: 1,
      };
      eventHandler({}, changeEvent);

      expect(callback).toHaveBeenCalledWith(changeEvent);
    });
  });

  describe('セキュリティ', () => {
    it('Node.js APIが直接公開されていない', async () => {
      await import('../preload');

      expect(electronAPI).not.toHaveProperty('require');
      expect(electronAPI).not.toHaveProperty('process');
      expect(electronAPI).not.toHaveProperty('__dirname');
      expect(electronAPI).not.toHaveProperty('__filename');
    });

    it('IPCレンダラーが直接公開されていない', async () => {
      await import('../preload');

      expect(electronAPI).not.toHaveProperty('ipcRenderer');
      expect(electronAPI).not.toHaveProperty('invoke');
      expect(electronAPI).not.toHaveProperty('send');
    });

    it('安全なメソッドのみが公開されている', async () => {
      await import('../preload');

      const allowedMethods = [
        'getVersion',
        'getPath',
        'minimizeWindow',
        'maximizeWindow',
        'closeWindow',
        'queryDatabase',
        'runDatabase',
        'saveFile',
        'openFile',
        'onDatabaseChange',
        'offDatabaseChange',
      ];

      const exposedMethods = Object.keys(electronAPI);
      expect(exposedMethods.sort()).toEqual(allowedMethods.sort());
    });
  });
});
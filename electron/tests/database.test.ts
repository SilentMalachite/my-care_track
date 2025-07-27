import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs/promises';
import * as path from 'path';

// モジュールのモック
vi.mock('sqlite3', () => ({
  default: {
    Database: vi.fn().mockImplementation((path: string, callback: any) => {
      const db = {
        run: vi.fn((sql: string, params: any, callback: any) => {
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          callback?.call({ lastID: 1, changes: 1 }, null);
          return db;
        }),
        get: vi.fn((sql: string, params: any, callback: any) => {
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          callback?.(null, { id: 1, name: 'Test' });
          return db;
        }),
        all: vi.fn((sql: string, params: any, callback: any) => {
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          callback?.(null, [{ id: 1, name: 'Test' }]);
          return db;
        }),
        close: vi.fn((callback: any) => {
          callback?.(null);
          return db;
        }),
        serialize: vi.fn((callback: any) => {
          callback?.();
          return db;
        }),
      };
      callback?.(null);
      return db;
    }),
    OPEN_READWRITE: 2,
    OPEN_CREATE: 4,
  },
}));

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error('File not found')),
  copyFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
  },
}));

describe('Database Module', () => {
  let database: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (database?.db) {
      await database.close();
    }
  });

  describe('データベース初期化', () => {
    it('データベースファイルが作成される', async () => {
      const { Database } = await import('../db/database');
      database = new Database();

      await database.initialize();

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.dirname('/mock/userData/caretrack.db'),
        { recursive: true }
      );
      expect(sqlite3.default.Database).toHaveBeenCalledWith(
        '/mock/userData/caretrack.db',
        expect.any(Function)
      );
    });

    it('必要なテーブルが作成される', async () => {
      const { Database } = await import('../db/database');
      database = new Database();

      await database.initialize();

      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      const runCalls = mockDb.run.mock.calls;

      // clientsテーブルの作成を確認
      expect(runCalls).toContainEqual([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS clients'),
        expect.any(Function),
      ]);

      // support_plansテーブルの作成を確認
      expect(runCalls).toContainEqual([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS support_plans'),
        expect.any(Function),
      ]);

      // service_logsテーブルの作成を確認
      expect(runCalls).toContainEqual([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS service_logs'),
        expect.any(Function),
      ]);

      // staffテーブルの作成を確認
      expect(runCalls).toContainEqual([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS staff'),
        expect.any(Function),
      ]);

      // emergency_contactsテーブルの作成を確認
      expect(runCalls).toContainEqual([
        expect.stringContaining('CREATE TABLE IF NOT EXISTS emergency_contacts'),
        expect.any(Function),
      ]);
    });

    it('既存のデータベースがある場合は再利用される', async () => {
      (fs.access as any).mockResolvedValueOnce(undefined); // ファイルが存在する

      const { Database } = await import('../db/database');
      database = new Database();

      await database.initialize();

      expect(fs.copyFile).not.toHaveBeenCalled();
    });

    it('初期化エラーが適切に処理される', async () => {
      const dbError = new Error('Database initialization failed');
      (sqlite3.default.Database as any).mockImplementationOnce((path: string, callback: any) => {
        callback(dbError);
      });

      const { Database } = await import('../db/database');
      database = new Database();

      await expect(database.initialize()).rejects.toThrow('Database initialization failed');
    });
  });

  describe('クエリ実行', () => {
    it('SELECT クエリが実行できる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.query('SELECT * FROM clients WHERE id = ?', [1]);

      expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });

    it('パラメータなしのクエリが実行できる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.query('SELECT * FROM clients');

      expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });

    it('空の結果が正しく返される', async () => {
      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.all.mockImplementationOnce((sql: string, params: any, callback: any) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        callback(null, []);
      });

      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.query('SELECT * FROM clients WHERE id = ?', [999]);

      expect(result).toEqual([]);
    });

    it('クエリエラーが適切に処理される', async () => {
      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.all.mockImplementationOnce((sql: string, params: any, callback: any) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        callback(new Error('SQL syntax error'));
      });

      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await expect(database.query('INVALID SQL')).rejects.toThrow('SQL syntax error');
    });
  });

  describe('データ更新', () => {
    it('INSERT クエリが実行できる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.run(
        'INSERT INTO clients (name, email) VALUES (?, ?)',
        ['新規クライアント', 'test@example.com']
      );

      expect(result).toEqual({ lastID: 1, changes: 1 });
    });

    it('UPDATE クエリが実行できる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.run(
        'UPDATE clients SET name = ? WHERE id = ?',
        ['更新された名前', 1]
      );

      expect(result).toEqual({ lastID: 1, changes: 1 });
    });

    it('DELETE クエリが実行できる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.run('DELETE FROM clients WHERE id = ?', [1]);

      expect(result).toEqual({ lastID: 1, changes: 1 });
    });

    it('変更がない場合は changes が 0 になる', async () => {
      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.run.mockImplementationOnce((sql: string, params: any, callback: any) => {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        callback.call({ lastID: 0, changes: 0 }, null);
      });

      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const result = await database.run('UPDATE clients SET name = ? WHERE id = ?', ['test', 999]);

      expect(result.changes).toBe(0);
    });
  });

  describe('トランザクション', () => {
    it('トランザクションが正常に実行される', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await database.transaction(async (db: any) => {
        await db.run('INSERT INTO clients (name) VALUES (?)', ['Client 1']);
        await db.run('INSERT INTO clients (name) VALUES (?)', ['Client 2']);
      });

      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      const runCalls = mockDb.run.mock.calls;

      expect(runCalls).toContainEqual(['BEGIN TRANSACTION', expect.any(Function)]);
      expect(runCalls).toContainEqual(['COMMIT', expect.any(Function)]);
    });

    it('エラー時にロールバックされる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await expect(
        database.transaction(async (db: any) => {
          await db.run('INSERT INTO clients (name) VALUES (?)', ['Client 1']);
          throw new Error('Transaction error');
        })
      ).rejects.toThrow('Transaction error');

      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      const runCalls = mockDb.run.mock.calls;

      expect(runCalls).toContainEqual(['BEGIN TRANSACTION', expect.any(Function)]);
      expect(runCalls).toContainEqual(['ROLLBACK', expect.any(Function)]);
    });
  });

  describe('バックアップ', () => {
    it('データベースのバックアップが作成される', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const backupPath = await database.backup();

      expect(fs.copyFile).toHaveBeenCalledWith(
        '/mock/userData/caretrack.db',
        expect.stringContaining('caretrack_backup_'),
      );
      expect(backupPath).toContain('caretrack_backup_');
    });

    it('バックアップエラーが適切に処理される', async () => {
      (fs.copyFile as any).mockRejectedValueOnce(new Error('Backup failed'));

      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await expect(database.backup()).rejects.toThrow('Backup failed');
    });
  });

  describe('データベース接続管理', () => {
    it('データベースが正しく閉じられる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await database.close();

      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('既に閉じられたデータベースを再度閉じてもエラーにならない', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      await database.close();
      await database.close(); // 2回目

      expect(true).toBe(true); // エラーが発生しないことを確認
    });

    it('データベース未初期化時のクエリはエラーになる', async () => {
      const { Database } = await import('../db/database');
      database = new Database();

      await expect(database.query('SELECT * FROM clients')).rejects.toThrow(
        'Database not initialized'
      );
    });
  });

  describe('ヘルパーメソッド', () => {
    it('getClientByIdが正しく動作する', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.get.mockImplementationOnce((sql: string, params: any, callback: any) => {
        callback(null, { id: 1, name: 'テストクライアント', status: 'active' });
      });

      const client = await database.getClientById(1);

      expect(client).toEqual({ id: 1, name: 'テストクライアント', status: 'active' });
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM clients WHERE id = ?'),
        [1],
        expect.any(Function)
      );
    });

    it('getSupportPlansByClientIdが正しく動作する', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const mockPlans = [
        { id: 1, clientId: 1, planName: '支援計画1' },
        { id: 2, clientId: 1, planName: '支援計画2' },
      ];
      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.all.mockImplementationOnce((sql: string, params: any, callback: any) => {
        callback(null, mockPlans);
      });

      const plans = await database.getSupportPlansByClientId(1);

      expect(plans).toEqual(mockPlans);
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM support_plans WHERE client_id = ?'),
        [1],
        expect.any(Function)
      );
    });

    it('getServiceLogsByDateRangeが正しく動作する', async () => {
      const { Database } = await import('../db/database');
      database = new Database();
      await database.initialize();

      const mockLogs = [
        { id: 1, serviceDate: '2024-01-15', details: 'サービス記録1' },
        { id: 2, serviceDate: '2024-01-16', details: 'サービス記録2' },
      ];
      const mockDb = (sqlite3.default.Database as any).mock.results[0].value;
      mockDb.all.mockImplementationOnce((sql: string, params: any, callback: any) => {
        callback(null, mockLogs);
      });

      const logs = await database.getServiceLogsByDateRange('2024-01-01', '2024-01-31');

      expect(logs).toEqual(mockLogs);
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('service_date BETWEEN ? AND ?'),
        ['2024-01-01', '2024-01-31'],
        expect.any(Function)
      );
    });
  });
});
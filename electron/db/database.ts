import sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';

export class Database {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'caretrack.db');
  }

  async initialize(): Promise<void> {
    try {
      // データベースディレクトリを作成
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

      // データベースを開く
      this.db = await this.openDatabase();

      // テーブルを作成
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private openDatabase(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    const tables = [
      // クライアントテーブル
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_kana TEXT,
        date_of_birth DATE,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')),
        phone TEXT,
        email TEXT,
        address TEXT,
        disability_type TEXT,
        disability_grade INTEGER,
        insurance_number TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 支援計画テーブル
      `CREATE TABLE IF NOT EXISTS support_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        plan_name TEXT NOT NULL,
        goals TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed', 'cancelled')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
        assigned_staff_ids TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // サービス記録テーブル
      `CREATE TABLE IF NOT EXISTS service_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        support_plan_id INTEGER,
        staff_id INTEGER NOT NULL,
        service_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        service_type TEXT NOT NULL,
        details TEXT,
        achievements TEXT,
        issues TEXT,
        next_actions TEXT,
        mood_level INTEGER CHECK(mood_level BETWEEN 1 AND 5),
        health_status TEXT CHECK(health_status IN ('excellent', 'good', 'fair', 'poor')),
        attachments TEXT,
        notes TEXT,
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'confirmed', 'approved')),
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (support_plan_id) REFERENCES support_plans (id),
        FOREIGN KEY (staff_id) REFERENCES staff (id)
      )`,

      // スタッフテーブル
      `CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_kana TEXT,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'viewer')),
        specialties TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        password_hash TEXT NOT NULL,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 緊急連絡先テーブル
      `CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        is_primary BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // アセスメント（評価）テーブル
      `CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        support_plan_id INTEGER,
        assessment_type TEXT NOT NULL CHECK(assessment_type IN ('initial', 'periodic', 'annual', 'discharge')),
        assessment_date DATE NOT NULL,
        summary TEXT,
        overall_score INTEGER CHECK(overall_score BETWEEN 1 AND 100),
        category_scores TEXT,
        strengths TEXT,
        challenges TEXT,
        recommendations TEXT,
        goals TEXT,
        status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'approved')),
        finalized_at DATETIME,
        finalized_by INTEGER,
        attachments TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (staff_id) REFERENCES staff (id),
        FOREIGN KEY (support_plan_id) REFERENCES support_plans (id)
      )`,

      // インデックスの作成
      `CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)`,
      `CREATE INDEX IF NOT EXISTS idx_support_plans_client_id ON support_plans(client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_support_plans_status ON support_plans(status)`,
      `CREATE INDEX IF NOT EXISTS idx_service_logs_client_id ON service_logs(client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_service_logs_service_date ON service_logs(service_date)`,
      `CREATE INDEX IF NOT EXISTS idx_service_logs_status ON service_logs(status)`,
      `CREATE INDEX IF NOT EXISTS idx_emergency_contacts_client_id ON emergency_contacts(client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_assessments_client_id ON assessments(client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_assessments_assessment_date ON assessments(assessment_date)`,
      `CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status)`,
    ];

    for (const sql of tables) {
      await this.runQuery(sql);
    }
  }

  private runQuery(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async transaction(callback: (db: Database) => Promise<void>): Promise<void> {
    await this.run('BEGIN TRANSACTION');
    try {
      await callback(this);
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async backup(): Promise<string> {
    const backupPath = path.join(
      path.dirname(this.dbPath),
      `caretrack_backup_${new Date().toISOString().replace(/:/g, '-')}.db`
    );
    await fs.copyFile(this.dbPath, backupPath);
    return backupPath;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // ヘルパーメソッド
  async getClientById(id: number): Promise<any> {
    const rows = await this.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async getSupportPlansByClientId(clientId: number): Promise<any[]> {
    return this.query(
      'SELECT * FROM support_plans WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );
  }

  async getServiceLogsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    return this.query(
      'SELECT * FROM service_logs WHERE service_date BETWEEN ? AND ? ORDER BY service_date DESC',
      [startDate, endDate]
    );
  }
}
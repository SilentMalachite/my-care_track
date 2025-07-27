# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-07-27

### Added

#### 🔐 セキュリティ機能
- **パスワード複雑性要件**: 8文字以上、大文字・小文字・数字・特殊文字必須
- **ログイン試行制限**: 5回失敗でアカウント自動ロック機能
- **パスワード有効期限**: 90日間での強制変更
- **パスワード履歴管理**: 過去5回のパスワード再利用防止
- **JWT認証システム**: トークンベース認証（24時間有効）
- **ロールベースアクセス制御**: 管理者・スタッフ・閲覧者の権限管理

#### 📊 認証API
- `POST /api/v1/auth/login` - ログイン認証
- `POST /api/v1/auth/logout` - ログアウト
- `POST /api/v1/auth/change_password` - パスワード変更

#### 🛡️ セキュリティ設定
- `config/initializers/security.rb` - カスタマイズ可能なセキュリティ設定
- パスワード要件とログイン制限の設定可能

#### 🧪 テストカバレッジ
- **Staff model**: 35 examples - パスワードセキュリティとバリデーション
- **Auth controller**: 16 examples - 認証フロー全体
- **全コントローラー**: 認証保護機能の統合テスト
- **統合テスト**: エンドツーエンドの認証フロー

### Changed

#### 🔄 API セキュリティ強化
- 全APIエンドポイントに認証保護を追加
- `ApplicationController`でのJWT認証処理
- 認証ヘッダー必須化

#### 📝 データベース拡張
- `staffs`テーブルにセキュリティ関連フィールド追加:
  - `failed_login_attempts` - ログイン失敗回数
  - `locked_at` - アカウントロック時刻
  - `password_changed_at` - パスワード変更日時
- `password_histories`テーブル新規作成

#### 🔧 依存関係更新
- `jwt` gem 追加 - JWT認証機能
- `kaminari` gem 追加 - ページネーション機能
- `bcrypt` gem - パスワードハッシュ化強化

### Security

#### 🚨 セキュリティ修正
- **CVE対応**: パスワード平文保存の脆弱性を修正
- **認証強化**: 全APIエンドポイントの認証保護
- **セッション管理**: JWT トークンでの安全なセッション管理
- **暴力攻撃対策**: ログイン試行回数制限とアカウントロック

#### 🔒 暗号化強化
- bcryptによるパスワードハッシュ化
- パスワード履歴の安全な保存
- JWT トークンでの安全な認証

### Technical Details

#### 🧪 テスト結果
```
168 examples, 0 failures, 4 pending

Breakdown:
- Staff model: 35 examples ✅
- Auth controller: 16 examples ✅  
- Assessments controller: 9 examples ✅
- Clients controller: 29 examples ✅
- ServiceLogs controller: 29 examples ✅
- SupportPlans controller: 23 examples ✅
- Integration tests: 6 examples ✅
- Password History model: ✅
```

#### 📁 主要ファイル
- `app/models/staff.rb` - スタッフモデルとセキュリティ機能
- `app/models/password_history.rb` - パスワード履歴管理
- `app/controllers/api/v1/auth_controller.rb` - 認証API
- `app/controllers/application_controller.rb` - JWT認証処理
- `config/initializers/security.rb` - セキュリティ設定

#### 🛠️ 開発手法
- **TDD (Test-Driven Development)** で完全実装
- **Red-Green-Refactor** サイクルでの品質保証
- 全機能の事前テスト設計と実装

### Migration Guide

#### データベース移行
```bash
# 既存データベースの移行
rails db:migrate

# セキュリティフィールドの追加とパスワード履歴テーブル作成が実行されます
```

#### 設定の更新
既存の設定ファイルは自動的に新しいセキュリティ設定に対応します。カスタマイズが必要な場合は `config/initializers/security.rb` を編集してください。

#### APIクライアントの更新
既存のAPIクライアントは認証ヘッダーの追加が必要です:

```javascript
// 認証ヘッダーの追加例
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## Development Notes

このリリースは完全にTDD（テスト駆動開発）で実装され、すべてのセキュリティ機能が包括的にテストされています。

### Contributors
- 開発チーム - セキュリティ機能の設計・実装
- QAチーム - 包括的なテスト設計・実行

### Links
- [セキュリティドキュメント](./SECURITY.md)
- [開発ガイド](./docs/DEVELOPMENT.md)
- [API仕様書](./docs/API.md)

---

*Generated on 2025-01-27*

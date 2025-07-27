# 未完了項目一覧

最終更新日: 2025年7月27日（TDD完了：API連携サービス、ルーティング設定、Rails APIコントローラー、メインレイアウト・ナビゲーション、アセスメント機能スタッフ情報連携、プロジェクト構造改善）

## 🔴 高優先度項目（必須機能）

### 1. フロントエンドAPI連携サービス
**ディレクトリ**: `frontend/src/services/`
**状態**: 完了 ✅

#### 1.1 APIクライアント基盤
- [x] `api.ts` - axiosインスタンス設定、エラーハンドリング ✅
- [x] `api.test.ts` - APIクライアントのテスト ✅

#### 1.2 Client APIサービス
- [x] `clientService.ts` - 利用者管理のCRUD操作 ✅
- [x] `clientService.test.ts` - サービスのテスト ✅
- [x] 利用者番号の重複チェックAPI連携 ✅

#### 1.3 SupportPlan APIサービス
- [x] `supportPlanService.ts` - 支援計画のCRUD操作 ✅
- [x] `supportPlanService.test.ts` - サービスのテスト ✅

#### 1.4 ServiceLog APIサービス
- [x] `serviceLogService.ts` - サービス記録のCRUD操作 ✅
- [x] `serviceLogService.test.ts` - サービスのテスト ✅

### 2. 利用者登録フォームの追加機能
**ファイル**: `frontend/src/components/clients/ClientForm.tsx`
**状態**: 完了 ✅

- [x] 利用者番号のリアルタイム重複チェック機能 ✅
- [x] API連携によるサーバーサイドバリデーション ✅

## 🟡 中優先度項目（基盤機能）

### 3. メインレイアウト・ナビゲーション
**ディレクトリ**: `frontend/src/components/layout/`
**状態**: 完了 ✅

#### 3.1 MainLayout.tsx
- [x] レスポンシブ対応（モバイルハンバーガーメニュー） ✅
- [x] ユーザー情報表示 ✅
- [x] フッター情報（バージョン等） ✅
- [x] 環境情報表示 ✅
- [x] DB接続状態表示 ✅
- [x] 最終更新日時表示 ✅

#### 3.2 Navigation.tsx
- [x] アクティブページハイライト機能 ✅
- [x] パンくずリスト表示 ✅
- [ ] 権限別メニュー表示制御（将来機能）

#### 3.3 Breadcrumb.tsx（新規実装）
- [x] パンくずリスト自動生成 ✅
- [x] カスタムラベル対応 ✅
- [x] 全ページ対応 ✅

### 4. ルーティング設定
**ファイル**: `frontend/src/App.tsx`, `frontend/src/routes/index.tsx`
**状態**: 完了 ✅

- [x] React Router v6の設定 ✅
- [x] ルート定義（以下のパス） ✅
  - [x] `/` - ダッシュボード ✅
  - [x] `/clients` - 利用者一覧 ✅
  - [x] `/clients/:id` - 利用者詳細 ✅
  - [x] `/clients/new` - 利用者新規登録 ✅
  - [x] `/clients/:id/edit` - 利用者編集 ✅
  - [x] `/support-plans` - 支援計画一覧 ✅
  - [x] `/support-plans/:id` - 支援計画詳細 ✅
  - [x] `/support-plans/new` - 支援計画新規作成 ✅
  - [x] `/support-plans/:id/edit` - 支援計画編集 ✅
  - [x] `/service-logs` - サービス記録一覧 ✅
  - [x] `/service-logs/new` - サービス記録新規作成 ✅
  - [x] `/service-logs/:id/edit` - サービス記録編集 ✅
  - [x] `/assessments` - 評価・アセスメント一覧 ✅
  - [x] `/assessments/:id` - 評価・アセスメント詳細 ✅
  - [x] `/assessments/new` - 評価・アセスメント新規作成 ✅
  - [x] `/assessments/:id/edit` - 評価・アセスメント編集 ✅
  - [x] `/settings` - 設定 ✅
- [x] 404エラーページ ✅
- [x] リダイレクト処理 ✅
- [x] 遅延読み込み（React.lazy）とSuspense ✅
- [x] ローディング状態の表示 ✅

### 5. アセスメント機能のスタッフ情報連携
**対象ファイル**:
- `frontend/src/pages/assessments/AssessmentEdit.tsx`
- `frontend/src/pages/assessments/AssessmentDetail.tsx`
- `frontend/src/pages/assessments/AssessmentNew.tsx`
- `frontend/src/pages/assessments/AssessmentList.tsx`

**状態**: 完了 ✅
- [x] スタッフ情報の取得処理実装 ✅
- [x] スタッフ選択UI実装 ✅
- [x] StaffServiceのTDD実装（15テスト全て成功） ✅
- [x] Staff APIコントローラー実装 ✅
- [x] API URLのv1対応 ✅

## 🟢 低優先度項目（追加機能）

### 6. Rails APIコントローラー
**ディレクトリ**: `backend/app/controllers/`
**状態**: 完了 ✅

#### 6.1 clients_controller.rb
- [x] CRUD エンドポイント実装 ✅
- [x] 検索・フィルタ機能 ✅
- [x] ページネーション ✅
- [x] RSpecテスト（29テスト全て成功） ✅
- [x] 利用者番号重複チェックAPI ✅
- [x] 統計情報API ✅

#### 6.2 support_plans_controller.rb
- [x] CRUD エンドポイント実装 ✅
- [x] クライアント別計画取得 ✅
- [x] ステータス一括更新（完了機能） ✅
- [x] RSpecテスト（23テスト全て成功） ✅
- [x] 統計情報API ✅

#### 6.3 service_logs_controller.rb
- [x] CRUD エンドポイント実装 ✅
- [x] 期間別取得 ✅
- [x] 承認機能 ✅
- [x] RSpecテスト（29テスト全て成功） ✅
- [x] 統計情報API ✅

#### 6.4 assessments_controller.rb
- [x] 既存実装済み ✅
- [x] auth_controller.rb（認証）も実装済み ✅

### 7. Electronデスクトップアプリ化
**ディレクトリ**: `electron/`
**状態**: 完了 ✅

#### 7.1 メインプロセス（main.ts）
- [x] ウィンドウ管理 ✅
- [x] アプリケーション制御 ✅
- [x] マルチプラットフォーム対応 ✅
- [x] メニュー作成機能 ✅
- [x] ファイルダイアログ処理 ✅
- [x] エラーハンドリング ✅
- [x] データベース統合 ✅

#### 7.2 プリロードスクリプト（preload.ts）
- [x] Context Isolation設定 ✅
- [x] IPC通信設定 ✅
- [x] セキュリティ設定 ✅
- [x] API公開（electronAPI） ✅

### 8. パッケージング設定
**状態**: 完了 ✅

- [x] electron-builder設定の完成 ✅
- [x] 各プラットフォーム用ビルド設定 ✅
  - [x] Windows (.exe, .portable) ✅
  - [x] macOS (.app, .dmg, .zip) ✅
  - [x] Linux (.AppImage, .deb) ✅
- [x] 署名・公証設定（entitlements.mac.plist） ✅
- [x] NSISインストーラー設定 ✅
- [x] DMGレイアウト設定 ✅
- [ ] アイコンファイルの準備（将来タスク）

### 9. テスト関連の修正
**ファイル**: `tests/packaging.test.js`
**状態**: 完了 ✅

- [x] TypeScriptインポート問題の解決 ✅
- [x] テストの再有効化 ✅
- [x] electron-builder設定の読み込み対応 ✅
- [x] アセットディレクトリの修正 ✅

## 📊 進捗サマリー

| カテゴリ | 完了率 | 残タスク数 |
|---------|--------|------------|
| フロントエンドコンポーネント | 100% | 0 |
| API連携 | 100% | 0 |
| ルーティング設定 | 100% | 0 |
| バックエンドAPI | 100% | 0 |
| レイアウト・ナビゲーション | 100% | 0 |
| アセスメント機能連携 | 100% | 0 |
| Electron統合 | 100% | 0 |
| パッケージング設定 | 100% | 0 |
| テスト・品質 | 100% | 0 |

## 🎯 完了したタスク

1. ✅ **API連携サービスの実装**（高優先度）
   - フロントエンドの機能を完成させるために必須

2. ✅ **ルーティング設定**（中優先度）
   - アプリケーション全体のナビゲーションに必要

3. ✅ **Rails APIコントローラー**（中優先度）
   - バックエンドの基本機能実装

4. ✅ **メインレイアウト・ナビゲーション機能追加**（中優先度）
   - パンくずリスト、レスポンシブ対応等

5. ✅ **アセスメント機能のスタッフ情報連携**（中優先度）
   - スタッフ情報の取得処理とUI実装

6. ✅ **Electron統合**（低優先度）
   - デスクトップアプリ化（main.ts、preload.ts実装済み）

7. ✅ **パッケージング設定**
   - electron-builderによるマルチプラットフォーム設定

8. ✅ **テスト関連の修正**
   - パッケージングテストの修正と対応

## 📝 備考

- **TDDアプローチで全項目を完了** ✅
- **API連携サービスが完全実装済み** - フロントエンドとバックエンド間の通信基盤が完成
- **Electron統合が完了** - main.ts、preload.ts、データベース統合が実装済み
- **ルーティング設定が完全実装済み** - React Router v6によるSPAナビゲーション基盤が完成
- **Rails APIコントローラーが完全実装済み** - 全106テストが成功、バックエンドAPIが完全動作
- **メインレイアウト・ナビゲーション機能が完全実装済み** - モバイル対応、パンくずリスト、ユーザー情報表示、環境情報表示が完成
- **アセスメント機能のスタッフ情報連携が完全実装済み** - StaffService、Staff APIコントローラー、全画面対応が完成
- **パッケージング設定が完了** - electron-builderによるWindows/macOS/Linuxマルチプラットフォーム対応
- **プロジェクト構造の改善が完了** - 以下の問題を解決：
  - backend/frontendディレクトリの重複を削除
  - package.jsonにワークスペース設定を追加
  - ビルドスクリプトを統一（build:all追加）
  - プロジェクト構造テスト（7テスト）を追加し、全てパス
- **全ての未完了項目が完了しました！** 🎉
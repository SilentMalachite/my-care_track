# CareTrack 開発セットアップガイド

## 目次
1. [前提条件](#前提条件)
2. [クイックスタート](#クイックスタート)
3. [詳細セットアップ](#詳細セットアップ)
4. [開発ワークフロー](#開発ワークフロー)
5. [トラブルシューティング](#トラブルシューティング)

## 前提条件

以下のソフトウェアがインストールされている必要があります：

| ソフトウェア | 必須バージョン | 確認コマンド |
|------------|--------------|-------------|
| Node.js | 18.x 以上 | `node --version` |
| Ruby | 3.3.x | `ruby --version` |
| SQLite3 | 3.x | `sqlite3 --version` |
| Git | 2.x | `git --version` |

### macOS の場合
```bash
# Homebrewを使用
brew install node ruby sqlite3
```

### Windows の場合
- Node.js: [公式サイト](https://nodejs.org/)からインストーラーをダウンロード
- Ruby: [RubyInstaller](https://rubyinstaller.org/)を使用
- SQLite3: Rubyに含まれています

### Linux の場合
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm ruby ruby-dev sqlite3 libsqlite3-dev

# Fedora
sudo dnf install nodejs npm ruby ruby-devel sqlite sqlite-devel
```

## クイックスタート

```bash
# 1. リポジトリのクローン
git clone https://github.com/your-org/my-care_track.git
cd my-care_track

# 2. 依存関係のインストール
npm install

# 3. Railsの依存関係インストール
cd backend
bundle install
cd ..

# 4. データベースのセットアップ
cd backend
rails db:create db:migrate db:seed
cd ..

# 5. 開発サーバーの起動
npm run dev
```

これで以下が起動します：
- Rails APIサーバー: http://localhost:3001
- React開発サーバー: http://localhost:5173
- Electronアプリケーション

## 詳細セットアップ

### 1. プロジェクト構造の理解

```
my-care_track/
├── backend/          # Rails API
├── frontend/         # React SPA
├── electron/         # Electronメインプロセス
├── tests/           # 統合テスト
├── docs/            # ドキュメント
└── package.json     # ルート（ワークスペース管理）
```

### 2. NPMワークスペースの仕組み

ルートの`package.json`で以下のワークスペースを定義しています：
```json
{
  "workspaces": [
    "frontend",
    "electron"
  ]
}
```

これにより：
- 共通の依存関係はルートで管理
- `npm install`一回で全ての依存関係をインストール
- 単一の`node_modules`と`package-lock.json`

### 3. 環境設定

#### Rails環境変数
`backend/.env`ファイルを作成：
```env
RAILS_ENV=development
DATABASE_URL=sqlite3:db/development.sqlite3
SECRET_KEY_BASE=your-secret-key-here
```

#### Electronの設定
開発時はデフォルト設定で動作します。

## 開発ワークフロー

### 基本的な開発フロー

1. **機能ブランチの作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

3. **コードの変更**
   - Frontend: `frontend/src/`
   - Backend: `backend/app/`
   - Electron: `electron/`

4. **テストの実行**
   ```bash
   # 全てのテスト
   npm test
   
   # フロントエンドのみ
   npm run test:frontend
   
   # バックエンドのみ
   npm run test:backend
   ```

5. **ビルドの確認**
   ```bash
   npm run build:all
   ```

### よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（全て） |
| `npm run build:all` | 全体をビルド |
| `npm test` | テスト実行 |
| `npm run package` | デスクトップアプリのパッケージ化 |

### コンポーネント別の開発

#### Reactフロントエンド開発
```bash
cd frontend
npm run dev  # 開発サーバー起動
npm test     # テスト実行
```

#### Rails API開発
```bash
cd backend
rails server -p 3001  # APIサーバー起動
bundle exec rspec     # テスト実行
rails console         # コンソール起動
```

#### Electron開発
```bash
cd electron
npm run build  # TypeScriptコンパイル
npm test       # テスト実行
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. npm installが失敗する
```bash
# キャッシュクリアと再インストール
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Rails APIが起動しない
```bash
cd backend
# データベースをリセット
rails db:drop db:create db:migrate db:seed
# ポートを確認
lsof -i :3001  # 使用中のプロセスを確認
```

#### 3. Electronが白い画面になる
```bash
# 開発者ツールで確認
# Cmd/Ctrl + Shift + I でDevToolsを開く

# Electronのキャッシュをクリア
rm -rf ~/Library/Application\ Support/CareTrack  # macOS
rm -rf %APPDATA%/CareTrack  # Windows
```

#### 4. TypeScriptエラー
```bash
# TypeScriptのバージョンを確認
npx tsc --version  # 5.8.3であることを確認

# 型定義の再インストール
npm install
```

#### 5. テストが失敗する
```bash
# 統合テストの個別実行
npx jest tests/project-structure.test.js
npx jest tests/dependency-management.test.js
npx jest tests/build-process.test.js

# フロントエンドテストのデバッグモード
cd frontend
npm run test:ui  # UIモードで実行
```

### ポート競合の解決

デフォルトポート：
- Rails API: 3001
- React Dev Server: 5173

ポートを変更する場合：
```bash
# Rails
cd backend && rails server -p 3002

# React（vite.config.tsで設定）
server: {
  port: 5174
}
```

### ログの確認

```bash
# Rails ログ
tail -f backend/log/development.log

# Electronコンソール出力
# アプリケーション起動時のターミナルに表示

# React開発サーバー
# ブラウザのコンソールで確認
```

## 参考資料

- [プロジェクトアーキテクチャ](../ARCHITECTURE.md)
- [API仕様書](./API_SPEC.md)
- [コーディング規約](./CODING_STANDARDS.md)
- [テストガイド](./TESTING_GUIDE.md)

## サポート

問題が解決しない場合は：
1. [Issue](https://github.com/your-org/my-care_track/issues)を作成
2. Slackの#caretrack-devチャンネルで質問
3. ドキュメントの改善提案をPRで送信

---

Happy Coding! 🚀
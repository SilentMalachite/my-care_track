# CareTrack アーキテクチャドキュメント

## 概要

CareTrackは、障害福祉サービスの利用者管理を行うデスクトップアプリケーションです。
オフライン環境で完全に動作し、ローカルマシン上でデータを管理します。

## 技術スタック構成

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Shell                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │               React Frontend (SPA)               │    │
│  │                                                   │    │
│  │  - TypeScript + React                            │    │
│  │  - Tailwind CSS                                  │    │
│  │  - React Router v6                               │    │
│  │  - Axios (API Client)                            │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓ HTTP                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Ruby on Rails API Backend             │    │
│  │                                                   │    │
│  │  - Rails 7 (API Only Mode)                       │    │
│  │  - SQLite3 Database                              │    │
│  │  - RESTful JSON API                              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
my-care_track/
├── backend/          # Rails APIアプリケーション
├── frontend/         # React SPAアプリケーション  
├── electron/         # Electronメインプロセス
├── tests/           # 統合テスト
├── docs/            # ドキュメント
└── package.json     # ルートパッケージ（ワークスペース管理）
```

## 各コンポーネントの役割

### 1. Electron Shell（`electron/`）
- **役割**: デスクトップアプリケーションのシェル
- **責務**:
  - ウィンドウ管理
  - ネイティブメニュー
  - ファイルシステムアクセス
  - プロセス間通信（IPC）
  - セキュリティ設定

### 2. React Frontend（`frontend/`）
- **役割**: ユーザーインターフェース
- **責務**:
  - UIコンポーネント
  - 状態管理
  - ルーティング
  - APIクライアント
  - フォームバリデーション

### 3. Rails Backend（`backend/`）
- **役割**: ビジネスロジックとデータ管理
- **責務**:
  - RESTful API提供
  - データベース管理
  - ビジネスロジック
  - バリデーション
  - 認証・認可

## 開発ワークフロー

### 1. 開発モード
```bash
npm run dev
```
このコマンドで以下が同時に起動します：
- Rails APIサーバー（ポート3001）
- React開発サーバー（ポート5173）
- Electronアプリケーション

### 2. ビルドプロセス
```bash
npm run build:all
```
以下の順序でビルドが実行されます：
1. TypeScriptコンパイル（Electron）
2. Reactアプリケーションのビルド
3. Rails アセットのプリコンパイル

### 3. パッケージング
```bash
npm run package
```
electron-builderを使用して、各プラットフォーム向けの実行可能ファイルを生成します。

## 依存関係管理

### NPMワークスペース
ルートの`package.json`でワークスペースを定義し、共通の依存関係を一元管理しています：

```json
{
  "workspaces": [
    "frontend",
    "electron"
  ]
}
```

### 共通依存関係
- TypeScript
- ESLint
- Vitest
- 開発ツール類

これらはルートの`package.json`で管理され、各ワークスペースから参照されます。

## データフロー

```
User Input → React UI → Axios → Rails API → SQLite DB
                ↑                    ↓
                └────── Response ────┘
```

1. ユーザーがReact UIを操作
2. AxiosがRails APIにHTTPリクエストを送信
3. Rails APIがビジネスロジックを実行
4. SQLite3データベースでデータを永続化
5. レスポンスをReact UIに返却
6. UIが更新される

## セキュリティ考慮事項

1. **Context Isolation**: Electronのメインプロセスとレンダラープロセスを分離
2. **ローカル動作**: ネットワーク接続不要、データは全てローカル保存
3. **セッション管理**: Rails側でセッションベースの認証を実装
4. **SQLite暗号化**: 将来的にデータベース暗号化を実装予定

## テスト戦略

1. **単体テスト**:
   - Frontend: Vitest + React Testing Library
   - Backend: RSpec
   - Electron: Vitest

2. **統合テスト**:
   - Jest（`tests/`ディレクトリ）
   - プロジェクト構造の検証
   - 依存関係の整合性チェック
   - ビルドプロセスの検証

## トラブルシューティング

### よくある問題

1. **ポート競合**
   - Rails APIはポート3001を使用
   - React開発サーバーはポート5173を使用
   - 既に使用中の場合は、該当プロセスを終了してください

2. **依存関係エラー**
   ```bash
   npm install  # ルートディレクトリで実行
   ```

3. **ビルドエラー**
   - TypeScriptのバージョン統一を確認
   - Node.jsのバージョンを確認（18.x以上推奨）

## 今後の改善計画

1. **パフォーマンス最適化**
   - React.lazyによる遅延読み込みの拡充
   - APIレスポンスのキャッシング

2. **開発体験の向上**
   - ホットリロードの改善
   - デバッグツールの統合

3. **セキュリティ強化**
   - データベース暗号化
   - より詳細な権限管理

## 参考リンク

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Ruby on Rails Guides](https://guides.rubyonrails.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
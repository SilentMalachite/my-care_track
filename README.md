# 🏥 障害者支援管理システム (my-care_track)

[![Ruby](https://img.shields.io/badge/Ruby-3.3+-red.svg)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-8.0+-red.svg)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Test Status](https://img.shields.io/badge/Tests-168%20passed-green.svg)](./backend/spec)

オフライン対応のデスクトップアプリケーションで、障害者福祉サービスのクライアント管理を行います。

## 🎯 プロジェクト概要

このシステムは、障害者支援サービスの現場スタッフが利用するクライアント管理システムです。支援の全ライフサイクルをカバーし、完全にオフラインで動作します。

### 支援ライフサイクル
1. **受付・登録** - クライアント情報の初期登録
2. **支援計画策定** - 個別支援計画の作成
3. **サービス提供** - 日々のサービス記録
4. **評価・モニタリング** - 定期的な評価とアセスメント
5. **終了・退所** - 支援終了時の処理

## 🛠 技術スタック

| レイヤー | 技術 |
|---------|------|
| バックエンド | Ruby on Rails 8.0+ (API) |
| フロントエンド | React 18+ + TypeScript |
| デスクトップ | Electron |
| データベース | SQLite3 (ローカル) |
| スタイリング | Tailwind CSS |
| 認証 | JWT + bcrypt |
| テスト | RSpec + Jest |

## 🔐 セキュリティ機能

### パスワードセキュリティ
- **複雑性要件**: 8文字以上、大文字・小文字・数字・特殊文字必須
- **ログイン試行制限**: 5回失敗でアカウントロック
- **パスワード有効期限**: 90日間
- **履歴管理**: 過去5回のパスワード再利用防止

### 認証・認可
- JWT トークンベース認証（24時間有効）
- ロールベースアクセス制御（管理者・スタッフ・閲覧者）
- 全APIエンドポイントの認証保護

### データ保護
- ローカルSQLiteデータベース
- bcryptによるパスワードハッシュ化
- セッション管理とタイムアウト

## 📦 主要機能

### 基本エンティティ
- **クライアント** - サービス利用者情報
- **支援計画** - 個別支援計画
- **サービス記録** - 日々の支援活動記録
- **スタッフ** - 職員管理
- **アセスメント** - 評価記録
- **緊急連絡先** - 緊急時連絡先情報

### 機能要件
- ✅ クライアント登録・管理
- ✅ 支援計画の作成・更新
- ✅ サービス提供記録の入力
- ✅ アセスメント機能
- ✅ 職員認証・権限管理
- ✅ 検索・フィルタリング
- 🔄 CSVエクスポート
- 🔄 月次レポート生成

## 🚀 セットアップ

### 前提条件
- Ruby 3.3+
- Node.js 18+
- SQLite3

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/my-care_track.git
cd my-care_track

# バックエンドセットアップ
cd backend
bundle install
rails db:create db:migrate db:seed

# フロントエンドセットアップ
cd ../frontend
npm install

# Electronセットアップ
cd ../electron
npm install
```

### 開発サーバー起動

```bash
# バックエンド（ポート3000）
cd backend
rails server

# フロントエンド（ポート5173）
cd frontend
npm run dev

# Electronアプリ
cd electron
npm run dev
```

## 🧪 テスト

### バックエンドテスト
```bash
cd backend
bundle exec rspec
```

**テスト結果**: 168 examples, 0 failures, 4 pending

### フロントエンドテスト
```bash
cd frontend
npm test
```

### テストカバレッジ
- **認証機能**: 100%
- **パスワードセキュリティ**: 100%
- **API エンドポイント**: 100%
- **モデルバリデーション**: 100%

## 📁 プロジェクト構造

```
my-care_track/
├── backend/                 # Rails API
│   ├── app/
│   │   ├── controllers/     # API コントローラー
│   │   ├── models/          # データモデル
│   │   └── ...
│   ├── config/
│   │   └── initializers/
│   │       └── security.rb  # セキュリティ設定
│   ├── db/                  # データベース関連
│   └── spec/                # テストファイル
├── frontend/                # React アプリ
│   ├── src/
│   │   ├── components/      # UI コンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── services/        # API サービス
│   │   └── types/           # TypeScript 型定義
│   └── ...
├── electron/                # Electron メインプロセス
└── docs/                    # ドキュメント
```

## 🔧 設定

### セキュリティ設定
セキュリティ設定は `backend/config/initializers/security.rb` で変更可能:

```ruby
Rails.application.config.security = {
  password: {
    min_length: 8,
    expiration_days: 90,
    history_limit: 5
  },
  login: {
    max_attempts: 5,
    lockout_duration: 30.minutes
  }
}
```

## 🌟 特徴

### オフライン対応
- ネットワーク接続不要
- ローカルSQLiteデータベース
- デスクトップアプリとして配布

### 日本の福祉制度対応
- 障害者総合支援法に準拠
- 日本語UI対応
- 現場ワークフローに最適化

### アクセシビリティ
- キーボードナビゲーション
- スクリーンリーダー対応
- 高コントラストモード

## 📋 今後の拡張予定

- [ ] QRコードによるクライアント検索
- [ ] PDF形式でのケアサマリー出力
- [ ] サービススケジュールのカレンダー表示
- [ ] ローカルバックアップ・復元機能
- [ ] 多言語対応（英語・中国語・韓国語）

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🔗 関連リンク

- [Ruby on Rails](https://rubyonrails.org/)
- [React](https://reactjs.org/)
- [Electron](https://electronjs.org/)
- [日本の障害者支援制度について](https://www.mhlw.go.jp/)

---

**開発チーム**: 障害者支援現場のニーズに基づいて設計・開発されています。
# Security Policy

## 🔐 セキュリティポリシー

このドキュメントでは、my-care_track プロジェクトのセキュリティ機能、設定、および報告手順について説明します。

## サポートされているバージョン

現在セキュリティアップデートがサポートされているバージョン:

| バージョン | サポート状況 |
| ------- | ----------- |
| 1.0.x   | ✅ |
| < 1.0   | ❌ |

## 🛡️ セキュリティ機能

### 認証・認可

#### パスワードセキュリティ
- **複雑性要件**: 最小8文字、大文字・小文字・数字・特殊文字必須
- **有効期限**: 90日間での強制変更
- **履歴管理**: 過去5回のパスワード再利用防止
- **ハッシュ化**: bcrypt による安全なパスワード保存

#### ログイン保護
- **試行制限**: 5回失敗でアカウント自動ロック
- **JWT認証**: トークンベース認証（24時間有効）
- **セッション管理**: 安全なトークン管理

#### 権限管理
- **ロールベースアクセス制御**:
  - `admin`: 全機能へのアクセス
  - `staff`: 通常業務機能
  - `viewer`: 閲覧のみ

### データ保護

#### ローカルデータ
- **SQLite暗号化**: ローカルデータベースの保護
- **オフライン動作**: ネットワーク依存の削除
- **データ分離**: アプリケーションデータの分離

#### 通信セキュリティ
- **API保護**: 全エンドポイントでの認証必須
- **CORS設定**: 適切なクロスオリジン制御
- **ヘッダー検証**: セキュリティヘッダーの実装

## ⚙️ セキュリティ設定

### 設定ファイル

`backend/config/initializers/security.rb`:

```ruby
Rails.application.config.security = {
  # パスワード要件
  password: {
    min_length: 8,                    # 最小文字数
    require_uppercase: true,          # 大文字必須
    require_lowercase: true,          # 小文字必須
    require_digit: true,              # 数字必須
    require_special_char: true,       # 特殊文字必須
    special_chars: '!@#$%^&*(),.?":{}|<>',  # 有効な特殊文字
    expiration_days: 90,              # パスワード有効期限（日）
    history_limit: 5                  # 履歴保持数
  },
  
  # ログインセキュリティ
  login: {
    max_attempts: 5,                  # 最大試行回数
    lockout_duration: 30.minutes      # ロック時間
  }
}
```

### 環境変数

#### 必須環境変数
```bash
# JWT秘密鍵（本番環境では必ず設定）
SECRET_KEY_BASE=your_secret_key_here

# データベース暗号化キー（推奨）
DATABASE_ENCRYPTION_KEY=your_encryption_key_here
```

#### 開発環境での設定
```bash
# .env ファイル（開発環境のみ）
SECRET_KEY_BASE=development_secret_key
RAILS_ENV=development
```

## 🔧 セキュリティ管理

### アカウント管理

#### 新しいスタッフの追加
```ruby
# Rails コンソールでの安全なユーザー作成
staff = Staff.new(
  staff_number: 'ST001',
  name: 'スタッフ名',
  email: 'staff@example.com',
  role: 'staff',
  password: 'SecurePassword123!'
)
staff.save!
```

#### ロックされたアカウントの解除
```ruby
# アカウントロックの解除
staff = Staff.find_by(email: 'locked@example.com')
staff.unlock_account!
```

#### パスワードリセット
```ruby
# 管理者によるパスワードリセット
staff = Staff.find_by(email: 'user@example.com')
staff.password = 'NewSecurePassword123!'
staff.password_confirmation = 'NewSecurePassword123!'
staff.save!
```

### ログとモニタリング

#### セキュリティイベントのログ
- ログイン成功/失敗
- アカウントロック/解除
- パスワード変更
- 権限変更

#### ログファイルの場所
```
log/security.log          # セキュリティ関連イベント
log/authentication.log    # 認証ログ
log/access.log           # APIアクセスログ
```

## 🚨 脆弱性報告

### 報告手順

セキュリティ脆弱性を発見した場合は、以下の手順で報告してください:

1. **緊急度の確認**
   - 🔴 **Critical**: データ漏洩やシステム停止の可能性
   - 🟡 **High**: 権限昇格や認証回避
   - 🟢 **Medium**: 情報漏洩やサービス拒否
   - 🔵 **Low**: 軽微な情報漏洩

2. **報告方法**
   - **Email**: security@yourcompany.com
   - **GitHub**: プライベートセキュリティアドバイザリー
   - **緊急時**: 24時間以内に連絡

3. **報告内容**
   ```
   件名: [SECURITY] 脆弱性報告 - [緊急度]
   
   ## 脆弱性の詳細
   - 影響範囲:
   - 攻撃手法:
   - 再現手順:
   - 影響度:
   
   ## 環境情報
   - バージョン:
   - OS:
   - ブラウザ:
   
   ## 推奨対策
   - 即座に実施すべき対策:
   - 長期的な対策:
   ```

### 対応プロセス

1. **受信確認**: 24時間以内
2. **初期評価**: 48時間以内
3. **詳細調査**: 1週間以内
4. **修正版リリース**: 緊急度に応じて
5. **公開報告**: 修正完了後

## 🛠️ セキュリティチェックリスト

### デプロイ前チェック

- [ ] すべてのテストが通過
- [ ] セキュリティ設定の確認
- [ ] 環境変数の設定確認
- [ ] データベース暗号化の確認
- [ ] CORS設定の確認
- [ ] ログ設定の確認

### 定期メンテナンス

#### 月次チェック
- [ ] パスワード有効期限の確認
- [ ] ロックアカウントの確認
- [ ] セキュリティログの確認
- [ ] 依存関係の脆弱性チェック

#### 四半期チェック
- [ ] セキュリティ設定の見直し
- [ ] アクセス権限の監査
- [ ] バックアップの確認
- [ ] 侵入テストの実施

### 推奨ツール

#### セキュリティスキャン
```bash
# Gemの脆弱性チェック
bundle audit

# コードの静的解析
brakeman

# 依存関係の確認
bundle outdated
```

## 📚 参考資料

### セキュリティ標準
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Ruby/Rails セキュリティ
- [Rails Security Guide](https://guides.rubyonrails.org/security.html)
- [Ruby Security Guidelines](https://ruby-lang.org/en/security/)
- [OWASP Rails Security Guide](https://owasp.org/www-project-cheat-sheets/cheatsheets/Ruby_on_Rails_Cheat_Sheet.html)

### 認証・認可
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [bcrypt Documentation](https://github.com/bcrypt-ruby/bcrypt-ruby)
- [OWASP Authentication Guidelines](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html)

## 📞 連絡先

### 開発チーム
- **GitHub**: @SilentMalachite/my-care_track



---

*このセキュリティポリシーは継続的に更新されます。最新版は常にこのリポジトリで確認してください。*

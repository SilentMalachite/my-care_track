import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientForm } from './ClientForm';
import { Client, CreateClientRequest } from '../../types/client';

// モックデータ
const mockClient: Client = {
  id: 1,
  clientNumber: 'CL001',
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  phone: '03-1234-5678',
  email: 'yamada@example.com',
  address: '東京都千代田区1-1-1',
  disabilityType: 'physical',
  disabilityGrade: 2,
  insuranceNumber: 'INS123456',
  status: 'active',
  notes: '特記事項なし',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ClientForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォーム表示', () => {
    it('新規登録モードで全てのフォーム要素が表示される', () => {
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 基本情報フィールド
      expect(screen.getByLabelText('利用者番号 *')).toBeInTheDocument();
      expect(screen.getByLabelText('氏名 *')).toBeInTheDocument();
      expect(screen.getByLabelText('氏名（カナ） *')).toBeInTheDocument();
      expect(screen.getByLabelText('生年月日 *')).toBeInTheDocument();
      expect(screen.getByLabelText('性別 *')).toBeInTheDocument();

      // 連絡先フィールド
      expect(screen.getByLabelText('電話番号')).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('住所')).toBeInTheDocument();

      // 障害情報フィールド
      expect(screen.getByLabelText('障害種別 *')).toBeInTheDocument();
      expect(screen.getByLabelText('障害等級')).toBeInTheDocument();
      expect(screen.getByLabelText('保険番号')).toBeInTheDocument();

      // ステータス・備考フィールド
      expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
      expect(screen.getByLabelText('備考')).toBeInTheDocument();

      // ボタン
      expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('編集モードで既存データが表示される', () => {
      render(
        <ClientForm
          client={mockClient}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('CL001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('山田太郎')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ヤマダタロウ')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('03-1234-5678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('yamada@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('東京都千代田区1-1-1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('INS123456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('特記事項なし')).toBeInTheDocument();

      // ボタンテキストが「更新」になる
      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    it('各フィールドに値を入力できる', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // テキスト入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL002');
      await user.type(screen.getByLabelText('氏名 *'), '佐藤花子');
      await user.type(screen.getByLabelText('氏名（カナ） *'), 'サトウハナコ');
      await user.type(screen.getByLabelText('電話番号'), '090-1234-5678');
      await user.type(screen.getByLabelText('メールアドレス'), 'sato@example.com');
      await user.type(screen.getByLabelText('住所'), '大阪府大阪市北区2-2-2');
      await user.type(screen.getByLabelText('保険番号'), 'INS789012');
      await user.type(screen.getByLabelText('備考'), 'テスト備考');

      // 日付入力
      const dateInput = screen.getByLabelText('生年月日 *');
      await user.clear(dateInput);
      await user.type(dateInput, '1985-05-15');

      // 数値入力
      await user.type(screen.getByLabelText('障害等級'), '3');

      // セレクトボックス
      await user.selectOptions(screen.getByLabelText('性別 *'), 'female');
      await user.selectOptions(screen.getByLabelText('障害種別 *'), 'mental');
      await user.selectOptions(screen.getByLabelText('ステータス'), 'inactive');

      // 入力値の確認
      expect(screen.getByDisplayValue('CL002')).toBeInTheDocument();
      expect(screen.getByDisplayValue('佐藤花子')).toBeInTheDocument();
      expect(screen.getByDisplayValue('サトウハナコ')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1985-05-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('090-1234-5678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('sato@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('大阪府大阪市北区2-2-2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('INS789012')).toBeInTheDocument();
      expect(screen.getByDisplayValue('テスト備考')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByLabelText('性別 *')).toHaveValue('female');
      expect(screen.getByLabelText('障害種別 *')).toHaveValue('mental');
      expect(screen.getByLabelText('ステータス')).toHaveValue('inactive');
    });
  });

  describe('バリデーション', () => {
    it('必須項目が空の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 送信ボタンをクリック
      await user.click(screen.getByRole('button', { name: '登録' }));

      // エラーメッセージの確認
      await waitFor(() => {
        expect(screen.getByText('利用者番号は必須です')).toBeInTheDocument();
        expect(screen.getByText('氏名は必須です')).toBeInTheDocument();
        expect(screen.getByText('氏名（カナ）は必須です')).toBeInTheDocument();
        expect(screen.getByText('生年月日は必須です')).toBeInTheDocument();
        expect(screen.getByText('性別は必須です')).toBeInTheDocument();
        expect(screen.getByText('障害種別は必須です')).toBeInTheDocument();
      });

      // onSubmitが呼ばれていないことを確認
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('電話番号の形式が不正な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText('電話番号'), '123'); // 不正な形式
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(screen.getByText('電話番号の形式が正しくありません')).toBeInTheDocument();
      });
    });

    it('メールアドレスの形式が不正な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText('メールアドレス'), 'invalid-email'); // 不正な形式
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(screen.getByText('メールアドレスの形式が正しくありません')).toBeInTheDocument();
      });
    });

    it('生年月日が未来日の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      await user.type(screen.getByLabelText('生年月日 *'), futureDateStr);
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(screen.getByText('生年月日は過去の日付を指定してください')).toBeInTheDocument();
      });
    });

    it('障害等級が範囲外の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText('障害等級'), '8'); // 1-7の範囲外
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('障害等級は1から7の間で入力してください')).toBeInTheDocument();
      });
    });

    it('氏名（カナ）にひらがなが含まれる場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText('氏名（カナ） *'), 'やまだたろう'); // ひらがな
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('カタカナで入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力で送信できる', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 必須項目を入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL003');
      await user.type(screen.getByLabelText('氏名 *'), '鈴木一郎');
      await user.type(screen.getByLabelText('氏名（カナ） *'), 'スズキイチロウ');
      await user.type(screen.getByLabelText('生年月日 *'), '1980-03-20');
      await user.selectOptions(screen.getByLabelText('性別 *'), 'male');
      await user.selectOptions(screen.getByLabelText('障害種別 *'), 'intellectual');

      // 任意項目も入力
      await user.type(screen.getByLabelText('電話番号'), '045-123-4567');
      await user.type(screen.getByLabelText('メールアドレス'), 'suzuki@example.com');
      await user.type(screen.getByLabelText('障害等級'), '4');

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          clientNumber: 'CL003',
          name: '鈴木一郎',
          nameKana: 'スズキイチロウ',
          dateOfBirth: '1980-03-20',
          gender: 'male',
          disabilityType: 'intellectual',
          phone: '045-123-4567',
          email: 'suzuki@example.com',
          disabilityGrade: 4,
          status: 'active', // デフォルト値
        });
      });
    });

    it('編集モードで更新できる', async () => {
      const user = userEvent.setup();
      render(
        <ClientForm
          client={mockClient}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 名前を変更
      const nameInput = screen.getByLabelText('氏名 *');
      await user.clear(nameInput);
      await user.type(nameInput, '山田次郎');

      // 送信
      await user.click(screen.getByRole('button', { name: '更新' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            name: '山田次郎',
          })
        );
      });
    });

    it('送信中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<ClientForm onSubmit={slowSubmit} onCancel={mockOnCancel} />);

      // 必須項目を入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL004');
      await user.type(screen.getByLabelText('氏名 *'), '田中太郎');
      await user.type(screen.getByLabelText('氏名（カナ） *'), 'タナカタロウ');
      await user.type(screen.getByLabelText('生年月日 *'), '1975-06-10');
      await user.selectOptions(screen.getByLabelText('性別 *'), 'male');
      await user.selectOptions(screen.getByLabelText('障害種別 *'), 'developmental');

      // 送信
      const submitButton = screen.getByRole('button', { name: '登録' });
      await user.click(submitButton);

      // ボタンが無効化されていることを確認
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('登録中...')).toBeInTheDocument();

      // 送信完了後、ボタンが有効化される
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText('登録')).toBeInTheDocument();
      });
    });
  });

  describe('キャンセル操作', () => {
    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('フォームをリセットできる', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // フォームに入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL005');
      await user.type(screen.getByLabelText('氏名 *'), '高橋花子');

      // リセットボタンをクリック
      await user.click(screen.getByRole('button', { name: 'リセット' }));

      // フィールドがクリアされていることを確認
      expect(screen.getByLabelText('利用者番号 *')).toHaveValue('');
      expect(screen.getByLabelText('氏名 *')).toHaveValue('');
    });
  });

  describe('エラーハンドリング', () => {
    it('送信エラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const errorSubmit = vi.fn().mockRejectedValue(new Error('ネットワークエラー'));
      render(<ClientForm onSubmit={errorSubmit} onCancel={mockOnCancel} />);

      // 必須項目を入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL006');
      await user.type(screen.getByLabelText('氏名 *'), '佐々木太郎');
      await user.type(screen.getByLabelText('氏名（カナ） *'), 'ササキタロウ');
      await user.type(screen.getByLabelText('生年月日 *'), '1988-11-30');
      await user.selectOptions(screen.getByLabelText('性別 *'), 'male');
      await user.selectOptions(screen.getByLabelText('障害種別 *'), 'sensory');

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('送信中にエラーが発生しました。もう一度お試しください。')).toBeInTheDocument();
      });
    });

    it('利用者番号重複エラーが表示される', async () => {
      const user = userEvent.setup();
      const duplicateError = new Error('利用者番号が既に使用されています');
      const errorSubmit = vi.fn().mockRejectedValue(duplicateError);
      render(<ClientForm onSubmit={errorSubmit} onCancel={mockOnCancel} />);

      // 必須項目を入力
      await user.type(screen.getByLabelText('利用者番号 *'), 'CL001'); // 既存の番号
      await user.type(screen.getByLabelText('氏名 *'), '新規利用者');
      await user.type(screen.getByLabelText('氏名（カナ） *'), 'シンキリヨウシャ');
      await user.type(screen.getByLabelText('生年月日 *'), '1990-01-01');
      await user.selectOptions(screen.getByLabelText('性別 *'), 'other');
      await user.selectOptions(screen.getByLabelText('障害種別 *'), 'physical');

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('利用者番号が既に使用されています')).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('必須項目にaria-required属性が設定されている', () => {
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('利用者番号 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('氏名 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('氏名（カナ） *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('生年月日 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('性別 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('障害種別 *')).toHaveAttribute('aria-required', 'true');
    });

    it('エラー時にaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 不正な電話番号を入力
      const phoneInput = screen.getByLabelText('電話番号');
      await user.type(phoneInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
        expect(phoneInput).toHaveAttribute('aria-describedby', expect.stringContaining('phone-error'));
      });
    });

    it('フォームにaria-labelが設定されている', () => {
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', '利用者登録フォーム');
    });

    it('エラーメッセージにrole="alert"が設定されている', async () => {
      const user = userEvent.setup();
      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // 送信ボタンをクリックしてバリデーションエラーを発生させる
      await user.click(screen.getByRole('button', { name: '登録' }));

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル画面でフォームが縦に配置される', () => {
      // ビューポートをモバイルサイズに設定
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const form = screen.getByRole('form');
      expect(form).toHaveClass('sm:grid-cols-1');
    });

    it('デスクトップ画面でフォームが適切に配置される', () => {
      // ビューポートをデスクトップサイズに設定
      global.innerWidth = 1024;
      global.innerHeight = 768;

      render(<ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const form = screen.getByRole('form');
      expect(form).toHaveClass('md:grid-cols-2');
    });
  });
});
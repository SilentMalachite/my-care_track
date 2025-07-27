import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportPlanForm } from './SupportPlanForm';
import { SupportPlan, CreateSupportPlanRequest } from '../../types/supportPlan';
import { Client } from '../../types/client';

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

const mockSupportPlan: SupportPlan = {
  id: 1,
  clientId: 1,
  planName: '日常生活支援計画',
  goals: ['自立した生活の維持', '社会参加の促進', '健康管理の改善'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'active',
  priority: 'high',
  assignedStaffIds: [1, 2],
  notes: '週2回の訪問サポート',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockStaffList = [
  { id: 1, name: '佐藤太郎', role: '介護福祉士' },
  { id: 2, name: '鈴木花子', role: '社会福祉士' },
  { id: 3, name: '田中一郎', role: 'ケアマネージャー' },
];

describe('SupportPlanForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォーム表示', () => {
    it('新規作成モードで全てのフォーム要素が表示される', () => {
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 基本情報フィールド
      expect(screen.getByText('利用者: 山田太郎 様')).toBeInTheDocument();
      expect(screen.getByLabelText('計画名 *')).toBeInTheDocument();
      expect(screen.getByLabelText('開始日 *')).toBeInTheDocument();
      expect(screen.getByLabelText('終了日 *')).toBeInTheDocument();
      expect(screen.getByLabelText('優先度 *')).toBeInTheDocument();
      expect(screen.getByLabelText('ステータス')).toBeInTheDocument();

      // 目標入力フィールド
      expect(screen.getByText('目標設定')).toBeInTheDocument();
      expect(screen.getByLabelText('目標 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '目標を追加' })).toBeInTheDocument();

      // 担当スタッフ選択
      expect(screen.getByText('担当スタッフ')).toBeInTheDocument();
      expect(screen.getByText('佐藤太郎')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('田中一郎')).toBeInTheDocument();

      // 備考フィールド
      expect(screen.getByLabelText('備考')).toBeInTheDocument();

      // ボタン
      expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('編集モードで既存データが表示される', () => {
      render(
        <SupportPlanForm
          client={mockClient}
          supportPlan={mockSupportPlan}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('日常生活支援計画')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
      expect(screen.getByDisplayValue('週2回の訪問サポート')).toBeInTheDocument();

      // 目標が表示される
      expect(screen.getByDisplayValue('自立した生活の維持')).toBeInTheDocument();
      expect(screen.getByDisplayValue('社会参加の促進')).toBeInTheDocument();
      expect(screen.getByDisplayValue('健康管理の改善')).toBeInTheDocument();

      // 担当スタッフがチェックされている
      const sato = screen.getByRole('checkbox', { name: '佐藤太郎' });
      const suzuki = screen.getByRole('checkbox', { name: '鈴木花子' });
      const tanaka = screen.getByRole('checkbox', { name: '田中一郎' });
      
      expect(sato).toBeChecked();
      expect(suzuki).toBeChecked();
      expect(tanaka).not.toBeChecked();

      // ボタンテキストが「更新」になる
      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    it('各フィールドに値を入力できる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // テキスト入力
      await user.type(screen.getByLabelText('計画名 *'), '新規支援計画');
      await user.type(screen.getByLabelText('備考'), 'テスト備考');

      // 日付入力
      await user.type(screen.getByLabelText('開始日 *'), '2024-02-01');
      await user.type(screen.getByLabelText('終了日 *'), '2024-07-31');

      // セレクトボックス
      await user.selectOptions(screen.getByLabelText('優先度 *'), 'medium');
      await user.selectOptions(screen.getByLabelText('ステータス'), 'pending');

      // 目標入力
      await user.type(screen.getByLabelText('目標 1'), '新しい目標');

      // スタッフ選択
      await user.click(screen.getByRole('checkbox', { name: '田中一郎' }));

      // 入力値の確認
      expect(screen.getByDisplayValue('新規支援計画')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-02-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-07-31')).toBeInTheDocument();
      expect(screen.getByDisplayValue('テスト備考')).toBeInTheDocument();
      expect(screen.getByDisplayValue('新しい目標')).toBeInTheDocument();
      expect(screen.getByLabelText('優先度 *')).toHaveValue('medium');
      expect(screen.getByLabelText('ステータス')).toHaveValue('pending');
      expect(screen.getByRole('checkbox', { name: '田中一郎' })).toBeChecked();
    });

    it('目標を追加・削除できる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 初期状態は1つの目標入力
      expect(screen.getByLabelText('目標 1')).toBeInTheDocument();

      // 目標を追加
      await user.click(screen.getByRole('button', { name: '目標を追加' }));
      expect(screen.getByLabelText('目標 2')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '目標を追加' }));
      expect(screen.getByLabelText('目標 3')).toBeInTheDocument();

      // 目標に入力
      await user.type(screen.getByLabelText('目標 2'), '追加目標1');
      await user.type(screen.getByLabelText('目標 3'), '追加目標2');

      // 目標を削除（目標2を削除）
      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[1]); // 2番目の削除ボタン

      // 目標2が削除され、目標3の内容が目標2に移動
      expect(screen.queryByDisplayValue('追加目標1')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('追加目標2')).toBeInTheDocument();
    });

    it('最大10個まで目標を追加できる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 9個追加（初期1個 + 9個 = 10個）
      for (let i = 0; i < 9; i++) {
        await user.click(screen.getByRole('button', { name: '目標を追加' }));
      }

      expect(screen.getByLabelText('目標 10')).toBeInTheDocument();

      // 追加ボタンが無効化される
      const addButton = screen.getByRole('button', { name: '目標を追加' });
      expect(addButton).toBeDisabled();
    });
  });

  describe('バリデーション', () => {
    it('必須項目が空の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 送信ボタンをクリック
      await user.click(screen.getByRole('button', { name: '登録' }));

      // エラーメッセージの確認
      await waitFor(() => {
        expect(screen.getByText('計画名は必須です')).toBeInTheDocument();
        expect(screen.getByText('開始日は必須です')).toBeInTheDocument();
        expect(screen.getByText('終了日は必須です')).toBeInTheDocument();
        expect(screen.getByText('優先度は必須です')).toBeInTheDocument();
        expect(screen.getByText('少なくとも1つの目標を入力してください')).toBeInTheDocument();
        expect(screen.getByText('少なくとも1人の担当スタッフを選択してください')).toBeInTheDocument();
      });

      // onSubmitが呼ばれていないことを確認
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('終了日が開始日より前の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('開始日 *'), '2024-12-31');
      await user.type(screen.getByLabelText('終了日 *'), '2024-01-01');
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(screen.getByText('終了日は開始日以降の日付を指定してください')).toBeInTheDocument();
      });
    });

    it('計画名が100文字を超える場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const longName = 'あ'.repeat(101);
      await user.type(screen.getByLabelText('計画名 *'), longName);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('計画名は100文字以内で入力してください')).toBeInTheDocument();
      });
    });

    it('空の目標がある場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 2つ目の目標を追加
      await user.click(screen.getByRole('button', { name: '目標を追加' }));
      
      // 1つ目の目標のみ入力
      await user.type(screen.getByLabelText('目標 1'), '目標1');
      // 2つ目は空のまま

      // 他の必須項目を入力
      await user.type(screen.getByLabelText('計画名 *'), 'テスト計画');
      await user.type(screen.getByLabelText('開始日 *'), '2024-01-01');
      await user.type(screen.getByLabelText('終了日 *'), '2024-12-31');
      await user.selectOptions(screen.getByLabelText('優先度 *'), 'medium');
      await user.click(screen.getByRole('checkbox', { name: '佐藤太郎' }));

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      await waitFor(() => {
        expect(screen.getByText('目標2を入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力で送信できる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.type(screen.getByLabelText('計画名 *'), '新規支援計画');
      await user.type(screen.getByLabelText('開始日 *'), '2024-04-01');
      await user.type(screen.getByLabelText('終了日 *'), '2025-03-31');
      await user.selectOptions(screen.getByLabelText('優先度 *'), 'high');
      await user.type(screen.getByLabelText('目標 1'), '生活の質の向上');
      await user.click(screen.getByRole('checkbox', { name: '佐藤太郎' }));
      await user.click(screen.getByRole('checkbox', { name: '鈴木花子' }));

      // 任意項目も入力
      await user.type(screen.getByLabelText('備考'), '月1回のモニタリング実施');

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          clientId: 1,
          planName: '新規支援計画',
          goals: ['生活の質の向上'],
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          status: 'active',
          priority: 'high',
          assignedStaffIds: [1, 2],
          notes: '月1回のモニタリング実施',
        });
      });
    });

    it('編集モードで更新できる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          supportPlan={mockSupportPlan}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 計画名を変更
      const nameInput = screen.getByLabelText('計画名 *');
      await user.clear(nameInput);
      await user.type(nameInput, '更新された支援計画');

      // 新しい目標を追加
      await user.click(screen.getByRole('button', { name: '目標を追加' }));
      await user.type(screen.getByLabelText('目標 4'), '新しい目標');

      // 送信
      await user.click(screen.getByRole('button', { name: '更新' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            clientId: 1,
            planName: '更新された支援計画',
            goals: ['自立した生活の維持', '社会参加の促進', '健康管理の改善', '新しい目標'],
          })
        );
      });
    });

    it('送信中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={slowSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.type(screen.getByLabelText('計画名 *'), 'テスト計画');
      await user.type(screen.getByLabelText('開始日 *'), '2024-01-01');
      await user.type(screen.getByLabelText('終了日 *'), '2024-12-31');
      await user.selectOptions(screen.getByLabelText('優先度 *'), 'medium');
      await user.type(screen.getByLabelText('目標 1'), 'テスト目標');
      await user.click(screen.getByRole('checkbox', { name: '佐藤太郎' }));

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
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('フォームをリセットできる', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // フォームに入力
      await user.type(screen.getByLabelText('計画名 *'), 'テスト計画');
      await user.type(screen.getByLabelText('目標 1'), 'テスト目標');
      await user.click(screen.getByRole('checkbox', { name: '佐藤太郎' }));

      // リセットボタンをクリック
      await user.click(screen.getByRole('button', { name: 'リセット' }));

      // フィールドがクリアされていることを確認
      expect(screen.getByLabelText('計画名 *')).toHaveValue('');
      expect(screen.getByLabelText('目標 1')).toHaveValue('');
      expect(screen.getByRole('checkbox', { name: '佐藤太郎' })).not.toBeChecked();
    });
  });

  describe('エラーハンドリング', () => {
    it('送信エラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const errorSubmit = vi.fn().mockRejectedValue(new Error('ネットワークエラー'));
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={errorSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.type(screen.getByLabelText('計画名 *'), 'テスト計画');
      await user.type(screen.getByLabelText('開始日 *'), '2024-01-01');
      await user.type(screen.getByLabelText('終了日 *'), '2024-12-31');
      await user.selectOptions(screen.getByLabelText('優先度 *'), 'medium');
      await user.type(screen.getByLabelText('目標 1'), 'テスト目標');
      await user.click(screen.getByRole('checkbox', { name: '佐藤太郎' }));

      // 送信
      await user.click(screen.getByRole('button', { name: '登録' }));

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('送信中にエラーが発生しました。もう一度お試しください。')).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('必須項目にaria-required属性が設定されている', () => {
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('計画名 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('開始日 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('終了日 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('優先度 *')).toHaveAttribute('aria-required', 'true');
    });

    it('エラー時にaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 長い計画名を入力
      const planNameInput = screen.getByLabelText('計画名 *');
      await user.type(planNameInput, 'あ'.repeat(101));
      await user.tab();

      await waitFor(() => {
        expect(planNameInput).toHaveAttribute('aria-invalid', 'true');
        expect(planNameInput).toHaveAttribute('aria-describedby', expect.stringContaining('planName-error'));
      });
    });

    it('フォームにaria-labelが設定されている', () => {
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', '支援計画登録フォーム');
    });

    it('エラーメッセージにrole="alert"が設定されている', async () => {
      const user = userEvent.setup();
      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

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

      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveClass('sm:grid-cols-1');
    });

    it('デスクトップ画面でフォームが適切に配置される', () => {
      // ビューポートをデスクトップサイズに設定
      global.innerWidth = 1024;
      global.innerHeight = 768;

      render(
        <SupportPlanForm
          client={mockClient}
          staffList={mockStaffList}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveClass('md:grid-cols-2');
    });
  });
});
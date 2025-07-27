import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceLogForm } from './ServiceLogForm';
import { ServiceLog, CreateServiceLogRequest } from '../../types/serviceLog';
import { Client } from '../../types/client';
import { SupportPlan } from '../../types/supportPlan';

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

const mockServiceLog: ServiceLog = {
  id: 1,
  clientId: 1,
  supportPlanId: 1,
  staffId: 1,
  serviceDate: '2024-06-10',
  startTime: '09:00',
  endTime: '11:00',
  serviceType: 'physical_care',
  content: '入浴介助と身体清拭を実施。体調良好。',
  nextAction: '次回は爪切りも実施予定',
  attachments: [],
  notes: '利用者の体調良好',
  status: 'draft',
  createdAt: '2024-06-10T12:00:00Z',
  updatedAt: '2024-06-10T12:00:00Z',
};

const mockSupportPlans: SupportPlan[] = [
  {
    id: 1,
    clientId: 1,
    planName: '日常生活支援計画',
    goals: ['自立した生活の維持'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    priority: 'high',
    assignedStaffIds: [1],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    clientId: 1,
    planName: '就労支援計画',
    goals: ['就労スキルの向上'],
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    status: 'active',
    priority: 'medium',
    assignedStaffIds: [2],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

const mockStaffList = [
  { id: 1, name: '佐藤太郎', role: '介護福祉士' },
  { id: 2, name: '鈴木花子', role: '社会福祉士' },
  { id: 3, name: '田中一郎', role: 'ケアマネージャー' },
];

describe('ServiceLogForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォーム表示', () => {
    it('新規作成モードで全てのフォーム要素が表示される', () => {
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 基本情報
      expect(screen.getByText('利用者: 山田太郎 様')).toBeInTheDocument();
      expect(screen.getByLabelText('サービス日 *')).toBeInTheDocument();
      expect(screen.getByLabelText('開始時間 *')).toBeInTheDocument();
      expect(screen.getByLabelText('終了時間 *')).toBeInTheDocument();

      // 支援計画・サービス種別
      expect(screen.getByLabelText('支援計画 *')).toBeInTheDocument();
      expect(screen.getByLabelText('サービス種別 *')).toBeInTheDocument();

      // 担当者
      expect(screen.getByLabelText('担当者 *')).toBeInTheDocument();
      expect(screen.getByDisplayValue('佐藤太郎')).toBeInTheDocument(); // 現在のスタッフが選択されている

      // 記録内容
      expect(screen.getByLabelText('サービス内容 *')).toBeInTheDocument();
      expect(screen.getByLabelText('次回予定・申し送り')).toBeInTheDocument();
      expect(screen.getByLabelText('備考')).toBeInTheDocument();

      // ステータス
      expect(screen.getByLabelText('ステータス')).toBeInTheDocument();

      // ボタン
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('編集モードで既存データが表示される', () => {
      render(
        <ServiceLogForm
          client={mockClient}
          serviceLog={mockServiceLog}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('2024-06-10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('入浴介助と身体清拭を実施。体調良好。')).toBeInTheDocument();
      expect(screen.getByDisplayValue('次回は爪切りも実施予定')).toBeInTheDocument();
      expect(screen.getByDisplayValue('利用者の体調良好')).toBeInTheDocument();

      // ボタンテキストが「更新」になる
      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
    });

    it('今日の日付がデフォルトで設定される', () => {
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByLabelText('サービス日 *')).toHaveValue(today);
    });
  });

  describe('フォーム入力', () => {
    it('各フィールドに値を入力できる', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 日付入力
      const dateInput = screen.getByLabelText('サービス日 *');
      await user.clear(dateInput);
      await user.type(dateInput, '2024-06-15');

      // 時間入力
      await user.type(screen.getByLabelText('開始時間 *'), '14:00');
      await user.type(screen.getByLabelText('終了時間 *'), '16:00');

      // セレクトボックス
      await user.selectOptions(screen.getByLabelText('支援計画 *'), '2');
      await user.selectOptions(screen.getByLabelText('サービス種別 *'), 'domestic_support');
      await user.selectOptions(screen.getByLabelText('担当者 *'), '2');
      await user.selectOptions(screen.getByLabelText('ステータス'), 'confirmed');

      // テキストエリア
      await user.type(screen.getByLabelText('サービス内容 *'), '掃除と洗濯のサポートを実施');
      await user.type(screen.getByLabelText('次回予定・申し送り'), '次回は買い物同行予定');
      await user.type(screen.getByLabelText('備考'), 'テスト備考');

      // 入力値の確認
      expect(screen.getByDisplayValue('2024-06-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('16:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('掃除と洗濯のサポートを実施')).toBeInTheDocument();
      expect(screen.getByDisplayValue('次回は買い物同行予定')).toBeInTheDocument();
      expect(screen.getByDisplayValue('テスト備考')).toBeInTheDocument();
    });

    it('時間計算が正しく表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('開始時間 *'), '09:00');
      await user.type(screen.getByLabelText('終了時間 *'), '11:30');

      expect(screen.getByText('サービス時間: 2時間30分')).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('必須項目が空の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須フィールドをクリア
      const dateInput = screen.getByLabelText('サービス日 *');
      await user.clear(dateInput);

      // 送信ボタンをクリック
      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        expect(screen.getByText('サービス日は必須です')).toBeInTheDocument();
        expect(screen.getByText('開始時間は必須です')).toBeInTheDocument();
        expect(screen.getByText('終了時間は必須です')).toBeInTheDocument();
        expect(screen.getByText('支援計画は必須です')).toBeInTheDocument();
        expect(screen.getByText('サービス種別は必須です')).toBeInTheDocument();
        expect(screen.getByText('サービス内容は必須です')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('未来日の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const dateInput = screen.getByLabelText('サービス日 *');
      await user.clear(dateInput);
      await user.type(dateInput, futureDateStr);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('未来の日付は指定できません')).toBeInTheDocument();
      });
    });

    it('終了時間が開始時間より前の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('開始時間 *'), '14:00');
      await user.type(screen.getByLabelText('終了時間 *'), '13:00');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('終了時間は開始時間より後を指定してください')).toBeInTheDocument();
      });
    });

    it('サービス時間が8時間を超える場合警告が表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('開始時間 *'), '09:00');
      await user.type(screen.getByLabelText('終了時間 *'), '18:00');

      expect(screen.getByText('サービス時間が8時間を超えています')).toBeInTheDocument();
    });

    it('サービス内容が1000文字を超える場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const longContent = 'あ'.repeat(1001);
      await user.type(screen.getByLabelText('サービス内容 *'), longContent);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('サービス内容は1000文字以内で入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力で送信できる', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.clear(screen.getByLabelText('サービス日 *'));
      await user.type(screen.getByLabelText('サービス日 *'), '2024-06-20');
      await user.type(screen.getByLabelText('開始時間 *'), '10:00');
      await user.type(screen.getByLabelText('終了時間 *'), '12:00');
      await user.selectOptions(screen.getByLabelText('支援計画 *'), '1');
      await user.selectOptions(screen.getByLabelText('サービス種別 *'), 'social_participation');
      await user.type(screen.getByLabelText('サービス内容 *'), '地域活動への参加支援');

      // 任意項目も入力
      await user.type(screen.getByLabelText('次回予定・申し送り'), '次回も同様の支援を実施');
      await user.type(screen.getByLabelText('備考'), '利用者の積極的な参加が見られた');

      // 送信
      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          clientId: 1,
          supportPlanId: 1,
          staffId: 1,
          serviceDate: '2024-06-20',
          startTime: '10:00',
          endTime: '12:00',
          serviceType: 'social_participation',
          content: '地域活動への参加支援',
          nextAction: '次回も同様の支援を実施',
          notes: '利用者の積極的な参加が見られた',
          status: 'draft',
        });
      });
    });

    it('編集モードで更新できる', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          serviceLog={mockServiceLog}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 内容を変更
      const contentInput = screen.getByLabelText('サービス内容 *');
      await user.clear(contentInput);
      await user.type(contentInput, '更新されたサービス内容');

      // 送信
      await user.click(screen.getByRole('button', { name: '更新' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            content: '更新されたサービス内容',
          })
        );
      });
    });

    it('確認ステータスで送信する', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.clear(screen.getByLabelText('サービス日 *'));
      await user.type(screen.getByLabelText('サービス日 *'), '2024-06-20');
      await user.type(screen.getByLabelText('開始時間 *'), '10:00');
      await user.type(screen.getByLabelText('終了時間 *'), '12:00');
      await user.selectOptions(screen.getByLabelText('支援計画 *'), '1');
      await user.selectOptions(screen.getByLabelText('サービス種別 *'), 'physical_care');
      await user.type(screen.getByLabelText('サービス内容 *'), 'テストサービス');

      // ステータスを確認済に変更
      await user.selectOptions(screen.getByLabelText('ステータス'), 'confirmed');

      // 確認して送信ボタンをクリック
      await user.click(screen.getByRole('button', { name: '確認して送信' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'confirmed',
          })
        );
      });
    });

    it('送信中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={slowSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.clear(screen.getByLabelText('サービス日 *'));
      await user.type(screen.getByLabelText('サービス日 *'), '2024-06-20');
      await user.type(screen.getByLabelText('開始時間 *'), '10:00');
      await user.type(screen.getByLabelText('終了時間 *'), '12:00');
      await user.selectOptions(screen.getByLabelText('支援計画 *'), '1');
      await user.selectOptions(screen.getByLabelText('サービス種別 *'), 'physical_care');
      await user.type(screen.getByLabelText('サービス内容 *'), 'テスト');

      // 送信
      const submitButton = screen.getByRole('button', { name: '保存' });
      await user.click(submitButton);

      // ボタンが無効化されていることを確認
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('保存中...')).toBeInTheDocument();

      // 送信完了後、ボタンが有効化される
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(screen.getByText('保存')).toBeInTheDocument();
      });
    });
  });

  describe('キャンセル操作', () => {
    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
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
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // フォームに入力
      await user.type(screen.getByLabelText('サービス内容 *'), 'テスト内容');
      await user.type(screen.getByLabelText('備考'), 'テスト備考');

      // リセットボタンをクリック
      await user.click(screen.getByRole('button', { name: 'リセット' }));

      // フィールドがクリアされていることを確認
      expect(screen.getByLabelText('サービス内容 *')).toHaveValue('');
      expect(screen.getByLabelText('備考')).toHaveValue('');
    });
  });

  describe('エラーハンドリング', () => {
    it('送信エラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const errorSubmit = vi.fn().mockRejectedValue(new Error('ネットワークエラー'));
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={errorSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 必須項目を入力
      await user.clear(screen.getByLabelText('サービス日 *'));
      await user.type(screen.getByLabelText('サービス日 *'), '2024-06-20');
      await user.type(screen.getByLabelText('開始時間 *'), '10:00');
      await user.type(screen.getByLabelText('終了時間 *'), '12:00');
      await user.selectOptions(screen.getByLabelText('支援計画 *'), '1');
      await user.selectOptions(screen.getByLabelText('サービス種別 *'), 'physical_care');
      await user.type(screen.getByLabelText('サービス内容 *'), 'テスト');

      // 送信
      await user.click(screen.getByRole('button', { name: '保存' }));

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('送信中にエラーが発生しました。もう一度お試しください。')).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('必須項目にaria-required属性が設定されている', () => {
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('サービス日 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('開始時間 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('終了時間 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('支援計画 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('サービス種別 *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('サービス内容 *')).toHaveAttribute('aria-required', 'true');
    });

    it('エラー時にaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 不正な時間を入力
      await user.type(screen.getByLabelText('開始時間 *'), '14:00');
      await user.type(screen.getByLabelText('終了時間 *'), '13:00');
      await user.tab();

      await waitFor(() => {
        const endTimeInput = screen.getByLabelText('終了時間 *');
        expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
        expect(endTimeInput).toHaveAttribute('aria-describedby', expect.stringContaining('endTime-error'));
      });
    });

    it('フォームにaria-labelが設定されている', () => {
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'サービス記録登録フォーム');
    });

    it('エラーメッセージにrole="alert"が設定されている', async () => {
      const user = userEvent.setup();
      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // 送信ボタンをクリックしてバリデーションエラーを発生させる
      const dateInput = screen.getByLabelText('サービス日 *');
      await user.clear(dateInput);
      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル画面でフォームが縦に配置される', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveClass('sm:grid-cols-1');
    });

    it('デスクトップ画面でフォームが適切に配置される', () => {
      global.innerWidth = 1024;
      global.innerHeight = 768;

      render(
        <ServiceLogForm
          client={mockClient}
          supportPlans={mockSupportPlans}
          staffList={mockStaffList}
          currentStaffId={1}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveClass('md:grid-cols-2');
    });
  });
});
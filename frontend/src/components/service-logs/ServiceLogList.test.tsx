import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ServiceLogList } from './ServiceLogList';
import { ServiceLog } from '../../types/serviceLog';
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

const mockServiceLogs: ServiceLog[] = [
  {
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
    status: 'approved',
    approvedBy: 10,
    approvedAt: '2024-06-11T00:00:00Z',
    createdAt: '2024-06-10T12:00:00Z',
    updatedAt: '2024-06-11T00:00:00Z',
  },
  {
    id: 2,
    clientId: 1,
    supportPlanId: 1,
    staffId: 2,
    serviceDate: '2024-06-12',
    startTime: '14:00',
    endTime: '16:00',
    serviceType: 'social_participation',
    content: '地域活動センターへの同行支援を実施。',
    nextAction: '次回も継続予定',
    attachments: [],
    status: 'confirmed',
    createdAt: '2024-06-12T17:00:00Z',
    updatedAt: '2024-06-12T17:00:00Z',
  },
  {
    id: 3,
    clientId: 1,
    supportPlanId: 2,
    staffId: 1,
    serviceDate: '2024-06-15',
    startTime: '10:00',
    endTime: '12:00',
    serviceType: 'domestic_support',
    content: '掃除、洗濯、買い物同行を実施。',
    nextAction: '冷蔵庫の整理が必要',
    attachments: ['receipt001.jpg'],
    status: 'draft',
    createdAt: '2024-06-15T13:00:00Z',
    updatedAt: '2024-06-15T13:00:00Z',
  },
];

const mockStaffInfo = {
  1: { name: '佐藤太郎', role: '介護福祉士' },
  2: { name: '鈴木花子', role: '社会福祉士' },
};

const mockPlanInfo = {
  1: { planName: '日常生活支援計画' },
  2: { planName: '就労支援計画' },
};

describe('ServiceLogList', () => {
  const mockOnCreate = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnApprove = vi.fn();
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('表示機能', () => {
    it('サービス記録一覧が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('入浴介助と身体清拭を実施。体調良好。')).toBeInTheDocument();
      expect(screen.getByText('地域活動センターへの同行支援を実施。')).toBeInTheDocument();
      expect(screen.getByText('掃除、洗濯、買い物同行を実施。')).toBeInTheDocument();
    });

    it('日付と時間が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('2024/06/10')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
      expect(screen.getByText('2024/06/12')).toBeInTheDocument();
      expect(screen.getByText('14:00 - 16:00')).toBeInTheDocument();
    });

    it('サービス種別バッジが表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('身体介護')).toBeInTheDocument();
      expect(screen.getByText('社会参加支援')).toBeInTheDocument();
      expect(screen.getByText('家事援助')).toBeInTheDocument();
    });

    it('ステータスバッジが表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('承認済')).toBeInTheDocument();
      expect(screen.getByText('確認済')).toBeInTheDocument();
      expect(screen.getByText('下書き')).toBeInTheDocument();
    });

    it('スタッフ情報が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          staffInfo={mockStaffInfo}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('佐藤太郎')).toHaveLength(2); // 2つの記録で同じスタッフ
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
    });

    it('支援計画名が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          planInfo={mockPlanInfo}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('日常生活支援計画')).toHaveLength(2);
      expect(screen.getByText('就労支援計画')).toBeInTheDocument();
    });

    it('空の状態が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('サービス記録がありません')).toBeInTheDocument();
    });

    it('クライアント情報が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          client={mockClient}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('山田太郎 様のサービス記録')).toBeInTheDocument();
    });
  });

  describe('操作機能', () => {
    it('新規記録作成ボタンが表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreate}
        />
      );

      const createButton = screen.getByRole('button', { name: '新規記録作成' });
      expect(createButton).toBeInTheDocument();
    });

    it('新規記録作成ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreate}
        />
      );

      const createButton = screen.getByRole('button', { name: '新規記録作成' });
      await user.click(createButton);

      expect(mockOnCreate).toHaveBeenCalledTimes(1);
    });

    it('編集ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('削除ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('承認ボタンが下書きステータスの記録に表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onApprove={mockOnApprove}
        />
      );

      const approveButtons = screen.getAllByRole('button', { name: '承認' });
      expect(approveButtons).toHaveLength(1); // 下書きステータスの記録のみ
    });

    it('承認ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onApprove={mockOnApprove}
        />
      );

      const approveButton = screen.getByRole('button', { name: '承認' });
      await user.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledWith(3);
    });

    it('CSVエクスポートボタンが表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByRole('button', { name: 'CSVエクスポート' })).toBeInTheDocument();
    });

    it('CSVエクスポートをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onExport={mockOnExport}
        />
      );

      const exportButton = screen.getByRole('button', { name: 'CSVエクスポート' });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith('csv');
    });
  });

  describe('フィルタリング・検索', () => {
    it('期間指定フィルターが機能する', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showFilters={true}
        />
      );

      const startDateInput = screen.getByLabelText('開始日');
      const endDateInput = screen.getByLabelText('終了日');

      await user.type(startDateInput, '2024-06-11');
      await user.type(endDateInput, '2024-06-13');

      // 期間内の記録のみ表示される
      expect(screen.getByText('地域活動センターへの同行支援を実施。')).toBeInTheDocument();
      expect(screen.queryByText('入浴介助と身体清拭を実施。体調良好。')).not.toBeInTheDocument();
      expect(screen.queryByText('掃除、洗濯、買い物同行を実施。')).not.toBeInTheDocument();
    });

    it('サービス種別でフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showFilters={true}
        />
      );

      const typeFilter = screen.getByRole('combobox', { name: 'サービス種別' });
      await user.selectOptions(typeFilter, 'physical_care');

      expect(screen.getByText('入浴介助と身体清拭を実施。体調良好。')).toBeInTheDocument();
      expect(screen.queryByText('地域活動センターへの同行支援を実施。')).not.toBeInTheDocument();
      expect(screen.queryByText('掃除、洗濯、買い物同行を実施。')).not.toBeInTheDocument();
    });

    it('ステータスでフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showFilters={true}
        />
      );

      const statusFilter = screen.getByRole('combobox', { name: 'ステータス' });
      await user.selectOptions(statusFilter, 'draft');

      expect(screen.getByText('掃除、洗濯、買い物同行を実施。')).toBeInTheDocument();
      expect(screen.queryByText('入浴介助と身体清拭を実施。体調良好。')).not.toBeInTheDocument();
      expect(screen.queryByText('地域活動センターへの同行支援を実施。')).not.toBeInTheDocument();
    });

    it('検索フィールドで内容を検索できる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('内容を検索...');
      await user.type(searchInput, '入浴');

      expect(screen.getByText('入浴介助と身体清拭を実施。体調良好。')).toBeInTheDocument();
      expect(screen.queryByText('地域活動センターへの同行支援を実施。')).not.toBeInTheDocument();
      expect(screen.queryByText('掃除、洗濯、買い物同行を実施。')).not.toBeInTheDocument();
    });
  });

  describe('カレンダービュー', () => {
    it('カレンダービューに切り替えられる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showViewToggle={true}
        />
      );

      const calendarButton = screen.getByRole('button', { name: 'カレンダー表示' });
      await user.click(calendarButton);

      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('カレンダーに記録が表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showViewToggle={true}
        />
      );

      const calendarButton = screen.getByRole('button', { name: 'カレンダー表示' });
      await user.click(calendarButton);

      // 日付セルに記録数が表示される
      expect(screen.getByText('10日')).toBeInTheDocument();
      expect(screen.getByTestId('log-count-2024-06-10')).toHaveTextContent('1');
      expect(screen.getByTestId('log-count-2024-06-12')).toHaveTextContent('1');
      expect(screen.getByTestId('log-count-2024-06-15')).toHaveTextContent('1');
    });

    it('カレンダーの日付をクリックして記録を表示できる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showViewToggle={true}
        />
      );

      const calendarButton = screen.getByRole('button', { name: 'カレンダー表示' });
      await user.click(calendarButton);

      const date10 = screen.getByTestId('calendar-date-2024-06-10');
      await user.click(date10);

      expect(screen.getByText('2024/06/10の記録')).toBeInTheDocument();
      expect(screen.getByText('入浴介助と身体清拭を実施。体調良好。')).toBeInTheDocument();
    });
  });

  describe('集計表示', () => {
    it('月次集計が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showSummary={true}
        />
      );

      expect(screen.getByText('月次集計')).toBeInTheDocument();
      expect(screen.getByText('総記録数: 3件')).toBeInTheDocument();
      expect(screen.getByText('総サービス時間: 6時間')).toBeInTheDocument();
    });

    it('サービス種別ごとの集計が表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showSummary={true}
        />
      );

      expect(screen.getByText('身体介護: 1件 (2時間)')).toBeInTheDocument();
      expect(screen.getByText('社会参加支援: 1件 (2時間)')).toBeInTheDocument();
      expect(screen.getByText('家事援助: 1件 (2時間)')).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示でカード形式になる', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid-cols-1');
    });

    it('デスクトップ表示でテーブル形式になる', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          viewMode="table"
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'サービス記録一覧');
    });

    it('キーボード操作が可能', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const firstEditButton = screen.getAllByRole('button', { name: '編集' })[0];
      firstEditButton.focus();
      
      expect(firstEditButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });
  });

  describe('一括操作', () => {
    it('複数選択チェックボックスが表示される', () => {
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          allowBulkActions={true}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4); // 全選択 + 3記録
    });

    it('一括削除ができる', async () => {
      const user = userEvent.setup();
      const mockOnBulkDelete = vi.fn();
      
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBulkDelete={mockOnBulkDelete}
          allowBulkActions={true}
        />
      );

      // 2つの記録を選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // 最初の記録
      await user.click(checkboxes[2]); // 2番目の記録

      const bulkDeleteButton = screen.getByRole('button', { name: /削除.*2/ });
      await user.click(bulkDeleteButton);

      expect(mockOnBulkDelete).toHaveBeenCalledWith([1, 2]);
    });

    it('一括承認ができる', async () => {
      const user = userEvent.setup();
      const mockOnBulkApprove = vi.fn();
      
      renderWithRouter(
        <ServiceLogList
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBulkApprove={mockOnBulkApprove}
          allowBulkActions={true}
        />
      );

      // 下書き記録を選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[3]); // 下書きステータスの記録

      const bulkApproveButton = screen.getByRole('button', { name: /承認.*1/ });
      await user.click(bulkApproveButton);

      expect(mockOnBulkApprove).toHaveBeenCalledWith([3]);
    });
  });
});
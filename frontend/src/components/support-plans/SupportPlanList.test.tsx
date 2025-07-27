import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SupportPlanList } from './SupportPlanList';
import { SupportPlan } from '../../types/supportPlan';

// モックデータ
const mockSupportPlans: SupportPlan[] = [
  {
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
  },
  {
    id: 2,
    clientId: 1,
    planName: '就労支援計画',
    goals: ['職場環境への適応', 'スキルアップ研修の受講'],
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    status: 'pending',
    priority: 'medium',
    assignedStaffIds: [3],
    notes: '月1回の面談実施',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    clientId: 1,
    planName: '地域移行支援計画',
    goals: ['グループホームへの入居準備', '地域資源の活用'],
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    status: 'completed',
    priority: 'low',
    assignedStaffIds: [1],
    notes: '計画完了',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-12-31T00:00:00Z',
  },
];

// 進捗データのモック
const mockProgress = {
  1: { progressPercentage: 75, isOverdue: false },
  2: { progressPercentage: 0, isOverdue: false },
  3: { progressPercentage: 100, isOverdue: false },
};

describe('SupportPlanList', () => {
  const mockOnCreate = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();

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
    it('支援計画一覧が表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('日常生活支援計画')).toBeInTheDocument();
      expect(screen.getByText('就労支援計画')).toBeInTheDocument();
      expect(screen.getByText('地域移行支援計画')).toBeInTheDocument();
    });

    it('計画の期間が表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('2024/01/01 - 2024/12/31')).toBeInTheDocument();
      expect(screen.getByText('2024/02/01 - 2024/07/31')).toBeInTheDocument();
      expect(screen.getByText('2023/06/01 - 2023/12/31')).toBeInTheDocument();
    });

    it('ステータスバッジが表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('実施中')).toBeInTheDocument();
      expect(screen.getByText('保留中')).toBeInTheDocument();
      expect(screen.getByText('完了')).toBeInTheDocument();
    });

    it('優先度が表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      expect(screen.getByText('低')).toBeInTheDocument();
    });

    it('進捗率が表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          progress={mockProgress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('空の状態が表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={[]}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('支援計画がありません')).toBeInTheDocument();
    });
  });

  describe('操作機能', () => {
    it('新規計画作成ボタンが表示される', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onCreateNew={mockOnCreate}
        />
      );

      const createButton = screen.getByRole('button', { name: '新規計画作成' });
      expect(createButton).toBeInTheDocument();
    });

    it('新規計画作成ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onCreateNew={mockOnCreate}
        />
      );

      const createButton = screen.getByRole('button', { name: '新規計画作成' });
      await user.click(createButton);

      expect(mockOnCreate).toHaveBeenCalledTimes(1);
    });

    it('計画詳細へのリンクが機能する', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const detailLink = screen.getByRole('link', { name: /日常生活支援計画/ });
      expect(detailLink).toHaveAttribute('href', '/support-plans/1');
    });

    it('編集ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: '編集' });
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('削除ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('削除確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          confirmDelete={true}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);

      expect(screen.getByText('削除確認')).toBeInTheDocument();
      expect(screen.getByText('この支援計画を削除してもよろしいですか？')).toBeInTheDocument();
    });

    it('ステータス一括変更ができる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          allowBulkActions={true}
        />
      );

      // チェックボックスを選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // ヘッダーを除く最初のチェックボックス
      await user.click(checkboxes[2]);

      // ステータス変更ボタンをクリック
      const bulkStatusButton = screen.getByRole('button', { name: /ステータス変更/ });
      await user.click(bulkStatusButton);

      // ステータス選択
      const statusSelect = screen.getByRole('combobox', { name: '新しいステータス' });
      await user.selectOptions(statusSelect, 'active');

      const confirmButton = screen.getByRole('button', { name: '変更' });
      await user.click(confirmButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith([1, 2], 'active');
    });
  });

  describe('フィルタリング・ソート', () => {
    it('ステータスでフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          showFilters={true}
        />
      );

      const statusFilter = screen.getByRole('combobox', { name: 'ステータス' });
      await user.selectOptions(statusFilter, 'active');

      expect(screen.getByText('日常生活支援計画')).toBeInTheDocument();
      expect(screen.queryByText('就労支援計画')).not.toBeInTheDocument();
      expect(screen.queryByText('地域移行支援計画')).not.toBeInTheDocument();
    });

    it('優先度でフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          showFilters={true}
        />
      );

      const priorityFilter = screen.getByRole('combobox', { name: '優先度' });
      await user.selectOptions(priorityFilter, 'high');

      expect(screen.getByText('日常生活支援計画')).toBeInTheDocument();
      expect(screen.queryByText('就労支援計画')).not.toBeInTheDocument();
      expect(screen.queryByText('地域移行支援計画')).not.toBeInTheDocument();
    });

    it('期間でソートできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          showSort={true}
        />
      );

      const sortSelect = screen.getByRole('combobox', { name: '並び順' });
      await user.selectOptions(sortSelect, 'startDate');

      const planNames = screen.getAllByTestId('plan-name').map(el => el.textContent);
      expect(planNames[0]).toBe('地域移行支援計画');
      expect(planNames[1]).toBe('日常生活支援計画');
      expect(planNames[2]).toBe('就労支援計画');
    });

    it('進捗率でソートできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          progress={mockProgress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          showSort={true}
        />
      );

      const sortSelect = screen.getByRole('combobox', { name: '並び順' });
      await user.selectOptions(sortSelect, 'progress');

      const planNames = screen.getAllByTestId('plan-name').map(el => el.textContent);
      expect(planNames[0]).toBe('地域移行支援計画'); // 100%
      expect(planNames[1]).toBe('日常生活支援計画'); // 75%
      expect(planNames[2]).toBe('就労支援計画'); // 0%
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示でカード形式になる', () => {
      // モバイルサイズをシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid-cols-1');
    });

    it('タブレット表示で2列になる', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });

      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('md:grid-cols-2');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', '支援計画一覧');
    });

    it('キーボード操作が可能', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanList
          supportPlans={mockSupportPlans}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const firstEditButton = screen.getAllByRole('button', { name: '編集' })[0];
      firstEditButton.focus();
      
      expect(firstEditButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });
  });

  describe('期限切れ警告', () => {
    it('期限切れの計画に警告が表示される', () => {
      const overdueProgress = {
        1: { progressPercentage: 75, isOverdue: true },
      };

      renderWithRouter(
        <SupportPlanList
          supportPlans={[mockSupportPlans[0]]}
          clientId={1}
          progress={overdueProgress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('期限切れ')).toBeInTheDocument();
      expect(screen.getByTestId('overdue-warning')).toHaveClass('text-red-600');
    });

    it('期限が近い計画に警告が表示される', () => {
      const nearDeadlinePlan: SupportPlan = {
        ...mockSupportPlans[0],
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5日後
      };

      renderWithRouter(
        <SupportPlanList
          supportPlans={[nearDeadlinePlan]}
          clientId={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText(/期限まで.*日/)).toBeInTheDocument();
      expect(screen.getByTestId('deadline-warning')).toHaveClass('text-yellow-600');
    });
  });
});
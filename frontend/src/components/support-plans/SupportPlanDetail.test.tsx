import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SupportPlanDetail } from './SupportPlanDetail';
import { SupportPlan } from '../../types/supportPlan';
import { ServiceLog } from '../../types/serviceLog';

// モックデータ
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
  notes: '週2回の訪問サポート\n医療機関との連携強化',
  reviewDate: '2024-06-15',
  reviewNotes: '順調に進捗している。目標1は80%達成。',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-15T00:00:00Z',
};

const mockProgress = {
  planId: 1,
  totalGoals: 3,
  completedGoals: 2,
  progressPercentage: 66.7,
  daysElapsed: 180,
  totalDays: 365,
  timeProgressPercentage: 49.3,
  isOverdue: false,
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
    content: '入浴介助と身体清拭を実施',
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
    content: '地域活動センターへの同行支援',
    nextAction: '次回も継続予定',
    attachments: [],
    status: 'confirmed',
    createdAt: '2024-06-12T17:00:00Z',
    updatedAt: '2024-06-12T17:00:00Z',
  },
];

const mockStaffInfo = {
  1: { name: '佐藤太郎', role: '介護福祉士' },
  2: { name: '鈴木花子', role: '社会福祉士' },
};

describe('SupportPlanDetail', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnGoalCheck = vi.fn();
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

  describe('詳細表示', () => {
    it('計画基本情報が表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('日常生活支援計画')).toBeInTheDocument();
      expect(screen.getByText('実施中')).toBeInTheDocument();
      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('2024/01/01 - 2024/12/31')).toBeInTheDocument();
    });

    it('目標リストが表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('自立した生活の維持')).toBeInTheDocument();
      expect(screen.getByText('社会参加の促進')).toBeInTheDocument();
      expect(screen.getByText('健康管理の改善')).toBeInTheDocument();
    });

    it('進捗状況が表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          progress={mockProgress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('66.7%')).toBeInTheDocument();
      expect(screen.getByText('2/3')).toBeInTheDocument();
      expect(screen.getByText(/180日経過/)).toBeInTheDocument();
    });

    it('関連サービスログが表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('入浴介助と身体清拭を実施')).toBeInTheDocument();
      expect(screen.getByText('地域活動センターへの同行支援')).toBeInTheDocument();
      expect(screen.getByText('2024/06/10')).toBeInTheDocument();
      expect(screen.getByText('2024/06/12')).toBeInTheDocument();
    });

    it('担当スタッフ情報が表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          staffInfo={mockStaffInfo}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('佐藤太郎')).toBeInTheDocument();
      expect(screen.getByText('介護福祉士')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('社会福祉士')).toBeInTheDocument();
    });

    it('レビュー情報が表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('2024/06/15')).toBeInTheDocument();
      expect(screen.getByText('順調に進捗している。目標1は80%達成。')).toBeInTheDocument();
    });

    it('備考が改行付きで表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText(/週2回の訪問サポート/)).toBeInTheDocument();
      expect(screen.getByText(/医療機関との連携強化/)).toBeInTheDocument();
    });
  });

  describe('操作機能', () => {
    it('編集ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const editButton = screen.getByRole('button', { name: '編集' });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('削除ボタンをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const deleteButton = screen.getByRole('button', { name: '削除' });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('削除確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          confirmDelete={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: '削除' });
      await user.click(deleteButton);

      expect(screen.getByText('削除確認')).toBeInTheDocument();
      expect(screen.getByText('この支援計画を削除してもよろしいですか？')).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: '削除する' });
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('目標達成チェックができる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          progress={mockProgress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onGoalCheck={mockOnGoalCheck}
          allowGoalCheck={true}
        />
      );

      const goalCheckboxes = screen.getAllByRole('checkbox');
      await user.click(goalCheckboxes[0]);

      expect(mockOnGoalCheck).toHaveBeenCalledWith(0, true);
    });

    it('ステータス変更ができる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusButton = screen.getByRole('button', { name: 'ステータス変更' });
      await user.click(statusButton);

      const statusSelect = screen.getByRole('combobox', { name: '新しいステータス' });
      await user.selectOptions(statusSelect, 'completed');

      const confirmButton = screen.getByRole('button', { name: '変更' });
      await user.click(confirmButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'completed');
    });

    it('PDFエクスポートボタンが表示される', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByRole('button', { name: 'PDFエクスポート' })).toBeInTheDocument();
    });

    it('PDFエクスポートをクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onExport={mockOnExport}
        />
      );

      const exportButton = screen.getByRole('button', { name: 'PDFエクスポート' });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(1, 'pdf');
    });
  });

  describe('タブ表示', () => {
    it('タブで情報を切り替えられる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          serviceLogs={mockServiceLogs}
          staffInfo={mockStaffInfo}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      // デフォルトで基本情報タブが表示
      expect(screen.getByText('目標リスト')).toBeInTheDocument();

      // サービス記録タブに切り替え
      const serviceLogTab = screen.getByRole('tab', { name: 'サービス記録' });
      await user.click(serviceLogTab);

      expect(screen.getByText('入浴介助と身体清拭を実施')).toBeInTheDocument();

      // スタッフ情報タブに切り替え
      const staffTab = screen.getByRole('tab', { name: 'スタッフ情報' });
      await user.click(staffTab);

      expect(screen.getByText('佐藤太郎')).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示で縦積みレイアウトになる', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const container = screen.getByTestId('plan-detail-container');
      expect(container).toHaveClass('flex-col');
    });

    it('デスクトップ表示で横並びレイアウトになる', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const container = screen.getByTestId('plan-detail-container');
      expect(container).toHaveClass('lg:flex-row');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出し構造が設定されている', () => {
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: '日常生活支援計画' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '基本情報' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: '目標リスト' })).toBeInTheDocument();
    });

    it('キーボード操作でタブを切り替えられる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <SupportPlanDetail
          supportPlan={mockSupportPlan}
          serviceLogs={mockServiceLogs}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const firstTab = screen.getByRole('tab', { name: '基本情報' });
      firstTab.focus();

      // 右矢印キーで次のタブへ
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'サービス記録' })).toHaveFocus();

      // Enterキーでタブを選択
      await user.keyboard('{Enter}');
      expect(screen.getByText('入浴介助と身体清拭を実施')).toBeInTheDocument();
    });
  });

  describe('期限警告', () => {
    it('期限切れの計画に警告が表示される', () => {
      const expiredPlan = {
        ...mockSupportPlan,
        endDate: '2023-12-31',
      };

      renderWithRouter(
        <SupportPlanDetail
          supportPlan={expiredPlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText('期限切れ')).toBeInTheDocument();
      expect(screen.getByTestId('deadline-alert')).toHaveClass('bg-red-50');
    });

    it('期限が近い計画に警告が表示される', () => {
      const nearDeadlinePlan = {
        ...mockSupportPlan,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      renderWithRouter(
        <SupportPlanDetail
          supportPlan={nearDeadlinePlan}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText(/期限まで.*日/)).toBeInTheDocument();
      expect(screen.getByTestId('deadline-alert')).toHaveClass('bg-yellow-50');
    });
  });
});
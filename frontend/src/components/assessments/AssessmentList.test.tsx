import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AssessmentList } from './AssessmentList';
import type { Assessment } from '../../types/assessment';

const mockAssessments: Assessment[] = [
  {
    id: 1,
    clientId: 1,
    staffId: 1,
    supportPlanId: 1,
    assessmentType: 'initial',
    assessmentDate: '2025-07-27',
    summary: '初回アセスメントを実施しました。',
    overallScore: 75,
    categoryScores: {
      '身体機能': 80,
      '認知機能': 70,
      '社会参加': 75,
    },
    strengths: '日常生活動作は概ね自立している。',
    challenges: '階段昇降時に不安定さが見られる。',
    recommendations: '理学療法の頻度を週2回に増やす。',
    goals: '3ヶ月後には階段を安全に昇降できるようになる。',
    status: 'draft',
    notes: '次回評価は3ヶ月後に実施予定',
    createdAt: '2025-07-27T10:00:00',
    updatedAt: '2025-07-27T10:00:00',
  },
  {
    id: 2,
    clientId: 2,
    staffId: 2,
    supportPlanId: 2,
    assessmentType: 'periodic',
    assessmentDate: '2025-07-20',
    summary: '定期アセスメントを実施しました。',
    overallScore: 82,
    categoryScores: {
      '身体機能': 85,
      '認知機能': 80,
      '社会参加': 80,
    },
    status: 'approved',
    createdAt: '2025-07-20T10:00:00',
    updatedAt: '2025-07-20T10:00:00',
  },
  {
    id: 3,
    clientId: 3,
    staffId: 1,
    assessmentType: 'annual',
    assessmentDate: '2025-07-15',
    summary: '年次アセスメントを実施しました。',
    overallScore: 90,
    status: 'pending',
    createdAt: '2025-07-15T10:00:00',
    updatedAt: '2025-07-15T10:00:00',
  },
];

const mockClients = {
  1: { name: '山田太郎' },
  2: { name: '鈴木花子' },
  3: { name: '佐藤次郎' },
};

const mockStaff = {
  1: { name: 'スタッフA' },
  2: { name: 'スタッフB' },
};

describe('AssessmentList', () => {
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnFinalize = vi.fn();

  const defaultProps = {
    assessments: mockAssessments,
    clients: mockClients,
    staff: mockStaff,
    onDelete: mockOnDelete,
    onStatusChange: mockOnStatusChange,
    onFinalize: mockOnFinalize,
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示', () => {
    it('アセスメント一覧が表示される', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      expect(screen.getByText('初回アセスメントを実施しました。')).toBeInTheDocument();
      expect(screen.getByText('定期アセスメントを実施しました。')).toBeInTheDocument();
      expect(screen.getByText('年次アセスメントを実施しました。')).toBeInTheDocument();
    });

    it('クライアント名が表示される', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('鈴木花子')).toBeInTheDocument();
      expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
    });

    it('アセスメントがない場合メッセージが表示される', () => {
      renderWithRouter(<AssessmentList {...defaultProps} assessments={[]} />);

      expect(screen.getByText('評価・アセスメントがありません')).toBeInTheDocument();
    });
  });

  describe('フィルタリング', () => {
    it('ステータスでフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const statusFilter = screen.getByLabelText('ステータス');
      await user.selectOptions(statusFilter, 'draft');

      expect(screen.getByText('初回アセスメントを実施しました。')).toBeInTheDocument();
      expect(screen.queryByText('定期アセスメントを実施しました。')).not.toBeInTheDocument();
      expect(screen.queryByText('年次アセスメントを実施しました。')).not.toBeInTheDocument();
    });

    it('アセスメント種別でフィルタリングできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const typeFilter = screen.getByLabelText('種別');
      await user.selectOptions(typeFilter, 'periodic');

      expect(screen.queryByText('初回アセスメントを実施しました。')).not.toBeInTheDocument();
      expect(screen.getByText('定期アセスメントを実施しました。')).toBeInTheDocument();
      expect(screen.queryByText('年次アセスメントを実施しました。')).not.toBeInTheDocument();
    });
  });

  describe('ソート', () => {
    it('評価日でソートできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const sortSelect = screen.getByLabelText('並び順');
      await user.selectOptions(sortSelect, 'date_asc');

      const summaries = screen.getAllByText(/アセスメントを実施しました。$/);
      expect(summaries[0]).toHaveTextContent('年次アセスメントを実施しました。');
      expect(summaries[1]).toHaveTextContent('定期アセスメントを実施しました。');
      expect(summaries[2]).toHaveTextContent('初回アセスメントを実施しました。');
    });

    it('スコアでソートできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const sortSelect = screen.getByLabelText('並び順');
      await user.selectOptions(sortSelect, 'score_desc');

      const summaries = screen.getAllByText(/アセスメントを実施しました。$/);
      expect(summaries[0]).toHaveTextContent('年次アセスメントを実施しました。'); // スコア90
      expect(summaries[1]).toHaveTextContent('定期アセスメントを実施しました。'); // スコア82
      expect(summaries[2]).toHaveTextContent('初回アセスメントを実施しました。'); // スコア75
    });
  });

  describe('アクション', () => {
    it('詳細リンクが正しく設定されている', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const detailLink = screen.getByRole('link', { name: /初回アセスメント/ });
      expect(detailLink).toHaveAttribute('href', '/assessments/1');
    });

    it('編集リンクが正しく設定されている', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const editLinks = screen.getAllByText('編集');
      expect(editLinks[0]).toHaveAttribute('href', '/assessments/1/edit');
    });

    it('削除ボタンクリックで確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      expect(screen.getByText('このアセスメントを削除してもよろしいですか？')).toBeInTheDocument();
    });

    it('承認ボタンが承認待ちのアセスメントに表示される', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const approveButtons = screen.getAllByText('承認');
      expect(approveButtons).toHaveLength(1); // pendingステータスのアセスメントのみ
    });

    it('承認ボタンクリックでonFinalizeが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const approveButton = screen.getByText('承認');
      await user.click(approveButton);

      expect(mockOnFinalize).toHaveBeenCalledWith(3);
    });
  });

  describe('バッチ操作', () => {
    it('複数選択してステータスを変更できる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // 最初のアセスメントを選択
      await user.click(checkboxes[3]); // 3番目のアセスメントを選択

      const statusSelect = screen.getByLabelText('ステータス変更');
      await user.selectOptions(statusSelect, 'pending');

      const applyButton = screen.getByText('適用');
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith([1, 3], 'pending');
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('リストに適切なaria属性が設定されている', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', '評価・アセスメント一覧');
    });

    it('各アセスメントアイテムにaria-labelが設定されている', () => {
      renderWithRouter(<AssessmentList {...defaultProps} />);

      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveAttribute('aria-label', expect.stringContaining('山田太郎'));
    });
  });
});
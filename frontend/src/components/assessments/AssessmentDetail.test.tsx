import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AssessmentDetail } from './AssessmentDetail';
import type { Assessment } from '../../types/assessment';

const mockAssessment: Assessment = {
  id: 1,
  clientId: 1,
  staffId: 1,
  supportPlanId: 1,
  assessmentType: 'initial',
  assessmentDate: '2025-07-27',
  summary: '初回アセスメントを実施しました。身体機能、認知機能ともに良好です。',
  overallScore: 75,
  categoryScores: {
    '身体機能': 80,
    '認知機能': 70,
    '社会参加': 75,
    '日常生活動作': 72,
    'コミュニケーション': 78,
  },
  strengths: '日常生活動作は概ね自立している。意欲的に活動に参加している。',
  challenges: '階段昇降時に不安定さが見られる。服薬管理に支援が必要。',
  recommendations: '理学療法の頻度を週2回に増やす。服薬カレンダーの導入を検討。',
  goals: '3ヶ月後には階段を安全に昇降できるようになる。服薬の自己管理ができるようになる。',
  status: 'draft',
  notes: '次回評価は3ヶ月後に実施予定',
  createdAt: '2025-07-27T10:00:00',
  updatedAt: '2025-07-27T10:00:00',
};

const mockClient = { id: 1, name: '山田太郎' };
const mockStaff = { id: 1, name: 'スタッフA' };
const mockPlan = { id: 1, planName: '日常生活支援計画' };

describe('AssessmentDetail', () => {
  const mockOnDelete = vi.fn();
  const mockOnFinalize = vi.fn();

  const defaultProps = {
    assessment: mockAssessment,
    client: mockClient,
    staff: mockStaff,
    supportPlan: mockPlan,
    onDelete: mockOnDelete,
    onFinalize: mockOnFinalize,
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本情報表示', () => {
    it('アセスメントの基本情報が表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('初回アセスメント')).toBeInTheDocument();
      expect(screen.getByText('2025/7/27')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('スタッフA')).toBeInTheDocument();
      expect(screen.getByText('日常生活支援計画')).toBeInTheDocument();
    });

    it('総合スコアが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('総合評価スコア')).toBeInTheDocument();
    });

    it('ステータスが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('下書き')).toBeInTheDocument();
    });
  });

  describe('評価内容表示', () => {
    it('評価サマリーが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('初回アセスメントを実施しました。身体機能、認知機能ともに良好です。')).toBeInTheDocument();
    });

    it('カテゴリ別スコアが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('身体機能')).toBeInTheDocument();
      expect(screen.getByText('80点')).toBeInTheDocument();
      expect(screen.getByText('認知機能')).toBeInTheDocument();
      expect(screen.getByText('70点')).toBeInTheDocument();
    });

    it('強み・課題・推奨事項・目標が表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('日常生活動作は概ね自立している。意欲的に活動に参加している。')).toBeInTheDocument();
      expect(screen.getByText('階段昇降時に不安定さが見られる。服薬管理に支援が必要。')).toBeInTheDocument();
      expect(screen.getByText('理学療法の頻度を週2回に増やす。服薬カレンダーの導入を検討。')).toBeInTheDocument();
      expect(screen.getByText('3ヶ月後には階段を安全に昇降できるようになる。服薬の自己管理ができるようになる。')).toBeInTheDocument();
    });

    it('備考が表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByText('次回評価は3ヶ月後に実施予定')).toBeInTheDocument();
    });
  });

  describe('アクション', () => {
    it('編集リンクが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      const editLink = screen.getByRole('link', { name: '編集' });
      expect(editLink).toHaveAttribute('href', '/assessments/1/edit');
    });

    it('削除ボタンクリックで確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      await user.click(deleteButton);

      expect(screen.getByText('このアセスメントを削除してもよろしいですか？')).toBeInTheDocument();
    });

    it('削除確認でonDeleteが呼ばれる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: '削除する' });
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('承認ボタンが承認待ちステータスで表示される', () => {
      const pendingAssessment = { ...mockAssessment, status: 'pending' as const };
      renderWithRouter(
        <AssessmentDetail {...defaultProps} assessment={pendingAssessment} />
      );

      expect(screen.getByRole('button', { name: '承認する' })).toBeInTheDocument();
    });

    it('承認ボタンクリックでonFinalizeが呼ばれる', async () => {
      const user = userEvent.setup();
      const pendingAssessment = { ...mockAssessment, status: 'pending' as const };
      renderWithRouter(
        <AssessmentDetail {...defaultProps} assessment={pendingAssessment} />
      );

      const approveButton = screen.getByRole('button', { name: '承認する' });
      await user.click(approveButton);

      expect(mockOnFinalize).toHaveBeenCalledWith(1);
    });

    it('承認済みステータスでは編集・削除ボタンが無効になる', () => {
      const approvedAssessment = { ...mockAssessment, status: 'approved' as const };
      renderWithRouter(
        <AssessmentDetail {...defaultProps} assessment={approvedAssessment} />
      );

      expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: '編集' })).not.toBeInTheDocument();
    });
  });

  describe('印刷対応', () => {
    it('印刷ボタンが表示される', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByRole('button', { name: '印刷' })).toBeInTheDocument();
    });

    it('印刷ボタンクリックでwindow.printが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockPrint = vi.fn();
      window.print = mockPrint;

      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: '印刷' });
      await user.click(printButton);

      expect(mockPrint).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出しレベルが設定されている', () => {
      renderWithRouter(<AssessmentDetail {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1, name: '初回アセスメント' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '基本情報' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: '評価内容' })).toBeInTheDocument();
    });

    it('印刷時に適切なクラスが適用される', () => {
      const { container } = renderWithRouter(<AssessmentDetail {...defaultProps} />);

      const printHiddenElements = container.querySelectorAll('[class*="print:hidden"]');
      const printStyleElements = container.querySelectorAll('[class*="print:"]');
      expect(printStyleElements.length).toBeGreaterThan(0);
    });
  });
});
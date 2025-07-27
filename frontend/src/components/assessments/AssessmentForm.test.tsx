import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssessmentForm } from './AssessmentForm';
import type { Assessment, AssessmentFormData } from '../../types/assessment';

describe('AssessmentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultAssessment: Assessment = {
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
  };

  const mockClients = [
    { id: 1, name: '山田太郎' },
    { id: 2, name: '鈴木花子' },
  ];

  const mockStaff = [
    { id: 1, name: 'スタッフA' },
    { id: 2, name: 'スタッフB' },
  ];

  const mockPlans = [
    { id: 1, planName: '日常生活支援計画' },
    { id: 2, planName: '就労支援計画' },
  ];

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    clients: mockClients,
    staff: mockStaff,
    supportPlans: mockPlans,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示', () => {
    it('新規作成モードで表示される', () => {
      render(<AssessmentForm {...defaultProps} />);

      expect(screen.getByText('評価・アセスメント新規作成')).toBeInTheDocument();
      expect(screen.getByLabelText('クライアント *')).toBeInTheDocument();
      expect(screen.getByLabelText('担当スタッフ *')).toBeInTheDocument();
      expect(screen.getByLabelText('支援計画')).toBeInTheDocument();
      expect(screen.getByLabelText('アセスメント種別 *')).toBeInTheDocument();
      expect(screen.getByLabelText('評価日 *')).toBeInTheDocument();
      expect(screen.getByLabelText('総合評価スコア')).toBeInTheDocument();
    });

    it('編集モードで表示される', () => {
      render(<AssessmentForm {...defaultProps} assessment={defaultAssessment} isEditMode />);

      expect(screen.getByText('評価・アセスメント編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('初回アセスメントを実施しました。')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    it('各フィールドに入力できる', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      // クライアント選択
      await user.selectOptions(screen.getByLabelText('クライアント *'), '1');
      expect(screen.getByLabelText('クライアント *')).toHaveValue('1');

      // 評価日入力
      const dateInput = screen.getByLabelText('評価日 *');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-07-27');
      expect(dateInput).toHaveValue('2025-07-27');

      // サマリー入力
      await user.type(screen.getByLabelText('評価サマリー'), '新規アセスメント');
      expect(screen.getByLabelText('評価サマリー')).toHaveValue('新規アセスメント');

      // スコア入力
      await user.type(screen.getByLabelText('総合評価スコア'), '80');
      expect(screen.getByLabelText('総合評価スコア')).toHaveValue('80');
    });

    it('カテゴリスコアを入力できる', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      const categoryScores = ['身体機能', '認知機能', '社会参加'];
      for (const category of categoryScores) {
        const input = screen.getByLabelText(category);
        await user.type(input, '75');
        expect(input).toHaveValue('75');
      }
    });
  });

  describe('バリデーション', () => {
    it('必須フィールドが空の場合エラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: '保存' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('クライアントは必須です')).toBeInTheDocument();
        expect(screen.getByText('担当スタッフは必須です')).toBeInTheDocument();
        expect(screen.getByText('アセスメント種別は必須です')).toBeInTheDocument();
        expect(screen.getByText('評価日は必須です')).toBeInTheDocument();
      });
    });

    it('スコアの値が範囲外の場合エラーを表示する', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      const scoreInput = screen.getByLabelText('総合評価スコア');
      await user.type(scoreInput, '150');

      const submitButton = screen.getByRole('button', { name: '保存' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('スコアは1から100の間で入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    it('新規作成時にフォームデータを送信する', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      await user.selectOptions(screen.getByLabelText('クライアント *'), '1');
      await user.selectOptions(screen.getByLabelText('担当スタッフ *'), '1');
      await user.selectOptions(screen.getByLabelText('アセスメント種別 *'), 'initial');
      await user.type(screen.getByLabelText('評価日 *'), '2025-07-27');
      await user.type(screen.getByLabelText('評価サマリー'), '新規アセスメント');
      await user.type(screen.getByLabelText('総合評価スコア'), '80');

      const submitButton = screen.getByRole('button', { name: '保存' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 1,
            staffId: 1,
            assessmentType: 'initial',
            assessmentDate: '2025-07-27',
            summary: '新規アセスメント',
            overallScore: 80,
          })
        );
      });
    });

    it('編集時に更新データを送信する', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} assessment={defaultAssessment} isEditMode />);

      const summaryInput = screen.getByLabelText('評価サマリー');
      await user.clear(summaryInput);
      await user.type(summaryInput, '更新されたアセスメント');

      const submitButton = screen.getByRole('button', { name: '更新' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            summary: '更新されたアセスメント',
          }),
          1
        );
      });
    });
  });

  describe('キャンセル処理', () => {
    it('キャンセルボタンクリックでonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<AssessmentForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('状態管理', () => {
    it('ステータスに応じて編集可能かどうかが変わる', () => {
      const approvedAssessment = { ...defaultAssessment, status: 'approved' as const };
      render(<AssessmentForm {...defaultProps} assessment={approvedAssessment} isEditMode />);

      expect(screen.getByText('承認済みのアセスメントは編集できません')).toBeInTheDocument();
      expect(screen.getByLabelText('評価サマリー')).toBeDisabled();
    });
  });

  describe('アクセシビリティ', () => {
    it('フォームに適切なaria属性が設定されている', () => {
      render(<AssessmentForm {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', '評価・アセスメント登録フォーム');

      expect(screen.getByLabelText('クライアント *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('担当スタッフ *')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('評価日 *')).toHaveAttribute('aria-required', 'true');
    });
  });
});
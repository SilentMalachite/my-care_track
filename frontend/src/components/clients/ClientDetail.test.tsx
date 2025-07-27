import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import ClientDetail from './ClientDetail';
import { mockClient } from '../../test/mocks/clientData';

describe('ClientDetail', () => {
  const defaultProps = {
    client: mockClient,
    loading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onBack: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders client detail title', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('利用者詳細')).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    it('renders edit and delete buttons', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('編集')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });

    it('displays client name and kana', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('タナカ タロウ')).toBeInTheDocument();
    });

    it('displays client number', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('CL001')).toBeInTheDocument();
    });

    it('displays basic information section', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('基本情報')).toBeInTheDocument();
      expect(screen.getByText('生年月日')).toBeInTheDocument();
      expect(screen.getByText('性別')).toBeInTheDocument();
      expect(screen.getByText('年齢')).toBeInTheDocument();
    });

    it('displays contact information section', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('連絡先情報')).toBeInTheDocument();
      expect(screen.getByText('電話番号')).toBeInTheDocument();
      expect(screen.getByText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByText('住所')).toBeInTheDocument();
    });

    it('displays disability information section', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('障害情報')).toBeInTheDocument();
      expect(screen.getByText('障害種別')).toBeInTheDocument();
      expect(screen.getByText('障害等級')).toBeInTheDocument();
      expect(screen.getByText('保険番号')).toBeInTheDocument();
    });

    it('displays status information section', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('ステータス情報')).toBeInTheDocument();
      expect(screen.getByText('現在のステータス')).toBeInTheDocument();
    });

    it('displays formatted date of birth', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('1990/05/15')).toBeInTheDocument();
    });

    it('displays gender in Japanese', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('男性')).toBeInTheDocument();
    });

    it('displays disability type in Japanese', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('身体障害')).toBeInTheDocument();
    });

    it('displays status in Japanese', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText('利用中')).toBeInTheDocument();
    });

    it('displays calculated age', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.getByText(/\d+歳/)).toBeInTheDocument();
    });

    it('displays notes section when notes exist', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('備考')).toBeInTheDocument();
      expect(screen.getByText('車椅子利用者')).toBeInTheDocument();
    });

    it('displays created and updated dates', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByText('登録日時')).toBeInTheDocument();
      expect(screen.getByText('更新日時')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading is true', () => {
      render(<ClientDetail {...defaultProps} loading={true} />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('hides client details when loading', () => {
      render(<ClientDetail {...defaultProps} loading={true} />);
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
    });
  });

  describe('missing data handling', () => {
    it('shows placeholder when email is missing', () => {
      const clientWithoutEmail = { ...mockClient, email: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutEmail} />);
      expect(screen.getByText('未設定')).toBeInTheDocument();
    });

    it('shows placeholder when phone is missing', () => {
      const clientWithoutPhone = { ...mockClient, phone: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutPhone} />);
      expect(screen.getByText('未設定')).toBeInTheDocument();
    });

    it('shows placeholder when address is missing', () => {
      const clientWithoutAddress = { ...mockClient, address: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutAddress} />);
      expect(screen.getByText('未設定')).toBeInTheDocument();
    });

    it('shows placeholder when disability grade is missing', () => {
      const clientWithoutGrade = { ...mockClient, disabilityGrade: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutGrade} />);
      expect(screen.getByText('未設定')).toBeInTheDocument();
    });

    it('shows placeholder when insurance number is missing', () => {
      const clientWithoutInsurance = { ...mockClient, insuranceNumber: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutInsurance} />);
      expect(screen.getByText('未設定')).toBeInTheDocument();
    });

    it('hides notes section when notes are empty', () => {
      const clientWithoutNotes = { ...mockClient, notes: undefined };
      render(<ClientDetail {...defaultProps} client={clientWithoutNotes} />);
      expect(screen.queryByText('備考')).not.toBeInTheDocument();
    });
  });

  describe('discharge information', () => {
    it('displays discharge information when client is discharged', () => {
      const dischargedClient = {
        ...mockClient,
        status: 'discharged' as const,
        dischargeDate: '2024-03-15',
        dischargeReason: 'Support goals achieved',
      };
      
      render(<ClientDetail {...defaultProps} client={dischargedClient} />);
      
      expect(screen.getByText('終了情報')).toBeInTheDocument();
      expect(screen.getByText('終了日')).toBeInTheDocument();
      expect(screen.getByText('終了理由')).toBeInTheDocument();
      expect(screen.getByText('2024/03/15')).toBeInTheDocument();
      expect(screen.getByText('Support goals achieved')).toBeInTheDocument();
    });

    it('does not display discharge information for active clients', () => {
      render(<ClientDetail {...defaultProps} />);
      expect(screen.queryByText('終了情報')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientDetail {...defaultProps} />);
      
      const backButton = screen.getByText('戻る');
      await user.click(backButton);
      
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientDetail {...defaultProps} />);
      
      const editButton = screen.getByText('編集');
      await user.click(editButton);
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockClient);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientDetail {...defaultProps} />);
      
      const deleteButton = screen.getByText('削除');
      await user.click(deleteButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for action buttons', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByLabelText('利用者一覧に戻る')).toBeInTheDocument();
      expect(screen.getByLabelText('利用者情報を編集')).toBeInTheDocument();
      expect(screen.getByLabelText('利用者を削除')).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ClientDetail {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('利用者詳細');
      // 基本情報、連絡先情報、障害情報、ステータス情報、備考のh2要素
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5);
    });

    it('has proper semantic structure with definition lists', () => {
      render(<ClientDetail {...defaultProps} />);
      
      const definitionLists = screen.getAllByRole('definition');
      expect(definitionLists.length).toBeGreaterThan(0);
    });
  });

  describe('responsive design', () => {
    it('applies responsive classes for mobile layout', () => {
      render(<ClientDetail {...defaultProps} />);
      
      // メインコンテナ（最上位のdiv）を取得 - さらに上の階層を見る
      const h1Element = screen.getByText('利用者詳細');
      const mainContainer = h1Element.closest('div')?.parentElement?.parentElement;
      expect(mainContainer).toHaveClass('space-y-6');
    });
  });
});
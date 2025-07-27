import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import ClientList from './ClientList';
import { mockClients } from '../../test/mocks/clientData';

describe('ClientList', () => {
  const defaultProps = {
    clients: mockClients,
    loading: false,
    onClientSelect: vi.fn(),
    onClientEdit: vi.fn(),
    onClientDelete: vi.fn(),
    onAddClient: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders client list title', () => {
      render(<ClientList {...defaultProps} />);
      expect(screen.getByText('利用者一覧')).toBeInTheDocument();
    });

    it('renders add client button', () => {
      render(<ClientList {...defaultProps} />);
      expect(screen.getByText('新規利用者登録')).toBeInTheDocument();
    });

    it('renders all clients in the list', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('山田次郎')).toBeInTheDocument();
    });

    it('displays client numbers correctly', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByText('CL001')).toBeInTheDocument();
      expect(screen.getByText('CL002')).toBeInTheDocument();
      expect(screen.getByText('CL003')).toBeInTheDocument();
    });

    it('displays disability types in Japanese', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByText('身体障害')).toBeInTheDocument();
      expect(screen.getByText('知的障害')).toBeInTheDocument();
      expect(screen.getByText('精神障害')).toBeInTheDocument();
    });

    it('displays status labels in Japanese', () => {
      render(<ClientList {...defaultProps} />);
      
      // 利用中のクライアントが2人 + フィルターボタンで1つ = 合計3つ
      expect(screen.getAllByText('利用中')).toHaveLength(3);
      // 休止中のクライアントが1人 + フィルターボタンで1つ = 合計2つ  
      expect(screen.getAllByText('休止中')).toHaveLength(2);
    });

    it('displays ages correctly', () => {
      render(<ClientList {...defaultProps} />);
      
      // 年齢の計算は現在日付に依存するため、具体的な年齢ではなく形式をテスト
      expect(screen.getAllByText(/\d+歳/)).toHaveLength(3);
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading is true', () => {
      render(<ClientList {...defaultProps} loading={true} />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('hides client list when loading', () => {
      render(<ClientList {...defaultProps} loading={true} />);
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no clients', () => {
      render(<ClientList {...defaultProps} clients={[]} />);
      expect(screen.getByText('利用者が登録されていません')).toBeInTheDocument();
    });

    it('still shows add button when empty', () => {
      render(<ClientList {...defaultProps} clients={[]} />);
      expect(screen.getByText('新規利用者登録')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onAddClient when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const addButton = screen.getByText('新規利用者登録');
      await user.click(addButton);
      
      expect(defaultProps.onAddClient).toHaveBeenCalledTimes(1);
    });

    it('calls onClientSelect when client row is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const clientRow = screen.getByText('田中太郎').closest('tr');
      if (clientRow) {
        await user.click(clientRow);
      }
      
      expect(defaultProps.onClientSelect).toHaveBeenCalledWith(mockClients[0]);
    });

    it('calls onClientEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const editButtons = screen.getAllByText('編集');
      await user.click(editButtons[0]);
      
      expect(defaultProps.onClientEdit).toHaveBeenCalledWith(mockClients[0]);
    });

    it('calls onClientDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);
      
      expect(defaultProps.onClientDelete).toHaveBeenCalledWith(mockClients[0]);
    });
  });

  describe('search functionality', () => {
    it('renders search input', () => {
      render(<ClientList {...defaultProps} />);
      expect(screen.getByPlaceholderText('利用者名で検索...')).toBeInTheDocument();
    });

    it('filters clients by name when searching', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('利用者名で検索...');
      await user.type(searchInput, '田中');
      
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
      expect(screen.queryByText('山田次郎')).not.toBeInTheDocument();
    });

    it('filters clients by client number when searching', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('利用者名で検索...');
      await user.type(searchInput, 'CL002');
      
      expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.queryByText('山田次郎')).not.toBeInTheDocument();
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('利用者名で検索...');
      await user.type(searchInput, '存在しない名前');
      
      expect(screen.getByText('検索条件に一致する利用者が見つかりません')).toBeInTheDocument();
    });
  });

  describe('status filtering', () => {
    it('renders status filter buttons', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByText('すべて')).toBeInTheDocument();
      expect(screen.getAllByText('利用中')).toHaveLength(3); // フィルターボタン1つ + テーブル内2つ
      expect(screen.getAllByText('休止中')).toHaveLength(2); // フィルターボタン1つ + テーブル内1つ
      expect(screen.getByText('終了')).toBeInTheDocument();
    });

    it('filters clients by active status', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      const activeFilter = screen.getAllByText('利用中').find(el => el.closest('button'));
      if (activeFilter) {
        await user.click(activeFilter);
      }
      
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.queryByText('山田次郎')).not.toBeInTheDocument();
    });

    it('shows all clients when "すべて" filter is selected', async () => {
      const user = userEvent.setup();
      render(<ClientList {...defaultProps} />);
      
      // First filter by active
      const activeFilter = screen.getAllByText('利用中').find(el => el.closest('button'));
      if (activeFilter) {
        await user.click(activeFilter);
      }
      
      // Then click "すべて"
      const allFilter = screen.getByText('すべて');
      await user.click(allFilter);
      
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('山田次郎')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels for action buttons', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByLabelText('新規利用者を登録')).toBeInTheDocument();
      expect(screen.getByLabelText('利用者を検索')).toBeInTheDocument();
    });

    it('has proper table headers', () => {
      render(<ClientList {...defaultProps} />);
      
      expect(screen.getByText('利用者番号')).toBeInTheDocument();
      expect(screen.getByText('氏名')).toBeInTheDocument();
      expect(screen.getByText('年齢')).toBeInTheDocument();
      expect(screen.getByText('障害種別')).toBeInTheDocument();
      expect(screen.getByText('ステータス')).toBeInTheDocument();
      expect(screen.getByText('操作')).toBeInTheDocument();
    });
  });
});
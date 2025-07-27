import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// windowオブジェクトのモック
const mockBack = vi.fn();
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();

// グローバルhistoryのモック
Object.defineProperty(window, 'history', {
  value: {
    back: mockBack,
    pushState: mockPushState,
    replaceState: mockReplaceState,
    length: 1,
    scrollRestoration: 'auto',
    state: null,
  },
  writable: true,
});

// globalHistoryのモック（React Router用）
(globalThis as any).globalHistory = {
  pushState: mockPushState,
  replaceState: mockReplaceState,
};

describe('NotFound', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表示内容', () => {
    it('404エラーコードが表示される', () => {
      renderWithRouter(<NotFound />);
      
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('エラーメッセージが表示される', () => {
      renderWithRouter(<NotFound />);
      
      expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
      expect(screen.getByText(/お探しのページは存在しないか/)).toBeInTheDocument();
    });

    it('エラーアイコンが表示される', () => {
      renderWithRouter(<NotFound />);
      
      // Lucide iconはSVGとしてレンダリングされる
      const icon = document.querySelector('svg.lucide-circle-alert');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-24', 'h-24');
    });
  });

  describe('ナビゲーション', () => {
    it('ホームに戻るリンクが正しく設定されている', () => {
      renderWithRouter(<NotFound />);
      
      const homeLink = screen.getByRole('link', { name: /ホームに戻る/ });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('前のページに戻るボタンがクリックできる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotFound />);
      
      const backButton = screen.getByRole('button', { name: '前のページに戻る' });
      await user.click(backButton);
      
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('よくアクセスされるページへのリンクが表示される', () => {
      renderWithRouter(<NotFound />);
      
      const clientsLink = screen.getByRole('link', { name: '利用者管理' });
      const plansLink = screen.getByRole('link', { name: '支援計画' });
      const logsLink = screen.getByRole('link', { name: 'サービス記録' });
      
      expect(clientsLink).toHaveAttribute('href', '/clients');
      expect(plansLink).toHaveAttribute('href', '/support-plans');
      expect(logsLink).toHaveAttribute('href', '/service-logs');
    });
  });

  describe('スタイリング', () => {
    it('レスポンシブなボタンレイアウトが適用されている', () => {
      renderWithRouter(<NotFound />);
      
      const buttonContainer = screen.getByRole('link', { name: /ホームに戻る/ }).parentElement;
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('ダークモード対応のクラスが設定されている', () => {
      renderWithRouter(<NotFound />);
      
      const heading = screen.getByText('404');
      expect(heading).toHaveClass('text-gray-900', 'dark:text-gray-100');
      
      const message = screen.getByText('ページが見つかりません');
      expect(message).toHaveClass('text-gray-800', 'dark:text-gray-200');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切な見出し構造が設定されている', () => {
      renderWithRouter(<NotFound />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toHaveTextContent('404');
      expect(h2).toHaveTextContent('ページが見つかりません');
    });

    it('ナビゲーションに適切なaria-labelが設定されている', () => {
      renderWithRouter(<NotFound />);
      
      const nav = screen.getByRole('navigation', { name: 'よくアクセスされるページ' });
      expect(nav).toBeInTheDocument();
    });

    it('アイコンにaria-hidden属性が設定されている', () => {
      renderWithRouter(<NotFound />);
      
      const icon = document.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('インタラクション', () => {
    it('ホームリンクがフォーカス可能', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotFound />);
      
      const homeLink = screen.getByRole('link', { name: /ホームに戻る/ });
      
      await user.tab();
      expect(homeLink).toHaveFocus();
    });

    it('リンクにホバースタイルが適用される', () => {
      renderWithRouter(<NotFound />);
      
      const clientsLink = screen.getByRole('link', { name: '利用者管理' });
      expect(clientsLink).toHaveClass('hover:underline', 'hover:text-blue-800');
    });
  });
});
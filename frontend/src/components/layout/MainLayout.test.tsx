import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

// ナビゲーションコンポーネントのモック
vi.mock('./Navigation', () => ({
  Navigation: ({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => (
    <nav data-testid="navigation" data-collapsed={isCollapsed}>
      <button onClick={onToggle} data-testid="nav-toggle">
        {isCollapsed ? 'Expand' : 'Collapse'}
      </button>
      <a href="/clients" data-testid="nav-clients">利用者管理</a>
      <a href="/support-plans" data-testid="nav-plans">支援計画</a>
      <a href="/service-logs" data-testid="nav-logs">サービス記録</a>
    </nav>
  ),
}));

// React Routerでラップするヘルパー
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ビューポートをデスクトップサイズにリセット
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  describe('基本構造', () => {
    it('メインレイアウトの基本要素が表示される', () => {
      renderWithRouter(
        <MainLayout>
          <div data-testid="test-content">テストコンテンツ</div>
        </MainLayout>
      );

      // ヘッダー
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('障害者支援クライアント管理システム')).toBeInTheDocument();

      // ナビゲーション
      expect(screen.getByTestId('navigation')).toBeInTheDocument();

      // メインコンテンツエリア
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();

      // フッター
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText(/© 2024/)).toBeInTheDocument();
    });

    it('正しいARIA属性が設定されている', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label', 'ページヘッダー');

      const nav = screen.getByTestId('navigation');
      expect(nav.closest('[role="navigation"]')).toBeInTheDocument();

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'メインコンテンツ');

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('aria-label', 'ページフッター');
    });

    it('適切な見出し構造が設定されている', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('障害者支援クライアント管理システム');
    });
  });

  describe('ナビゲーション制御', () => {
    it('ナビゲーションの開閉を制御できる', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const navigation = screen.getByTestId('navigation');
      const toggleButton = screen.getByTestId('nav-toggle');

      // 初期状態：ナビゲーションは展開されている
      expect(navigation).toHaveAttribute('data-collapsed', 'false');
      expect(toggleButton).toHaveTextContent('Collapse');

      // ナビゲーションを閉じる
      await user.click(toggleButton);
      expect(navigation).toHaveAttribute('data-collapsed', 'true');
      expect(toggleButton).toHaveTextContent('Expand');

      // ナビゲーションを再び開く
      await user.click(toggleButton);
      expect(navigation).toHaveAttribute('data-collapsed', 'false');
      expect(toggleButton).toHaveTextContent('Collapse');
    });

    it('ハンバーガーメニューボタンが表示される', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く|メニューを閉じる/ });
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveAttribute('aria-expanded');
    });
  });

  describe('ヘッダー機能', () => {
    it('システムタイトルがリンクとして機能する', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const titleLink = screen.getByRole('link', { name: '障害者支援クライアント管理システム' });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', '/');
    });

    it('ユーザー情報エリアが表示される', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      expect(screen.getByText('管理者')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
    });

    it('現在時刻が表示される', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      // 時刻表示の要素が存在することを確認
      const timeElement = screen.getByTestId('current-time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル画面でナビゲーションが初期状態で閉じている', () => {
      // モバイルサイズに設定
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      fireEvent(window, new Event('resize'));

      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const navigation = screen.getByTestId('navigation');
      expect(navigation).toHaveAttribute('data-collapsed', 'true');
    });

    it('タブレット画面で適切なレイアウトが適用される', () => {
      // タブレットサイズに設定
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      fireEvent(window, new Event('resize'));

      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const layout = screen.getByTestId('main-layout');
      expect(layout).toHaveClass('md:grid-cols-[240px_1fr]');
    });

    it('デスクトップ画面で適切なレイアウトが適用される', () => {
      // デスクトップサイズに設定
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      fireEvent(window, new Event('resize'));

      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const layout = screen.getByTestId('main-layout');
      expect(layout).toHaveClass('lg:grid-cols-[260px_1fr]');
    });
  });

  describe('アクセシビリティ', () => {
    it('キーボードナビゲーションが機能する', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      // Tabキーでフォーカス移動できることを確認
      await user.tab();
      expect(screen.getByRole('link', { name: 'メインコンテンツにスキップ' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /メニューを/ })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: '障害者支援クライアント管理システム' })).toHaveFocus();
    });

    it('スクリーンリーダー用のスキップリンクが機能する', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      // スキップリンクをフォーカス
      const skipLink = screen.getByRole('link', { name: 'メインコンテンツにスキップ' });
      await user.click(skipLink);

      // メインコンテンツにフォーカスが移動することを確認
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });

    it('ハイコントラストモードで適切に表示される', () => {
      // ハイコントラストモードのシミュレート
      document.documentElement.classList.add('high-contrast');

      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('high-contrast:border-white');

      // クリーンアップ
      document.documentElement.classList.remove('high-contrast');
    });
  });

  describe('ページタイトル管理', () => {
    it('ページタイトルが動的に設定される', () => {
      renderWithRouter(
        <MainLayout title="利用者管理">
          <div>コンテンツ</div>
        </MainLayout>
      );

      expect(document.title).toBe('利用者管理 - 障害者支援クライアント管理システム');
    });

    it('タイトルが指定されない場合はデフォルトタイトルが使用される', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      expect(document.title).toBe('障害者支援クライアント管理システム');
    });
  });

  describe('エラー境界', () => {
    it('子コンポーネントのエラーを適切に処理する', () => {
      const ErrorComponent = () => {
        throw new Error('テストエラー');
      };

      // エラーログを抑制
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(
        <MainLayout>
          <ErrorComponent />
        </MainLayout>
      );

      expect(screen.getByText('問題が発生しました')).toBeInTheDocument();
      expect(screen.getByText('ページの再読み込みをお試しください')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ページを再読み込み' })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('エラー境界のリロードボタンが表示される', async () => {
      const ErrorComponent = () => {
        throw new Error('テストエラー');
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(
        <MainLayout>
          <ErrorComponent />
        </MainLayout>
      );

      const reloadButton = screen.getByRole('button', { name: 'ページを再読み込み' });
      expect(reloadButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('パフォーマンス', () => {
    it('時刻表示コンポーネントが正しく表示される', () => {
      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const timeElement = screen.getByTestId('current-time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
    });
  });

  describe('テーマ対応', () => {
    it('ダークモードに対応している', () => {
      // ダークモードのシミュレート
      document.documentElement.classList.add('dark');

      renderWithRouter(
        <MainLayout>
          <div>コンテンツ</div>
        </MainLayout>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('dark:bg-gray-800');

      // クリーンアップ
      document.documentElement.classList.remove('dark');
    });
  });

  describe('ローディング状態', () => {
    it('ローディング状態を表示できる', () => {
      renderWithRouter(
        <MainLayout loading={true}>
          <div>コンテンツ</div>
        </MainLayout>
      );

      expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('ローディング中はメインコンテンツが非表示になる', () => {
      renderWithRouter(
        <MainLayout loading={true}>
          <div data-testid="main-content">コンテンツ</div>
        </MainLayout>
      );

      expect(screen.queryByTestId('main-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
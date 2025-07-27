import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {component}
    </MemoryRouter>
  );
};

describe('Breadcrumb', () => {
  describe('基本機能', () => {
    it('ホームページではパンくずリストを表示しない', () => {
      renderWithRouter(<Breadcrumb />, '/');
      expect(screen.queryByRole('navigation', { name: 'パンくずリスト' })).not.toBeInTheDocument();
    });

    it('利用者一覧ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/clients');
      
      const nav = screen.getByRole('navigation', { name: 'パンくずリスト' });
      expect(nav).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: 'ホーム' });
      expect(homeLink).toHaveAttribute('href', '/');

      expect(screen.getByText('利用者管理')).toBeInTheDocument();
      expect(screen.getByText('利用者管理').closest('li')).toHaveAttribute('aria-current', 'page');
    });

    it('利用者詳細ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123');
      
      const nav = screen.getByRole('navigation', { name: 'パンくずリスト' });
      expect(nav).toBeInTheDocument();

      expect(screen.getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: '利用者管理' })).toHaveAttribute('href', '/clients');
      expect(screen.getByText('詳細')).toBeInTheDocument();
    });

    it('利用者新規登録ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/clients/new');
      
      expect(screen.getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: '利用者管理' })).toHaveAttribute('href', '/clients');
      expect(screen.getByText('新規登録')).toBeInTheDocument();
    });

    it('利用者編集ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123/edit');
      
      expect(screen.getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: '利用者管理' })).toHaveAttribute('href', '/clients');
      expect(screen.getByRole('link', { name: '詳細' })).toHaveAttribute('href', '/clients/123');
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
  });

  describe('支援計画ページのパンくずリスト', () => {
    it('支援計画一覧ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/support-plans');
      
      expect(screen.getByRole('link', { name: 'ホーム' })).toBeInTheDocument();
      expect(screen.getByText('支援計画管理')).toBeInTheDocument();
    });

    it('支援計画詳細ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/support-plans/456');
      
      expect(screen.getByRole('link', { name: '支援計画管理' })).toHaveAttribute('href', '/support-plans');
      expect(screen.getByText('詳細')).toBeInTheDocument();
    });

    it('支援計画新規作成ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/support-plans/new');
      
      expect(screen.getByRole('link', { name: '支援計画管理' })).toHaveAttribute('href', '/support-plans');
      expect(screen.getByText('新規作成')).toBeInTheDocument();
    });
  });

  describe('サービス記録ページのパンくずリスト', () => {
    it('サービス記録一覧ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/service-logs');
      
      expect(screen.getByText('サービス記録')).toBeInTheDocument();
    });

    it('サービス記録新規作成ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/service-logs/new');
      
      expect(screen.getByRole('link', { name: 'サービス記録' })).toHaveAttribute('href', '/service-logs');
      expect(screen.getByText('新規作成')).toBeInTheDocument();
    });

    it('サービス記録編集ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/service-logs/789/edit');
      
      expect(screen.getByRole('link', { name: 'サービス記録' })).toHaveAttribute('href', '/service-logs');
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
  });

  describe('評価・アセスメントページのパンくずリスト', () => {
    it('評価・アセスメント一覧ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/assessments');
      
      expect(screen.getByText('評価・アセスメント')).toBeInTheDocument();
    });

    it('評価・アセスメント詳細ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/assessments/321');
      
      expect(screen.getByRole('link', { name: '評価・アセスメント' })).toHaveAttribute('href', '/assessments');
      expect(screen.getByText('詳細')).toBeInTheDocument();
    });
  });

  describe('設定ページのパンくずリスト', () => {
    it('設定ページで正しいパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/settings');
      
      expect(screen.getByText('設定・管理')).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('正しいスタイルクラスが適用されている', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123');
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-gray-50');
      
      const list = screen.getByRole('list');
      expect(list).toHaveClass('flex', 'items-center', 'space-x-2');
    });

    it('区切り文字が正しく表示される', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123');
      
      const separators = screen.getAllByText('›');
      expect(separators).toHaveLength(2); // ホーム › 利用者管理 › 詳細
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123');
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'パンくずリスト');
      
      const currentPage = screen.getByText('詳細').closest('li');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('構造化データが正しく設定されている', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123');
      
      const list = screen.getByRole('list');
      const items = screen.getAllByRole('listitem');
      
      expect(list).toBeInTheDocument();
      expect(items).toHaveLength(3); // ホーム、利用者管理、詳細
    });
  });

  describe('カスタムパンくずリスト', () => {
    it('カスタムアイテムを追加できる', () => {
      const customItems = [
        { label: 'カスタム項目', href: '/custom' }
      ];
      
      renderWithRouter(<Breadcrumb customItems={customItems} />, '/clients');
      
      expect(screen.getByRole('link', { name: 'カスタム項目' })).toHaveAttribute('href', '/custom');
    });

    it('カスタムラベルで既存の項目を上書きできる', () => {
      const customLabels = {
        clients: 'サービス利用者'
      };
      
      renderWithRouter(<Breadcrumb customLabels={customLabels} />, '/clients');
      
      expect(screen.getByText('サービス利用者')).toBeInTheDocument();
      expect(screen.queryByText('利用者管理')).not.toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('未知のルートでは基本的なパンくずリストを表示する', () => {
      renderWithRouter(<Breadcrumb />, '/unknown-route');
      
      expect(screen.getByRole('link', { name: 'ホーム' })).toBeInTheDocument();
      expect(screen.getByText('unknown-route')).toBeInTheDocument();
    });

    it('深い階層のルートでも正しく表示する', () => {
      renderWithRouter(<Breadcrumb />, '/clients/123/support-plans/456');
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4); // ホーム、利用者管理、詳細、支援計画管理
      expect(screen.getByText('支援計画')).toBeInTheDocument();
    });
  });
});
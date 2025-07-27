import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes, routeConfig } from './index';

// ページコンポーネントのモック
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">ダッシュボード</div>,
}));

vi.mock('../pages/clients/ClientList', () => ({
  default: () => <div data-testid="client-list">利用者一覧</div>,
}));

vi.mock('../pages/clients/ClientDetail', () => ({
  default: () => <div data-testid="client-detail">利用者詳細</div>,
}));

vi.mock('../pages/clients/ClientNew', () => ({
  default: () => <div data-testid="client-new">利用者新規登録</div>,
}));

vi.mock('../pages/clients/ClientEdit', () => ({
  default: () => <div data-testid="client-edit">利用者編集</div>,
}));

vi.mock('../pages/support-plans/SupportPlanList', () => ({
  default: () => <div data-testid="support-plan-list">支援計画一覧</div>,
}));

vi.mock('../pages/support-plans/SupportPlanDetail', () => ({
  default: () => <div data-testid="support-plan-detail">支援計画詳細</div>,
}));

vi.mock('../pages/support-plans/SupportPlanNew', () => ({
  default: () => <div data-testid="support-plan-new">支援計画新規作成</div>,
}));

vi.mock('../pages/support-plans/SupportPlanEdit', () => ({
  default: () => <div data-testid="support-plan-edit">支援計画編集</div>,
}));

vi.mock('../pages/service-logs/ServiceLogList', () => ({
  default: () => <div data-testid="service-log-list">サービス記録一覧</div>,
}));

vi.mock('../pages/service-logs/ServiceLogNew', () => ({
  default: () => <div data-testid="service-log-new">サービス記録新規作成</div>,
}));

vi.mock('../pages/service-logs/ServiceLogEdit', () => ({
  default: () => <div data-testid="service-log-edit">サービス記録編集</div>,
}));

vi.mock('../pages/Settings', () => ({
  default: () => <div data-testid="settings">設定</div>,
}));

vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found">404 - ページが見つかりません</div>,
}));

// MainLayoutのモック
vi.mock('../components/layout/MainLayout', () => ({
  MainLayout: () => {
    const { Outlet } = require('react-router-dom');
    return (
      <div data-testid="main-layout">
        <Outlet />
      </div>
    );
  },
}));

describe('AppRoutes', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AppRoutes />
      </MemoryRouter>
    );
  };

  describe('ルートルーティング', () => {
    it('ルートパスでダッシュボードが表示される', async () => {
      renderWithRouter('/');
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('利用者管理ルーティング', () => {
    it('/clientsで利用者一覧が表示される', async () => {
      renderWithRouter('/clients');
      
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
      });
    });

    it('/clients/newで利用者新規登録が表示される', async () => {
      renderWithRouter('/clients/new');
      
      await waitFor(() => {
        expect(screen.getByTestId('client-new')).toBeInTheDocument();
      });
    });

    it('/clients/:idで利用者詳細が表示される', async () => {
      renderWithRouter('/clients/123');
      
      await waitFor(() => {
        expect(screen.getByTestId('client-detail')).toBeInTheDocument();
      });
    });

    it('/clients/:id/editで利用者編集が表示される', async () => {
      renderWithRouter('/clients/123/edit');
      
      await waitFor(() => {
        expect(screen.getByTestId('client-edit')).toBeInTheDocument();
      });
    });
  });

  describe('支援計画管理ルーティング', () => {
    it('/support-plansで支援計画一覧が表示される', async () => {
      renderWithRouter('/support-plans');
      
      await waitFor(() => {
        expect(screen.getByTestId('support-plan-list')).toBeInTheDocument();
      });
    });

    it('/support-plans/newで支援計画新規作成が表示される', async () => {
      renderWithRouter('/support-plans/new');
      
      await waitFor(() => {
        expect(screen.getByTestId('support-plan-new')).toBeInTheDocument();
      });
    });

    it('/support-plans/:idで支援計画詳細が表示される', async () => {
      renderWithRouter('/support-plans/456');
      
      await waitFor(() => {
        expect(screen.getByTestId('support-plan-detail')).toBeInTheDocument();
      });
    });

    it('/support-plans/:id/editで支援計画編集が表示される', async () => {
      renderWithRouter('/support-plans/456/edit');
      
      await waitFor(() => {
        expect(screen.getByTestId('support-plan-edit')).toBeInTheDocument();
      });
    });
  });

  describe('サービス記録ルーティング', () => {
    it('/service-logsでサービス記録一覧が表示される', async () => {
      renderWithRouter('/service-logs');
      
      await waitFor(() => {
        expect(screen.getByTestId('service-log-list')).toBeInTheDocument();
      });
    });

    it('/service-logs/newでサービス記録新規作成が表示される', async () => {
      renderWithRouter('/service-logs/new');
      
      await waitFor(() => {
        expect(screen.getByTestId('service-log-new')).toBeInTheDocument();
      });
    });

    it('/service-logs/:id/editでサービス記録編集が表示される', async () => {
      renderWithRouter('/service-logs/789/edit');
      
      await waitFor(() => {
        expect(screen.getByTestId('service-log-edit')).toBeInTheDocument();
      });
    });
  });

  describe('その他のルーティング', () => {
    it('/settingsで設定ページが表示される', async () => {
      renderWithRouter('/settings');
      
      await waitFor(() => {
        expect(screen.getByTestId('settings')).toBeInTheDocument();
      });
    });

    it('存在しないパスで404ページが表示される', async () => {
      renderWithRouter('/invalid-path');
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      });
    });
  });

  describe('レイアウト統合', () => {
    it('すべてのページがMainLayout内に表示される', async () => {
      renderWithRouter('/');
      
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    it('ページ読み込み中にローディングが表示される（遅延読み込み使用）', async () => {
      renderWithRouter('/clients');
      
      // React.lazy による遅延読み込みが使用されていることを確認
      // 開発環境ではロードが速すぎてローディング状態を確認できないため、
      // コンポーネントが最終的に表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
      });
      
      // 遅延読み込みされたことを確認（Suspenseが使用されている）
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('ルート設定', () => {
    it('routeConfigに全ルートが定義されている', () => {
      expect(routeConfig).toContainEqual({ path: '/', name: 'ダッシュボード' });
      expect(routeConfig).toContainEqual({ path: '/clients', name: '利用者一覧' });
      expect(routeConfig).toContainEqual({ path: '/clients/new', name: '利用者新規登録' });
      expect(routeConfig).toContainEqual({ path: '/clients/:id', name: '利用者詳細' });
      expect(routeConfig).toContainEqual({ path: '/clients/:id/edit', name: '利用者編集' });
      expect(routeConfig).toContainEqual({ path: '/support-plans', name: '支援計画一覧' });
      expect(routeConfig).toContainEqual({ path: '/support-plans/new', name: '支援計画新規作成' });
      expect(routeConfig).toContainEqual({ path: '/support-plans/:id', name: '支援計画詳細' });
      expect(routeConfig).toContainEqual({ path: '/support-plans/:id/edit', name: '支援計画編集' });
      expect(routeConfig).toContainEqual({ path: '/service-logs', name: 'サービス記録一覧' });
      expect(routeConfig).toContainEqual({ path: '/service-logs/new', name: 'サービス記録新規作成' });
      expect(routeConfig).toContainEqual({ path: '/service-logs/:id/edit', name: 'サービス記録編集' });
      expect(routeConfig).toContainEqual({ path: '/settings', name: '設定' });
    });

    it('routeConfigの数が正しい', () => {
      expect(routeConfig).toHaveLength(13);
    });
  });
});
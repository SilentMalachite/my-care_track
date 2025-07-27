import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

// ページコンポーネントのインポート（遅延読み込み）
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const ClientList = React.lazy(() => import('../pages/clients/ClientList'));
const ClientDetail = React.lazy(() => import('../pages/clients/ClientDetail'));
const ClientNew = React.lazy(() => import('../pages/clients/ClientNew'));
const ClientEdit = React.lazy(() => import('../pages/clients/ClientEdit'));
const SupportPlanList = React.lazy(() => import('../pages/support-plans/SupportPlanList'));
const SupportPlanDetail = React.lazy(() => import('../pages/support-plans/SupportPlanDetail'));
const SupportPlanNew = React.lazy(() => import('../pages/support-plans/SupportPlanNew'));
const SupportPlanEdit = React.lazy(() => import('../pages/support-plans/SupportPlanEdit'));
const ServiceLogList = React.lazy(() => import('../pages/service-logs/ServiceLogList'));
const ServiceLogNew = React.lazy(() => import('../pages/service-logs/ServiceLogNew'));
const ServiceLogEdit = React.lazy(() => import('../pages/service-logs/ServiceLogEdit'));
const AssessmentList = React.lazy(() => import('../pages/assessments/AssessmentList'));
const AssessmentDetail = React.lazy(() => import('../pages/assessments/AssessmentDetail'));
const AssessmentNew = React.lazy(() => import('../pages/assessments/AssessmentNew'));
const AssessmentEdit = React.lazy(() => import('../pages/assessments/AssessmentEdit'));
const Settings = React.lazy(() => import('../pages/Settings'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// ローディングコンポーネント
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">読み込み中...</p>
    </div>
  </div>
);

// Suspenseラッパーコンポーネント
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={<PageLoader />}>
    {children}
  </React.Suspense>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* ダッシュボード */}
        <Route
          index
          element={
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          }
        />

        {/* 利用者管理 */}
        <Route path="clients">
          <Route
            index
            element={
              <SuspenseWrapper>
                <ClientList />
              </SuspenseWrapper>
            }
          />
          <Route
            path="new"
            element={
              <SuspenseWrapper>
                <ClientNew />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id"
            element={
              <SuspenseWrapper>
                <ClientDetail />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id/edit"
            element={
              <SuspenseWrapper>
                <ClientEdit />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* 支援計画管理 */}
        <Route path="support-plans">
          <Route
            index
            element={
              <SuspenseWrapper>
                <SupportPlanList />
              </SuspenseWrapper>
            }
          />
          <Route
            path="new"
            element={
              <SuspenseWrapper>
                <SupportPlanNew />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id"
            element={
              <SuspenseWrapper>
                <SupportPlanDetail />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id/edit"
            element={
              <SuspenseWrapper>
                <SupportPlanEdit />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* サービス記録 */}
        <Route path="service-logs">
          <Route
            index
            element={
              <SuspenseWrapper>
                <ServiceLogList />
              </SuspenseWrapper>
            }
          />
          <Route
            path="new"
            element={
              <SuspenseWrapper>
                <ServiceLogNew />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id/edit"
            element={
              <SuspenseWrapper>
                <ServiceLogEdit />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* 評価・アセスメント */}
        <Route path="assessments">
          <Route
            index
            element={
              <SuspenseWrapper>
                <AssessmentList />
              </SuspenseWrapper>
            }
          />
          <Route
            path="new"
            element={
              <SuspenseWrapper>
                <AssessmentNew />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id"
            element={
              <SuspenseWrapper>
                <AssessmentDetail />
              </SuspenseWrapper>
            }
          />
          <Route
            path=":id/edit"
            element={
              <SuspenseWrapper>
                <AssessmentEdit />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* 設定 */}
        <Route
          path="settings"
          element={
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <SuspenseWrapper>
              <NotFound />
            </SuspenseWrapper>
          }
        />
      </Route>

      {/* ルートレベルの404リダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ルート設定のエクスポート（テスト用）
export const routeConfig = [
  { path: '/', name: 'ダッシュボード' },
  { path: '/clients', name: '利用者一覧' },
  { path: '/clients/new', name: '利用者新規登録' },
  { path: '/clients/:id', name: '利用者詳細' },
  { path: '/clients/:id/edit', name: '利用者編集' },
  { path: '/support-plans', name: '支援計画一覧' },
  { path: '/support-plans/new', name: '支援計画新規作成' },
  { path: '/support-plans/:id', name: '支援計画詳細' },
  { path: '/support-plans/:id/edit', name: '支援計画編集' },
  { path: '/service-logs', name: 'サービス記録一覧' },
  { path: '/service-logs/new', name: 'サービス記録新規作成' },
  { path: '/service-logs/:id/edit', name: 'サービス記録編集' },
  { path: '/assessments', name: '評価・アセスメント一覧' },
  { path: '/assessments/new', name: '評価・アセスメント新規作成' },
  { path: '/assessments/:id', name: '評価・アセスメント詳細' },
  { path: '/assessments/:id/edit', name: '評価・アセスメント編集' },
  { path: '/settings', name: '設定' },
];
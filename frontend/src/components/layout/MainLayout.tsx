import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Clock, LogOut, User } from 'lucide-react';
import { Navigation } from './Navigation';
import { Breadcrumb } from './Breadcrumb';

interface UserInfo {
  name: string;
  role: string;
  email?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
  userInfo?: UserInfo;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// エラー境界コンポーネント
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MainLayout Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              問題が発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              ページの再読み込みをお試しください
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ローディングスピナーコンポーネント
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div 
      className="flex flex-col items-center"
      role="status"
      aria-label="読み込み中"
    >
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        data-testid="loading-spinner"
      ></div>
      <p className="mt-4 text-gray-600">読み込み中...</p>
    </div>
  </div>
);

// 現在時刻表示コンポーネント
const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className="flex items-center text-sm text-gray-600 dark:text-gray-300"
      data-testid="current-time"
    >
      <Clock className="w-4 h-4 mr-1" />
      {formatTime(currentTime)}
    </div>
  );
};

export const MainLayout: React.FC<Partial<MainLayoutProps>> = ({ 
  children, 
  title, 
  loading = false,
  userInfo = { name: '管理者', role: '管理者' }
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ページタイトルの設定
  useEffect(() => {
    const baseTitle = '障害者支援クライアント管理システム';
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;
  }, [title]);

  // レスポンシブ対応
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsNavCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // ユーザーメニューの外側クリック処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('[aria-label="ユーザーメニュー"]')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  const toggleNavigation = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleLogout = () => {
    // 将来のログアウト処理
    console.log('ログアウト処理');
  };

  // スキップリンクのクリックハンドラ
  const handleSkipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div 
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 grid grid-rows-[auto_1fr_auto] ${
          isMobile 
            ? 'grid-cols-1' 
            : isNavCollapsed 
              ? 'md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]'
              : 'md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]'
        }`}
        data-testid="main-layout"
      >
        {/* スキップリンク */}
        <a
          href="#main-content"
          onClick={handleSkipToMain}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          メインコンテンツにスキップ
        </a>

        {/* ヘッダー */}
        <header 
          className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 high-contrast:border-white ${
            isMobile ? 'col-span-1' : 'col-span-2'
          }`}
          role="banner"
          aria-label="ページヘッダー"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              {/* ハンバーガーメニューボタン */}
              <button
                onClick={toggleNavigation}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={!isNavCollapsed}
                aria-label={isNavCollapsed ? 'メニューを開く' : 'メニューを閉じる'}
              >
                {isNavCollapsed ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </button>

              {/* システムタイトル */}
              <Link 
                to="/" 
                className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                <h1>障害者支援クライアント管理システム</h1>
              </Link>
            </div>

            {/* 右側のユーザー情報とツール */}
            <div className="flex items-center space-x-4">
              <CurrentTime />
              
              {/* ユーザー情報とメニュー */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-expanded={isUserMenuOpen}
                  aria-label="ユーザーメニュー"
                >
                  <User className="w-4 h-4" />
                  <span>{userInfo.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({userInfo.role})</span>
                </button>

                {/* ユーザーメニュードロップダウン */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">{userInfo.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.role}</p>
                      {userInfo.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.email}</p>
                      )}
                    </div>
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        プロフィール設定
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ログアウト</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* モバイルメニューオーバーレイ */}
        {isMobile && !isNavCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsNavCollapsed(true)}
            data-testid="mobile-menu-overlay"
            aria-hidden="true"
          />
        )}

        {/* ナビゲーション */}
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                  isNavCollapsed ? '-translate-x-full' : 'translate-x-0'
                }`
              : 'block'
          } ${isMobile ? '' : ''}`}
          role="navigation"
          aria-label="メインナビゲーション"
        >
          <Navigation 
            isCollapsed={isMobile ? false : isNavCollapsed} 
            onToggle={toggleNavigation}
          />
        </div>

        {/* メインコンテンツ */}
        <main
          id="main-content"
          className={`bg-white dark:bg-gray-900 ${
            isMobile ? 'col-span-1' : ''
          } focus:outline-none`}
          role="main"
          aria-label="メインコンテンツ"
          tabIndex={-1}
        >
          {/* パンくずリスト */}
          <Breadcrumb />
          
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>

        {/* フッター */}
        <footer 
          className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 ${
            isMobile ? 'col-span-1' : 'col-span-2'
          }`}
          role="contentinfo"
          aria-label="ページフッター"
        >
          <div className="space-y-2">
            {/* 基本情報 */}
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div>
                © 2024 障害者支援クライアント管理システム
              </div>
              <div>
                Version 1.0.0
              </div>
            </div>
            
            {/* 環境情報 */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
              <div data-testid="environment-info" className="flex items-center space-x-1">
                <span className="font-medium">環境:</span>
                <span>{process.env.NODE_ENV === 'production' ? '本番' : '開発'}</span>
              </div>
              
              <div data-testid="db-status" className="flex items-center space-x-1">
                <span className="font-medium">DB:</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  接続中
                </span>
              </div>
              
              <div data-testid="last-updated" className="flex items-center space-x-1">
                <span className="font-medium">最終更新:</span>
                <span>{new Date().toLocaleString('ja-JP', { 
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
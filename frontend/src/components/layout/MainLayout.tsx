import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Clock, LogOut, User } from 'lucide-react';
import { Navigation } from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
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
  loading = false 
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>管理者</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </header>

        {/* ナビゲーション */}
        <div 
          className={`${
            isMobile && isNavCollapsed 
              ? 'hidden' 
              : 'block'
          } ${isMobile ? 'col-span-1 row-start-2' : ''}`}
          role="navigation"
          aria-label="メインナビゲーション"
        >
          <Navigation 
            isCollapsed={isNavCollapsed} 
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
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div>
              © 2024 障害者支援クライアント管理システム
            </div>
            <div>
              Version 1.0.0
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Clipboard, FileText, ClipboardCheck, Settings } from 'lucide-react';

interface NavigationProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  testId: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'ダッシュボード',
    icon: <Home className="w-5 h-5" data-testid="home-icon" />,
    testId: 'nav-dashboard',
  },
  {
    path: '/clients',
    label: '利用者管理',
    icon: <Users className="w-5 h-5" data-testid="users-icon" />,
    testId: 'nav-clients',
  },
  {
    path: '/support-plans',
    label: '支援計画管理',
    icon: <Clipboard className="w-5 h-5" data-testid="clipboard-icon" />,
    testId: 'nav-plans',
  },
  {
    path: '/service-logs',
    label: 'サービス記録',
    icon: <FileText className="w-5 h-5" data-testid="file-text-icon" />,
    testId: 'nav-logs',
  },
  {
    path: '/assessments',
    label: '評価・アセスメント',
    icon: <ClipboardCheck className="w-5 h-5" data-testid="clipboard-check-icon" />,
    testId: 'nav-assessments',
  },
  {
    path: '/settings',
    label: '設定・管理',
    icon: <Settings className="w-5 h-5" data-testid="settings-icon" />,
    testId: 'nav-settings',
  },
];

export const Navigation: React.FC<NavigationProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  // アクティブ状態の判定
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // リンクのクラス名を生成
  const getLinkClassName = (path: string) => {
    const baseClasses = `
      flex items-center px-3 py-2 text-sm font-medium rounded-md
      transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
      ${isCollapsed ? 'justify-center' : 'justify-start'}
    `;

    if (isActive(path)) {
      return `${baseClasses} bg-blue-50 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200`;
    }

    return `${baseClasses} text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white`;
  };

  return (
    <nav 
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        high-contrast:border-white h-screen md:sticky md:top-0
        overflow-y-auto
      `}
      role="navigation"
      aria-label="メインナビゲーション"
      data-testid="navigation"
      data-collapsed={isCollapsed}
    >
      <div className="p-4">
        <ul role="list" className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path} role="listitem">
              <Link
                to={item.path}
                className={getLinkClassName(item.path)}
                data-testid={item.testId}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="ml-3 truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* 将来のサブメニュー領域 */}
        {!isCollapsed && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 mb-3">
              その他
            </div>
            <div className="space-y-1">
              {/* 将来のサブメニュー項目 */}
            </div>
          </div>
        )}

        {/* フッター情報 */}
        {!isCollapsed && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Ver 1.0.0</span>
                <button
                  onClick={onToggle}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="ナビゲーションを折りたたむ"
                  data-testid="nav-toggle"
                >
                  <span className="text-xs">←</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 折りたたみ時の展開ボタン */}
        {isCollapsed && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="ナビゲーションを展開"
              data-testid="nav-toggle"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
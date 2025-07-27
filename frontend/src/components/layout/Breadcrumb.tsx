import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  customLabels?: Record<string, string>;
}

const defaultLabels: Record<string, string> = {
  clients: '利用者管理',
  'support-plans': '支援計画管理',
  'service-logs': 'サービス記録',
  assessments: '評価・アセスメント',
  settings: '設定・管理',
  new: '新規登録',
  edit: '編集',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ customItems, customLabels }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // ホームページでは表示しない
  if (pathSegments.length === 0) {
    return null;
  }

  const labels = { ...defaultLabels, ...customLabels };

  // パスからパンくずリストアイテムを生成
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: 'ホーム', href: '/' }];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // 数字のセグメント（ID）の場合
      if (/^\d+$/.test(segment)) {
        // support-plansの下のIDの場合
        if (pathSegments[index - 1] === 'support-plans') {
          items.push({ label: '詳細', href: path });
        }
        // service-logsの下のIDの場合（編集ページへのパス）
        else if (pathSegments[index - 1] === 'service-logs') {
          // editが続く場合はリンクなし
          if (pathSegments[index + 1] === 'edit') {
            items.push({ label: '記録' });
          }
        }
        // assessmentsの下のIDの場合
        else if (pathSegments[index - 1] === 'assessments') {
          items.push({ label: '詳細', href: path });
        }
        // clientsの下のIDの場合
        else if (pathSegments[index - 1] === 'clients') {
          // 深い階層の場合の処理
          if (pathSegments[index + 1] && pathSegments[index + 1] === 'support-plans') {
            items.push({ label: '詳細', href: path });
          } else if (pathSegments[index + 1] === 'edit') {
            items.push({ label: '詳細', href: path });
          } else {
            items.push({ label: '詳細', href: index === pathSegments.length - 1 ? undefined : path });
          }
        }
        // その他のIDの場合
        else {
          items.push({ label: '詳細', href: index === pathSegments.length - 1 ? undefined : path });
        }
      }
      // 特別なパスの処理
      else if (segment === 'new') {
        const parentSegment = pathSegments[index - 1];
        if (parentSegment === 'support-plans' || parentSegment === 'service-logs') {
          items.push({ label: '新規作成' });
        } else {
          items.push({ label: labels[segment] || '新規登録' });
        }
      }
      else if (segment === 'edit') {
        items.push({ label: labels[segment] || '編集' });
      }
      // 深い階層での support-plans の処理
      else if (segment === 'support-plans' && index > 0) {
        items.push({ label: '支援計画' });
      }
      // 通常のセグメント
      else {
        const label = labels[segment] || segment;
        items.push({
          label,
          href: index === pathSegments.length - 1 ? undefined : path,
        });
      }
    });

    // カスタムアイテムがある場合は追加
    if (customItems) {
      items.push(...customItems);
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <nav
      aria-label="パンくずリスト"
      className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li aria-hidden="true" className="text-gray-400 dark:text-gray-500">
                ›
              </li>
            )}
            <li
              className={`flex items-center ${
                index === breadcrumbItems.length - 1
                  ? 'text-gray-600 dark:text-gray-400 font-medium'
                  : ''
              }`}
              aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
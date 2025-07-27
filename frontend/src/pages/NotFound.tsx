import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        {/* アイコン */}
        <div className="mb-8">
          <AlertCircle 
            className="w-24 h-24 text-gray-400 mx-auto"
            aria-hidden="true"
          />
        </div>

        {/* エラーコード */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>

        {/* エラーメッセージ */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          ページが見つかりません
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          お探しのページは存在しないか、移動した可能性があります。<br />
          URLを確認するか、ホームページに戻ってください。
        </p>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            ホームに戻る
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            前のページに戻る
          </button>
        </div>

        {/* ヘルプテキスト */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>よくアクセスされるページ：</p>
          <nav className="mt-2" aria-label="よくアクセスされるページ">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <li>
                <Link 
                  to="/clients" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  利用者管理
                </Link>
              </li>
              <li>
                <Link 
                  to="/support-plans" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  支援計画
                </Link>
              </li>
              <li>
                <Link 
                  to="/service-logs" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  サービス記録
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
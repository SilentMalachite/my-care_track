import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        ダッシュボード
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        ここにダッシュボードコンテンツが表示されます。
      </p>
    </div>
  );
};

export default Dashboard;
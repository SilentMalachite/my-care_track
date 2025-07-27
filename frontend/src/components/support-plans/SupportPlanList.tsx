import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, Edit, Trash2, Plus, Filter, ChevronDown } from 'lucide-react';
import { SupportPlan, SUPPORT_PLAN_STATUS_LABELS, SUPPORT_PLAN_PRIORITY_LABELS } from '../../types/supportPlan';

interface SupportPlanProgress {
  progressPercentage: number;
  isOverdue: boolean;
}

interface SupportPlanListProps {
  supportPlans: SupportPlan[];
  clientId: number;
  progress?: Record<number, SupportPlanProgress>;
  onEdit: (planId: number) => void;
  onDelete: (planId: number) => void;
  onStatusChange: (planIds: number[], newStatus: SupportPlan['status']) => void;
  onCreateNew?: () => void;
  confirmDelete?: boolean;
  allowBulkActions?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
}

type SortBy = 'default' | 'startDate' | 'endDate' | 'priority' | 'status' | 'progress';

export const SupportPlanList: React.FC<SupportPlanListProps> = ({
  supportPlans,
  clientId,
  progress,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateNew,
  confirmDelete = false,
  allowBulkActions = false,
  showFilters = false,
  showSort = false,
}) => {
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<SupportPlan['status'] | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<SupportPlan['priority'] | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState<SupportPlan['status']>('active');

  // フィルタリング
  const filteredPlans = useMemo(() => {
    let filtered = [...supportPlans];

    if (statusFilter) {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(plan => plan.priority === priorityFilter);
    }

    return filtered;
  }, [supportPlans, statusFilter, priorityFilter]);

  // ソート
  const sortedPlans = useMemo(() => {
    const sorted = [...filteredPlans];

    switch (sortBy) {
      case 'startDate':
        sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'endDate':
        sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'status':
        const statusOrder = { active: 0, pending: 1, completed: 2, cancelled: 3 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case 'progress':
        if (progress) {
          sorted.sort((a, b) => {
            const progressA = progress[a.id]?.progressPercentage || 0;
            const progressB = progress[b.id]?.progressPercentage || 0;
            return progressB - progressA;
          });
        }
        break;
    }

    return sorted;
  }, [filteredPlans, sortBy, progress]);

  // 日付フォーマット
  const formatDateRange = (startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // 期限チェック
  const getDeadlineWarning = (endDate: string, status: SupportPlan['status']) => {
    if (status === 'completed' || status === 'cancelled') return null;

    const end = new Date(endDate);
    const today = new Date();
    const daysUntilEnd = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd < 0) {
      return { type: 'overdue', message: '期限切れ', className: 'text-red-600' };
    } else if (daysUntilEnd <= 7) {
      return { type: 'warning', message: `期限まで${daysUntilEnd}日`, className: 'text-yellow-600' };
    }

    return null;
  };

  // ステータスバッジのスタイル
  const getStatusBadgeClass = (status: SupportPlan['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 優先度バッジのスタイル
  const getPriorityBadgeClass = (priority: SupportPlan['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 削除処理
  const handleDelete = (planId: number) => {
    if (confirmDelete) {
      setShowDeleteConfirm(planId);
    } else {
      onDelete(planId);
    }
  };

  const confirmDeleteAction = () => {
    if (showDeleteConfirm) {
      onDelete(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  // 一括選択
  const handleSelectPlan = (planId: number) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlans.length === sortedPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(sortedPlans.map(plan => plan.id));
    }
  };

  // 一括ステータス変更
  const handleBulkStatusChange = () => {
    onStatusChange(selectedPlans, bulkNewStatus);
    setSelectedPlans([]);
    setShowBulkStatusModal(false);
  };

  if (sortedPlans.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">支援計画がありません</p>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            新規計画作成
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">支援計画一覧</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* フィルター */}
          {showFilters && (
            <>
              <select
                aria-label="ステータス"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SupportPlan['status'] | '')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのステータス</option>
                {Object.entries(SUPPORT_PLAN_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                aria-label="優先度"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as SupportPlan['priority'] | '')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべての優先度</option>
                {Object.entries(SUPPORT_PLAN_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </>
          )}

          {/* ソート */}
          {showSort && (
            <select
              aria-label="並び順"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">デフォルト</option>
              <option value="startDate">開始日順</option>
              <option value="endDate">終了日順</option>
              <option value="priority">優先度順</option>
              <option value="status">ステータス順</option>
              {progress && <option value="progress">進捗率順</option>}
            </select>
          )}

          {/* 一括操作 */}
          {allowBulkActions && selectedPlans.length > 0 && (
            <button
              onClick={() => setShowBulkStatusModal(true)}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ステータス変更 ({selectedPlans.length})
            </button>
          )}

          {/* 新規作成ボタン */}
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              新規計画作成
            </button>
          )}
        </div>
      </div>

      {/* 一括選択チェックボックス */}
      {allowBulkActions && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedPlans.length === sortedPlans.length && sortedPlans.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="select-all">すべて選択</label>
        </div>
      )}

      {/* 計画リスト */}
      <ul 
        role="list" 
        aria-label="支援計画一覧"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4"
      >
        {sortedPlans.map((plan) => {
          const planProgress = progress?.[plan.id];
          const deadlineWarning = getDeadlineWarning(plan.endDate, plan.status);

          return (
            <li key={plan.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {/* チェックボックス */}
                      {allowBulkActions && (
                        <input
                          type="checkbox"
                          checked={selectedPlans.includes(plan.id)}
                          onChange={() => handleSelectPlan(plan.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`${plan.planName}を選択`}
                        />
                      )}

                      <div className="flex-1">
                        {/* タイトルと詳細リンク */}
                        <Link
                          to={`/support-plans/${plan.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 focus:outline-none focus:underline"
                          data-testid="plan-name"
                        >
                          {plan.planName}
                        </Link>

                        {/* バッジ */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(plan.status)}`}>
                            {SUPPORT_PLAN_STATUS_LABELS[plan.status]}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(plan.priority)}`}>
                            {SUPPORT_PLAN_PRIORITY_LABELS[plan.priority]}
                          </span>
                          {deadlineWarning && (
                            <span 
                              className={`inline-flex items-center gap-1 text-xs font-medium ${deadlineWarning.className}`}
                              data-testid={deadlineWarning.type === 'overdue' ? 'overdue-warning' : 'deadline-warning'}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {deadlineWarning.message}
                            </span>
                          )}
                        </div>

                        {/* 期間 */}
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
                        </div>

                        {/* 目標 */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            目標: {plan.goals.slice(0, 2).join('、')}
                            {plan.goals.length > 2 && ` 他${plan.goals.length - 2}件`}
                          </p>
                        </div>

                        {/* 進捗バー */}
                        {planProgress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">進捗</span>
                              <span className="font-medium">{planProgress.progressPercentage}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  planProgress.progressPercentage === 100
                                    ? 'bg-green-600'
                                    : planProgress.progressPercentage >= 70
                                    ? 'bg-blue-600'
                                    : planProgress.progressPercentage >= 30
                                    ? 'bg-yellow-600'
                                    : 'bg-red-600'
                                }`}
                                style={{ width: `${planProgress.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* 備考 */}
                        {plan.notes && (
                          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{plan.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEdit(plan.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">削除確認</h3>
            <p className="text-gray-600 mb-6">
              この支援計画を削除してもよろしいですか？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 一括ステータス変更モーダル */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">ステータス一括変更</h3>
            <p className="text-gray-600 mb-4">
              選択した{selectedPlans.length}件の支援計画のステータスを変更します。
            </p>
            <div className="mb-6">
              <label htmlFor="bulk-status" className="block text-sm font-medium text-gray-700 mb-2">
                新しいステータス
              </label>
              <select
                id="bulk-status"
                value={bulkNewStatus}
                onChange={(e) => setBulkNewStatus(e.target.value as SupportPlan['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SUPPORT_PLAN_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkStatusChange}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                変更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
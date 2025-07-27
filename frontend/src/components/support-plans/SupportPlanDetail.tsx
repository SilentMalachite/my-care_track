import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Target, Clock, FileText, Edit, Trash2, Download, AlertCircle, Check } from 'lucide-react';
import { SupportPlan, SUPPORT_PLAN_STATUS_LABELS, SUPPORT_PLAN_PRIORITY_LABELS } from '../../types/supportPlan';
import { ServiceLog } from '../../types/serviceLog';

interface SupportPlanProgress {
  planId: number;
  totalGoals: number;
  completedGoals: number;
  progressPercentage: number;
  daysElapsed: number;
  totalDays: number;
  timeProgressPercentage: number;
  isOverdue: boolean;
}

interface StaffInfo {
  [key: number]: {
    name: string;
    role: string;
  };
}

interface SupportPlanDetailProps {
  supportPlan: SupportPlan;
  progress?: SupportPlanProgress;
  serviceLogs?: ServiceLog[];
  staffInfo?: StaffInfo;
  onEdit: (planId: number) => void;
  onDelete: (planId: number) => void;
  onStatusChange: (planId: number, newStatus: SupportPlan['status']) => void;
  onGoalCheck?: (goalIndex: number, checked: boolean) => void;
  onExport?: (planId: number, format: string) => void;
  confirmDelete?: boolean;
  allowGoalCheck?: boolean;
}

type TabType = 'basic' | 'serviceLogs' | 'staff';

export const SupportPlanDetail: React.FC<SupportPlanDetailProps> = ({
  supportPlan,
  progress,
  serviceLogs,
  staffInfo,
  onEdit,
  onDelete,
  onStatusChange,
  onGoalCheck,
  onExport,
  confirmDelete = false,
  allowGoalCheck = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<SupportPlan['status']>(supportPlan.status);
  const [goalCheckStates, setGoalCheckStates] = useState<boolean[]>(
    new Array(supportPlan.goals.length).fill(false)
  );

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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

  // 期限チェック
  const getDeadlineWarning = () => {
    if (supportPlan.status === 'completed' || supportPlan.status === 'cancelled') return null;

    const end = new Date(supportPlan.endDate);
    const today = new Date();
    const daysUntilEnd = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd < 0) {
      return { type: 'overdue', message: '期限切れ', className: 'bg-red-50 border-red-200' };
    } else if (daysUntilEnd <= 7) {
      return { type: 'warning', message: `期限まで${daysUntilEnd}日`, className: 'bg-yellow-50 border-yellow-200' };
    }

    return null;
  };

  // 削除処理
  const handleDelete = () => {
    if (confirmDelete) {
      setShowDeleteConfirm(true);
    } else {
      onDelete(supportPlan.id);
    }
  };

  const confirmDeleteAction = () => {
    onDelete(supportPlan.id);
    setShowDeleteConfirm(false);
  };

  // ステータス変更処理
  const handleStatusChange = () => {
    onStatusChange(supportPlan.id, newStatus);
    setShowStatusModal(false);
  };

  // 目標チェック処理
  const handleGoalCheck = (index: number) => {
    const newState = !goalCheckStates[index];
    setGoalCheckStates(prev => {
      const updated = [...prev];
      updated[index] = newState;
      return updated;
    });
    if (onGoalCheck) {
      onGoalCheck(index, newState);
    }
  };

  const deadlineWarning = getDeadlineWarning();

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supportPlan.planName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(supportPlan.status)}`}>
                {SUPPORT_PLAN_STATUS_LABELS[supportPlan.status]}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(supportPlan.priority)}`}>
                {SUPPORT_PLAN_PRIORITY_LABELS[supportPlan.priority]}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(supportPlan.startDate, supportPlan.endDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(supportPlan.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="編集"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="削除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ステータス変更
            </button>
            {onExport && (
              <button
                onClick={() => onExport(supportPlan.id, 'pdf')}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-1" />
                PDFエクスポート
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 期限警告 */}
      {deadlineWarning && (
        <div 
          className={`mx-6 mt-4 p-4 border rounded-lg flex items-center gap-2 ${deadlineWarning.className}`}
          data-testid="deadline-alert"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="font-medium">{deadlineWarning.message}</span>
        </div>
      )}

      {/* タブ */}
      <div className="border-b">
        <nav className="flex" role="tablist" aria-label="計画詳細タブ">
          <button
            role="tab"
            aria-selected={activeTab === 'basic'}
            aria-controls="basic-panel"
            onClick={() => setActiveTab('basic')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && serviceLogs) {
                setActiveTab('serviceLogs');
                setTimeout(() => {
                  const serviceLogsTab = document.querySelector('[aria-controls="serviceLogs-panel"]');
                  (serviceLogsTab as HTMLElement)?.focus();
                }, 0);
              }
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基本情報
          </button>
          {serviceLogs && (
            <button
              role="tab"
              aria-selected={activeTab === 'serviceLogs'}
              aria-controls="serviceLogs-panel"
              onClick={() => setActiveTab('serviceLogs')}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  setActiveTab('basic');
                } else if (e.key === 'ArrowRight' && staffInfo) {
                  setActiveTab('staff');
                } else if (e.key === 'Enter') {
                  setActiveTab('serviceLogs');
                }
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                activeTab === 'serviceLogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              サービス記録
            </button>
          )}
          {staffInfo && (
            <button
              role="tab"
              aria-selected={activeTab === 'staff'}
              aria-controls="staff-panel"
              onClick={() => setActiveTab('staff')}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  setActiveTab(serviceLogs ? 'serviceLogs' : 'basic');
                }
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                activeTab === 'staff'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              スタッフ情報
            </button>
          )}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div 
        className="p-6 flex flex-col lg:flex-row gap-6" 
        data-testid="plan-detail-container"
      >
        {/* 基本情報タブ */}
        <div 
          id="basic-panel" 
          role="tabpanel" 
          aria-labelledby="basic-tab" 
          className="flex-1"
          style={{ display: activeTab === 'basic' ? 'block' : 'none' }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          
          {/* 進捗状況 */}
          {progress && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">進捗状況</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">目標達成率</span>
                  <span className="font-medium">{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress.progressPercentage === 100
                        ? 'bg-green-600'
                        : progress.progressPercentage >= 70
                        ? 'bg-blue-600'
                        : progress.progressPercentage >= 30
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">達成目標数</span>
                  <span>{progress.completedGoals}/{progress.totalGoals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">経過日数</span>
                  <span>{progress.daysElapsed}日経過 / 全{progress.totalDays}日</span>
                </div>
              </div>
            </div>
          )}

          {/* 目標リスト */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">目標リスト</h3>
            <ul className="space-y-2">
              {supportPlan.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-3">
                  {allowGoalCheck && onGoalCheck ? (
                    <input
                      type="checkbox"
                      checked={goalCheckStates[index]}
                      onChange={() => handleGoalCheck(index)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`目標「${goal}」を達成済みにする`}
                    />
                  ) : (
                    <Target className="w-4 h-4 text-gray-400 mt-0.5" />
                  )}
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* レビュー情報 */}
          {supportPlan.reviewDate && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">レビュー情報</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">レビュー日：</span>
                  <span>{formatDate(supportPlan.reviewDate)}</span>
                </div>
                {supportPlan.reviewNotes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    {supportPlan.reviewNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 備考 */}
          {supportPlan.notes && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">備考</h3>
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {supportPlan.notes}
              </div>
            </div>
          )}
        </div>

        {/* サービス記録タブ */}
        <div 
          id="serviceLogs-panel" 
          role="tabpanel" 
          aria-labelledby="serviceLogs-tab" 
          className="flex-1"
          style={{ display: activeTab === 'serviceLogs' ? 'block' : 'none' }}
        >
          {serviceLogs && serviceLogs.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">サービス記録</h2>
              <div className="space-y-4">
                {serviceLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{formatDate(log.serviceDate)}</span>
                          <span className="text-sm text-gray-600">
                            {log.startTime} - {log.endTime}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.status === 'approved' ? 'bg-green-100 text-green-800' :
                        log.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status === 'approved' ? '承認済' :
                         log.status === 'confirmed' ? '確認済' :
                         '下書き'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{log.content}</p>
                    {log.nextAction && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">次回対応：</span> {log.nextAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* スタッフ情報タブ */}
        <div 
          id="staff-panel" 
          role="tabpanel" 
          aria-labelledby="staff-tab" 
          className="flex-1"
          style={{ display: activeTab === 'staff' ? 'block' : 'none' }}
        >
          {staffInfo && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">スタッフ情報</h2>
              <div className="space-y-3">
                {supportPlan.assignedStaffIds.map((staffId) => {
                  const staff = staffInfo[staffId];
                  if (!staff) return null;
                  
                  return (
                    <div key={staffId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-10 h-10 text-gray-400 bg-white rounded-full p-2" />
                      <div>
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600">{staff.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

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
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ステータス変更モーダル */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">ステータス変更</h3>
            <div className="mb-6">
              <label htmlFor="new-status" className="block text-sm font-medium text-gray-700 mb-2">
                新しいステータス
              </label>
              <select
                id="new-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as SupportPlan['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SUPPORT_PLAN_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleStatusChange}
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
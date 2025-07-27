import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PencilIcon, TrashIcon, CheckCircleIcon } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { ASSESSMENT_TYPES, ASSESSMENT_STATUS } from '../../types/assessment';

interface AssessmentListProps {
  assessments: Assessment[];
  clients: Record<number, { name: string }>;
  staff: Record<number, { name: string }>;
  onDelete: (id: number) => void;
  onStatusChange: (ids: number[], status: Assessment['status']) => void;
  onFinalize: (id: number) => void;
}

export function AssessmentList({
  assessments,
  clients,
  staff,
  onDelete,
  onStatusChange,
  onFinalize,
}: AssessmentListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [batchStatus, setBatchStatus] = useState<Assessment['status'] | ''>('');

  // フィルタリングとソート
  const filteredAndSortedAssessments = useMemo(() => {
    let filtered = assessments;

    if (filterStatus) {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }
    if (filterType) {
      filtered = filtered.filter((a) => a.assessmentType === filterType);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime();
        case 'date_desc':
          return new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime();
        case 'score_asc':
          return (a.overallScore || 0) - (b.overallScore || 0);
        case 'score_desc':
          return (b.overallScore || 0) - (a.overallScore || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [assessments, filterStatus, filterType, sortBy]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAndSortedAssessments.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatusChange = () => {
    if (selectedIds.length > 0 && batchStatus) {
      onStatusChange(selectedIds, batchStatus);
      setSelectedIds([]);
      setBatchStatus('');
    }
  };

  const handleDelete = (id: number) => {
    onDelete(id);
    setShowDeleteConfirm(null);
  };

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">評価・アセスメントがありません</p>
        <Link
          to="/assessments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">評価・アセスメント一覧</h2>
        <Link
          to="/assessments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">すべて</option>
            {Object.entries(ASSESSMENT_STATUS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">
            種別
          </label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">すべて</option>
            {Object.entries(ASSESSMENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
            並び順
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="date_desc">評価日（新しい順）</option>
            <option value="date_asc">評価日（古い順）</option>
            <option value="score_desc">スコア（高い順）</option>
            <option value="score_asc">スコア（低い順）</option>
          </select>
        </div>
      </div>

      {/* バッチ操作 */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 rounded-md flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {selectedIds.length}件選択中
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="batchStatus" className="text-sm font-medium text-gray-700">
              ステータス変更
            </label>
            <select
              id="batchStatus"
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value as Assessment['status'] | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">選択してください</option>
              {Object.entries(ASSESSMENT_STATUS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleBatchStatusChange}
              disabled={!batchStatus}
              className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              適用
            </button>
          </div>
        </div>
      )}

      {/* リスト */}
      <ul className="divide-y divide-gray-200" role="list" aria-label="評価・アセスメント一覧">
        <li className="bg-gray-50 px-6 py-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredAndSortedAssessments.length && selectedIds.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              aria-label="すべて選択"
            />
            <div className="ml-4 flex-1 grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>クライアント</span>
              <span>種別</span>
              <span>評価日</span>
              <span>スコア</span>
              <span>ステータス</span>
              <span className="text-right">操作</span>
            </div>
          </div>
        </li>

        {filteredAndSortedAssessments.map((assessment) => (
          <li
            key={assessment.id}
            className="px-6 py-4 hover:bg-gray-50"
            aria-label={`${clients[assessment.clientId]?.name || 'クライアント不明'}の${
              ASSESSMENT_TYPES[assessment.assessmentType]
            }アセスメント`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(assessment.id)}
                onChange={() => handleSelect(assessment.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                aria-label={`${assessment.id}を選択`}
              />
              <div className="ml-4 flex-1 grid grid-cols-6 gap-4 items-center">
                <div>
                  <Link
                    to={`/assessments/${assessment.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    {clients[assessment.clientId]?.name || 'クライアント不明'}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.summary || 'サマリーなし'}
                  </p>
                </div>
                <span className="text-sm text-gray-900">
                  {ASSESSMENT_TYPES[assessment.assessmentType]}
                </span>
                <span className="text-sm text-gray-900">
                  {new Date(assessment.assessmentDate).toLocaleDateString('ja-JP')}
                </span>
                <span className="text-sm text-gray-900">
                  {assessment.overallScore || '-'}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    assessment.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : assessment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {ASSESSMENT_STATUS[assessment.status]}
                </span>
                <div className="flex items-center justify-end gap-2">
                  {assessment.status === 'pending' && (
                    <button
                      onClick={() => onFinalize(assessment.id)}
                      className="text-green-600 hover:text-green-900"
                      title="承認"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="sr-only">承認</span>
                    </button>
                  )}
                  <Link
                    to={`/assessments/${assessment.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="sr-only">編集</span>
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(assessment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="sr-only">削除</span>
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              このアセスメントを削除してもよろしいですか？
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
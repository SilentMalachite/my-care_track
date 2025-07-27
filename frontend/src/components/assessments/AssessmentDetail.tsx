import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, PrinterIcon, CheckCircleIcon } from 'lucide-react';
import type { Assessment } from '../../types/assessment';
import { ASSESSMENT_TYPES, ASSESSMENT_STATUS } from '../../types/assessment';

interface AssessmentDetailProps {
  assessment: Assessment;
  client: { id: number; name: string };
  staff: { id: number; name: string };
  supportPlan?: { id: number; planName: string };
  onDelete: (id: number) => void;
  onFinalize: (id: number) => void;
}

export function AssessmentDetail({
  assessment,
  client,
  staff,
  supportPlan,
  onDelete,
  onFinalize,
}: AssessmentDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    onDelete(assessment.id);
    setShowDeleteConfirm(false);
  };

  const isEditable = assessment.status !== 'approved';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow print:shadow-none">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {ASSESSMENT_TYPES[assessment.assessmentType]}アセスメント
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            作成日: {new Date(assessment.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            印刷
          </button>
          {assessment.status === 'pending' && (
            <button
              onClick={() => onFinalize(assessment.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              承認する
            </button>
          )}
          {isEditable && (
            <>
              <Link
                to={`/assessments/${assessment.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                編集
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                削除
              </button>
            </>
          )}
        </div>
      </div>

      {/* ステータスバッジ */}
      <div className="mb-6">
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            assessment.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : assessment.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {ASSESSMENT_STATUS[assessment.status]}
        </span>
      </div>

      {/* 基本情報 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">クライアント</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">担当スタッフ</dt>
            <dd className="mt-1 text-sm text-gray-900">{staff.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">評価日</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(assessment.assessmentDate).toLocaleDateString('ja-JP')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">支援計画</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {supportPlan?.planName || '-'}
            </dd>
          </div>
        </dl>
      </section>

      {/* 総合評価スコア */}
      {assessment.overallScore && (
        <section className="mb-8">
          <div className="bg-indigo-50 rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-indigo-600 mb-2">総合評価スコア</p>
            <p className="text-4xl font-bold text-indigo-900">{assessment.overallScore}</p>
            <p className="text-sm text-indigo-600 mt-2">/ 100</p>
          </div>
        </section>
      )}

      {/* 評価内容 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">評価内容</h2>
        
        {/* サマリー */}
        {assessment.summary && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">評価サマリー</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.summary}</p>
          </div>
        )}

        {/* カテゴリ別スコア */}
        {assessment.categoryScores && Object.keys(assessment.categoryScores).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">カテゴリ別評価</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(assessment.categoryScores).map(([category, score]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">{category}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{score}点</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 強み */}
        {assessment.strengths && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">強み・できること</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.strengths}</p>
          </div>
        )}

        {/* 課題 */}
        {assessment.challenges && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">課題・困難なこと</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.challenges}</p>
          </div>
        )}

        {/* 推奨事項 */}
        {assessment.recommendations && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">推奨事項・支援方針</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.recommendations}</p>
          </div>
        )}

        {/* 目標 */}
        {assessment.goals && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">目標</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.goals}</p>
          </div>
        )}

        {/* 備考 */}
        {assessment.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">備考</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{assessment.notes}</p>
          </div>
        )}
      </section>

      {/* 承認情報 */}
      {assessment.status === 'approved' && assessment.finalizedAt && (
        <section className="border-t pt-4 mt-8 print:block">
          <p className="text-sm text-gray-500">
            承認日: {new Date(assessment.finalizedAt).toLocaleDateString('ja-JP')}
          </p>
        </section>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              このアセスメントを削除してもよろしいですか？
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              この操作は取り消すことができません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
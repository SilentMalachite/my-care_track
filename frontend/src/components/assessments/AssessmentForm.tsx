import { useState, useEffect } from 'react';
import type { Assessment, AssessmentFormData, ASSESSMENT_CATEGORIES } from '../../types/assessment';

interface AssessmentFormProps {
  assessment?: Assessment;
  isEditMode?: boolean;
  onSubmit: (data: AssessmentFormData, id?: number) => void;
  onCancel: () => void;
  clients: Array<{ id: number; name: string }>;
  staff: Array<{ id: number; name: string }>;
  supportPlans: Array<{ id: number; planName: string }>;
}

export function AssessmentForm({
  assessment,
  isEditMode = false,
  onSubmit,
  onCancel,
  clients,
  staff,
  supportPlans,
}: AssessmentFormProps) {
  const [formData, setFormData] = useState<AssessmentFormData>({
    clientId: assessment?.clientId || 0,
    staffId: assessment?.staffId || 0,
    supportPlanId: assessment?.supportPlanId,
    assessmentType: assessment?.assessmentType || '',
    assessmentDate: assessment?.assessmentDate || '',
    summary: assessment?.summary || '',
    overallScore: assessment?.overallScore,
    categoryScores: assessment?.categoryScores || {},
    strengths: assessment?.strengths || '',
    challenges: assessment?.challenges || '',
    recommendations: assessment?.recommendations || '',
    goals: assessment?.goals || '',
    status: assessment?.status || 'draft',
    notes: assessment?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isApproved = assessment?.status === 'approved';

  const categories: readonly string[] = ['身体機能', '認知機能', '社会参加', '日常生活動作', 'コミュニケーション'];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'クライアントは必須です';
    }
    if (!formData.staffId) {
      newErrors.staffId = '担当スタッフは必須です';
    }
    if (!formData.assessmentType) {
      newErrors.assessmentType = 'アセスメント種別は必須です';
    }
    if (!formData.assessmentDate) {
      newErrors.assessmentDate = '評価日は必須です';
    }
    if (formData.overallScore && (formData.overallScore < 1 || formData.overallScore > 100)) {
      newErrors.overallScore = 'スコアは1から100の間で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData, assessment?.id);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'clientId' || name === 'staffId' || name === 'supportPlanId' || name === 'overallScore'
        ? value ? Number(value) : undefined
        : value,
    }));
  };

  const handleCategoryScoreChange = (category: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryScores: {
        ...prev.categoryScores,
        [category]: value ? Number(value) : undefined,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? '評価・アセスメント編集' : '評価・アセスメント新規作成'}
      </h2>

      {isApproved && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">承認済みのアセスメントは編集できません</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="評価・アセスメント登録フォーム"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* クライアント */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              クライアント *
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              disabled={isApproved || isEditMode}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-required="true"
            >
              <option value="">選択してください</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
            )}
          </div>

          {/* 担当スタッフ */}
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
              担当スタッフ *
            </label>
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              disabled={isApproved}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-required="true"
            >
              <option value="">選択してください</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.staffId && (
              <p className="mt-1 text-sm text-red-600">{errors.staffId}</p>
            )}
          </div>

          {/* 支援計画 */}
          <div>
            <label htmlFor="supportPlanId" className="block text-sm font-medium text-gray-700">
              支援計画
            </label>
            <select
              id="supportPlanId"
              name="supportPlanId"
              value={formData.supportPlanId || ''}
              onChange={handleChange}
              disabled={isApproved}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">選択してください</option>
              {supportPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.planName}
                </option>
              ))}
            </select>
          </div>

          {/* アセスメント種別 */}
          <div>
            <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700">
              アセスメント種別 *
            </label>
            <select
              id="assessmentType"
              name="assessmentType"
              value={formData.assessmentType}
              onChange={handleChange}
              disabled={isApproved}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-required="true"
            >
              <option value="">選択してください</option>
              <option value="initial">初回</option>
              <option value="periodic">定期</option>
              <option value="annual">年次</option>
              <option value="discharge">終了時</option>
            </select>
            {errors.assessmentType && (
              <p className="mt-1 text-sm text-red-600">{errors.assessmentType}</p>
            )}
          </div>

          {/* 評価日 */}
          <div>
            <label htmlFor="assessmentDate" className="block text-sm font-medium text-gray-700">
              評価日 *
            </label>
            <input
              type="date"
              id="assessmentDate"
              name="assessmentDate"
              value={formData.assessmentDate}
              onChange={handleChange}
              disabled={isApproved}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              aria-required="true"
            />
            {errors.assessmentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.assessmentDate}</p>
            )}
          </div>

          {/* 総合評価スコア */}
          <div>
            <label htmlFor="overallScore" className="block text-sm font-medium text-gray-700">
              総合評価スコア
            </label>
            <input
              type="number"
              id="overallScore"
              name="overallScore"
              value={formData.overallScore || ''}
              onChange={handleChange}
              disabled={isApproved}
              min="1"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.overallScore && (
              <p className="mt-1 text-sm text-red-600">{errors.overallScore}</p>
            )}
          </div>
        </div>

        {/* カテゴリスコア */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">カテゴリ別評価</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category}>
                <label htmlFor={category} className="block text-sm font-medium text-gray-700">
                  {category}
                </label>
                <input
                  type="number"
                  id={category}
                  value={formData.categoryScores?.[category] || ''}
                  onChange={(e) => handleCategoryScoreChange(category, e.target.value)}
                  disabled={isApproved}
                  min="1"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 評価サマリー */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            評価サマリー
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* 強み */}
        <div>
          <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">
            強み・できること
          </label>
          <textarea
            id="strengths"
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* 課題 */}
        <div>
          <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
            課題・困難なこと
          </label>
          <textarea
            id="challenges"
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* 推奨事項 */}
        <div>
          <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">
            推奨事項・支援方針
          </label>
          <textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* 目標 */}
        <div>
          <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
            目標
          </label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* 備考 */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            備考
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={isApproved}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            キャンセル
          </button>
          {!isApproved && (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditMode ? '更新' : '保存'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
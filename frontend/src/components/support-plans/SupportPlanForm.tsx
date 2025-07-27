import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Client } from '../../types/client';
import { SupportPlan, CreateSupportPlanRequest, UpdateSupportPlanRequest, SUPPORT_PLAN_STATUS_LABELS, SUPPORT_PLAN_PRIORITY_LABELS } from '../../types/supportPlan';

interface StaffInfo {
  id: number;
  name: string;
  role: string;
}

interface SupportPlanFormProps {
  client: Client;
  supportPlan?: SupportPlan;
  staffList: StaffInfo[];
  onSubmit: (data: CreateSupportPlanRequest | UpdateSupportPlanRequest) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  planName: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low' | '';
  assignedStaffIds: number[];
  notes: string;
}

interface FormErrors {
  planName?: string;
  goals?: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
  assignedStaffIds?: string;
  goalErrors?: { [key: number]: string };
  general?: string;
}

const initialFormData: FormData = {
  planName: '',
  goals: [''],
  startDate: '',
  endDate: '',
  status: 'active',
  priority: '',
  assignedStaffIds: [],
  notes: '',
};

export const SupportPlanForm: React.FC<SupportPlanFormProps> = ({
  client,
  supportPlan,
  staffList,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const isEditMode = !!supportPlan;

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (supportPlan) {
      setFormData({
        planName: supportPlan.planName,
        goals: supportPlan.goals.length > 0 ? supportPlan.goals : [''],
        startDate: supportPlan.startDate,
        endDate: supportPlan.endDate,
        status: supportPlan.status,
        priority: supportPlan.priority,
        assignedStaffIds: supportPlan.assignedStaffIds,
        notes: supportPlan.notes || '',
      });
    }
  }, [supportPlan]);

  // バリデーション関数
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'planName':
        if (!value) return '計画名は必須です';
        if (value.length > 100) return '計画名は100文字以内で入力してください';
        return undefined;
      case 'startDate':
        return !value ? '開始日は必須です' : undefined;
      case 'endDate':
        if (!value) return '終了日は必須です';
        if (formData.startDate && value < formData.startDate) {
          return '終了日は開始日以降の日付を指定してください';
        }
        return undefined;
      case 'priority':
        return !value ? '優先度は必須です' : undefined;
      default:
        return undefined;
    }
  };

  // フォーム全体のバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const goalErrors: { [key: number]: string } = {};

    // 基本フィールドのバリデーション
    Object.keys(formData).forEach((key) => {
      if (key !== 'goals' && key !== 'assignedStaffIds' && key !== 'notes' && key !== 'status') {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

    // 目標のバリデーション
    const filledGoals = formData.goals.filter(goal => goal.trim());
    if (filledGoals.length === 0) {
      newErrors.goals = '少なくとも1つの目標を入力してください';
    } else {
      formData.goals.forEach((goal, index) => {
        if (!goal.trim()) {
          goalErrors[index] = `目標${index + 1}を入力してください`;
        }
      });
    }

    // 担当スタッフのバリデーション
    if (formData.assignedStaffIds.length === 0) {
      newErrors.assignedStaffIds = '少なくとも1人の担当スタッフを選択してください';
    }

    if (Object.keys(goalErrors).length > 0) {
      newErrors.goalErrors = goalErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 入力値変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // リアルタイムバリデーション
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error, general: undefined }));
    
    setShowReset(true);
  };

  // フォーカスアウト時のバリデーション
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error, general: undefined }));
  };

  // 目標変更ハンドラ
  const handleGoalChange = (index: number, value: string) => {
    setFormData(prev => {
      const newGoals = [...prev.goals];
      newGoals[index] = value;
      return { ...prev, goals: newGoals };
    });

    // エラーをクリア
    if (value.trim()) {
      setErrors(prev => ({
        ...prev,
        goals: undefined,
        goalErrors: prev.goalErrors ? { ...prev.goalErrors, [index]: undefined } : undefined,
      }));
    }

    setShowReset(true);
  };

  // 目標追加ハンドラ
  const handleAddGoal = () => {
    if (formData.goals.length < 10) {
      setFormData(prev => ({ ...prev, goals: [...prev.goals, ''] }));
    }
  };

  // 目標削除ハンドラ
  const handleRemoveGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));

    // エラーも削除
    setErrors(prev => {
      if (prev.goalErrors) {
        const newGoalErrors = { ...prev.goalErrors };
        delete newGoalErrors[index];
        // インデックスを調整
        const adjustedErrors: { [key: number]: string } = {};
        Object.keys(newGoalErrors).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum > index) {
            adjustedErrors[keyNum - 1] = newGoalErrors[keyNum];
          } else {
            adjustedErrors[keyNum] = newGoalErrors[keyNum];
          }
        });
        return { ...prev, goalErrors: Object.keys(adjustedErrors).length > 0 ? adjustedErrors : undefined };
      }
      return prev;
    });
  };

  // スタッフ選択ハンドラ
  const handleStaffToggle = (staffId: number) => {
    setFormData(prev => {
      const isSelected = prev.assignedStaffIds.includes(staffId);
      const newStaffIds = isSelected
        ? prev.assignedStaffIds.filter(id => id !== staffId)
        : [...prev.assignedStaffIds, staffId];
      
      return { ...prev, assignedStaffIds: newStaffIds };
    });

    // エラーをクリア
    setErrors(prev => ({ ...prev, assignedStaffIds: undefined }));
    setShowReset(true);
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submitData: CreateSupportPlanRequest | UpdateSupportPlanRequest = {
        clientId: client.id,
        planName: formData.planName,
        goals: formData.goals.filter(goal => goal.trim()),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        priority: formData.priority as 'high' | 'medium' | 'low',
        assignedStaffIds: formData.assignedStaffIds,
        notes: formData.notes || undefined,
      };

      if (isEditMode && supportPlan) {
        (submitData as UpdateSupportPlanRequest).id = supportPlan.id;
      }

      await onSubmit(submitData);
    } catch (error) {
      setErrors({ general: '送信中にエラーが発生しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームリセットハンドラ
  const handleReset = () => {
    setFormData(supportPlan ? {
      planName: supportPlan.planName,
      goals: supportPlan.goals.length > 0 ? supportPlan.goals : [''],
      startDate: supportPlan.startDate,
      endDate: supportPlan.endDate,
      status: supportPlan.status,
      priority: supportPlan.priority,
      assignedStaffIds: supportPlan.assignedStaffIds,
      notes: supportPlan.notes || '',
    } : initialFormData);
    setErrors({});
    setShowReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? '支援計画編集' : '支援計画新規作成'}
      </h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-medium text-gray-800">
          利用者: {client.name} 様
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:grid-cols-1"
        role="form"
        aria-label="支援計画登録フォーム"
      >
        {/* 全体エラーメッセージ */}
        {errors.general && (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-md p-4" role="alert">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        {/* 基本情報セクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">基本情報</h3>
        </div>

        {/* 計画名 */}
        <div className="col-span-full">
          <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">
            計画名 *
          </label>
          <input
            type="text"
            id="planName"
            name="planName"
            value={formData.planName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.planName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.planName}
            aria-describedby={errors.planName ? 'planName-error' : undefined}
          />
          {errors.planName && (
            <p id="planName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.planName}
            </p>
          )}
        </div>

        {/* 開始日 */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            開始日 *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? 'startDate-error' : undefined}
          />
          {errors.startDate && (
            <p id="startDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.startDate}
            </p>
          )}
        </div>

        {/* 終了日 */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            終了日 *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.endDate}
            aria-describedby={errors.endDate ? 'endDate-error' : undefined}
          />
          {errors.endDate && (
            <p id="endDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.endDate}
            </p>
          )}
        </div>

        {/* 優先度 */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            優先度 *
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.priority ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.priority}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
          >
            <option value="">選択してください</option>
            {Object.entries(SUPPORT_PLAN_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.priority && (
            <p id="priority-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.priority}
            </p>
          )}
        </div>

        {/* ステータス */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(SUPPORT_PLAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* 目標設定セクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">目標設定</h3>
          {errors.goals && (
            <p className="mb-2 text-sm text-red-600" role="alert">
              {errors.goals}
            </p>
          )}
        </div>

        <div className="col-span-full space-y-3">
          {formData.goals.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <label htmlFor={`goal-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  目標 {index + 1}
                </label>
                <input
                  type="text"
                  id={`goal-${index}`}
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.goalErrors?.[index] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-invalid={!!errors.goalErrors?.[index]}
                  aria-describedby={errors.goalErrors?.[index] ? `goal-${index}-error` : undefined}
                />
                {errors.goalErrors?.[index] && (
                  <p id={`goal-${index}-error`} className="mt-1 text-sm text-red-600" role="alert">
                    {errors.goalErrors[index]}
                  </p>
                )}
              </div>
              {formData.goals.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddGoal}
            disabled={formData.goals.length >= 10}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.goals.length >= 10
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            目標を追加
          </button>
        </div>

        {/* 担当スタッフセクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">担当スタッフ</h3>
          {errors.assignedStaffIds && (
            <p className="mb-2 text-sm text-red-600" role="alert">
              {errors.assignedStaffIds}
            </p>
          )}
        </div>

        <div className="col-span-full">
          <div className="space-y-2">
            {staffList.map((staff) => (
              <label key={staff.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.assignedStaffIds.includes(staff.id)}
                  onChange={() => handleStaffToggle(staff.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={staff.name}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{staff.name}</div>
                  <div className="text-sm text-gray-600">{staff.role}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 備考 */}
        <div className="col-span-full">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ボタン群 */}
        <div className="col-span-full flex justify-end space-x-4 pt-6 border-t">
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              リセット
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting 
              ? (isEditMode ? '更新中...' : '登録中...') 
              : (isEditMode ? '更新' : '登録')
            }
          </button>
        </div>
      </form>
    </div>
  );
};
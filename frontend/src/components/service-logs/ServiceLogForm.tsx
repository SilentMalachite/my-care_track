import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Client } from '../../types/client';
import { SupportPlan } from '../../types/supportPlan';
import { ServiceLog, CreateServiceLogRequest, UpdateServiceLogRequest, SERVICE_LOG_TYPE_LABELS, SERVICE_LOG_STATUS_LABELS } from '../../types/serviceLog';

interface StaffInfo {
  id: number;
  name: string;
  role: string;
}

interface ServiceLogFormProps {
  client: Client;
  serviceLog?: ServiceLog;
  supportPlans: SupportPlan[];
  staffList: StaffInfo[];
  currentStaffId: number;
  onSubmit: (data: CreateServiceLogRequest | UpdateServiceLogRequest) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  serviceDate: string;
  startTime: string;
  endTime: string;
  supportPlanId: string;
  serviceType: ServiceLog['serviceType'] | '';
  staffId: string;
  content: string;
  nextAction: string;
  notes: string;
  status: ServiceLog['status'];
}

interface FormErrors {
  serviceDate?: string;
  startTime?: string;
  endTime?: string;
  supportPlanId?: string;
  serviceType?: string;
  staffId?: string;
  content?: string;
  general?: string;
}

const initialFormData = (currentStaffId: number): FormData => ({
  serviceDate: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  supportPlanId: '',
  serviceType: '',
  staffId: currentStaffId.toString(),
  content: '',
  nextAction: '',
  notes: '',
  status: 'draft',
});

export const ServiceLogForm: React.FC<ServiceLogFormProps> = ({
  client,
  serviceLog,
  supportPlans,
  staffList,
  currentStaffId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData(currentStaffId));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const isEditMode = !!serviceLog;

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (serviceLog) {
      setFormData({
        serviceDate: serviceLog.serviceDate,
        startTime: serviceLog.startTime,
        endTime: serviceLog.endTime,
        supportPlanId: serviceLog.supportPlanId.toString(),
        serviceType: serviceLog.serviceType,
        staffId: serviceLog.staffId.toString(),
        content: serviceLog.content,
        nextAction: serviceLog.nextAction || '',
        notes: serviceLog.notes || '',
        status: serviceLog.status,
      });
    }
  }, [serviceLog]);

  // サービス時間の計算
  const serviceHours = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return null;
    
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    
    if (end <= start) return null;
    
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, total: diffMs / (1000 * 60 * 60) };
  }, [formData.startTime, formData.endTime]);

  // バリデーション関数
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'serviceDate':
        if (!value) return 'サービス日は必須です';
        if (new Date(value) > new Date()) return '未来の日付は指定できません';
        return undefined;
      case 'startTime':
        return !value ? '開始時間は必須です' : undefined;
      case 'endTime':
        if (!value) return '終了時間は必須です';
        if (formData.startTime && value <= formData.startTime) {
          return '終了時間は開始時間より後を指定してください';
        }
        return undefined;
      case 'supportPlanId':
        return !value ? '支援計画は必須です' : undefined;
      case 'serviceType':
        return !value ? 'サービス種別は必須です' : undefined;
      case 'staffId':
        return !value ? '担当者は必須です' : undefined;
      case 'content':
        if (!value) return 'サービス内容は必須です';
        if (value.length > 1000) return 'サービス内容は1000文字以内で入力してください';
        return undefined;
      default:
        return undefined;
    }
  };

  // フォーム全体のバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      if (key !== 'nextAction' && key !== 'notes' && key !== 'status') {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) {
          newErrors[key as keyof FormErrors] = error;
        }
      }
    });

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
    setErrors(prev => ({ ...prev, [name]: error }));
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
      const submitData: CreateServiceLogRequest | UpdateServiceLogRequest = {
        clientId: client.id,
        supportPlanId: parseInt(formData.supportPlanId),
        staffId: parseInt(formData.staffId),
        serviceDate: formData.serviceDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        serviceType: formData.serviceType as ServiceLog['serviceType'],
        content: formData.content,
        nextAction: formData.nextAction || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      if (isEditMode && serviceLog) {
        (submitData as UpdateServiceLogRequest).id = serviceLog.id;
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
    setFormData(serviceLog ? {
      serviceDate: serviceLog.serviceDate,
      startTime: serviceLog.startTime,
      endTime: serviceLog.endTime,
      supportPlanId: serviceLog.supportPlanId.toString(),
      serviceType: serviceLog.serviceType,
      staffId: serviceLog.staffId.toString(),
      content: serviceLog.content,
      nextAction: serviceLog.nextAction || '',
      notes: serviceLog.notes || '',
      status: serviceLog.status,
    } : initialFormData(currentStaffId));
    setErrors({});
    setShowReset(false);
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return isEditMode ? '更新中...' : '保存中...';
    }
    if (formData.status === 'confirmed') {
      return '確認して送信';
    }
    return isEditMode ? '更新' : '保存';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'サービス記録編集' : 'サービス記録新規作成'}
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
        aria-label="サービス記録登録フォーム"
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

        {/* サービス日 */}
        <div>
          <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-1">
            サービス日 *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              id="serviceDate"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.serviceDate ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-required="true"
              aria-invalid={!!errors.serviceDate}
              aria-describedby={errors.serviceDate ? 'serviceDate-error' : undefined}
            />
          </div>
          {errors.serviceDate && (
            <p id="serviceDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.serviceDate}
            </p>
          )}
        </div>

        {/* 時間 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              開始時間 *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-required="true"
                aria-invalid={!!errors.startTime}
                aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              />
            </div>
            {errors.startTime && (
              <p id="startTime-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.startTime}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              終了時間 *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-required="true"
                aria-invalid={!!errors.endTime}
                aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              />
            </div>
            {errors.endTime && (
              <p id="endTime-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* サービス時間表示 */}
        {serviceHours && (
          <div className="col-span-full">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              serviceHours.total > 8 ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                サービス時間: {serviceHours.hours}時間{serviceHours.minutes > 0 && `${serviceHours.minutes}分`}
              </span>
              {serviceHours.total > 8 && (
                <>
                  <AlertCircle className="w-5 h-5 ml-2" />
                  <span className="text-sm">サービス時間が8時間を超えています</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* サービス内容セクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">サービス内容</h3>
        </div>

        {/* 支援計画 */}
        <div>
          <label htmlFor="supportPlanId" className="block text-sm font-medium text-gray-700 mb-1">
            支援計画 *
          </label>
          <select
            id="supportPlanId"
            name="supportPlanId"
            value={formData.supportPlanId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.supportPlanId ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.supportPlanId}
            aria-describedby={errors.supportPlanId ? 'supportPlanId-error' : undefined}
          >
            <option value="">選択してください</option>
            {supportPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.planName}
              </option>
            ))}
          </select>
          {errors.supportPlanId && (
            <p id="supportPlanId-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.supportPlanId}
            </p>
          )}
        </div>

        {/* サービス種別 */}
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
            サービス種別 *
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.serviceType ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.serviceType}
            aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
          >
            <option value="">選択してください</option>
            {Object.entries(SERVICE_LOG_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.serviceType && (
            <p id="serviceType-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.serviceType}
            </p>
          )}
        </div>

        {/* 担当者 */}
        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
            担当者 *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.staffId ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-required="true"
              aria-invalid={!!errors.staffId}
              aria-describedby={errors.staffId ? 'staffId-error' : undefined}
            >
              <option value="">選択してください</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
          {errors.staffId && (
            <p id="staffId-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.staffId}
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
            {Object.entries(SERVICE_LOG_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* サービス内容 */}
        <div className="col-span-full">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            サービス内容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'content-error' : undefined}
          />
          {errors.content && (
            <p id="content-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.content}
            </p>
          )}
        </div>

        {/* 次回予定・申し送り */}
        <div className="col-span-full">
          <label htmlFor="nextAction" className="block text-sm font-medium text-gray-700 mb-1">
            次回予定・申し送り
          </label>
          <textarea
            id="nextAction"
            name="nextAction"
            value={formData.nextAction}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            rows={3}
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
                : formData.status === 'confirmed'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {getSubmitButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};
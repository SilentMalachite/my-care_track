import React, { useState, useEffect } from 'react';
import { Client, CreateClientRequest, UpdateClientRequest, DISABILITY_TYPE_LABELS, STATUS_LABELS, GENDER_LABELS } from '../../types/client';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  clientNumber: string;
  name: string;
  nameKana: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  phone: string;
  email: string;
  address: string;
  disabilityType: 'physical' | 'intellectual' | 'mental' | 'sensory' | 'developmental' | '';
  disabilityGrade: string;
  insuranceNumber: string;
  status: 'active' | 'inactive' | 'discharged';
  notes: string;
}

interface FormErrors {
  clientNumber?: string;
  name?: string;
  nameKana?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  disabilityType?: string;
  disabilityGrade?: string;
  general?: string;
}

const initialFormData: FormData = {
  clientNumber: '',
  name: '',
  nameKana: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  disabilityType: '',
  disabilityGrade: '',
  insuranceNumber: '',
  status: 'active',
  notes: '',
};

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const isEditMode = !!client;

  // 編集モードの場合、初期データを設定
  useEffect(() => {
    if (client) {
      setFormData({
        clientNumber: client.clientNumber,
        name: client.name,
        nameKana: client.nameKana,
        dateOfBirth: client.dateOfBirth,
        gender: client.gender,
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        disabilityType: client.disabilityType,
        disabilityGrade: client.disabilityGrade?.toString() || '',
        insuranceNumber: client.insuranceNumber || '',
        status: client.status,
        notes: client.notes || '',
      });
    }
  }, [client]);

  // バリデーション関数
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'clientNumber':
        return !value ? '利用者番号は必須です' : undefined;
      case 'name':
        return !value ? '氏名は必須です' : undefined;
      case 'nameKana':
        if (!value) return '氏名（カナ）は必須です';
        if (!/^[ァ-ヶー\s]+$/.test(value)) return 'カタカナで入力してください';
        return undefined;
      case 'dateOfBirth':
        if (!value) return '生年月日は必須です';
        if (new Date(value) > new Date()) return '生年月日は過去の日付を指定してください';
        return undefined;
      case 'gender':
        return !value ? '性別は必須です' : undefined;
      case 'phone':
        if (value && !/^[\d\-\(\)\+\s]+$/.test(value)) return '電話番号の形式が正しくありません';
        if (value && value.replace(/[\-\(\)\+\s]/g, '').length < 10) return '電話番号の形式が正しくありません';
        return undefined;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'メールアドレスの形式が正しくありません';
        return undefined;
      case 'disabilityType':
        return !value ? '障害種別は必須です' : undefined;
      case 'disabilityGrade':
        if (value && (parseInt(value) < 1 || parseInt(value) > 7)) return '障害等級は1から7の間で入力してください';
        return undefined;
      default:
        return undefined;
    }
  };

  // フォーム全体のバリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData] as string);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 入力値変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 必須項目のリアルタイムバリデーション
    if (['clientNumber', 'name', 'nameKana', 'dateOfBirth', 'gender', 'disabilityType'].includes(name)) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error, general: undefined }));
    }
    
    setShowReset(true);
  };

  // フォーカスアウト時のバリデーション
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error, general: undefined }));
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
      const submitData: CreateClientRequest | UpdateClientRequest = {
        clientNumber: formData.clientNumber,
        name: formData.name,
        nameKana: formData.nameKana,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        disabilityType: formData.disabilityType as 'physical' | 'intellectual' | 'mental' | 'sensory' | 'developmental',
        disabilityGrade: formData.disabilityGrade ? parseInt(formData.disabilityGrade) : undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (isEditMode && client) {
        (submitData as UpdateClientRequest).id = client.id;
      }

      await onSubmit(submitData);
    } catch (error) {
      let errorMessage = '送信中にエラーが発生しました。もう一度お試しください。';
      
      if (error instanceof Error) {
        // 特定のエラーメッセージがある場合はそれを使用
        if (error.message.includes('利用者番号が既に使用されています')) {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームリセットハンドラ
  const handleReset = () => {
    setFormData(client ? {
      clientNumber: client.clientNumber,
      name: client.name,
      nameKana: client.nameKana,
      dateOfBirth: client.dateOfBirth,
      gender: client.gender,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      disabilityType: client.disabilityType,
      disabilityGrade: client.disabilityGrade?.toString() || '',
      insuranceNumber: client.insuranceNumber || '',
      status: client.status,
      notes: client.notes || '',
    } : initialFormData);
    setErrors({});
    setShowReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? '利用者情報編集' : '利用者新規登録'}
      </h2>

      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:grid-cols-1"
        role="form"
        aria-label="利用者登録フォーム"
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

        {/* 利用者番号 */}
        <div>
          <label htmlFor="clientNumber" className="block text-sm font-medium text-gray-700 mb-1">
            利用者番号 *
          </label>
          <input
            type="text"
            id="clientNumber"
            name="clientNumber"
            value={formData.clientNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.clientNumber}
            aria-describedby={errors.clientNumber ? 'clientNumber-error' : undefined}
          />
          {errors.clientNumber && (
            <p id="clientNumber-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.clientNumber}
            </p>
          )}
        </div>

        {/* 氏名 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            氏名 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* 氏名（カナ） */}
        <div>
          <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-1">
            氏名（カナ） *
          </label>
          <input
            type="text"
            id="nameKana"
            name="nameKana"
            value={formData.nameKana}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nameKana ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.nameKana}
            aria-describedby={errors.nameKana ? 'nameKana-error' : undefined}
          />
          {errors.nameKana && (
            <p id="nameKana-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.nameKana}
            </p>
          )}
        </div>

        {/* 生年月日 */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            生年月日 *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* 性別 */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            性別 *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.gender}
            aria-describedby={errors.gender ? 'gender-error' : undefined}
          >
            <option value="">選択してください</option>
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.gender && (
            <p id="gender-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.gender}
            </p>
          )}
        </div>

        {/* 連絡先セクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">連絡先情報</h3>
        </div>

        {/* 電話番号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* 住所 */}
        <div className="col-span-full">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            住所
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 障害情報セクション */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">障害情報</h3>
        </div>

        {/* 障害種別 */}
        <div>
          <label htmlFor="disabilityType" className="block text-sm font-medium text-gray-700 mb-1">
            障害種別 *
          </label>
          <select
            id="disabilityType"
            name="disabilityType"
            value={formData.disabilityType}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.disabilityType ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.disabilityType}
            aria-describedby={errors.disabilityType ? 'disabilityType-error' : undefined}
          >
            <option value="">選択してください</option>
            {Object.entries(DISABILITY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.disabilityType && (
            <p id="disabilityType-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.disabilityType}
            </p>
          )}
        </div>

        {/* 障害等級 */}
        <div>
          <label htmlFor="disabilityGrade" className="block text-sm font-medium text-gray-700 mb-1">
            障害等級
          </label>
          <input
            type="number"
            id="disabilityGrade"
            name="disabilityGrade"
            value={formData.disabilityGrade}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min="1"
            max="7"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.disabilityGrade ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.disabilityGrade}
            aria-describedby={errors.disabilityGrade ? 'disabilityGrade-error' : undefined}
          />
          {errors.disabilityGrade && (
            <p id="disabilityGrade-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.disabilityGrade}
            </p>
          )}
        </div>

        {/* 保険番号 */}
        <div>
          <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 mb-1">
            保険番号
          </label>
          <input
            type="text"
            id="insuranceNumber"
            name="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
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
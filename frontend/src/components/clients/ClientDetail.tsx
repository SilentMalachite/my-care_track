import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Client, DISABILITY_TYPE_LABELS, STATUS_LABELS, GENDER_LABELS } from '../../types/client';
import { calculateAge, formatDate } from '../../test/utils/testUtils';

interface ClientDetailProps {
  client: Client;
  loading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onBack: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  loading,
  onEdit,
  onDelete,
  onBack,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            aria-label="利用者一覧に戻る"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">利用者詳細</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(client)}
            aria-label="利用者情報を編集"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            編集
          </button>
          <button
            onClick={() => onDelete(client)}
            aria-label="利用者を削除"
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </button>
        </div>
      </div>

      {/* Client Name & Number */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{client.name}</div>
            <p className="text-lg text-gray-600 mt-1">{client.nameKana}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">利用者番号</div>
            <div className="text-xl font-semibold text-gray-900">{client.clientNumber}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">生年月日</dt>
              <dd className="text-sm text-gray-900">{formatDate(client.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">年齢</dt>
              <dd className="text-sm text-gray-900">{calculateAge(client.dateOfBirth)}歳</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">性別</dt>
              <dd className="text-sm text-gray-900">{GENDER_LABELS[client.gender]}</dd>
            </div>
          </dl>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">連絡先情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">電話番号</dt>
              <dd className="text-sm text-gray-900">{client.phone || '未設定'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
              <dd className="text-sm text-gray-900">{client.email || '未設定'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">住所</dt>
              <dd className="text-sm text-gray-900">{client.address || '未設定'}</dd>
            </div>
          </dl>
        </div>

        {/* Disability Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">障害情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">障害種別</dt>
              <dd className="text-sm text-gray-900">{DISABILITY_TYPE_LABELS[client.disabilityType]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">障害等級</dt>
              <dd className="text-sm text-gray-900">
                {client.disabilityGrade ? `${client.disabilityGrade}級` : '未設定'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">保険番号</dt>
              <dd className="text-sm text-gray-900">{client.insuranceNumber || '未設定'}</dd>
            </div>
          </dl>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ステータス情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">現在のステータス</dt>
              <dd className="text-sm">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : client.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[client.status]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">登録日時</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(client.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">更新日時</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(client.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Discharge Information (if applicable) */}
      {client.status === 'discharged' && (client.dischargeDate || client.dischargeReason) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">終了情報</h2>
          <dl className="space-y-3">
            {client.dischargeDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">終了日</dt>
                <dd className="text-sm text-gray-900">{formatDate(client.dischargeDate)}</dd>
              </div>
            )}
            {client.dischargeReason && (
              <div>
                <dt className="text-sm font-medium text-gray-500">終了理由</dt>
                <dd className="text-sm text-gray-900">{client.dischargeReason}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">備考</h2>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
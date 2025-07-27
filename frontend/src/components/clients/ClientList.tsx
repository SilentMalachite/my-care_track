import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Client, DISABILITY_TYPE_LABELS, STATUS_LABELS } from '../../types/client';
import { calculateAge } from '../../test/utils/testUtils';

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  onClientSelect: (client: Client) => void;
  onClientEdit: (client: Client) => void;
  onClientDelete: (client: Client) => void;
  onAddClient: () => void;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'discharged';

const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  onClientSelect,
  onClientEdit,
  onClientDelete,
  onAddClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.nameKana.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const statusFilterButtons = [
    { key: 'all' as const, label: 'すべて' },
    { key: 'active' as const, label: '利用中' },
    { key: 'inactive' as const, label: '休止中' },
    { key: 'discharged' as const, label: '終了' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">利用者一覧</h1>
        <button
          onClick={onAddClient}
          aria-label="新規利用者を登録"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規利用者登録
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="利用者名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="利用者を検索"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          {statusFilterButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => setStatusFilter(button.key)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                statusFilter === button.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      {filteredClients.length === 0 && clients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg">利用者が登録されていません</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg">検索条件に一致する利用者が見つかりません</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利用者番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  氏名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年齢
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  障害種別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => onClientSelect(client)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.clientNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.nameKana}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(client.dateOfBirth)}歳
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {DISABILITY_TYPE_LABELS[client.disabilityType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientEdit(client);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      編集
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientDelete(client);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientList;
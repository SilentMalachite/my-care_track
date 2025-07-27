import { apiClient } from './api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client';

// クライアント検索パラメータ
export interface ClientSearchParams {
  query?: string;
  disabilityType?: Client['disabilityType'];
  status?: Client['status'];
  page?: number;
  limit?: number;
  search?: string;
}

// クライアント統計情報
export interface ClientStats {
  total: number;
  byStatus: Record<Client['status'], number>;
  byDisabilityType: Record<Client['disabilityType'], number>;
}

// 緊急連絡先
export interface EmergencyContact {
  id?: number;
  clientId?: number;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// CSVエクスポートフィルター
export interface ClientExportFilters {
  status?: Client['status'];
  disabilityType?: Client['disabilityType'];
}

export const clientService = {
  /**
   * 全クライアントを取得
   */
  async getAll(params?: ClientSearchParams): Promise<Client[]> {
    const response = await apiClient.get<Client[]>('/clients', { params });
    return response.data;
  },

  /**
   * IDでクライアントを取得
   */
  async getById(id: number): Promise<Client | null> {
    try {
      const response = await apiClient.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 新規クライアントを作成
   */
  async create(data: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  /**
   * クライアント情報を更新
   */
  async update(id: number, data: UpdateClientRequest): Promise<Client> {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * クライアントを削除
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },

  /**
   * クライアントを検索
   */
  async search(params: ClientSearchParams): Promise<Client[]> {
    const response = await apiClient.get<Client[]>('/clients/search', { params });
    return response.data;
  },

  /**
   * クライアント統計情報を取得
   */
  async getStats(): Promise<ClientStats> {
    const response = await apiClient.get<ClientStats>('/clients/stats');
    return response.data;
  },

  /**
   * クライアント番号の可用性をチェック
   */
  async checkClientNumber(clientNumber: string): Promise<boolean> {
    const response = await apiClient.get<{ available: boolean }>(
      `/clients/check-number/${clientNumber}`
    );
    return response.data.available;
  },

  /**
   * 緊急連絡先を取得
   */
  async getEmergencyContacts(clientId: number): Promise<EmergencyContact[]> {
    const response = await apiClient.get<EmergencyContact[]>(
      `/clients/${clientId}/emergency-contacts`
    );
    return response.data;
  },

  /**
   * 緊急連絡先を更新
   */
  async updateEmergencyContacts(
    clientId: number,
    contacts: EmergencyContact[]
  ): Promise<EmergencyContact[]> {
    const response = await apiClient.put<EmergencyContact[]>(
      `/clients/${clientId}/emergency-contacts`,
      { contacts }
    );
    return response.data;
  },

  /**
   * CSV形式でクライアントデータをエクスポート
   */
  async exportToCSV(filters?: ClientExportFilters): Promise<Blob> {
    const response = await apiClient.get<Blob>('/clients/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
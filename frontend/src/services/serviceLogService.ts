import apiClient, { ApiClient } from './api';
import { API_ENDPOINTS } from './api';
import {
  ServiceLog,
  CreateServiceLogRequest,
  UpdateServiceLogRequest,
  ServiceLogStats,
  ServiceLogFilters,
  DailyServiceSummary,
  MonthlyServiceReport,
} from '../types/serviceLog';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportResponse {
  filename: string;
  data: string;
  mimeType: string;
}

class ServiceLogService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * サービスログリストを取得
   */
  async getServiceLogs(params?: ServiceLogFilters): Promise<ServiceLog[] | PaginatedResponse<ServiceLog>> {
    return this.apiClient.get<ServiceLog[] | PaginatedResponse<ServiceLog>>(
      API_ENDPOINTS.SERVICE_LOGS,
      params
    );
  }

  /**
   * 指定IDのサービスログを取得
   */
  async getServiceLog(id: number): Promise<ServiceLog> {
    return this.apiClient.get<ServiceLog>(`${API_ENDPOINTS.SERVICE_LOGS}/${id}`);
  }

  /**
   * 特定クライアントのサービスログを取得
   */
  async getClientServiceLogs(
    clientId: number,
    params?: ServiceLogFilters
  ): Promise<ServiceLog[]> {
    return this.apiClient.get<ServiceLog[]>(
      `${API_ENDPOINTS.CLIENTS}/${clientId}/service_logs`,
      params
    );
  }

  /**
   * 特定支援計画のサービスログを取得
   */
  async getPlanServiceLogs(
    supportPlanId: number,
    params?: ServiceLogFilters
  ): Promise<ServiceLog[]> {
    return this.apiClient.get<ServiceLog[]>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/${supportPlanId}/service_logs`,
      params
    );
  }

  /**
   * 新規サービスログを作成
   */
  async createServiceLog(data: CreateServiceLogRequest): Promise<ServiceLog> {
    return this.apiClient.post<ServiceLog>(API_ENDPOINTS.SERVICE_LOGS, data);
  }

  /**
   * 既存サービスログを更新
   */
  async updateServiceLog(data: UpdateServiceLogRequest): Promise<ServiceLog> {
    const { id, ...updateData } = data;
    return this.apiClient.put<ServiceLog>(`${API_ENDPOINTS.SERVICE_LOGS}/${id}`, updateData);
  }

  /**
   * サービスログを削除
   */
  async deleteServiceLog(id: number): Promise<void> {
    return this.apiClient.delete(`${API_ENDPOINTS.SERVICE_LOGS}/${id}`);
  }

  /**
   * サービスログの統計情報を取得
   */
  async getServiceLogStats(params?: { clientId?: number; supportPlanId?: number }): Promise<ServiceLogStats> {
    return this.apiClient.get<ServiceLogStats>(
      `${API_ENDPOINTS.SERVICE_LOGS}/stats`,
      params
    );
  }

  /**
   * 複数のサービスログのステータスを一括更新
   */
  async bulkUpdateStatus(
    logIds: number[],
    status: ServiceLog['status'],
    approvedBy?: number
  ): Promise<ServiceLog[]> {
    return this.apiClient.post<ServiceLog[]>(
      `${API_ENDPOINTS.SERVICE_LOGS}/bulk-update-status`,
      { logIds, status, approvedBy }
    );
  }

  /**
   * 日次サマリーを取得
   */
  async getDailySummary(date: string): Promise<DailyServiceSummary> {
    return this.apiClient.get<DailyServiceSummary>(
      `${API_ENDPOINTS.SERVICE_LOGS}/daily-summary`,
      { date }
    );
  }

  /**
   * 月次レポートを取得
   */
  async getMonthlyReport(year: number, month: number): Promise<MonthlyServiceReport> {
    return this.apiClient.get<MonthlyServiceReport>(
      `${API_ENDPOINTS.SERVICE_LOGS}/monthly-report`,
      { year, month }
    );
  }

  /**
   * サービスログデータをエクスポート
   */
  async exportServiceLogs(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: ServiceLogFilters
  ): Promise<ExportResponse> {
    const params = {
      format,
      ...filters,
    };
    return this.apiClient.get<ExportResponse>(
      `${API_ENDPOINTS.SERVICE_LOGS}/export`,
      params
    );
  }

  /**
   * キーワードでサービスログを検索
   */
  async searchServiceLogs(
    keyword: string,
    filters?: Omit<ServiceLogFilters, 'searchTerm'>
  ): Promise<ServiceLog[]> {
    const params = {
      q: keyword,
      ...filters,
    };
    return this.apiClient.get<ServiceLog[]>(
      `${API_ENDPOINTS.SERVICE_LOGS}/search`,
      params
    );
  }
}

// シングルトンインスタンスをエクスポート
export const serviceLogService = new ServiceLogService(apiClient);
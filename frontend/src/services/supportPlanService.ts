import apiClient, { ApiClient } from './api';
import { API_ENDPOINTS } from './api';
import {
  SupportPlan,
  CreateSupportPlanRequest,
  UpdateSupportPlanRequest,
  SupportPlanProgress,
  SupportPlanStats,
} from '../types/supportPlan';

export interface SupportPlanFilters {
  status?: SupportPlan['status'];
  priority?: SupportPlan['priority'];
  clientId?: number;
  assignedStaffId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DuplicatePlanOptions {
  newClientId?: number;
  newPlanName?: string;
  adjustDates?: boolean;
  startDate?: string;
}

export interface ExportResponse {
  filename: string;
  data: string;
  mimeType: string;
}

class SupportPlanService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 支援計画リストを取得
   */
  async getSupportPlans(params?: SupportPlanFilters): Promise<SupportPlan[] | PaginatedResponse<SupportPlan>> {
    return this.apiClient.get<SupportPlan[] | PaginatedResponse<SupportPlan>>(
      API_ENDPOINTS.SUPPORT_PLANS,
      params
    );
  }

  /**
   * 指定IDの支援計画を取得
   */
  async getSupportPlan(id: number): Promise<SupportPlan> {
    return this.apiClient.get<SupportPlan>(`${API_ENDPOINTS.SUPPORT_PLANS}/${id}`);
  }

  /**
   * 特定クライアントの支援計画を取得
   */
  async getClientSupportPlans(
    clientId: number,
    params?: { status?: SupportPlan['status'] }
  ): Promise<SupportPlan[]> {
    return this.apiClient.get<SupportPlan[]>(
      `${API_ENDPOINTS.CLIENTS}/${clientId}/support_plans`,
      params
    );
  }

  /**
   * 新規支援計画を作成
   */
  async createSupportPlan(data: CreateSupportPlanRequest): Promise<SupportPlan> {
    return this.apiClient.post<SupportPlan>(API_ENDPOINTS.SUPPORT_PLANS, data);
  }

  /**
   * 既存支援計画を更新
   */
  async updateSupportPlan(data: UpdateSupportPlanRequest): Promise<SupportPlan> {
    const { id, ...updateData } = data;
    return this.apiClient.put<SupportPlan>(`${API_ENDPOINTS.SUPPORT_PLANS}/${id}`, updateData);
  }

  /**
   * 支援計画を削除
   */
  async deleteSupportPlan(id: number): Promise<void> {
    return this.apiClient.delete(`${API_ENDPOINTS.SUPPORT_PLANS}/${id}`);
  }

  /**
   * 支援計画の進捗を計算
   */
  async calculateProgress(planId: number): Promise<SupportPlanProgress> {
    return this.apiClient.get<SupportPlanProgress>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/${planId}/progress`
    );
  }

  /**
   * 支援計画の統計情報を取得
   */
  async getSupportPlanStats(params?: { clientId?: number }): Promise<SupportPlanStats> {
    return this.apiClient.get<SupportPlanStats>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/stats`,
      params
    );
  }

  /**
   * 複数の支援計画のステータスを一括更新
   */
  async bulkUpdateStatus(
    planIds: number[],
    status: SupportPlan['status']
  ): Promise<SupportPlan[]> {
    return this.apiClient.post<SupportPlan[]>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/bulk-update-status`,
      { planIds, status }
    );
  }

  /**
   * 既存の支援計画を複製
   */
  async duplicatePlan(
    planId: number,
    options: DuplicatePlanOptions
  ): Promise<SupportPlan> {
    return this.apiClient.post<SupportPlan>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/${planId}/duplicate`,
      options
    );
  }

  /**
   * レビュー予定の支援計画を取得
   */
  async getUpcomingReviews(days: number = 30): Promise<SupportPlan[]> {
    return this.apiClient.get<SupportPlan[]>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/upcoming-reviews`,
      { days }
    );
  }

  /**
   * 支援計画データをエクスポート
   */
  async exportSupportPlans(
    format: 'csv' | 'pdf' | 'xlsx',
    filters?: SupportPlanFilters
  ): Promise<ExportResponse> {
    const params = {
      format,
      ...filters,
    };
    return this.apiClient.get<ExportResponse>(
      `${API_ENDPOINTS.SUPPORT_PLANS}/export`,
      params
    );
  }
}

// シングルトンインスタンスをエクスポート
export const supportPlanService = new SupportPlanService(apiClient);
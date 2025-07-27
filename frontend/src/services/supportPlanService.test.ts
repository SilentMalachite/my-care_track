import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supportPlanService } from './supportPlanService';
import { SupportPlan, CreateSupportPlanRequest, UpdateSupportPlanRequest } from '../types/supportPlan';
import { apiClientInstance } from './api';

// APIクライアントのモック
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');
  return {
    ...actual,
    apiClientInstance: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    API_ENDPOINTS: {
      SUPPORT_PLANS: '/support-plans',
      CLIENTS: '/clients',
    },
  };
});

const mockApiClient = vi.mocked(apiClientInstance);

// テストデータ
const mockSupportPlan: SupportPlan = {
  id: 1,
  clientId: 1,
  planName: '日常生活支援計画',
  goals: ['自立した生活の維持', '社会参加の促進', '健康管理の改善'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'active',
  priority: 'high',
  assignedStaffIds: [1, 2],
  notes: '週2回の訪問サポート',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSupportPlanList: SupportPlan[] = [
  mockSupportPlan,
  {
    ...mockSupportPlan,
    id: 2,
    planName: '就労支援計画',
    goals: ['職場環境への適応', 'スキルアップ研修の受講'],
    priority: 'medium',
  },
];

describe('supportPlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSupportPlans', () => {
    it('全支援計画リストを取得できる', async () => {
      mockApiClient.get.mockResolvedValue(mockSupportPlanList);

      const result = await supportPlanService.getSupportPlans();

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans', undefined);
      expect(result).toEqual(mockSupportPlanList);
    });

    it('フィルタ条件付きで支援計画を取得できる', async () => {
      const params = { status: 'active' as const, priority: 'high' as const };
      mockApiClient.get.mockResolvedValue([mockSupportPlan]);

      const result = await supportPlanService.getSupportPlans(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans', params);
      expect(result).toEqual([mockSupportPlan]);
    });

    it('ページネーション付きで取得できる', async () => {
      const params = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: mockSupportPlanList,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
      mockApiClient.get.mockResolvedValue(paginatedResponse);

      const result = await supportPlanService.getSupportPlans(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans', params);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getSupportPlan', () => {
    it('指定されたIDの支援計画を取得できる', async () => {
      mockApiClient.get.mockResolvedValue(mockSupportPlan);

      const result = await supportPlanService.getSupportPlan(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/1');
      expect(result).toEqual(mockSupportPlan);
    });

    it('存在しないIDでエラーが発生する', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Support plan not found'));

      await expect(supportPlanService.getSupportPlan(999)).rejects.toThrow('Support plan not found');
    });
  });

  describe('getClientSupportPlans', () => {
    it('特定クライアントの支援計画を取得できる', async () => {
      const clientPlans = [mockSupportPlan];
      mockApiClient.get.mockResolvedValue(clientPlans);

      const result = await supportPlanService.getClientSupportPlans(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/clients/1/support_plans', undefined);
      expect(result).toEqual(clientPlans);
    });

    it('ステータスでフィルタリングできる', async () => {
      const activePlans = [mockSupportPlan];
      mockApiClient.get.mockResolvedValue(activePlans);

      const result = await supportPlanService.getClientSupportPlans(1, { status: 'active' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/clients/1/support_plans', { status: 'active' });
      expect(result).toEqual(activePlans);
    });
  });

  describe('createSupportPlan', () => {
    const createData: CreateSupportPlanRequest = {
      clientId: 1,
      planName: '新規支援計画',
      goals: ['目標1', '目標2'],
      startDate: '2024-02-01',
      endDate: '2024-07-31',
      priority: 'medium',
      assignedStaffIds: [3],
      notes: 'テスト用計画',
    };

    it('新しい支援計画を作成できる', async () => {
      const createdPlan = { id: 3, ...createData, status: 'pending', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' };
      mockApiClient.post.mockResolvedValue(createdPlan);

      const result = await supportPlanService.createSupportPlan(createData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/support-plans', createData);
      expect(result).toEqual(createdPlan);
    });

    it('必須フィールドのみで作成できる', async () => {
      const minimalData: CreateSupportPlanRequest = {
        clientId: 2,
        planName: '最小限の計画',
        goals: ['基本目標'],
        startDate: '2024-03-01',
        endDate: '2024-05-31',
      };
      const createdPlan = { 
        id: 4, 
        ...minimalData, 
        status: 'pending', 
        priority: 'medium',
        assignedStaffIds: [],
        createdAt: '2024-01-15T00:00:00Z', 
        updatedAt: '2024-01-15T00:00:00Z' 
      };
      mockApiClient.post.mockResolvedValue(createdPlan);

      const result = await supportPlanService.createSupportPlan(minimalData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/support-plans', minimalData);
      expect(result).toEqual(createdPlan);
    });

    it('終了日が開始日より前の場合エラーが発生する', async () => {
      const invalidData = { ...createData, endDate: '2024-01-01' };
      mockApiClient.post.mockRejectedValue(new Error('終了日は開始日より後である必要があります'));

      await expect(supportPlanService.createSupportPlan(invalidData)).rejects.toThrow('終了日は開始日より後である必要があります');
    });
  });

  describe('updateSupportPlan', () => {
    const updateData: UpdateSupportPlanRequest = {
      id: 1,
      planName: '更新された支援計画',
      goals: ['更新目標1', '更新目標2', '更新目標3'],
      status: 'completed',
      reviewDate: '2024-06-01',
      reviewNotes: '計画完了、目標達成',
    };

    it('既存支援計画を更新できる', async () => {
      const updatedPlan = { ...mockSupportPlan, ...updateData, updatedAt: '2024-06-01T00:00:00Z' };
      mockApiClient.put.mockResolvedValue(updatedPlan);

      const result = await supportPlanService.updateSupportPlan(updateData);

      const { id, ...expectedData } = updateData;
      expect(mockApiClient.put).toHaveBeenCalledWith('/support-plans/1', expectedData);
      expect(result).toEqual(updatedPlan);
    });

    it('ステータスのみ更新できる', async () => {
      const statusUpdate: UpdateSupportPlanRequest = {
        id: 1,
        status: 'completed',
      };
      const updatedPlan = { ...mockSupportPlan, status: 'completed', updatedAt: '2024-06-01T00:00:00Z' };
      mockApiClient.put.mockResolvedValue(updatedPlan);

      const result = await supportPlanService.updateSupportPlan(statusUpdate);

      const { id, ...expectedData } = statusUpdate;
      expect(mockApiClient.put).toHaveBeenCalledWith('/support-plans/1', expectedData);
      expect(result).toEqual(updatedPlan);
    });
  });

  describe('deleteSupportPlan', () => {
    it('支援計画を削除できる', async () => {
      mockApiClient.delete.mockResolvedValue(null);

      await supportPlanService.deleteSupportPlan(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/support-plans/1');
    });

    it('関連データがある計画の削除でエラーが発生する', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('この支援計画には関連するサービス記録があるため削除できません'));

      await expect(supportPlanService.deleteSupportPlan(1)).rejects.toThrow('この支援計画には関連するサービス記録があるため削除できません');
    });
  });

  describe('calculateProgress', () => {
    it('支援計画の進捗を計算できる', async () => {
      const progressData = {
        planId: 1,
        totalGoals: 3,
        completedGoals: 2,
        progressPercentage: 66.7,
        daysElapsed: 180,
        totalDays: 365,
        timeProgressPercentage: 49.3,
        isOverdue: false,
      };
      mockApiClient.get.mockResolvedValue(progressData);

      const result = await supportPlanService.calculateProgress(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/1/progress');
      expect(result).toEqual(progressData);
    });
  });

  describe('getSupportPlanStats', () => {
    it('支援計画の統計情報を取得できる', async () => {
      const statsData = {
        total: 25,
        byStatus: {
          pending: 5,
          active: 15,
          completed: 4,
          cancelled: 1,
        },
        byPriority: {
          high: 8,
          medium: 12,
          low: 5,
        },
        overdue: 3,
        dueThisWeek: 2,
        dueThisMonth: 7,
        averageCompletionDays: 120,
      };
      mockApiClient.get.mockResolvedValue(statsData);

      const result = await supportPlanService.getSupportPlanStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/stats', undefined);
      expect(result).toEqual(statsData);
    });

    it('クライアントIDでフィルタリングできる', async () => {
      const clientStats = {
        total: 5,
        byStatus: {
          pending: 1,
          active: 3,
          completed: 1,
          cancelled: 0,
        },
        byPriority: {
          high: 2,
          medium: 2,
          low: 1,
        },
        overdue: 1,
        dueThisWeek: 0,
        dueThisMonth: 2,
        averageCompletionDays: 90,
      };
      mockApiClient.get.mockResolvedValue(clientStats);

      const result = await supportPlanService.getSupportPlanStats({ clientId: 1 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/stats', { clientId: 1 });
      expect(result).toEqual(clientStats);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('複数の支援計画のステータスを一括更新できる', async () => {
      const planIds = [1, 2, 3];
      const newStatus = 'completed' as const;
      const updatedPlans = planIds.map(id => ({ ...mockSupportPlan, id, status: newStatus }));
      mockApiClient.post.mockResolvedValue(updatedPlans);

      const result = await supportPlanService.bulkUpdateStatus(planIds, newStatus);

      expect(mockApiClient.post).toHaveBeenCalledWith('/support-plans/bulk-update-status', {
        planIds,
        status: newStatus,
      });
      expect(result).toEqual(updatedPlans);
    });
  });

  describe('duplicatePlan', () => {
    it('既存の支援計画を複製できる', async () => {
      const duplicateOptions = {
        newClientId: 2,
        newPlanName: '複製された支援計画',
        adjustDates: true,
      };
      const duplicatedPlan = {
        ...mockSupportPlan,
        id: 5,
        clientId: 2,
        planName: '複製された支援計画',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        status: 'pending' as const,
      };
      mockApiClient.post.mockResolvedValue(duplicatedPlan);

      const result = await supportPlanService.duplicatePlan(1, duplicateOptions);

      expect(mockApiClient.post).toHaveBeenCalledWith('/support-plans/1/duplicate', duplicateOptions);
      expect(result).toEqual(duplicatedPlan);
    });
  });

  describe('getUpcomingReviews', () => {
    it('レビュー予定の支援計画を取得できる', async () => {
      const upcomingPlans = [mockSupportPlan];
      mockApiClient.get.mockResolvedValue(upcomingPlans);

      const result = await supportPlanService.getUpcomingReviews(7);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/upcoming-reviews', { days: 7 });
      expect(result).toEqual(upcomingPlans);
    });

    it('デフォルトで30日以内のレビュー予定を取得する', async () => {
      const upcomingPlans = mockSupportPlanList;
      mockApiClient.get.mockResolvedValue(upcomingPlans);

      const result = await supportPlanService.getUpcomingReviews();

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/upcoming-reviews', { days: 30 });
      expect(result).toEqual(upcomingPlans);
    });
  });

  describe('exportSupportPlans', () => {
    it('支援計画データをCSV形式でエクスポートできる', async () => {
      const exportData = {
        filename: 'support_plans_export_20240115.csv',
        data: 'header1,header2\ndata1,data2',
        mimeType: 'text/csv',
      };
      mockApiClient.get.mockResolvedValue(exportData);

      const result = await supportPlanService.exportSupportPlans('csv');

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/export', { format: 'csv' });
      expect(result).toEqual(exportData);
    });

    it('フィルタ条件付きでエクスポートできる', async () => {
      const filters = {
        status: 'active' as const,
        priority: 'high' as const,
        clientId: 1,
      };
      const exportData = {
        filename: 'filtered_support_plans.csv',
        data: 'header1,header2\ndata1,data2',
        mimeType: 'text/csv',
      };
      mockApiClient.get.mockResolvedValue(exportData);

      const result = await supportPlanService.exportSupportPlans('csv', filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/support-plans/export', {
        format: 'csv',
        ...filters,
      });
      expect(result).toEqual(exportData);
    });
  });
});
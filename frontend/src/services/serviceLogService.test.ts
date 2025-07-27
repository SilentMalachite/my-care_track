import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serviceLogService } from './serviceLogService';
import { ServiceLog, CreateServiceLogRequest, UpdateServiceLogRequest } from '../types/serviceLog';
import apiClient from './api';

// APIクライアントのモック
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    API_ENDPOINTS: {
      SERVICE_LOGS: '/api/service_logs',
      CLIENTS: '/api/clients',
      SUPPORT_PLANS: '/api/support_plans',
    },
  };
});

const mockApiClient = vi.mocked(apiClient);

// テストデータ
const mockServiceLog: ServiceLog = {
  id: 1,
  clientId: 1,
  supportPlanId: 1,
  staffId: 1,
  serviceDate: '2024-01-15',
  startTime: '09:00',
  endTime: '11:00',
  serviceType: 'physical_support',
  details: '移動支援、身体介助を実施',
  achievements: ['外出支援を完了', '服薬確認済み'],
  issues: ['歩行時の疲労が見られた'],
  nextActions: ['理学療法士との連携を検討'],
  moodLevel: 4,
  healthStatus: 'good',
  attachments: ['report_20240115.pdf'],
  notes: '利用者様は積極的に活動に参加された',
  status: 'confirmed',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

const mockServiceLogList: ServiceLog[] = [
  mockServiceLog,
  {
    ...mockServiceLog,
    id: 2,
    serviceDate: '2024-01-16',
    serviceType: 'domestic_support',
    details: '家事援助、買い物支援を実施',
    achievements: ['掃除完了', '買い物代行完了'],
    issues: [],
    status: 'approved',
  },
];

describe('serviceLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getServiceLogs', () => {
    it('全サービスログリストを取得できる', async () => {
      mockApiClient.get.mockResolvedValue(mockServiceLogList);

      const result = await serviceLogService.getServiceLogs();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs', undefined);
      expect(result).toEqual(mockServiceLogList);
    });

    it('フィルタ条件付きでサービスログを取得できる', async () => {
      const params = { 
        clientId: 1, 
        serviceType: 'physical_care' as const,
        status: 'confirmed' as const 
      };
      mockApiClient.get.mockResolvedValue([mockServiceLog]);

      const result = await serviceLogService.getServiceLogs(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs', params);
      expect(result).toEqual([mockServiceLog]);
    });

    it('日付範囲でフィルタリングできる', async () => {
      const params = {
        serviceDateFrom: '2024-01-01',
        serviceDateTo: '2024-01-31',
      };
      mockApiClient.get.mockResolvedValue(mockServiceLogList);

      const result = await serviceLogService.getServiceLogs(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs', params);
      expect(result).toEqual(mockServiceLogList);
    });

    it('ページネーション付きで取得できる', async () => {
      const params = { page: 1, limit: 20 };
      const paginatedResponse = {
        data: mockServiceLogList,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };
      mockApiClient.get.mockResolvedValue(paginatedResponse);

      const result = await serviceLogService.getServiceLogs(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs', params);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getServiceLog', () => {
    it('指定されたIDのサービスログを取得できる', async () => {
      mockApiClient.get.mockResolvedValue(mockServiceLog);

      const result = await serviceLogService.getServiceLog(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/1');
      expect(result).toEqual(mockServiceLog);
    });

    it('存在しないIDでエラーが発生する', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Service log not found'));

      await expect(serviceLogService.getServiceLog(999)).rejects.toThrow('Service log not found');
    });
  });

  describe('getClientServiceLogs', () => {
    it('特定クライアントのサービスログを取得できる', async () => {
      const clientLogs = [mockServiceLog];
      mockApiClient.get.mockResolvedValue(clientLogs);

      const result = await serviceLogService.getClientServiceLogs(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/clients/1/service_logs', undefined);
      expect(result).toEqual(clientLogs);
    });

    it('日付範囲でフィルタリングできる', async () => {
      const params = {
        serviceDateFrom: '2024-01-01',
        serviceDateTo: '2024-01-31',
      };
      mockApiClient.get.mockResolvedValue(mockServiceLogList);

      const result = await serviceLogService.getClientServiceLogs(1, params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/clients/1/service_logs', params);
      expect(result).toEqual(mockServiceLogList);
    });
  });

  describe('getPlanServiceLogs', () => {
    it('特定支援計画のサービスログを取得できる', async () => {
      const planLogs = [mockServiceLog];
      mockApiClient.get.mockResolvedValue(planLogs);

      const result = await serviceLogService.getPlanServiceLogs(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/support_plans/1/service_logs', undefined);
      expect(result).toEqual(planLogs);
    });
  });

  describe('createServiceLog', () => {
    const createData: CreateServiceLogRequest = {
      clientId: 1,
      supportPlanId: 1,
      staffId: 2,
      serviceDate: '2024-01-17',
      startTime: '14:00',
      endTime: '16:00',
      serviceType: 'social_participation',
      content: '地域活動センターへの同行支援',
      nextAction: '次回も継続予定',
      notes: '積極的に参加されていた',
    };

    it('新しいサービスログを作成できる', async () => {
      const createdLog = { 
        id: 3, 
        ...createData, 
        status: 'draft' as const,
        attachments: [],
        createdAt: '2024-01-17T00:00:00Z', 
        updatedAt: '2024-01-17T00:00:00Z' 
      };
      mockApiClient.post.mockResolvedValue(createdLog);

      const result = await serviceLogService.createServiceLog(createData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/service_logs', createData);
      expect(result).toEqual(createdLog);
    });

    it('必須フィールドのみで作成できる', async () => {
      const minimalData: CreateServiceLogRequest = {
        clientId: 2,
        supportPlanId: 2,
        staffId: 3,
        serviceDate: '2024-01-18',
        startTime: '10:00',
        endTime: '11:00',
        serviceType: 'consultation',
        content: '定期相談を実施',
      };
      const createdLog = { 
        id: 4, 
        ...minimalData,
        status: 'draft' as const,
        attachments: [],
        createdAt: '2024-01-18T00:00:00Z', 
        updatedAt: '2024-01-18T00:00:00Z' 
      };
      mockApiClient.post.mockResolvedValue(createdLog);

      const result = await serviceLogService.createServiceLog(minimalData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/service_logs', minimalData);
      expect(result).toEqual(createdLog);
    });

    it('終了時刻が開始時刻より前の場合エラーが発生する', async () => {
      const invalidData = { ...createData, endTime: '08:00' };
      mockApiClient.post.mockRejectedValue(new Error('終了時刻は開始時刻より後である必要があります'));

      await expect(serviceLogService.createServiceLog(invalidData)).rejects.toThrow('終了時刻は開始時刻より後である必要があります');
    });
  });

  describe('updateServiceLog', () => {
    const updateData: UpdateServiceLogRequest = {
      id: 1,
      content: '入浴介助と身体清拭、爪切りを実施',
      nextAction: '次回は散髪も検討',
      status: 'approved',
      approvedBy: 10,
      approvedAt: '2024-01-16T09:00:00Z',
    };

    it('既存サービスログを更新できる', async () => {
      const updatedLog = { ...mockServiceLog, ...updateData, updatedAt: '2024-01-16T09:00:00Z' };
      mockApiClient.put.mockResolvedValue(updatedLog);

      const result = await serviceLogService.updateServiceLog(updateData);

      const { id, ...expectedData } = updateData;
      expect(mockApiClient.put).toHaveBeenCalledWith('/api/service_logs/1', expectedData);
      expect(result).toEqual(updatedLog);
    });

    it('ステータスのみ更新できる', async () => {
      const statusUpdate: UpdateServiceLogRequest = {
        id: 1,
        status: 'approved',
      };
      const updatedLog = { ...mockServiceLog, status: 'approved' as const, updatedAt: '2024-01-16T00:00:00Z' };
      mockApiClient.put.mockResolvedValue(updatedLog);

      const result = await serviceLogService.updateServiceLog(statusUpdate);

      const { id, ...expectedData } = statusUpdate;
      expect(mockApiClient.put).toHaveBeenCalledWith('/api/service_logs/1', expectedData);
      expect(result).toEqual(updatedLog);
    });
  });

  describe('deleteServiceLog', () => {
    it('サービスログを削除できる', async () => {
      mockApiClient.delete.mockResolvedValue(null);

      await serviceLogService.deleteServiceLog(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/service_logs/1');
    });

    it('承認済みログの削除でエラーが発生する', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('承認済みのサービスログは削除できません'));

      await expect(serviceLogService.deleteServiceLog(1)).rejects.toThrow('承認済みのサービスログは削除できません');
    });
  });

  describe('getServiceLogStats', () => {
    it('サービスログの統計情報を取得できる', async () => {
      const statsData = {
        total: 150,
        byServiceType: {
          physical_care: 50,
          domestic_support: 40,
          social_participation: 30,
          consultation: 25,
          other: 5,
        },
        byStatus: {
          draft: 10,
          confirmed: 120,
          approved: 20,
        },
        totalHours: 300,
        averageHoursPerService: 2,
        thisWeek: 15,
        thisMonth: 65,
        pendingApproval: 10,
      };
      mockApiClient.get.mockResolvedValue(statsData);

      const result = await serviceLogService.getServiceLogStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/stats', undefined);
      expect(result).toEqual(statsData);
    });

    it('クライアントIDでフィルタリングできる', async () => {
      const clientStats = {
        total: 20,
        byServiceType: {
          physical_care: 8,
          domestic_support: 6,
          social_participation: 4,
          consultation: 2,
          other: 0,
        },
        byStatus: {
          draft: 2,
          confirmed: 15,
          approved: 3,
        },
        totalHours: 40,
        averageHoursPerService: 2,
        thisWeek: 3,
        thisMonth: 8,
        pendingApproval: 2,
      };
      mockApiClient.get.mockResolvedValue(clientStats);

      const result = await serviceLogService.getServiceLogStats({ clientId: 1 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/stats', { clientId: 1 });
      expect(result).toEqual(clientStats);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('複数のサービスログのステータスを一括更新できる', async () => {
      const logIds = [1, 2, 3];
      const newStatus = 'approved' as const;
      const updatedLogs = logIds.map(id => ({ ...mockServiceLog, id, status: newStatus }));
      mockApiClient.post.mockResolvedValue(updatedLogs);

      const result = await serviceLogService.bulkUpdateStatus(logIds, newStatus, 10);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/service_logs/bulk-update-status', {
        logIds,
        status: newStatus,
        approvedBy: 10,
      });
      expect(result).toEqual(updatedLogs);
    });
  });

  describe('getDailySummary', () => {
    it('指定日の日次サマリーを取得できる', async () => {
      const summary = {
        date: '2024-01-15',
        totalServices: 25,
        totalHours: 50,
        byServiceType: {
          physical_care: 10,
          domestic_support: 8,
          social_participation: 4,
          consultation: 3,
          other: 0,
        },
        staffCount: 8,
        clientCount: 20,
      };
      mockApiClient.get.mockResolvedValue(summary);

      const result = await serviceLogService.getDailySummary('2024-01-15');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/daily-summary', { date: '2024-01-15' });
      expect(result).toEqual(summary);
    });
  });

  describe('getMonthlyReport', () => {
    it('月次レポートを取得できる', async () => {
      const report = {
        month: 'January',
        year: 2024,
        totalServices: 500,
        totalHours: 1000,
        byServiceType: {
          physical_care: 200,
          domestic_support: 150,
          social_participation: 80,
          consultation: 60,
          other: 10,
        },
        byClient: [
          { clientId: 1, clientName: '田中太郎', serviceCount: 20, totalHours: 40 },
          { clientId: 2, clientName: '山田花子', serviceCount: 15, totalHours: 30 },
        ],
        byStaff: [
          { staffId: 1, staffName: '佐藤職員', serviceCount: 50, totalHours: 100 },
          { staffId: 2, staffName: '鈴木職員', serviceCount: 45, totalHours: 90 },
        ],
      };
      mockApiClient.get.mockResolvedValue(report);

      const result = await serviceLogService.getMonthlyReport(2024, 1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/monthly-report', { year: 2024, month: 1 });
      expect(result).toEqual(report);
    });
  });

  describe('exportServiceLogs', () => {
    it('サービスログデータをCSV形式でエクスポートできる', async () => {
      const exportData = {
        filename: 'service_logs_export_20240115.csv',
        data: 'header1,header2\ndata1,data2',
        mimeType: 'text/csv',
      };
      mockApiClient.get.mockResolvedValue(exportData);

      const result = await serviceLogService.exportServiceLogs('csv');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/export', { format: 'csv' });
      expect(result).toEqual(exportData);
    });

    it('フィルタ条件付きでエクスポートできる', async () => {
      const filters = {
        clientId: 1,
        serviceType: 'physical_care' as const,
        serviceDateFrom: '2024-01-01',
        serviceDateTo: '2024-01-31',
      };
      const exportData = {
        filename: 'filtered_service_logs.csv',
        data: 'header1,header2\ndata1,data2',
        mimeType: 'text/csv',
      };
      mockApiClient.get.mockResolvedValue(exportData);

      const result = await serviceLogService.exportServiceLogs('csv', filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/export', {
        format: 'csv',
        ...filters,
      });
      expect(result).toEqual(exportData);
    });
  });

  describe('searchServiceLogs', () => {
    it('キーワードでサービスログを検索できる', async () => {
      const searchResults = [mockServiceLog];
      mockApiClient.get.mockResolvedValue(searchResults);

      const result = await serviceLogService.searchServiceLogs('入浴介助');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/search', { q: '入浴介助' });
      expect(result).toEqual(searchResults);
    });

    it('検索条件とフィルタを組み合わせられる', async () => {
      const params = {
        q: '介助',
        clientId: 1,
        serviceType: 'physical_care' as const,
      };
      const searchResults = [mockServiceLog];
      mockApiClient.get.mockResolvedValue(searchResults);

      const result = await serviceLogService.searchServiceLogs('介助', { 
        clientId: 1, 
        serviceType: 'physical_care' 
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service_logs/search', params);
      expect(result).toEqual(searchResults);
    });
  });
});
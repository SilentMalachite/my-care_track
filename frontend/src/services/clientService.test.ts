import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from './clientService';
import { apiClient } from './api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client';

// APIクライアントのモック
vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // モックデータ
  const mockClient: Client = {
    id: 1,
    clientNumber: 'CL001',
    name: '山田太郎',
    nameKana: 'ヤマダタロウ',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    phone: '03-1234-5678',
    email: 'yamada@example.com',
    address: '東京都千代田区1-1-1',
    disabilityType: 'physical',
    disabilityGrade: 2,
    insuranceNumber: 'INS123456',
    status: 'active',
    notes: '特記事項なし',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockClients: Client[] = [
    mockClient,
    {
      ...mockClient,
      id: 2,
      clientNumber: 'CL002',
      name: '佐藤花子',
      nameKana: 'サトウハナコ',
      email: 'sato@example.com',
    },
  ];

  describe('getAll', () => {
    it('全クライアントを取得できる', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockClients });

      const result = await clientService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/clients', { params: undefined });
      expect(result).toEqual(mockClients);
    });

    it('パラメータ付きでクライアントを取得できる', async () => {
      const params = {
        page: 2,
        limit: 20,
        status: 'active' as const,
        search: '山田',
      };
      (apiClient.get as any).mockResolvedValue({ data: mockClients });

      const result = await clientService.getAll(params);

      expect(apiClient.get).toHaveBeenCalledWith('/clients', { params });
      expect(result).toEqual(mockClients);
    });

    it('エラーが発生した場合、エラーをスローする', async () => {
      const error = new Error('Network Error');
      (apiClient.get as any).mockRejectedValue(error);

      await expect(clientService.getAll()).rejects.toThrow('Network Error');
    });
  });

  describe('getById', () => {
    it('IDでクライアントを取得できる', async () => {
      (apiClient.get as any).mockResolvedValue({ data: mockClient });

      const result = await clientService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/clients/1');
      expect(result).toEqual(mockClient);
    });

    it('クライアントが見つからない場合、nullを返す', async () => {
      const error = { response: { status: 404 } };
      (apiClient.get as any).mockRejectedValue(error);

      const result = await clientService.getById(999);

      expect(result).toBeNull();
    });

    it('その他のエラーの場合、エラーをスローする', async () => {
      const error = new Error('Server Error');
      (apiClient.get as any).mockRejectedValue(error);

      await expect(clientService.getById(1)).rejects.toThrow('Server Error');
    });
  });

  describe('create', () => {
    it('新規クライアントを作成できる', async () => {
      const createRequest: CreateClientRequest = {
        name: '新規太郎',
        nameKana: 'シンキタロウ',
        dateOfBirth: '1995-05-05',
        gender: 'male',
        phone: '090-1234-5678',
        address: '東京都新宿区2-2-2',
        disabilityType: 'mental',
        disabilityGrade: 3,
      };

      const createdClient = {
        ...createRequest,
        id: 3,
        clientNumber: 'CL003',
        status: 'active',
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue({ data: createdClient });

      const result = await clientService.create(createRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/clients', createRequest);
      expect(result).toEqual(createdClient);
    });

    it('バリデーションエラーの場合、エラー詳細を含むエラーをスローする', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'バリデーションエラー',
            errors: {
              name: ['名前は必須です'],
              email: ['メールアドレスの形式が正しくありません'],
            },
          },
        },
      };

      (apiClient.post as any).mockRejectedValue(validationError);

      try {
        await clientService.create({} as CreateClientRequest);
        expect.fail('エラーがスローされるべきです');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toBeDefined();
      }
    });
  });

  describe('update', () => {
    it('クライアント情報を更新できる', async () => {
      const updateRequest: UpdateClientRequest = {
        id: 1,
        email: 'yamada-new@example.com',
        phone: '03-9876-5432',
      };

      const updatedClient = {
        ...mockClient,
        ...updateRequest,
        updatedAt: '2024-06-10T00:00:00Z',
      };

      (apiClient.put as any).mockResolvedValue({ data: updatedClient });

      const result = await clientService.update(1, updateRequest);

      expect(apiClient.put).toHaveBeenCalledWith('/clients/1', updateRequest);
      expect(result).toEqual(updatedClient);
    });

    it('部分更新ができる', async () => {
      const partialUpdate: UpdateClientRequest = {
        status: 'inactive',
      };

      const updatedClient = {
        ...mockClient,
        status: 'inactive',
        updatedAt: '2024-06-10T00:00:00Z',
      };

      (apiClient.put as any).mockResolvedValue({ data: updatedClient });

      const result = await clientService.update(1, partialUpdate);

      expect(apiClient.put).toHaveBeenCalledWith('/clients/1', partialUpdate);
      expect(result.status).toBe('inactive');
    });
  });

  describe('delete', () => {
    it('クライアントを削除できる', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: { success: true } });

      await clientService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/clients/1');
    });

    it('削除時のエラーをスローする', async () => {
      const error = new Error('削除できません');
      (apiClient.delete as any).mockRejectedValue(error);

      await expect(clientService.delete(1)).rejects.toThrow('削除できません');
    });
  });

  describe('search', () => {
    it('検索条件でクライアントを検索できる', async () => {
      const searchParams = {
        query: '山田',
        disabilityType: 'physical' as const,
        status: 'active' as const,
      };

      (apiClient.get as any).mockResolvedValue({ data: [mockClient] });

      const result = await clientService.search(searchParams);

      expect(apiClient.get).toHaveBeenCalledWith('/clients/search', { params: searchParams });
      expect(result).toEqual([mockClient]);
    });

    it('空の検索結果を返す', async () => {
      (apiClient.get as any).mockResolvedValue({ data: [] });

      const result = await clientService.search({ query: '存在しない' });

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('クライアント統計情報を取得できる', async () => {
      const mockStats = {
        total: 100,
        byStatus: {
          active: 80,
          inactive: 15,
          suspended: 5,
        },
        byDisabilityType: {
          physical: 40,
          mental: 30,
          intellectual: 20,
          developmental: 10,
        },
      };

      (apiClient.get as any).mockResolvedValue({ data: mockStats });

      const result = await clientService.getStats();

      expect(apiClient.get).toHaveBeenCalledWith('/clients/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('checkClientNumber', () => {
    it('クライアント番号が利用可能かチェックできる', async () => {
      (apiClient.get as any).mockResolvedValue({ data: { available: true } });

      const result = await clientService.checkClientNumber('CL999');

      expect(apiClient.get).toHaveBeenCalledWith('/clients/check-number/CL999');
      expect(result).toBe(true);
    });

    it('クライアント番号が既に使用されている場合', async () => {
      (apiClient.get as any).mockResolvedValue({ data: { available: false } });

      const result = await clientService.checkClientNumber('CL001');

      expect(result).toBe(false);
    });
  });

  describe('getEmergencyContacts', () => {
    it('緊急連絡先を取得できる', async () => {
      const mockContacts = [
        {
          id: 1,
          clientId: 1,
          name: '山田太郎の母',
          relationship: '母',
          phone: '090-1111-2222',
          isPrimary: true,
        },
        {
          id: 2,
          clientId: 1,
          name: '山田太郎の妹',
          relationship: '妹',
          phone: '090-3333-4444',
          isPrimary: false,
        },
      ];

      (apiClient.get as any).mockResolvedValue({ data: mockContacts });

      const result = await clientService.getEmergencyContacts(1);

      expect(apiClient.get).toHaveBeenCalledWith('/clients/1/emergency-contacts');
      expect(result).toEqual(mockContacts);
    });
  });

  describe('updateEmergencyContacts', () => {
    it('緊急連絡先を更新できる', async () => {
      const contacts = [
        {
          name: '山田太郎の父',
          relationship: '父',
          phone: '090-5555-6666',
          isPrimary: true,
        },
      ];

      (apiClient.put as any).mockResolvedValue({ data: contacts });

      const result = await clientService.updateEmergencyContacts(1, contacts);

      expect(apiClient.put).toHaveBeenCalledWith('/clients/1/emergency-contacts', { contacts });
      expect(result).toEqual(contacts);
    });
  });

  describe('exportToCSV', () => {
    it('CSV形式でクライアントデータをエクスポートできる', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      (apiClient.get as any).mockResolvedValue({ data: mockBlob });

      const result = await clientService.exportToCSV();

      expect(apiClient.get).toHaveBeenCalledWith('/clients/export', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });

    it('フィルター付きでエクスポートできる', async () => {
      const filters = {
        status: 'active' as const,
        disabilityType: 'physical' as const,
      };
      const mockBlob = new Blob(['filtered csv data'], { type: 'text/csv' });
      (apiClient.get as any).mockResolvedValue({ data: mockBlob });

      const result = await clientService.exportToCSV(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/clients/export', {
        params: filters,
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });
});
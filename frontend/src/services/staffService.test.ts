import { describe, it, expect, vi, beforeEach } from 'vitest';
import { staffService } from './staffService';
import { apiClient } from './api';

// APIクライアントのモック
vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApiClient = apiClient as any;

describe('staffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStaff = {
    id: 1,
    name: '山田太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    role: 'ケアマネージャー',
    department: '介護支援課',
    isActive: true,
    hireDate: '2020-04-01',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockStaffList = [
    mockStaff,
    {
      id: 2,
      name: '佐藤花子',
      email: 'sato@example.com',
      phone: '090-2345-6789',
      role: '介護福祉士',
      department: '訪問介護課',
      isActive: true,
      hireDate: '2021-04-01',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
  ];

  describe('getStaff', () => {
    it('全スタッフを取得できる', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockStaffList });

      const result = await staffService.getStaff();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { params: undefined });
      expect(result).toEqual(mockStaffList);
    });

    it('検索パラメータを指定してスタッフを取得できる', async () => {
      const params = { 
        search: '山田',
        department: '介護支援課',
        isActive: true 
      };
      mockApiClient.get.mockResolvedValue({ data: [mockStaff] });

      const result = await staffService.getStaff(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { params });
      expect(result).toEqual([mockStaff]);
    });

    it('エラーハンドリングが正しく動作する', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(staffService.getStaff()).rejects.toThrow('Network error');
    });
  });

  describe('getStaffById', () => {
    it('IDでスタッフを取得できる', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockStaff });

      const result = await staffService.getStaffById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff/1');
      expect(result).toEqual(mockStaff);
    });

    it('存在しないIDの場合エラーになる', async () => {
      const error = new Error('Not found');
      mockApiClient.get.mockRejectedValue(error);

      await expect(staffService.getStaffById(999)).rejects.toThrow('Not found');
    });
  });

  describe('getActiveStaff', () => {
    it('アクティブなスタッフのみを取得できる', async () => {
      const activeStaff = mockStaffList.filter(s => s.isActive);
      mockApiClient.get.mockResolvedValue({ data: activeStaff });

      const result = await staffService.getActiveStaff();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff/active');
      expect(result).toEqual(activeStaff);
    });
  });

  describe('createStaff', () => {
    it('新しいスタッフを作成できる', async () => {
      const newStaff = {
        name: '新規スタッフ',
        email: 'new@example.com',
        phone: '090-9999-9999',
        role: '介護助手',
        department: '介護支援課',
        hireDate: '2024-01-01',
      };
      const createdStaff = { ...newStaff, id: 3, isActive: true };
      mockApiClient.post.mockResolvedValue({ data: createdStaff });

      const result = await staffService.createStaff(newStaff);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/staff', newStaff);
      expect(result).toEqual(createdStaff);
    });

    it('必須フィールドが不足している場合エラーになる', async () => {
      const invalidStaff = { name: '名前のみ' };
      const error = new Error('Validation error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(staffService.createStaff(invalidStaff as any)).rejects.toThrow('Validation error');
    });
  });

  describe('updateStaff', () => {
    it('既存スタッフを更新できる', async () => {
      const updateData = { role: 'シニアケアマネージャー' };
      const updatedStaff = { ...mockStaff, ...updateData };
      mockApiClient.patch.mockResolvedValue({ data: updatedStaff });

      const result = await staffService.updateStaff(1, updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/v1/staff/1', updateData);
      expect(result).toEqual(updatedStaff);
    });
  });

  describe('deleteStaff', () => {
    it('スタッフを削除できる', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true } });

      await staffService.deleteStaff(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/staff/1');
    });
  });

  describe('deactivateStaff', () => {
    it('スタッフを非アクティブにできる', async () => {
      const deactivatedStaff = { ...mockStaff, isActive: false };
      mockApiClient.patch.mockResolvedValue({ data: deactivatedStaff });

      const result = await staffService.deactivateStaff(1);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/v1/staff/1/deactivate', {});
      expect(result).toEqual(deactivatedStaff);
    });
  });

  describe('getStaffByDepartment', () => {
    it('部署別のスタッフを取得できる', async () => {
      const departmentStaff = mockStaffList.filter(s => s.department === '介護支援課');
      mockApiClient.get.mockResolvedValue({ data: departmentStaff });

      const result = await staffService.getStaffByDepartment('介護支援課');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { 
        params: { department: '介護支援課' } 
      });
      expect(result).toEqual(departmentStaff);
    });
  });

  describe('getStaffByRole', () => {
    it('役職別のスタッフを取得できる', async () => {
      const roleStaff = mockStaffList.filter(s => s.role === 'ケアマネージャー');
      mockApiClient.get.mockResolvedValue({ data: roleStaff });

      const result = await staffService.getStaffByRole('ケアマネージャー');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { 
        params: { role: 'ケアマネージャー' } 
      });
      expect(result).toEqual(roleStaff);
    });
  });

  describe('searchStaff', () => {
    it('名前でスタッフを検索できる', async () => {
      const searchResults = [mockStaff];
      mockApiClient.get.mockResolvedValue({ data: searchResults });

      const result = await staffService.searchStaff('山田');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { 
        params: { search: '山田' } 
      });
      expect(result).toEqual(searchResults);
    });

    it('空の検索文字列の場合、全スタッフを返す', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockStaffList });

      const result = await staffService.searchStaff('');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/staff', { 
        params: { search: '' } 
      });
      expect(result).toEqual(mockStaffList);
    });
  });
});
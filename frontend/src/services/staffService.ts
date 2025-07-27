import { apiClient } from './api';
import type { Staff, StaffFormData, StaffSearchParams } from '../types/staff';

export const staffService = {
  /**
   * スタッフ一覧を取得
   */
  async getStaff(params?: StaffSearchParams): Promise<Staff[]> {
    const response = await apiClient.get('/api/v1/staff', { params });
    return response.data;
  },

  /**
   * IDでスタッフを取得
   */
  async getStaffById(id: number): Promise<Staff> {
    const response = await apiClient.get(`/api/v1/staff/${id}`);
    return response.data;
  },

  /**
   * アクティブなスタッフのみを取得
   */
  async getActiveStaff(): Promise<Staff[]> {
    const response = await apiClient.get('/api/v1/staff/active');
    return response.data;
  },

  /**
   * スタッフを新規作成
   */
  async createStaff(data: StaffFormData): Promise<Staff> {
    const response = await apiClient.post('/api/v1/staff', data);
    return response.data;
  },

  /**
   * スタッフ情報を更新
   */
  async updateStaff(id: number, data: Partial<StaffFormData>): Promise<Staff> {
    const response = await apiClient.patch(`/api/v1/staff/${id}`, data);
    return response.data;
  },

  /**
   * スタッフを削除
   */
  async deleteStaff(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/staff/${id}`);
  },

  /**
   * スタッフを非アクティブ化
   */
  async deactivateStaff(id: number): Promise<Staff> {
    const response = await apiClient.patch(`/api/v1/staff/${id}/deactivate`, {});
    return response.data;
  },

  /**
   * 部署別スタッフを取得
   */
  async getStaffByDepartment(department: string): Promise<Staff[]> {
    const response = await apiClient.get('/api/v1/staff', { 
      params: { department } 
    });
    return response.data;
  },

  /**
   * 役職別スタッフを取得
   */
  async getStaffByRole(role: string): Promise<Staff[]> {
    const response = await apiClient.get('/api/v1/staff', { 
      params: { role } 
    });
    return response.data;
  },

  /**
   * スタッフを検索
   */
  async searchStaff(search: string): Promise<Staff[]> {
    const response = await apiClient.get('/api/v1/staff', { 
      params: { search } 
    });
    return response.data;
  },
};
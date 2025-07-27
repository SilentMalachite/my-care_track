import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assessmentService } from './assessmentService';
import apiClient from './api';
import type { Assessment, AssessmentFormData } from '../types/assessment';

vi.mock('./api');

describe('assessmentService', () => {
  const mockApiClient = apiClient as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAssessment: Assessment = {
    id: 1,
    clientId: 1,
    staffId: 1,
    supportPlanId: 1,
    assessmentType: 'initial',
    assessmentDate: '2025-07-27',
    summary: '初回アセスメントを実施しました。',
    overallScore: 75,
    categoryScores: {
      '身体機能': 80,
      '認知機能': 70,
      '社会参加': 75,
    },
    strengths: '日常生活動作は概ね自立している。',
    challenges: '階段昇降時に不安定さが見られる。',
    recommendations: '理学療法の頻度を週2回に増やす。',
    goals: '3ヶ月後には階段を安全に昇降できるようになる。',
    status: 'draft',
    notes: '次回評価は3ヶ月後に実施予定',
    createdAt: '2025-07-27T10:00:00',
    updatedAt: '2025-07-27T10:00:00',
  };

  const mockAssessmentList: Assessment[] = [
    mockAssessment,
    {
      ...mockAssessment,
      id: 2,
      assessmentType: 'periodic',
      assessmentDate: '2025-07-20',
      summary: '定期アセスメントを実施しました。',
      status: 'approved',
    },
  ];

  describe('getAssessments', () => {
    it('全アセスメントリストを取得できる', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockAssessmentList });

      const result = await assessmentService.getAssessments();

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments', { params: {} });
      expect(result).toEqual(mockAssessmentList);
    });

    it('フィルタ条件付きでアセスメントを取得できる', async () => {
      const filters = { status: 'approved', clientId: 1 };
      mockApiClient.get.mockResolvedValue({ data: mockAssessmentList.filter(a => a.status === 'approved') });

      const result = await assessmentService.getAssessments(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments', { params: filters });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('approved');
    });
  });

  describe('getAssessmentById', () => {
    it('指定されたIDのアセスメントを取得できる', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockAssessment });

      const result = await assessmentService.getAssessmentById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments/1');
      expect(result).toEqual(mockAssessment);
    });

    it('存在しないIDの場合エラーをスローする', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      await expect(assessmentService.getAssessmentById(999)).rejects.toThrow('Not found');
    });
  });

  describe('getAssessmentsByClientId', () => {
    it('特定クライアントのアセスメントを取得できる', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockAssessmentList });

      const result = await assessmentService.getAssessmentsByClientId(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments', { params: { clientId: 1 } });
      expect(result).toEqual(mockAssessmentList);
    });
  });

  describe('createAssessment', () => {
    const newAssessmentData: AssessmentFormData = {
      clientId: 1,
      staffId: 1,
      assessmentType: 'initial',
      assessmentDate: '2025-07-27',
      summary: '新規アセスメント',
      overallScore: 80,
    };

    it('新しいアセスメントを作成できる', async () => {
      const createdAssessment = { ...mockAssessment, ...newAssessmentData };
      mockApiClient.post.mockResolvedValue({ data: createdAssessment });

      const result = await assessmentService.createAssessment(newAssessmentData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/assessments', newAssessmentData);
      expect(result).toEqual(createdAssessment);
    });

    it('バリデーションエラーが発生した場合エラーをスローする', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Validation failed'));

      await expect(assessmentService.createAssessment(newAssessmentData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateAssessment', () => {
    const updateData = {
      summary: '更新されたアセスメント',
      overallScore: 85,
    };

    it('既存アセスメントを更新できる', async () => {
      const updatedAssessment = { ...mockAssessment, ...updateData };
      mockApiClient.patch.mockResolvedValue({ data: updatedAssessment });

      const result = await assessmentService.updateAssessment(1, updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/assessments/1', updateData);
      expect(result).toEqual(updatedAssessment);
    });
  });

  describe('deleteAssessment', () => {
    it('アセスメントを削除できる', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} });

      await assessmentService.deleteAssessment(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/assessments/1');
    });

    it('削除できない場合エラーをスローする', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Cannot delete approved assessment'));

      await expect(assessmentService.deleteAssessment(1)).rejects.toThrow('Cannot delete approved assessment');
    });
  });

  describe('finalizeAssessment', () => {
    it('アセスメントを承認できる', async () => {
      const finalizedAssessment = { 
        ...mockAssessment, 
        status: 'approved' as const,
        finalizedAt: '2025-07-27T12:00:00',
        finalizedBy: 1,
      };
      mockApiClient.post.mockResolvedValue({ data: finalizedAssessment });

      const result = await assessmentService.finalizeAssessment(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/assessments/1/finalize');
      expect(result.status).toBe('approved');
    });
  });

  describe('getAssessmentStatistics', () => {
    it('アセスメントの統計情報を取得できる', async () => {
      const stats = {
        total: 10,
        byStatus: { draft: 3, pending: 2, approved: 5 },
        byType: { initial: 2, periodic: 6, annual: 1, discharge: 1 },
        averageScore: 78.5,
      };
      mockApiClient.get.mockResolvedValue({ data: stats });

      const result = await assessmentService.getAssessmentStatistics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments/statistics');
      expect(result).toEqual(stats);
    });
  });

  describe('duplicateAssessment', () => {
    it('既存のアセスメントを複製できる', async () => {
      const duplicatedAssessment = {
        ...mockAssessment,
        id: 3,
        assessmentDate: '2025-07-28',
        status: 'draft' as const,
      };
      mockApiClient.post.mockResolvedValue({ data: duplicatedAssessment });

      const result = await assessmentService.duplicateAssessment(1, { assessmentDate: '2025-07-28' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/assessments/1/duplicate', { assessmentDate: '2025-07-28' });
      expect(result.id).toBe(3);
      expect(result.status).toBe('draft');
    });
  });

  describe('exportAssessmentData', () => {
    it('アセスメントデータをCSV形式でエクスポートできる', async () => {
      const csvData = 'id,client_id,assessment_type,assessment_date\n1,1,initial,2025-07-27';
      mockApiClient.get.mockResolvedValue({ data: csvData });

      const result = await assessmentService.exportAssessmentData({ format: 'csv' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/assessments/export', {
        params: { format: 'csv' },
        responseType: 'text',
      });
      expect(result).toBe(csvData);
    });
  });

  describe('validateAssessmentScore', () => {
    it('有効なスコアの場合trueを返す', () => {
      expect(assessmentService.validateAssessmentScore(50)).toBe(true);
      expect(assessmentService.validateAssessmentScore(1)).toBe(true);
      expect(assessmentService.validateAssessmentScore(100)).toBe(true);
    });

    it('無効なスコアの場合falseを返す', () => {
      expect(assessmentService.validateAssessmentScore(0)).toBe(false);
      expect(assessmentService.validateAssessmentScore(101)).toBe(false);
      expect(assessmentService.validateAssessmentScore(-1)).toBe(false);
    });
  });

  describe('calculateAverageScore', () => {
    it('カテゴリスコアの平均を計算できる', () => {
      const categoryScores = {
        '身体機能': 80,
        '認知機能': 70,
        '社会参加': 75,
      };

      const average = assessmentService.calculateAverageScore(categoryScores);
      expect(average).toBe(75);
    });

    it('空のカテゴリスコアの場合0を返す', () => {
      const average = assessmentService.calculateAverageScore({});
      expect(average).toBe(0);
    });
  });
});
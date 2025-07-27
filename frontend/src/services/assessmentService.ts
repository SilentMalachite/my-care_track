import apiClient from './api';
import type { Assessment, AssessmentFormData } from '../types/assessment';

interface AssessmentFilters {
  clientId?: number;
  staffId?: number;
  supportPlanId?: number;
  assessmentType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface AssessmentStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  averageScore: number;
}

interface ExportOptions {
  format: 'csv' | 'pdf';
  filters?: AssessmentFilters;
}

class AssessmentService {
  /**
   * アセスメントリストを取得
   */
  async getAssessments(filters: AssessmentFilters = {}): Promise<Assessment[]> {
    const response = await apiClient.get('/assessments', { params: filters });
    return response.data;
  }

  /**
   * 指定IDのアセスメントを取得
   */
  async getAssessmentById(id: number): Promise<Assessment> {
    const response = await apiClient.get(`/assessments/${id}`);
    return response.data;
  }

  /**
   * 特定クライアントのアセスメントを取得
   */
  async getAssessmentsByClientId(clientId: number): Promise<Assessment[]> {
    const response = await apiClient.get('/assessments', { params: { clientId } });
    return response.data;
  }

  /**
   * 新規アセスメントを作成
   */
  async createAssessment(data: AssessmentFormData): Promise<Assessment> {
    const response = await apiClient.post('/assessments', data);
    return response.data;
  }

  /**
   * 既存アセスメントを更新
   */
  async updateAssessment(id: number, data: Partial<AssessmentFormData>): Promise<Assessment> {
    const response = await apiClient.patch(`/assessments/${id}`, data);
    return response.data;
  }

  /**
   * アセスメントを削除
   */
  async deleteAssessment(id: number): Promise<void> {
    await apiClient.delete(`/assessments/${id}`);
  }

  /**
   * アセスメントを承認
   */
  async finalizeAssessment(id: number): Promise<Assessment> {
    const response = await apiClient.post(`/assessments/${id}/finalize`);
    return response.data;
  }

  /**
   * アセスメントの統計情報を取得
   */
  async getAssessmentStatistics(): Promise<AssessmentStatistics> {
    const response = await apiClient.get('/assessments/statistics');
    return response.data;
  }

  /**
   * 既存のアセスメントを複製
   */
  async duplicateAssessment(id: number, overrides: Partial<AssessmentFormData>): Promise<Assessment> {
    const response = await apiClient.post(`/assessments/${id}/duplicate`, overrides);
    return response.data;
  }

  /**
   * アセスメントデータをエクスポート
   */
  async exportAssessmentData(options: ExportOptions): Promise<string | Blob> {
    const response = await apiClient.get('/assessments/export', {
      params: options,
      responseType: options.format === 'pdf' ? 'blob' : 'text',
    });
    return response.data;
  }

  /**
   * アセスメントスコアのバリデーション
   */
  validateAssessmentScore(score: number): boolean {
    return score >= 1 && score <= 100;
  }

  /**
   * カテゴリスコアの平均を計算
   */
  calculateAverageScore(categoryScores: Record<string, number>): number {
    const scores = Object.values(categoryScores);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  }

  /**
   * アセスメントの期限チェック
   */
  isAssessmentDue(lastAssessmentDate: string, assessmentType: Assessment['assessmentType']): boolean {
    const daysSinceLastAssessment = Math.floor(
      (new Date().getTime() - new Date(lastAssessmentDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (assessmentType) {
      case 'periodic':
        return daysSinceLastAssessment >= 90; // 3ヶ月
      case 'annual':
        return daysSinceLastAssessment >= 365; // 1年
      default:
        return false;
    }
  }

  /**
   * アセスメントデータのフォーマット
   */
  formatAssessmentForDisplay(assessment: Assessment): any {
    return {
      ...assessment,
      assessmentDateFormatted: new Date(assessment.assessmentDate).toLocaleDateString('ja-JP'),
      statusLabel: this.getStatusLabel(assessment.status),
      typeLabel: this.getTypeLabel(assessment.assessmentType),
    };
  }

  private getStatusLabel(status: Assessment['status']): string {
    const statusLabels = {
      draft: '下書き',
      pending: '承認待ち',
      approved: '承認済み',
    };
    return statusLabels[status] || status;
  }

  private getTypeLabel(type: Assessment['assessmentType']): string {
    const typeLabels = {
      initial: '初回',
      periodic: '定期',
      annual: '年次',
      discharge: '終了時',
    };
    return typeLabels[type] || type;
  }
}

export const assessmentService = new AssessmentService();
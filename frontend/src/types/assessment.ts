export interface Assessment {
  id: number;
  clientId: number;
  staffId: number;
  supportPlanId?: number;
  assessmentType: 'initial' | 'periodic' | 'annual' | 'discharge';
  assessmentDate: string;
  summary?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  strengths?: string;
  challenges?: string;
  recommendations?: string;
  goals?: string;
  status: 'draft' | 'pending' | 'approved';
  finalizedAt?: string;
  finalizedBy?: number;
  attachments?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentFormData {
  clientId: number;
  staffId: number;
  supportPlanId?: number;
  assessmentType: 'initial' | 'periodic' | 'annual' | 'discharge';
  assessmentDate: string;
  summary?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  strengths?: string;
  challenges?: string;
  recommendations?: string;
  goals?: string;
  status?: 'draft' | 'pending' | 'approved';
  notes?: string;
}

export const ASSESSMENT_TYPES = {
  initial: '初回',
  periodic: '定期',
  annual: '年次',
  discharge: '終了時',
} as const;

export const ASSESSMENT_STATUS = {
  draft: '下書き',
  pending: '承認待ち',
  approved: '承認済み',
} as const;

export const ASSESSMENT_CATEGORIES = [
  '身体機能',
  '認知機能',
  '社会参加',
  '日常生活動作',
  'コミュニケーション',
] as const;
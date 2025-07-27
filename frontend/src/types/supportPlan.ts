export interface SupportPlan {
  id: number;
  clientId: number;
  planName: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  assignedStaffIds: number[];
  notes?: string;
  reviewDate?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportPlanRequest {
  clientId: number;
  planName: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  assignedStaffIds?: number[];
  notes?: string;
}

export interface UpdateSupportPlanRequest extends Partial<CreateSupportPlanRequest> {
  id: number;
  reviewDate?: string;
  reviewNotes?: string;
}

export const SUPPORT_PLAN_STATUS_LABELS: Record<SupportPlan['status'], string> = {
  pending: '保留中',
  active: '実施中',
  completed: '完了',
  cancelled: 'キャンセル',
};

export const SUPPORT_PLAN_PRIORITY_LABELS: Record<SupportPlan['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

// 進捗率計算用の型
export interface SupportPlanProgress {
  planId: number;
  totalGoals: number;
  completedGoals: number;
  progressPercentage: number;
  daysElapsed: number;
  totalDays: number;
  timeProgressPercentage: number;
  isOverdue: boolean;
}

// 統計情報用の型
export interface SupportPlanStats {
  total: number;
  byStatus: Record<SupportPlan['status'], number>;
  byPriority: Record<SupportPlan['priority'], number>;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  averageCompletionDays: number;
}
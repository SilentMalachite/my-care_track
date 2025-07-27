export interface ServiceLog {
  id: number;
  clientId: number;
  supportPlanId: number;
  staffId: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  serviceType: 'physical_care' | 'domestic_support' | 'social_participation' | 'consultation' | 'employment_support' | 'medical_support' | 'other';
  content: string;
  nextAction?: string;
  attachments?: string[];
  notes?: string;
  status: 'draft' | 'confirmed' | 'approved';
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceLogRequest {
  clientId: number;
  supportPlanId: number;
  staffId: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  serviceType: ServiceLog['serviceType'];
  content: string;
  nextAction?: string;
  attachments?: string[];
  notes?: string;
  status?: ServiceLog['status'];
}

export interface UpdateServiceLogRequest extends Partial<CreateServiceLogRequest> {
  id: number;
  approvedBy?: number;
  approvedAt?: string;
}

export const SERVICE_LOG_TYPE_LABELS: Record<ServiceLog['serviceType'], string> = {
  physical_care: '身体介護',
  domestic_support: '家事援助',
  social_participation: '社会参加支援',
  consultation: '相談支援',
  employment_support: '就労支援',
  medical_support: '医療支援',
  other: 'その他',
};

export const SERVICE_LOG_STATUS_LABELS: Record<ServiceLog['status'], string> = {
  draft: '下書き',
  confirmed: '確認済',
  approved: '承認済',
};

// 旧名称との互換性のためエクスポート
export const SERVICE_TYPE_LABELS = SERVICE_LOG_TYPE_LABELS;

// サービスログ統計情報
export interface ServiceLogStats {
  total: number;
  byServiceType: Record<ServiceLog['serviceType'], number>;
  byStatus: Record<ServiceLog['status'], number>;
  totalHours: number;
  averageHoursPerService: number;
  thisWeek: number;
  thisMonth: number;
  pendingApproval: number;
}

// サービスログ検索パラメータ
export interface ServiceLogFilters {
  clientId?: number;
  supportPlanId?: number;
  staffId?: number;
  serviceType?: ServiceLog['serviceType'];
  status?: ServiceLog['status'];
  serviceDateFrom?: string;
  serviceDateTo?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// 日次サマリー
export interface DailyServiceSummary {
  date: string;
  totalServices: number;
  totalHours: number;
  byServiceType: Record<ServiceLog['serviceType'], number>;
  staffCount: number;
  clientCount: number;
}

// 月次レポート
export interface MonthlyServiceReport {
  month: string;
  year: number;
  totalServices: number;
  totalHours: number;
  byServiceType: Record<ServiceLog['serviceType'], number>;
  byClient: Array<{
    clientId: number;
    clientName: string;
    serviceCount: number;
    totalHours: number;
  }>;
  byStaff: Array<{
    staffId: number;
    staffName: string;
    serviceCount: number;
    totalHours: number;
  }>;
}
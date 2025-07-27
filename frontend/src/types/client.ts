export interface Client {
  id: number;
  clientNumber: string;
  name: string;
  nameKana: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  disabilityType: 'physical' | 'intellectual' | 'mental' | 'sensory' | 'developmental';
  disabilityGrade?: number;
  insuranceNumber?: string;
  status: 'active' | 'inactive' | 'discharged';
  notes?: string;
  dischargeDate?: string;
  dischargeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  clientNumber: string;
  name: string;
  nameKana: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  disabilityType: 'physical' | 'intellectual' | 'mental' | 'sensory' | 'developmental';
  disabilityGrade?: number;
  insuranceNumber?: string;
  status?: 'active' | 'inactive' | 'discharged';
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: number;
}

export const DISABILITY_TYPE_LABELS: Record<Client['disabilityType'], string> = {
  physical: '身体障害',
  intellectual: '知的障害',
  mental: '精神障害',
  sensory: '感覚障害',
  developmental: '発達障害',
};

export const STATUS_LABELS: Record<Client['status'], string> = {
  active: '利用中',
  inactive: '休止中',
  discharged: '終了',
};

export const GENDER_LABELS: Record<Client['gender'], string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
};
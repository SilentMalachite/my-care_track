export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
}

export interface StaffSearchParams {
  search?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
}
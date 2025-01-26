import type { BaseEntity } from './index'

export interface Tool extends BaseEntity {
  code: string;
  category: string;
  name: string;
  specification: string;
  manufacturer?: string;
  manager?: string;
  current_stock: number;
  safety_stock: number;
  unit_price: number;
  location_zone: string;
  location_row: string;
  location_column: string;
  location_position: string;
  factory: string;
  department: string;
  line_name: string;
  images?: { id: number; image: string }[];
  remarks?: string;
  status: 'active' | 'inactive';
}

export interface ToolTransaction extends BaseEntity {
  tool_id: number;
  transaction_type: 'in' | 'out';
  quantity: number;
  requester: string;
  approver?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  transaction_date: string;
  remarks?: string;
}

export interface CreateToolData {
  code: string;
  category: string;
  name: string;
  specification: string;
  manufacturer?: string;
  manager?: string;
  current_stock: number;
  safety_stock: number;
  unit_price?: number;
  location_zone?: string;
  location_row?: string;
  location_column?: string;
  location_position?: string;
  factory?: string;
  department?: string;
  line_name?: string;
  image?: File;
  remarks?: string;
}

export interface UpdateToolData extends CreateToolData {
  id: number;
} 
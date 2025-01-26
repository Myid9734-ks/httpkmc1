import type { BaseEntity, Equipment } from './index'

export interface Maintenance extends BaseEntity {
  serial_no: string
  title: string
  description: string
  photos?: string
  inspector: string
  factory: string
  department: string
  line: string
  status: 'pending' | 'in_progress' | 'completed'
  is_other: boolean
  scheduled_date: string
  completed_date?: string | null
}

export interface MaintenanceStats {
  days: number
  cycle: string
  details: Array<{
    cycle: string
    avgDays: number
    count: number
  }>
}

export interface Transfer extends BaseEntity {
  management_no: string
  name: string
  model: string
  serial_no: string
  manufacturer: string
  manufacture_date: string
  purchase_date: string
  location: string
  department: string
  reason: string
  transfer_date: string
  front_image?: string
  nameplate_image?: string
}

export interface EquipmentInspection {
  id: number
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id?: number
  line_name: string
  inspection_id: number
  inspection_name: string
  inspection_standard: string
  inspection_cycle: string
  scheduled_date: string
  status: 'pending' | 'in_progress' | 'completed'
  inspector?: string
  checklist: any[]
}

export interface Line {
  id: number
  name: string
  level: number
  parent_id?: number
  children?: Line[]
  status: 'active' | 'inactive'
}

export interface Inspection {
  id: number
  name: string
  standard: string
  cycle: string
  checklist: any[]
  status: 'active' | 'inactive'
}

export interface CompletedInspection {
  id: number
  original_inspection_id: number
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id?: number
  line_name: string
  factory_name: string
  department_name: string
  sub_line_name?: string
  inspection_name: string
  inspection_standard: string
  inspection_cycle: string
  scheduled_date: string
  completion_date: string
  inspector: string
  checklist_results: any[]
  photos?: string
  notes?: string
} 
// 공통 인터페이스 정의
export interface BaseEntity {
  id: number
  created_at?: string
  updated_at?: string
}

// 설비 관련 인터페이스
export interface Equipment {
  id: number
  serial_no: string
  name: string
  factory: string
  department: string
  product_model: string
  manufacturer: string
  manufacture_date: string
  purchase_date: string
  lifespan: number | null
  front_image: string | null
  nameplate_image: string | null
  status: string
  created_at: string
  updated_at: string
  management_no?: string
  model?: string
  location?: string
  client: string
}

// 라인 관련 인터페이스
export interface Line extends BaseEntity {
  name: string
  code: string
  factory: string
  department: string
}

// 도구 관련 인터페이스
export interface Tool {
  id: number
  code: string
  category: string
  name: string
  specification: string
  manufacturer: string
  manager: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit: string
  location_zone: string
  location_row: string
  location_column: string
  location_position: string
  status: string
  created_at: string
  updated_at: string
}

// 점검 관련 인터페이스
export interface Inspection {
  id: number
  serial_no: string
  inspection_name: string
  inspection_standard: string
  inspection_cycle: string
  scheduled_date: string
  status: string
  checklist: any[]
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id: number | null
  line_name: string
  weekdays?: number[]
  completed_date?: string
  created_at: string
  updated_at: string
}

// 유지보수 관련 인터페이스
export interface Maintenance {
  id: number
  equipment_id: number
  factory: string
  department: string
  line: string
  type: string
  description: string
  status: string
  is_other: boolean
  created_at: string
  completed_at?: string
}

// 이동 이력 관련 인터페이스
export interface Transfer {
  id: number
  equipment_id: number
  management_no: string
  name: string
  model: string
  serial_no: string
  manufacturer: string
  manufacture_date: string
  purchase_date: string
  lifespan: number | null
  factory: string
  location: string
  department: string
  product_model: string
  front_image?: string
  nameplate_image?: string
  reason: string
  transfer_date: string
  created_at: string
  updated_at: string
}

// 알림 관련 인터페이스
export interface Notification {
  id: number
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  title?: string
  time?: string
  read?: boolean
}

export interface Factory {
  id: number
  name: string
}

export interface Department {
  id: number
  name: string
  factory_id: number
}

export interface ProductLine {
  id: number
  name: string
  department_id: number
}

export interface Transaction {
  id: number
  tool_id: number
  type: string
  quantity: number
  location_zone: string
  location_row: string
  location_column: string
  location_position: string
  created_at: string
} 
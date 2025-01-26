CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  factory TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- 정기점검 항목 테이블
CREATE TABLE IF NOT EXISTS inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  standard TEXT NOT NULL,
  cycle TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 정기점검 체크리스트 테이블
CREATE TABLE IF NOT EXISTS inspection_checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  required INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);

-- 라인 관리 테이블
CREATE TABLE IF NOT EXISTS lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  level INTEGER NOT NULL,  -- 1: 공장, 2: 부서, 3: 생산라인, 4: 하위라인
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active, inactive, maintenance
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES lines(id) ON DELETE CASCADE
);

-- 공장명 중복 방지를 위한 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_factory_name 
ON lines (name) 
WHERE level = 1;

-- 초기 관리자 계정 생성
INSERT OR IGNORE INTO users (
  username,
  password,
  name,
  email,
  factory,
  department,
  position,
  role,
  status
) VALUES (
  'admin',
  '$2a$10$JRmFtlpt9b4cIFAdHHz8MOWVNrgtHrb32kK58amT0moQ8VWCrNUTK',  -- 해시된 'admin123'
  '관리자',
  'admin@example.com',
  '본사',
  'IT',
  '관리자',
  'system_admin',
  'active'
); 

-- 일일 인수인계 테이블
CREATE TABLE IF NOT EXISTS daily_handovers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  factory TEXT NOT NULL,
  department TEXT NOT NULL,
  shift TEXT NOT NULL,  -- 주간조, 야간조
  writer TEXT NOT NULL,  -- 작성자
  receiver TEXT,  -- 인수자
  line_name TEXT NOT NULL,  -- 라인명
  handover_content TEXT,  -- 인수인계 사항
  remarks TEXT,  -- 비고
  general_remarks TEXT,  -- 전체 전달사항 및 건의사항
  status TEXT NOT NULL DEFAULT 'pending',  -- pending: 작성중, completed: 완료
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 일일 인수인계 날짜/공장/부서/근무조 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_handovers 
ON daily_handovers (date, factory, department, shift); 

-- 설비 관리 테이블
CREATE TABLE IF NOT EXISTS equipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  management_no TEXT,                    -- 관리번호
  name TEXT,                            -- 설비명
  model TEXT,                           -- MODEL
  serial_no TEXT NOT NULL,              -- SERIAL NO (필수)
  manufacturer TEXT,                    -- 제작업체
  manufacture_date DATE,                -- 제조일
  purchase_date DATE,                   -- 구입일
  lifespan INTEGER,                     -- 유효년수
  factory TEXT,                         -- 공장
  location TEXT,                        -- 설치장소
  department TEXT,                      -- 부서
  product_model TEXT,                   -- 제품모델
  client TEXT,                          -- 고객사
  front_image BLOB NOT NULL,            -- 정면 사진 (필수)
  nameplate_image BLOB NOT NULL,        -- 명판 사진 (필수)
  status TEXT NOT NULL DEFAULT 'active',  -- 상태 (active, inactive)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SERIAL NO 중복 방지를 위한 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_serial_no 
ON equipments (serial_no);

-- 관리번호 중복 방지를 위한 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_management_no 
ON equipments (management_no)
WHERE management_no IS NOT NULL; 

-- 공구/도구 관리 테이블
CREATE TABLE IF NOT EXISTS tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,              -- 관리번호
  category TEXT NOT NULL,                 -- 분류
  name TEXT NOT NULL,                     -- 공구/도구명
  specification TEXT NOT NULL,            -- 규격
  manufacturer TEXT,                      -- 제조사
  manager TEXT,                           -- 담당자
  current_stock INTEGER NOT NULL,         -- 현재고
  safety_stock INTEGER NOT NULL,          -- 안전재고
  unit_price INTEGER,                     -- 단가
  location_zone TEXT,                     -- 보관위치-구역
  location_row TEXT,                      -- 보관위치-열
  location_column TEXT,                   -- 보관위치-단
  location_position TEXT,                 -- 보관위치-칸
  factory TEXT,                           -- 공장
  department TEXT,                        -- 부서
  line_name TEXT,                         -- 라인명
  remarks TEXT,                          -- 비고
  status TEXT NOT NULL DEFAULT 'active',  -- 상태 (active, inactive)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 

-- 공구 이미지 테이블
CREATE TABLE IF NOT EXISTS tool_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id INTEGER NOT NULL,
  image BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

-- processes 테이블 생성
CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- 공정 이름
    processCode TEXT NOT NULL,             -- 공정 코드
    ct INTEGER,                           -- Cycle Time (초)
    setupTime INTEGER,                    -- Setup Time (분)
    isInternal INTEGER NOT NULL,          -- 사내공정(1) / 사외공정(0)
    description TEXT,                     -- 공정 설명
    selectedFactory INTEGER,              -- 선택된 공장 ID
    selectedDepartment INTEGER,           -- 선택된 부서 ID
    selectedLine INTEGER,                 -- 선택된 라인 ID
    selectedSubLine INTEGER,              -- 선택된 세부 라인 ID
    status TEXT DEFAULT 'active',         -- 상태 (active/inactive)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (selectedFactory) REFERENCES lines(id),
    FOREIGN KEY (selectedDepartment) REFERENCES lines(id),
    FOREIGN KEY (selectedLine) REFERENCES lines(id),
    FOREIGN KEY (selectedSubLine) REFERENCES lines(id),
    UNIQUE(processCode, selectedLine)
);

-- 트리거 생성: updated_at 자동 업데이트
CREATE TRIGGER IF NOT EXISTS processes_update_trigger 
AFTER UPDATE ON processes
BEGIN
    UPDATE processes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 

-- 설비 점검 계획 테이블
CREATE TABLE IF NOT EXISTS equipment_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level1_id INTEGER,
  level2_id INTEGER,
  level3_id INTEGER,
  level4_id INTEGER,
  line_name TEXT,
  inspection_id INTEGER,
  inspection_name TEXT,
  inspection_standard TEXT,
  inspection_cycle TEXT,
  scheduled_date TEXT,
  execution_due_date TEXT,
  status TEXT DEFAULT 'pending',
  inspector TEXT,
  inspection_date TEXT,
  checklist TEXT,
  check_results TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS equipment_inspections_updated_at
AFTER UPDATE ON equipment_inspections
BEGIN
  UPDATE equipment_inspections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 

-- 완료된 점검 테이블
CREATE TABLE IF NOT EXISTS completed_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_inspection_id INTEGER,        -- 원본 점검 ID
    
    -- 위치 정보
    level1_id INTEGER,                    -- 공장 ID
    level2_id INTEGER,                    -- 부서 ID
    level3_id INTEGER,                    -- 라인 ID
    level4_id INTEGER,                    -- 하위라인 ID
    line_name TEXT,                       -- 라인명
    
    -- 점검 정보
    inspection_name TEXT,                 -- 점검항목
    inspection_standard TEXT,             -- 점검기준
    inspection_cycle TEXT,                -- 점검주기
    
    -- 완료 정보
    scheduled_date TEXT,                  -- 예정일
    completion_date TEXT,                 -- 완료일
    inspector TEXT,                       -- 점검자
    checklist_results TEXT,               -- 체크리스트 결과 (JSON)
    photos BLOB,                          -- 점검 사진
    notes TEXT,                           -- 비고사항
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 완료된 점검 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS completed_inspections_updated_at
AFTER UPDATE ON completed_inspections
BEGIN
    UPDATE completed_inspections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 간단점검 테이블
CREATE TABLE IF NOT EXISTS quick_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_name TEXT NOT NULL,        -- 점검항목 이름
    cycle TEXT NOT NULL,                  -- 점검주기 (예: "2week", "1month")
    weekdays TEXT NOT NULL,               -- 점검요일 (JSON 문자열로 저장: [1,3,5])
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 간단점검 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS quick_inspections_updated_at
AFTER UPDATE ON quick_inspections
BEGIN
    UPDATE quick_inspections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 

-- 설비 이관 이력 테이블
CREATE TABLE IF NOT EXISTS equipment_transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id INTEGER NOT NULL,
  management_no TEXT,
  name TEXT,
  model TEXT,
  serial_no TEXT NOT NULL,
  manufacturer TEXT,
  manufacture_date DATE,
  purchase_date DATE,
  lifespan INTEGER,
  factory TEXT,
  location TEXT,
  department TEXT,
  product_model TEXT,
  client TEXT,
  front_image BLOB,
  nameplate_image BLOB,
  reason TEXT NOT NULL,
  transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 이관 이력 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS equipment_transfers_updated_at
AFTER UPDATE ON equipment_transfers
BEGIN
  UPDATE equipment_transfers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 

-- 유지보수 테이블
CREATE TABLE IF NOT EXISTS maintenances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_no TEXT NOT NULL,              -- 설비 SERIAL NO
  title TEXT NOT NULL,                  -- 제목
  description TEXT NOT NULL,            -- 설명
  inspector TEXT NOT NULL,              -- 점검자
  factory TEXT NOT NULL,                -- 공장
  department TEXT NOT NULL,             -- 부서
  line TEXT NOT NULL,                   -- 라인
  photos TEXT,                          -- 사진 (JSON string)
  status TEXT NOT NULL DEFAULT 'pending', -- 상태 (pending, in_progress, completed)
  scheduled_date DATE NOT NULL,         -- 예정일
  completed_date DATE,                  -- 완료일
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 유지보수 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS maintenances_updated_at
AFTER UPDATE ON maintenances
BEGIN
  UPDATE maintenances SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 

-- 공구 거래 내역 테이블
CREATE TABLE IF NOT EXISTS tool_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    manager TEXT NOT NULL,
    remarks TEXT,
    location_zone TEXT,      -- 위치 구역
    location_row INTEGER,    -- 위치 행
    location_column INTEGER, -- 위치 열
    location_position INTEGER, -- 위치 위치
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tools(id)
); 

-- 알림 관리 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                     -- 알림 유형 (TOOL_STOCK, TOOL_IN, EQUIPMENT_CHECK, MAINTENANCE_COMPLETE)
    message TEXT NOT NULL,                  -- 알림 메시지
    read_at DATETIME,                       -- 읽은 시간
    deleted_at DATETIME,                    -- 삭제된 시간
    reference_id INTEGER,                   -- 참조 ID (공구ID, 설비ID 등)
    reference_type TEXT,                    -- 참조 타입 (tools, equipments 등)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 알림 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications (type);

CREATE INDEX IF NOT EXISTS idx_notifications_reference 
ON notifications (reference_type, reference_id); 
<template>
  <div class="list-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>설비 목록</h1>
            <span class="item-count">총 {{ filteredEquipments.length }}개</span>
          </div>
          <div class="description-section">
            <p class="description">등록된 설비 목록을 조회하고 관리할 수 있습니다.</p>
          </div>
        </div>
        <div class="header-right">
          <button class="mac-button primary" @click="goToRegistration">
            <span class="button-icon">+</span>
            <span class="button-text">설비 등록</span>
          </button>
        </div>
      </div>
      <!-- 필터 섹션 추가 -->
      <div class="filter-section">
        <div class="filter-group">
          <select v-model="filters.factory" class="mac-select">
            <option value="">공장 전체</option>
            <option v-for="factory in uniqueFactories" :key="factory" :value="factory">
              {{ factory }}
            </option>
          </select>
          <select v-model="filters.department" class="mac-select">
            <option value="">부서 전체</option>
            <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
          <select v-model="filters.line" class="mac-select">
            <option value="">라인 전체</option>
            <option v-for="line in uniqueLines" :key="line" :value="line">
              {{ line }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 통계 카드 섹션 -->
    <div class="statistics-section">
      <div class="statistics-grid">
        <!-- 전체 설비 -->
        <div class="stat-card glass-card">
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon">📊</div>
              <h3>전체 설비</h3>
            </div>
            <div class="stat-value">{{ statistics.total }}대</div>
          </div>
        </div>

        <!-- 수명 임박 설비 -->
        <div class="stat-card glass-card warning">
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon">⚠️</div>
              <h3>수명 임박 설비</h3>
            </div>
            <div class="stat-value">{{ statistics.lifespanNearingEnd }}대</div>
            <div class="stat-description">잔여 수명 1년 이하</div>
          </div>
        </div>

        <!-- 평균 사용 연수 -->
        <div class="stat-card glass-card">
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon">⏳</div>
              <h3>평균 사용 연수</h3>
            </div>
            <div class="stat-value">{{ statistics.averageUsageYears }}년</div>
          </div>
        </div>

        <!-- 공장별 설비 현황 -->
        <div class="stat-card glass-card">
          <div class="stat-content">
            <div class="stat-header">
              <div class="stat-icon">🏭</div>
              <h3>공장별 설비 현황</h3>
            </div>
            <div class="stat-list">
              <div v-for="[factory, count] in statistics.factoryStats.slice(0, 3)" :key="factory" class="stat-item">
                <span class="stat-label">{{ factory }}</span>
                <span class="stat-count">{{ count }}대</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 뷰 전환 섹션 추가 -->
    <div class="view-toggle-section">
      <div class="view-toggle-buttons">
        <button 
          class="view-toggle-btn" 
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button 
          class="view-toggle-btn" 
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>
    </div>

    <!-- 테이블/카드 뷰 -->
    <div class="equipment-content">
      <!-- 테이블 뷰 -->
      <table v-if="viewMode === 'table'" class="mac-table">
        <thead>
          <tr>
            <th>관리번호</th>
            <th>설비명</th>
            <th>모델</th>
            <th>제조사</th>
            <th>시리얼번호</th>
            <th>설치장소</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEquipments.length === 0">
            <td colspan="7" class="empty-message">등록된 설비가 없습니다.</td>
          </tr>
          <tr v-else v-for="item in filteredEquipments" :key="item.id">
            <td>{{ item.management_no || '번호 미지정' }}</td>
            <td>{{ item.name || '-' }}</td>
            <td>{{ item.model || '-' }}</td>
            <td>{{ item.manufacturer || '-' }}</td>
            <td>{{ item.serial_no || '-' }}</td>
            <td>{{ item.location || '-' }}</td>
            <td>
              <div class="action-buttons">
                <button class="mac-button secondary small" @click="viewDetails(item)">
                  상세
                </button>
                <button class="mac-button danger small" @click="deleteEquipment(item.id)">
                  삭제
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 그리드 뷰 -->
      <div v-else class="equipment-grid">
        <div v-if="filteredEquipments.length === 0" class="empty-message">
          등록된 설비가 없습니다.
        </div>
        <div v-else class="grid-container">
          <div v-for="item in filteredEquipments" 
               :key="item.id" 
               class="equipment-card glass-card"
          >
            <div class="card-header">
              <h3>{{ item.name || '-' }}</h3>
              <div class="management-no">{{ item.management_no || '번호 미지정' }}</div>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">모델:</span>
                <span class="value">{{ item.model || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">제조사:</span>
                <span class="value">{{ item.manufacturer || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">시리얼:</span>
                <span class="value">{{ item.serial_no || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">설치장소:</span>
                <span class="value">{{ item.location || '-' }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="mac-button secondary small" @click="viewDetails(item)">
                상세
              </button>
              <button class="mac-button danger small" @click="deleteEquipment(item.id)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h2>설비 삭제</h2>
        <div class="modal-body">
          <label>삭제 사유:</label>
          <textarea v-model="deleteReason" placeholder="삭제 사유를 입력하세요" class="mac-input"></textarea>
        </div>
        <div class="modal-footer">
          <button class="mac-button primary" @click="confirmDelete">확인</button>
          <button class="mac-button secondary" @click="showDeleteModal = false">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import { useLinesStore } from '@/stores/lines'
import '@/styles/macBaseStyle.scss'
import '@/styles/components/table.scss'
import type { Equipment } from '@/types'

// 상태 관리
const router = useRouter()
const equipmentStore = useEquipmentStore()
const linesStore = useLinesStore()
const equipments = computed(() => equipmentStore.equipments)
const showDeleteModal = ref(false)
const deleteReason = ref('')
const selectedEquipmentId = ref(null)
const viewMode = ref('table')

// 필터링 관련 상태
const filters = ref({
  factory: '',
  department: '', 
  line: ''
})

// 공장 목록
const uniqueFactories = computed(() => {
  console.log('Lines from store:', linesStore.lines)
  const factories = [...new Set(equipments.value.map(item => item.factory))].filter(Boolean)
  console.log('Extracted factories:', factories)
  return factories.sort()
})

// 부서 목록 (선택된 공장 기준)
const uniqueDepartments = computed(() => {
  console.log('Selected factory:', filters.value.factory)
  if (!filters.value.factory) return []
  
  const departments = [...new Set(
    equipments.value
      .filter(item => item.factory === filters.value.factory)
      .map(item => item.department)
  )].filter(Boolean)
  
  console.log('Found departments:', departments)
  return departments.sort()
})

// 라인 목록 (선택된 부서 기준)
const uniqueLines = computed(() => {
  console.log('Selected department:', filters.value.department)
  if (!filters.value.factory || !filters.value.department) return []
  
  const lines = [...new Set(
    equipments.value
      .filter(item => 
        item.factory === filters.value.factory && 
        item.department === filters.value.department
      )
      .map(item => item.product_model)
  )].filter(Boolean)
  
  console.log('Found lines:', lines)
  return lines.sort()
})

// 필터 변경 핸들러
const handleFactoryChange = () => {
  console.log('Factory changed to:', filters.value.factory)
  filters.value.department = ''
  filters.value.line = ''
  applyFilters()
}

const handleDepartmentChange = () => {
  console.log('Department changed to:', filters.value.department)
  filters.value.line = ''
  applyFilters()
}

// 필터 초기화
const resetFilters = () => {
  filters.value = {
    factory: '',
    department: '',
    line: ''
  }
  applyFilters()
}

// 필터 적용
const applyFilters = () => {
  console.log('Applying filters:', filters.value)
  equipmentStore.applyFilters(filters.value)
  console.log('Filtered equipments:', equipmentStore.filteredEquipments)
}

// 필터링된 설비 목록
const filteredEquipments = computed(() => {
  return equipments.value.filter(item => {
    const factoryMatch = !filters.value.factory || item.factory === filters.value.factory
    const departmentMatch = !filters.value.department || item.department === filters.value.department
    const lineMatch = !filters.value.line || item.product_model === filters.value.line
    return factoryMatch && departmentMatch && lineMatch
  })
})

// 등록 페이지로 이동
const goToRegistration = () => {
  router.push('/basic/equipment')
}

// 상세 정보 보기
const viewDetails = (equipment) => {
  router.push(`/equipment/detail/${equipment.id}`)
}

// 설비 삭제
const deleteEquipment = async (id: number) => {
  selectedEquipmentId.value = id
  showDeleteModal.value = true
}

// 삭제 확인
const confirmDelete = async () => {
  if (selectedEquipmentId.value) {
    try {
      await equipmentStore.deleteEquipment(selectedEquipmentId.value, deleteReason.value)
      showDeleteModal.value = false
      deleteReason.value = ''
    } catch (error) {
      console.error('설비 삭제 실패:', error)
    }
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await linesStore.fetchLines()
  await equipmentStore.fetchEquipments()
})

// 통계 계산을 위한 computed 속성들
const statistics = computed(() => {
  const now = new Date()
  
  // 공장/부서/라인/제조사별 설비 수 계산
  const factoryCount: Record<string, number> = {}
  const departmentCount: Record<string, number> = {}
  const lineCount: Record<string, number> = {}
  const manufacturerCount: Record<string, number> = {}
  let expiredCount = 0
  let nearExpiryCount = 0
  let normalCount = 0
  let totalUsageYears = 0
  
  equipments.value.forEach(item => {
    // 공장별 카운트
    if (item.factory) {
      factoryCount[item.factory] = (factoryCount[item.factory] || 0) + 1
    }
    
    // 부서별 카운트
    if (item.department) {
      departmentCount[item.department] = (departmentCount[item.department] || 0) + 1
    }
    
    // 라인별 카운트
    if (item.product_model) {
      lineCount[item.product_model] = (lineCount[item.product_model] || 0) + 1
    }
    
    // 제조사별 카운트 추가
    if (item.manufacturer) {
      manufacturerCount[item.manufacturer] = (manufacturerCount[item.manufacturer] || 0) + 1
    }

    if (item.purchase_date && item.lifespan) {
      const purchaseDate = new Date(item.purchase_date)
      const expectedEndDate = new Date(purchaseDate)
      expectedEndDate.setFullYear(expectedEndDate.getFullYear() + item.lifespan)
      
      const remainingLife = (expectedEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)
      const usageYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      totalUsageYears += usageYears

      if (remainingLife <= 0) {
        expiredCount++
      } else if (remainingLife <= 1) {
        nearExpiryCount++
      } else {
        normalCount++
      }
    }
  })

  // 제조사 통계 계산 로직 추가
  const manufacturerStats = Object.entries(manufacturerCount)
    .sort((a, b) => b[1] - a[1])
  
  const mainManufacturer = manufacturerStats[0] || ['없음', 0]
  const otherManufacturers = manufacturerStats.slice(1)
  const otherManufacturersCount = otherManufacturers.reduce((sum, [_, count]) => sum + count, 0)

  return {
    total: equipments.value.length,
    factoryStats: Object.entries(factoryCount).sort((a, b) => b[1] - a[1]),
    departmentStats: Object.entries(departmentCount).sort((a, b) => b[1] - a[1]),
    lineStats: Object.entries(lineCount).sort((a, b) => b[1] - a[1]),
    manufacturerStats: Object.entries(manufacturerCount).sort((a, b) => b[1] - a[1]),
    lifespanStats: {
      expired: expiredCount,
      nearExpiry: nearExpiryCount,
      normal: normalCount
    },
    lifespanNearingEnd: nearExpiryCount,
    averageUsageYears: equipments.value.length ? 
      (totalUsageYears / equipments.value.length).toFixed(1) : 0,
    mainManufacturer,
    otherManufacturersCount
  }
})
</script>

<style lang="scss" scoped>
.list-view {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  
  .header {
    padding: 24px;
    border-radius: 12px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      
      .header-left {
        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          
          h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          
          .item-count {
            font-size: 14px;
            color: var(--text-secondary);
            background: var(--background-secondary);
            padding: 4px 8px;
            border-radius: 6px;
          }
        }
        
        .description-section {
          margin-top: 8px;
          
          .description {
            margin: 0;
            color: var(--text-secondary);
            font-size: 14px;
          }
        }
      }
    }
    
    .filter-section {
      .filter-group {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  .statistics-section {
    margin: 1.5rem 0;
    padding: 0 1.5rem;

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      height: 100%;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;

        .stat-icon {
          font-size: 1.5rem;
        }

        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0.5rem 0;
      }

      .stat-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .stat-list {
        margin-top: 0.5rem;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);

          &:last-child {
            border-bottom: none;
          }

          .stat-label {
            color: var(--text-secondary);
          }

          .stat-count {
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }

      &.warning {
        background: var(--system-warning-background);
        border: 1px solid var(--system-warning-border);

        .stat-value {
          color: var(--system-warning-text);
        }
      }
    }
  }
  
  .view-toggle-section {
    padding: 0 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: flex-end;

    .view-toggle-buttons {
      display: flex;
      gap: 0.5rem;
      padding: 0.25rem;
      border-radius: var(--radius-large);
      background: var(--system-secondary-background);
      border: 1px solid var(--system-border);

      .view-toggle-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: var(--system-card-background);
        border-radius: var(--radius-medium);
        cursor: pointer;
        color: var(--system-secondary-text);
        transition: var(--transition-base);
        box-shadow: var(--system-shadow);

        &:hover {
          background: var(--system-tertiary-background);
          color: var(--system-text);
        }

        &.active {
          background: var(--system-accent);
          color: var(--button-text);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  
  .equipment-content {
    flex: 1;
    overflow: auto;
    background: var(--card-background);
    border-radius: 12px;
    box-shadow: var(--mac-shadow);
    
    .mac-table {
      th {
        &:nth-child(1) { width: 12%; }  // 관리번호
        &:nth-child(2) { width: 15%; }  // 설비명
        &:nth-child(3) { width: 15%; }  // 모델
        &:nth-child(4) { width: 15%; }  // 제조사
        &:nth-child(5) { width: 15%; }  // 시리얼번호
        &:nth-child(6) { width: 15%; }  // 설치장소
        &:nth-child(7) { width: 13%; }  // 작업
      }
      
      .empty-message {
        text-align: center;
        padding: 24px;
        color: var(--text-secondary);
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-start;
      }
    }

    .equipment-grid {
      padding: 1.5rem;

      .empty-message {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
      }

      .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .equipment-card {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .card-header {
          margin-bottom: 1rem;

          h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .management-no {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
          }
        }

        .card-content {
          flex: 1;

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);

            &:last-child {
              border-bottom: none;
            }

            .label {
              color: var(--text-secondary);
              font-size: 0.875rem;
            }

            .value {
              color: var(--text-primary);
              font-weight: 500;
              font-size: 0.875rem;
            }
          }
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .statistics-section .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .statistics-section .statistics-grid {
    grid-template-columns: 1fr;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background: var(--card-background);
    border-radius: 12px;
    padding: 24px;
    width: 400px;
    
    h2 {
      margin: 0 0 16px 0;
    }
    
    .modal-body {
      margin-bottom: 24px;
      
      label {
        display: block;
        margin-bottom: 8px;
      }
      
      textarea {
        width: 100%;
        min-height: 100px;
        resize: vertical;
      }
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}
</style> 
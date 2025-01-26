<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const maintenances = ref([])
const selectedMaintenance = ref(null)
const isModalVisible = ref(false)

// 사용자 정보
const userFactory = ref('')
const userDepartment = ref('')

// 필터 상태
const selectedFactory = ref('')
const selectedDepartment = ref('')
const selectedLine = ref('')

// 데이터 로딩 상태
const isLoading = ref(true)

// Auth 스토어
const authStore = useAuthStore()

// 고유한 필터 옵션들 계산 (모든 공백 제거)
const normalizeString = (str) => {
  return str ? str.replace(/\s+/g, '').trim() : ''
}

const factories = computed(() => {
  return [...new Set(maintenances.value.map(m => normalizeString(m.factory)))].filter(Boolean)
})

const departments = computed(() => {
  // 데이터가 로딩 중이거나 없으면 빈 배열 반환
  if (isLoading.value || !maintenances.value.length) {
    return []
  }

  const normalizedUserDepartment = normalizeString(userDepartment.value)
  console.log('현재 사용자 부서:', userDepartment.value)
  console.log('정규화된 사용자 부서:', normalizedUserDepartment)

  // 모든 부서 목록 수집 및 정규화
  const allDepartments = maintenances.value
    .map(m => {
      console.log('유지보수 항목의 부서:', m.department)  // 각 항목의 부서 값 확인
      return normalizeString(m.department)
    })
    .filter(Boolean)

  // 중복 제거 및 정렬
  const uniqueDepartments = [...new Set(allDepartments)].sort()
  console.log('정렬된 전체 부서 목록:', uniqueDepartments)

  // 사용자 부서가 있고 목록에 포함되어 있으면 첫 번째로 이동
  if (normalizedUserDepartment && uniqueDepartments.includes(normalizedUserDepartment)) {
    const index = uniqueDepartments.indexOf(normalizedUserDepartment)
    uniqueDepartments.splice(index, 1)
    uniqueDepartments.unshift(normalizedUserDepartment)
    console.log('사용자 부서를 첫번째로 이동한 후:', uniqueDepartments)
  }

  return uniqueDepartments
})

const lines = computed(() => {
  return [...new Set(maintenances.value.map(m => normalizeString(m.line)))].filter(Boolean)
})

// 필터링된 유지보수 목록
const filteredMaintenances = computed(() => {
  return maintenances.value.filter(maintenance => {
    const normalizedFactory = normalizeString(maintenance.factory)
    const normalizedDepartment = normalizeString(maintenance.department)
    const normalizedLine = normalizeString(maintenance.line)
    
    const factoryMatch = !selectedFactory.value || normalizedFactory === normalizeString(selectedFactory.value)
    const departmentMatch = !selectedDepartment.value || normalizedDepartment === normalizeString(selectedDepartment.value)
    const lineMatch = !selectedLine.value || normalizedLine === normalizeString(selectedLine.value)
    
    return factoryMatch && departmentMatch && lineMatch
  })
})

// 필터 초기화 (사용자의 공장과 부서로)
const resetFilters = () => {
  selectedFactory.value = userFactory.value
  selectedDepartment.value = userDepartment.value
  selectedLine.value = ''
}

// 초기 데이터 로드
const loadInitialData = async () => {
  try {
    isLoading.value = true
    
    // 1. 먼저 사용자 정보 설정
    if (authStore.user) {
      console.log('Auth 스토어 사용자 정보:', authStore.user)
      userFactory.value = normalizeString(authStore.user.factory)
      userDepartment.value = normalizeString(authStore.user.department)
      console.log('사용자 정보 설정:', {
        factory: userFactory.value,
        department: userDepartment.value
      })
    }

    // 2. 유지보수 목록 가져오기
    const response = await client.get('/maintenances/completed')
    maintenances.value = response.data
    console.log('유지보수 목록 데이터 구조:', maintenances.value[0])  // 첫 번째 항목의 구조 확인
    console.log('유지보수 목록의 부서 목록:', maintenances.value.map(m => m.department))  // 모든 부서 확인
    console.log('유지보수 목록 로드됨:', maintenances.value.length)

    // 3. 필터 초기값 설정
    selectedFactory.value = userFactory.value
    selectedDepartment.value = userDepartment.value
    console.log('필터 초기값 설정:', {
      factory: selectedFactory.value,
      department: selectedDepartment.value
    })

  } catch (error) {
    console.error('데이터 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadInitialData()
})

const showMaintenanceDetail = (maintenance) => {
  selectedMaintenance.value = maintenance
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  selectedMaintenance.value = null
}
</script>

<template>
  <div class="other-maintenance-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>설비 외 유지보수 목록</h1>
        </div>
        <div class="description-section">
          <p class="description">설비와 관련되지 않은 유지보수 작업 목록입니다.</p>
        </div>
      </div>
    </div>

    <!-- 필터 카드 -->
    <div class="filter-card glass-card">
      <div class="filter-header">
        <h2>필터</h2>
        <button class="reset-button" @click="resetFilters">초기화</button>
      </div>
      <div class="filter-content">
        <div class="filter-group">
          <label>공장</label>
          <select v-model="selectedFactory">
            <option value="">전체</option>
            <option v-for="factory in factories" :key="factory" :value="factory">
              {{ factory }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>부서</label>
          <select v-model="selectedDepartment">
            <option value="">전체</option>
            <option v-for="department in departments" :key="department" :value="department">
              {{ department }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>라인</label>
          <select v-model="selectedLine">
            <option value="">전체</option>
            <option v-for="line in lines" :key="line" :value="line">
              {{ line }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="maintenance-list glass-card">
      <div v-if="filteredMaintenances.length === 0" class="empty-message">
        등록된 설비 외 유지보수가 없습니다.
      </div>
      <div v-else class="list-container">
        <div v-for="maintenance in filteredMaintenances" :key="maintenance.id" 
             class="list-item"
             @click="showMaintenanceDetail(maintenance)">
          <div class="item-content">
            <div class="item-header">
              <div class="left-section">
                <h3 class="item-title">{{ maintenance.title }}</h3>
                <p class="item-description">{{ maintenance.description }}</p>
              </div>
              <div class="right-section">
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">담당자</span>
                    <span class="info-value">{{ maintenance.inspector }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">예정일</span>
                    <span class="info-value">{{ maintenance.scheduled_date }}</span>
                  </div>
                  <div v-if="maintenance.completed_date" class="info-item">
                    <span class="info-label">완료일</span>
                    <span class="info-value">{{ maintenance.completed_date }}</span>
                  </div>
                  <span :class="['status-badge', 
                    maintenance.status === '완료' ? 'success' : 'pending']">
                    {{ maintenance.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 정보 모달 -->
    <div v-if="isModalVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content glass-card" @click.stop>
        <div class="modal-header">
          <h2>유지보수 상세 정보</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div v-if="selectedMaintenance" class="modal-body">
          <div class="detail-item">
            <h3>제목</h3>
            <p>{{ selectedMaintenance.title }}</p>
          </div>
          <div class="detail-item">
            <h3>설명</h3>
            <p>{{ selectedMaintenance.description }}</p>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <h3>담당자</h3>
              <p>{{ selectedMaintenance.inspector }}</p>
            </div>
            <div class="detail-item">
              <h3>예정일</h3>
              <p>{{ selectedMaintenance.scheduled_date }}</p>
            </div>
            <div class="detail-item">
              <h3>완료일</h3>
              <p>{{ selectedMaintenance.completed_date || '-' }}</p>
            </div>
            <div class="detail-item">
              <h3>상태</h3>
              <span :class="['status-badge', 
                selectedMaintenance.status === '완료' ? 'success' : 'pending']">
                {{ selectedMaintenance.status }}
              </span>
            </div>
          </div>
          <div v-if="selectedMaintenance.photos" class="detail-item">
            <h3>사진</h3>
            <div class="photos-grid">
              <img v-for="(photo, index) in JSON.parse(selectedMaintenance.photos)"
                   :key="index"
                   :src="photo"
                   alt="유지보수 사진"
                   @click="() => window.open(photo, '_blank')" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.other-maintenance-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  padding: 24px;
  
  .header-left {
    .title-section {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
    
    .description-section {
      margin-top: 8px;
      
      .description {
        margin: 0;
        color: var(--text-secondary);
      }
    }
  }
}

.maintenance-list {
  .empty-message {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .list-container {
    .list-item {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .item-content {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;

          .left-section {
            flex: 1;
            min-width: 0;

            .item-title {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: var(--text-primary);
            }

            .item-description {
              margin: 4px 0 0 0;
              color: var(--text-secondary);
              font-size: 14px;
              line-height: 1.5;
            }
          }

          .right-section {
            flex-shrink: 0;

            .info-row {
              display: flex;
              align-items: center;
              gap: 24px;

              .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .info-label {
                  font-size: 12px;
                  color: var(--text-secondary);
                  text-transform: uppercase;
                }

                .info-value {
                  color: var(--text-primary);
                  font-weight: 500;
                  white-space: nowrap;
                }
              }

              .status-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                
                &.success {
                  background-color: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }
                
                &.pending {
                  background-color: var(--el-color-warning-light-9);
                  color: var(--el-color-warning);
                }
              }
            }
          }
        }
      }

      &:hover {
        background-color: var(--background-secondary);
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  background-color: var(--background-primary);
  border-radius: 12px;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 4px;
      
      &:hover {
        color: var(--text-primary);
      }
    }
  }
  
  .modal-body {
    .detail-item {
      margin-bottom: 20px;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
      }
      
      p {
        margin: 0;
        color: var(--text-primary);
        line-height: 1.5;
      }
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      
      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

.list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.filter-card {
  padding: 24px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .reset-button {
      padding: 8px 16px;
      border: none;
      background-color: var(--el-color-primary-light-8);
      color: var(--el-color-primary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-color-primary-light-7);
      }
    }
  }

  .filter-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
      }

      select {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: var(--background-secondary);
        color: var(--text-primary);
        font-size: 14px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;

        &:hover, &:focus {
          border-color: var(--el-color-primary);
        }

        option {
          background-color: var(--background-primary);
          color: var(--text-primary);
        }
      }
    }
  }
}
</style> 
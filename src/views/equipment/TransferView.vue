<template>
  <div class="transfer-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>설비 이관 이력</h1>
            <span class="item-count">총 {{ transfers.length }}개</span>
          </div>
          <div class="description-section">
            <p class="description">삭제된 설비의 이관 이력을 조회할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 필터링 카드 -->
    <div class="filter-section glass-card">
      <div class="filter-header">
        <h3>필터</h3>
        <button class="reset-button" @click="resetFilters">
          초기화
        </button>
      </div>
      <div class="filter-content">
        <div class="filter-item">
          <label>공장</label>
          <select v-model="filters.factory" @change="applyFilters">
            <option value="">전체</option>
            <option v-for="factory in uniqueFactories" :key="factory" :value="factory">
              {{ factory }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>부서</label>
          <select v-model="filters.department" @change="applyFilters">
            <option value="">전체</option>
            <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>제품모델</label>
          <select v-model="filters.line" @change="applyFilters">
            <option value="">전체</option>
            <option v-for="model in uniqueLines" :key="model" :value="model">
              {{ model }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 테이블/카드 뷰 -->
    <div class="transfer-content glass-card">
      <!-- 데스크톱 테이블 뷰 -->
      <div class="desktop-view">
        <table class="mac-table">
          <thead>
            <tr>
              <th>이관일시</th>
              <th>설비번호</th>
              <th>설비명</th>
              <th>모델</th>
              <th>시리얼번호</th>
              <th>설치장소</th>
              <th>삭제사유</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="transfers.length === 0">
              <td colspan="7" class="empty-message">등록된 이관 이력이 없습니다.</td>
            </tr>
            <tr 
              v-else 
              v-for="item in transfers" 
              :key="item.id"
              @click="openModal(item)"
              class="clickable-row"
            >
              <td>{{ formatDate(item.transfer_date) }}</td>
              <td>{{ item.management_no || '-' }}</td>
              <td>{{ item.name || '-' }}</td>
              <td>{{ item.model || '-' }}</td>
              <td>{{ item.serial_no }}</td>
              <td>{{ item.location || '-' }}</td>
              <td>{{ item.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 모바일 카드 뷰 -->
      <div class="mobile-view">
        <div v-if="transfers.length === 0" class="empty-message">
          등록된 이관 이력이 없습니다.
        </div>
        <div 
          v-else 
          v-for="item in transfers" 
          :key="item.id" 
          class="transfer-card glass-card clickable-card"
          @click="openModal(item)"
        >
          <div class="card-header">
            <span class="transfer-date">{{ formatDate(item.transfer_date) }}</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">설비번호:</span>
              <span class="value">{{ item.management_no || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">설비명:</span>
              <span class="value">{{ item.name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">모델:</span>
              <span class="value">{{ item.model || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">시리얼번호:</span>
              <span class="value">{{ item.serial_no }}</span>
            </div>
            <div class="info-row">
              <span class="label">설치장소:</span>
              <span class="value">{{ item.location || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">삭제사유:</span>
              <span class="value">{{ item.reason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 정보 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content glass-card" @click.stop>
        <div class="modal-header">
          <h2>설비 이관 상세 정보</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">이관일시</span>
            <span class="detail-value">{{ formatDate(selectedItem?.transfer_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">설비번호</span>
            <span class="detail-value">{{ selectedItem?.management_no || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">설비명</span>
            <span class="detail-value">{{ selectedItem?.name || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">모델</span>
            <span class="detail-value">{{ selectedItem?.model || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">시리얼번호</span>
            <span class="detail-value">{{ selectedItem?.serial_no }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">제조사</span>
            <span class="detail-value">{{ selectedItem?.manufacturer || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">제조일자</span>
            <span class="detail-value">{{ formatDate(selectedItem?.manufacture_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">구매일자</span>
            <span class="detail-value">{{ formatDate(selectedItem?.purchase_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">설치장소</span>
            <span class="detail-value">{{ selectedItem?.location || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">부서</span>
            <span class="detail-value">{{ selectedItem?.department || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">삭제사유</span>
            <span class="detail-value">{{ selectedItem?.reason }}</span>
          </div>
          
          <!-- 사진 정보 추가 -->
          <div class="images-section">
            <h3>설비 사진</h3>
            <div class="image-grid">
              <div class="image-item">
                <h4>정면 사진</h4>
                <img 
                  v-if="selectedItem?.front_image" 
                  :src="selectedItem.front_image" 
                  alt="설비 정면"
                  @click="openImageModal(selectedItem.front_image)"
                />
                <div v-else class="no-image">이미지 없음</div>
              </div>
              <div class="image-item">
                <h4>명판 사진</h4>
                <img 
                  v-if="selectedItem?.nameplate_image" 
                  :src="selectedItem.nameplate_image" 
                  alt="설비 명판"
                  @click="openImageModal(selectedItem.nameplate_image)"
                />
                <div v-else class="no-image">이미지 없음</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 전체화면 모달 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content">
        <img :src="selectedImage" alt="확대된 이미지" />
        <button class="close-button" @click="closeImageModal">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import '@/styles/macBaseStyle.scss'
import '@/styles/components/table.scss'
import { useAuthStore } from '@/stores/auth'

// 상태 관리
const allTransfers = ref([])
const transfers = ref([])
const authStore = useAuthStore()

const filters = ref({
  factory: '',
  department: '',
  line: ''
})
const showModal = ref(false)
const selectedItem = ref(null)
const showImageModal = ref(false)
const selectedImage = ref('')

// 문자열 정규화 함수
const normalizeString = (str) => str?.replace(/\s+/g, '') || ''

// 사용자 정보 기반 필터 초기화
const initializeFilters = () => {
  const userFactory = normalizeString(authStore.user?.factory)
  const userDepartment = normalizeString(authStore.user?.department)
  
  console.log('사용자 정보:', {
    전체: authStore.user,
    공장: userFactory,
    부서: userDepartment,
    공장_원본: authStore.user?.factory,
    부서_원본: authStore.user?.department
  })
  
  filters.value = {
    factory: '',
    department: '',
    line: ''
  }
  
  // 공장 설정
  const matchingFactory = uniqueFactories.value.find(factory => 
    normalizeString(factory) === userFactory
  )
  
  if (matchingFactory) {
    console.log('일치하는 공장 찾음:', matchingFactory)
    filters.value.factory = matchingFactory
    
    // 부서 설정
    const matchingDepartment = uniqueDepartments.value.find(dept =>
      normalizeString(dept) === userDepartment
    )
    
    if (matchingDepartment) {
      console.log('일치하는 부서 찾음:', matchingDepartment)
      filters.value.department = matchingDepartment
    } else {
      console.log('일치하는 부서 없음. 가능한 부서 목록:', uniqueDepartments.value)
    }
  } else {
    console.log('일치하는 공장 없음. 가능한 공장 목록:', uniqueFactories.value)
  }
  
  applyFilters()
}

// 고유한 필터 옵션 계산
const uniqueFactories = computed(() => {
  const factories = allTransfers.value
    .map(item => item.factory)
    .filter(Boolean)
  return [...new Set(factories)].sort()
})

const uniqueDepartments = computed(() => {
  const departments = allTransfers.value
    .filter(item => {
      const itemFactory = normalizeString(item.factory)
      return !filters.value.factory || itemFactory === normalizeString(filters.value.factory)
    })
    .map(item => item.department)
    .filter(Boolean)
  return [...new Set(departments)].sort()
})

const uniqueLines = computed(() => {
  const models = allTransfers.value
    .filter(item => {
      const itemFactory = normalizeString(item.factory)
      const itemDepartment = normalizeString(item.department)
      const factoryMatch = !filters.value.factory || itemFactory === normalizeString(filters.value.factory)
      const departmentMatch = !filters.value.department || itemDepartment === normalizeString(filters.value.department)
      return factoryMatch && departmentMatch
    })
    .map(item => item.product_model)
    .filter(Boolean)
  return [...new Set(models)].sort()
})

// 필터 적용
const applyFilters = () => {
  console.log('필터 적용 전 상태:', {
    현재_필터: filters.value,
    전체_데이터_수: allTransfers.value.length
  })

  transfers.value = allTransfers.value.filter(item => {
    const itemFactory = normalizeString(item.factory)
    const itemDepartment = normalizeString(item.department)
    const itemModel = normalizeString(item.product_model)
    
    const factoryMatch = !filters.value.factory || itemFactory === normalizeString(filters.value.factory)
    const departmentMatch = !filters.value.department || itemDepartment === normalizeString(filters.value.department)
    const lineMatch = !filters.value.line || itemModel === normalizeString(filters.value.line)
    
    if (filters.value.factory || filters.value.department || filters.value.line) {
      console.log('필터링 상세 정보:', {
        아이템: {
          공장: item.factory,
          부서: item.department,
          제품모델: item.product_model
        },
        정규화된_값: {
          공장: itemFactory,
          부서: itemDepartment,
          제품모델: itemModel
        },
        매칭_결과: {
          공장_일치: factoryMatch,
          부서_일치: departmentMatch,
          라인_일치: lineMatch
        }
      })
    }
    
    return factoryMatch && departmentMatch && lineMatch
  })

  console.log('필터 적용 후 상태:', {
    필터링된_데이터_수: transfers.value.length,
    필터링된_데이터_샘플: transfers.value.slice(0, 2)
  })
}

// 이관 이력 조회
const fetchTransfers = async () => {
  try {
    const response = await client.get('/transfers')
    allTransfers.value = response.data
    transfers.value = response.data
    
    console.log('이관 이력 데이터 로딩:', {
      전체_데이터_수: response.data.length,
      공장_목록: uniqueFactories.value,
      부서_목록: uniqueDepartments.value,
      제품모델_목록: uniqueLines.value,
      샘플_데이터: response.data.slice(0, 2)
    })
    
    // 초기 필터 설정
    initializeFilters()
  } catch (error) {
    console.error('이동 이력 조회 실패:', error)
  }
}

const createTransfer = async (transfer) => {
  try {
    await client.post('/transfers', transfer)
    await fetchTransfers()
  } catch (error) {
    console.error('이동 이력 생성 실패:', error)
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  fetchTransfers()
})

// 필터 변경 감지
watch(() => filters.value.factory, (newFactory) => {
  if (!newFactory) {
    filters.value.department = ''
    filters.value.line = ''
  }
  applyFilters()
})

watch(() => filters.value.department, (newDepartment) => {
  if (!newDepartment) {
    filters.value.line = ''
  }
  applyFilters()
})

watch(() => filters.value.line, () => {
  applyFilters()
})

// 날짜 포맷
const formatDate = (date: string, showTime = false) => {
  if (!date) return '-'
  const options: Intl.DateTimeFormatOptions = showTime 
    ? undefined  // 시간 포함 시 기본 포맷 사용
    : { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(date).toLocaleString('ko-KR', options)
}

// 모달 열기
const openModal = (item) => {
  selectedItem.value = item
  showModal.value = true
}

// 모달 닫기
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
}

// 이미지 모달 열기
const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
}

// 이미지 모달 닫기
const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = ''
}

// 필터 초기화 버튼 클릭
const resetFilters = () => {
  initializeFilters()
  applyFilters()
}
</script>

<style scoped lang="scss">
.transfer-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  padding: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .header-left {
      .title-section {
        display: flex;
        align-items: center;
        gap: 10px;
        
        h1 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--mac-text);
        }
        
        .item-count {
          font-size: 0.875rem;
          color: var(--mac-text-secondary);
          background: var(--mac-background-secondary);
          padding: 4px 8px;
          border-radius: var(--mac-radius-sm);
        }
      }
      
      .description-section {
        margin-top: 8px;
        
        .description {
          margin: 0;
          font-size: 0.875rem;
          color: var(--mac-text-secondary);
        }
      }
    }
  }
}

.transfer-content {
  padding: 20px;
  
  .desktop-view {
    display: block;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  .mobile-view {
    display: none;
    
    @media (max-width: 768px) {
      display: block;
    }
  }
}

.transfer-card {
  margin-bottom: 16px;
  padding: 16px;
  
  .card-header {
    margin-bottom: 12px;
    
    .transfer-date {
      font-weight: 500;
      color: var(--mac-text);
    }
  }
  
  .card-body {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      
      .label {
        width: 100px;
        color: var(--mac-text-secondary);
      }
      
      .value {
        flex: 1;
        color: var(--mac-text);
      }
    }
  }
}

// 반응형 스타일
@media (max-width: 768px) {
  .header {
    .header-content {
      flex-direction: column;
      gap: 16px;
    }
  }
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--mac-background-hover);
  }
}

.clickable-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--mac-text);
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--mac-text-secondary);
      cursor: pointer;
      padding: 4px;
      
      &:hover {
        color: var(--mac-text);
      }
    }
  }
  
  .modal-body {
    .detail-row {
      display: flex;
      margin-bottom: 16px;
      
      .detail-label {
        width: 100px;
        color: var(--mac-text-secondary);
        font-size: 0.875rem;
      }
      
      .detail-value {
        flex: 1;
        color: var(--mac-text);
      }
    }
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 16px;
    
    .modal-body {
      .detail-row {
        flex-direction: column;
        
        .detail-label {
          width: 100%;
          margin-bottom: 4px;
        }
      }
    }
  }
}

.images-section {
  margin-top: 24px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 1rem;
    color: var(--mac-text);
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .image-item {
      h4 {
        margin: 0 0 8px;
        font-size: 0.875rem;
        color: var(--mac-text-secondary);
      }
      
      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: var(--mac-radius-sm);
        cursor: pointer;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.02);
        }
      }
      
      .no-image {
        width: 100%;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mac-background-secondary);
        border-radius: var(--mac-radius-sm);
        color: var(--mac-text-secondary);
        font-size: 0.875rem;
      }
    }
  }
}

.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  
  .image-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    
    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }
    
    .close-button {
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      font-size: 2rem;
      color: white;
      cursor: pointer;
      padding: 4px;
      
      &:hover {
        color: var(--mac-text-secondary);
      }
    }
  }
}

@media (max-width: 768px) {
  .images-section {
    .image-grid {
      grid-template-columns: 1fr;
    }
  }
  
  // ... existing mobile styles ...
}

.filter-section {
  padding: 20px;
  margin-bottom: 20px;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--mac-text);
    }
    
    .reset-button {
      padding: 6px 12px;
      border: none;
      border-radius: var(--mac-radius-sm);
      background-color: var(--mac-background-secondary);
      color: var(--mac-text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: var(--mac-background-hover);
        color: var(--mac-text);
      }
    }
  }
  
  .filter-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-size: 0.875rem;
        color: var(--mac-text-secondary);
      }
      
      select {
        width: 100%;
        padding: 8px 12px;
        border-radius: var(--mac-radius-sm);
        border: 1px solid var(--mac-border);
        background-color: var(--mac-background);
        color: var(--mac-text);
        font-size: 0.875rem;
        cursor: pointer;
        
        &:focus {
          outline: none;
          border-color: var(--mac-primary);
        }
        
        &:hover {
          border-color: var(--mac-border-hover);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .filter-section {
    .filter-content {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style> 
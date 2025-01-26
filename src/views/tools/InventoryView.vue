<template>
  <div class="inventory-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>공구 재고 현황</h1>
        </div>
        <div class="description-section">
          <p class="description">등록된 공구 및 지그의 재고 현황을 확인할 수 있습니다.</p>
        </div>
      </div>
      <div class="header-right">
        <div class="view-controls">
          <button 
            class="view-toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <i class="fa-solid fa-list"></i>ㅜ
          </button>
          <button 
            class="view-toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <i class="fa-solid fa-grid-2"></i>
          </button>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            class="mac-input search-input" 
            v-model="searchCode"
            :placeholder="searchPlaceholder"
            @input="handleSearchInput"
          >
          <button 
            v-if="searchCode && searchCode !== 'ikm_'" 
            class="reset-button"
            @click="resetSearch"
          >
            ×
          </button>
          <div class="search-help">
            <span>TIP: '/' 입력 시 품명/규격 검색 모드로 전환</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 통계 카드 추가 -->
    <div class="stats-container">
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-wrench"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalTools }}</div>
          <div class="stat-label">전체 공구</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ lowStockTools }}</div>
          <div class="stat-label">안전재고 미달</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-box-archive"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalStock }}</div>
          <div class="stat-label">총 재고 수량</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-won-sign"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatPrice(totalValue) }}</div>
          <div class="stat-label">총 재고 금액</div>
        </div>
      </div>
    </div>

    <div class="content glass-card">
      <!-- 리스트 뷰 -->
      <table v-if="viewMode === 'list'" class="tools-table">
        <thead>
          <tr>
            <th style="width: 40px"></th>
            <th>관리번호</th>
            <th>분류</th>
            <th>품명</th>
            <th>규격</th>
            <th>제조사</th>
            <th>현재고</th>
            <th>안전재고</th>
            <th>단가</th>
            <th>보관위치</th>
            <th>공장</th>
            <th>부서</th>
            <th>라인명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tool in filteredTools" 
              :key="tool.id"
              class="clickable-row">
            <td class="image-icon-cell" @click.stop="openImageModal(tool)">
              <i v-if="tool.images?.length" 
                 class="fa-solid fa-image" 
                 style="color: var(--accent-color)"></i>
            </td>
            <td data-label="관리번호" @click="openModal(tool)">{{ tool.code }}</td>
            <td data-label="분류" @click="openModal(tool)">{{ tool.category }}</td>
            <td data-label="품명" @click="openModal(tool)">{{ tool.name }}</td>
            <td data-label="규격" @click="openModal(tool)">{{ tool.specification }}</td>
            <td data-label="제조사" @click="openModal(tool)">{{ tool.manufacturer }}</td>
            <td data-label="현재고" @click="openModal(tool)" 
                :class="{ 'low-stock': tool.current_stock < tool.safety_stock }">
              {{ tool.current_stock }}
            </td>
            <td data-label="안전재고" @click="openModal(tool)">{{ tool.safety_stock }}</td>
            <td data-label="단가" @click="openModal(tool)">{{ formatPrice(tool.unit_price) }}</td>
            <td data-label="보관위치" @click="openModal(tool)">{{ formatLocation(tool) }}</td>
            <td data-label="공장" @click="openModal(tool)">{{ tool.factory }}</td>
            <td data-label="부서" @click="openModal(tool)">{{ tool.department }}</td>
            <td data-label="라인명" @click="openModal(tool)">{{ tool.line_name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 그리드 뷰 -->
      <div v-else class="tools-grid">
        <div v-for="tool in filteredTools" 
             :key="tool.id" 
             class="tool-card glass-card"
             @click="openModal(tool)">
          <div class="tool-image" @click.stop="openImageModal(tool)">
            <div class="image-placeholder" 
                 :style="tool.images?.length ? {
                   backgroundImage: `url(data:image/jpeg;base64,${tool.images[0].image})`
                 } : {}">
              <i v-if="tool.images?.length" 
                 class="fa-solid fa-image"
                 style="color: var(--accent-color)"></i>
              <i v-else 
                 class="fa-solid fa-cube placeholder-icon"
                 style="position: static"></i>
            </div>
          </div>
          <div class="tool-info">
            <div class="tool-header">
              <div class="tool-code">{{ tool.code }}</div>
              <div class="tool-category">{{ tool.category }}</div>
            </div>
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-spec">{{ tool.specification }}</div>
            <div class="tool-stock">
              <span class="current-stock" :class="{ warning: tool.current_stock < tool.safety_stock }">
                재고: {{ tool.current_stock }}
              </span>
              <span class="safety-stock">
                안전: {{ tool.safety_stock }}
              </span>
            </div>
            <div class="tool-location">{{ formatLocation(tool) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 정보 모달 -->
    <div v-if="selectedTool" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>공구 상세 정보</h2>
          <div class="modal-actions">
            <button 
              class="edit-button" 
              @click="toggleEditMode"
              :class="{ active: isEditMode }"
            >
              <i class="fa-solid" :class="isEditMode ? 'fa-check' : 'fa-pen'"></i>
              {{ isEditMode ? '저장' : '수정' }}
            </button>
            <button class="close-button" @click="closeModal">×</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <div class="info-group">
              <label>관리번호</label>
              <div>{{ selectedTool.code }}</div>
            </div>
            <div class="info-group">
              <label>분류</label>
              <div v-if="!isEditMode">{{ selectedTool.category }}</div>
              <select v-else v-model="editingTool.category" class="edit-input">
                <option v-for="option in categoryOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <div class="info-group">
              <label>품명</label>
              <div v-if="!isEditMode">{{ selectedTool.name }}</div>
              <input v-else v-model="editingTool.name" class="edit-input" type="text">
            </div>
            <div class="info-group">
              <label>규격</label>
              <div v-if="!isEditMode">{{ selectedTool.specification }}</div>
              <input v-else v-model="editingTool.specification" class="edit-input" type="text">
            </div>
            <div class="info-group">
              <label>제조사</label>
              <div v-if="!isEditMode">{{ selectedTool.manufacturer || '-' }}</div>
              <input v-else v-model="editingTool.manufacturer" class="edit-input" type="text">
            </div>
            <div class="info-group">
              <label>담당자</label>
              <div v-if="!isEditMode">{{ selectedTool.manager || '-' }}</div>
              <input v-else v-model="editingTool.manager" class="edit-input" type="text">
            </div>
            <div class="info-group">
              <label>현재고</label>
              <div v-if="!isEditMode">{{ selectedTool.current_stock }}</div>
              <input v-else v-model.number="editingTool.current_stock" class="edit-input" type="number" min="0">
            </div>
            <div class="info-group">
              <label>안전재고</label>
              <div v-if="!isEditMode">{{ selectedTool.safety_stock }}</div>
              <input v-else v-model.number="editingTool.safety_stock" class="edit-input" type="number" min="0">
            </div>
            <div class="info-group">
              <label>단가</label>
              <div v-if="!isEditMode">{{ formatPrice(selectedTool.unit_price) }}</div>
              <input v-else v-model.number="editingTool.unit_price" class="edit-input" type="number" min="0">
            </div>
            <div class="info-group">
              <label>보관위치</label>
              <div v-if="!isEditMode">{{ formatLocation(selectedTool) }}</div>
              <div v-else class="location-inputs">
                <div class="location-input-group">
                  <select v-if="!isCustomLocationZone" 
                          v-model="editingTool.location_zone" 
                          class="edit-input location">
                    <option value="">구역</option>
                    <option v-for="option in locationZoneOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                    <option value="custom">직접 입력</option>
                  </select>
                  <input v-else
                         v-model="editingTool.location_zone" 
                         class="edit-input location" 
                         type="text" 
                         placeholder="구역">
                  <button class="custom-toggle" 
                          @click="toggleCustomLocation('zone')"
                          :class="{ active: isCustomLocationZone }">
                  <i class="fa-solid" :class="isCustomLocationZone ? 'fa-chevron-down' : 'fa-pen'"></i>
                  </button>
                </div>

                <div class="location-input-group">
                  <select v-if="!isCustomLocationRow" 
                          v-model="editingTool.location_row" 
                          class="edit-input location">
                    <option value="">열</option>
                    <option v-for="option in locationNumberOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                    <option value="custom">직접 입력</option>
                  </select>
                  <input v-else
                         v-model="editingTool.location_row" 
                         class="edit-input location" 
                         type="text" 
                         placeholder="열">
                  <button class="custom-toggle" 
                          @click="toggleCustomLocation('row')"
                          :class="{ active: isCustomLocationRow }">
                  <i class="fa-solid" :class="isCustomLocationRow ? 'fa-chevron-down' : 'fa-pen'"></i>
                  </button>
                </div>

                <div class="location-input-group">
                  <select v-if="!isCustomLocationColumn" 
                          v-model="editingTool.location_column" 
                          class="edit-input location">
                    <option value="">단</option>
                    <option v-for="option in locationNumberOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                    <option value="custom">직접 입력</option>
                  </select>
                  <input v-else
                         v-model="editingTool.location_column" 
                         class="edit-input location" 
                         type="text" 
                         placeholder="단">
                  <button class="custom-toggle" 
                          @click="toggleCustomLocation('column')"
                          :class="{ active: isCustomLocationColumn }">
                  <i class="fa-solid" :class="isCustomLocationColumn ? 'fa-chevron-down' : 'fa-pen'"></i>
                  </button>
                </div>

                <div class="location-input-group">
                  <select v-if="!isCustomLocationPosition" 
                          v-model="editingTool.location_position" 
                          class="edit-input location">
                    <option value="">칸</option>
                    <option v-for="option in locationNumberOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                    <option value="custom">직접 입력</option>
                  </select>
                  <input v-else
                         v-model="editingTool.location_position" 
                         class="edit-input location" 
                         type="text" 
                         placeholder="칸">
                  <button class="custom-toggle" 
                          @click="toggleCustomLocation('position')"
                          :class="{ active: isCustomLocationPosition }">
                  <i class="fa-solid" :class="isCustomLocationPosition ? 'fa-chevron-down' : 'fa-pen'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="info-group">
              <label>공장</label>
              <div v-if="!isEditMode">{{ selectedTool.factory || '-' }}</div>
              <select v-else v-model="editingTool.factory" class="edit-input" @change="handleFactoryChange">
                <option value="">선택</option>
                <option v-for="option in factoryOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <div class="info-group">
              <label>부서</label>
              <div v-if="!isEditMode">{{ selectedTool.department || '-' }}</div>
              <select v-else v-model="editingTool.department" class="edit-input" @change="handleDepartmentChange">
                <option value="">선택</option>
                <option v-for="option in departmentOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <div class="info-group">
              <label>라인명</label>
              <div v-if="!isEditMode">{{ selectedTool.line_name || '-' }}</div>
              <select v-else v-model="editingTool.line_name" class="edit-input">
                <option value="">선택</option>
                <option v-for="option in lineNameOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
            <div class="info-group">
              <label>특이사항</label>
              <div v-if="!isEditMode">{{ selectedTool.remarks || '-' }}</div>
              <textarea v-else v-model="editingTool.remarks" class="edit-input textarea"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 전체화면 이미지 모달 -->
    <div v-if="showFullScreenModal" class="full-screen-modal" @click="closeFullImage">
      <img :src="fullScreenImage" alt="전체화면 이미지" />
      <button class="close-button" @click="closeFullImage">×</button>
    </div>

    <!-- 이미지 모달 추가 -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-content glass-card image-modal">
        <div class="modal-header">
          <h2>
            {{ selectedToolForImage?.name }} 이미지
            <span class="image-count">({{ selectedToolForImage?.images?.length }}개)</span>
          </h2>
          <button class="close-button" @click="closeImageModal">×</button>
        </div>
        <div class="modal-body">
          <swiper
            :modules="[SwiperNavigation, SwiperPagination]"
            :slides-per-view="1"
            :space-between="30"
            :navigation="true"
            :pagination="{ clickable: true }"
            class="tool-swiper"
          >
            <swiper-slide v-for="image in selectedToolForImage?.images" :key="image.id">
              <img
                :src="`data:image/jpeg;base64,${image.image}`"
                @click="openFullImage(image.image)"
                class="w-full h-80 object-contain rounded-lg cursor-pointer hover:opacity-90"
                alt="Tool image"
              />
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToolsStore } from '@/stores/tools'
import type { Tool } from '@/types/tool'
import '@/styles/macBaseStyle.scss'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useLinesStore } from '@/stores/lines'
import { useToast } from 'vue-toast-notification'

const API_URL = 'http://localhost:3000'  // 환경변수 대신 직접 URL 사용
const toast = useToast()

const toolsStore = useToolsStore()
const tools = ref<Tool[]>([])
const searchCode = ref('ikm_')
const isNameSearch = ref(false)

// 검색어에 따른 필터링된 도구 목록
const filteredTools = computed(() => {
  const searchValue = searchCode.value.toLowerCase()
  
  if (isNameSearch.value) {
    // 품명/규격 검색
    if (!searchValue) return tools.value
    
    return tools.value.filter(tool => 
      tool.name.toLowerCase().includes(searchValue) || 
      tool.specification.toLowerCase().includes(searchValue)
    )
  } else {
    // 관리번호 검색
    if (!searchValue || searchValue === 'ikm_') return tools.value
    return tools.value.filter(tool => 
      tool.code.toLowerCase().includes(searchValue)
    )
  }
})

// 검색어 입력 처리
const handleSearchInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value.includes('/')) {
    // '/'가 입력되면 품명/규격 검색 모드로 전환하고 검색창 비우기
    isNameSearch.value = true
    searchCode.value = ''
  } else if (!value.startsWith('ikm_') && !isNameSearch.value) {
    // 관리번호 검색 모드에서는 'ikm_' 유지
    searchCode.value = 'ikm_'
  }
}

// 검색창 placeholder 텍스트
const searchPlaceholder = computed(() => {
  return isNameSearch.value ? '품명 또는 규격 검색' : '관리번호 검색'
})

// 검색 모드 초기화
const resetSearch = () => {
  isNameSearch.value = false
  searchCode.value = 'ikm_'
}

onMounted(async () => {
  try {
    await toolsStore.fetchTools()
    tools.value = toolsStore.tools
  } catch (error) {
    console.error('공구 목록 로딩 실패:', error)
  }
})

const formatPrice = (price: number | undefined) => {
  if (!price) return '-'
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const formatLocation = (tool: Tool) => {
  const { location_zone, location_row, location_column, location_position } = tool
  if (!location_zone) return '-'
  return `${location_zone}-${location_row}-${location_column}-${location_position}`
}

const selectedTool = ref<Tool | null>(null)
const selectedToolForImage = ref<Tool | null>(null)

const openModal = (tool: Tool) => {
  selectedTool.value = tool
}

const closeModal = () => {
  selectedTool.value = null
  isEditMode.value = false
  editingTool.value = null
}

// 전체화면 이미지 모달 상태
const fullScreenImage = ref<string>('')
const showFullScreenModal = ref(false)

// 이미지 전체화면 보기
const openFullImage = (imageData: string) => {
  console.log('Image Data:', imageData)
  fullScreenImage.value = `data:image/jpeg;base64,${imageData}`
  showFullScreenModal.value = true
}

// 전체화면 모달 닫기
const closeFullImage = () => {
  showFullScreenModal.value = false
  fullScreenImage.value = ''
}

// 이미지 모달 상태
const showImageModal = ref(false)

// 이미지 모달 열기
const openImageModal = (tool: Tool) => {
  if (tool.images?.length) {
    selectedToolForImage.value = tool
    showImageModal.value = true
  }
}

// 이미지 모달 닫기
const closeImageModal = () => {
  showImageModal.value = false
  selectedToolForImage.value = null
}

// Swiper 모듈 설정
const SwiperNavigation = Navigation
const SwiperPagination = Pagination

// 통계 계산
const totalTools = computed(() => tools.value.length)

const lowStockTools = computed(() => 
  tools.value.filter(tool => 
    tool.current_stock < tool.safety_stock
  ).length
)

const totalStock = computed(() => 
  tools.value.reduce((sum, tool) => sum + tool.current_stock, 0)
)

const totalValue = computed(() => 
  tools.value.reduce((sum, tool) => 
    sum + (tool.current_stock * (tool.unit_price || 0)), 0
  )
)

// 뷰 모드 상태 추가
const viewMode = ref<'list' | 'grid'>('list')

// 수정 모드 상태
const isEditMode = ref(false)
const editingTool = ref<Tool | null>(null)

// 수정 모드 토글
const toggleEditMode = async () => {
  if (isEditMode.value) {
    // 저장 로직
    try {
      await toolsStore.updateTool(editingTool.value!)
      selectedTool.value = { ...editingTool.value }
      isEditMode.value = false
      // 목록 새로고침
      await toolsStore.fetchTools()
      tools.value = toolsStore.tools
    } catch (error) {
      console.error('공구 정보 수정 실패:', error)
      toast.error('공구 정보 수정에 실패했습니다.')
    }
  } else {
    // 수정 모드 시작
    editingTool.value = { ...selectedTool.value! }
    isEditMode.value = true
  }
}

// 콤보박스 옵션 데이터
const categoryOptions = [
  '절삭공구',
  '측정공구',
  '수공구',
  '전동공구',
  '지그류'
]

const locationZoneOptions = ['A', 'B', 'C', 'D']
const locationNumberOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString())

// 보관위치 입력 상태
const isCustomLocationZone = ref(false)
const isCustomLocationRow = ref(false)
const isCustomLocationColumn = ref(false)
const isCustomLocationPosition = ref(false)

// 보관위치 직접 입력 토글
const toggleCustomLocation = (type: 'zone' | 'row' | 'column' | 'position') => {
  switch(type) {
    case 'zone':
      isCustomLocationZone.value = !isCustomLocationZone.value
      if (!isCustomLocationZone.value) editingTool.value!.location_zone = ''
      break
    case 'row':
      isCustomLocationRow.value = !isCustomLocationRow.value
      if (!isCustomLocationRow.value) editingTool.value!.location_row = ''
      break
    case 'column':
      isCustomLocationColumn.value = !isCustomLocationColumn.value
      if (!isCustomLocationColumn.value) editingTool.value!.location_column = ''
      break
    case 'position':
      isCustomLocationPosition.value = !isCustomLocationPosition.value
      if (!isCustomLocationPosition.value) editingTool.value!.location_position = ''
      break
  }
}

// 라인 스토어
const linesStore = useLinesStore()

// 라인 데이터 로드
onMounted(async () => {
  await linesStore.fetchLines()
})

// 공장 목록 (level 1)
const factoryOptions = computed(() => 
  linesStore.lines
    .filter(line => line.level === 1)
    .map(line => line.name)
)

// 선택된 공장의 부서 목록 (level 2)
const departmentOptions = computed(() => {
  if (!editingTool.value?.factory) return []
  
  const selectedFactory = linesStore.lines.find(
    factory => factory.name === editingTool.value?.factory
  )
  
  return selectedFactory?.children
    ?.filter(dept => dept.level === 2)
    .map(dept => dept.name) || []
})

// 선택된 부서의 라인 목록 (level 3)
const lineNameOptions = computed(() => {
  if (!editingTool.value?.factory || !editingTool.value?.department) return []
  
  const selectedFactory = linesStore.lines.find(
    factory => factory.name === editingTool.value?.factory
  )
  
  const selectedDepartment = selectedFactory?.children?.find(
    dept => dept.name === editingTool.value?.department
  )
  
  return selectedDepartment?.children
    ?.filter(line => line.level === 3)
    .map(line => line.name) || []
})

// 공장 선택 시 부서/라인 초기화
const handleFactoryChange = () => {
  if (editingTool.value) {
    editingTool.value.department = ''
    editingTool.value.line_name = ''
  }
}

// 부서 선택 시 라인 초기화
const handleDepartmentChange = () => {
  if (editingTool.value) {
    editingTool.value.line_name = ''
  }
}
</script>

<style scoped lang="scss">
.inventory-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-left {
    .title-section {
      h1 {
        margin: 0;
        font-size: 24px;
        color: var(--text-primary);
      }
    }

    .description-section {
      margin-top: 8px;
      color: var(--text-secondary);
    }
  }

  .header-right {
    display: flex;
    gap: 16px;
    align-items: center;

    .view-controls {
      display: flex;
      gap: 8px;
      
      .view-toggle-btn {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--surface-variant);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: var(--hover-bg);
          border-color: var(--hover-border);
          color: var(--text-primary);
        }
        
        &.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }
        
        i {
          font-size: 16px;
        }
      }
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-input {
        width: 200px;
        padding: 8px 12px;
        padding-right: 32px; // 리셋 버튼을 위한 공간
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 14px;
        
        &:focus {
          border-color: rgb(59, 130, 246);
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      }

      .reset-button {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: var(--text-primary);
        }
      }

      .search-help {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.tools-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background: var(--surface-variant);
    font-weight: 600;
    color: var(--text-primary);
  }

  td {
    color: var(--text-secondary);
  }

  tbody tr:hover {
    background: var(--surface-variant);
  }
}

:root {
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --border-color: rgba(0, 0, 0, 0.12);
  --surface-variant: rgba(0, 0, 0, 0.04);
  --modal-bg: rgba(255, 255, 255, 0.98);
  --modal-header-bg: rgba(255, 255, 255, 0.95);
  --hover-bg: rgba(37, 99, 235, 0.04);
  --hover-border: rgba(37, 99, 235, 0.1);
  --accent-color: #3b82f6;
}

.dark {
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.15);
  --surface-variant: rgba(255, 255, 255, 0.06);
  --modal-bg: rgba(23, 23, 23, 0.98);
  --modal-header-bg: rgba(28, 28, 28, 0.98);
  --hover-bg: rgba(59, 130, 246, 0.15);
  --hover-border: rgba(59, 130, 246, 0.25);
  --accent-color: #60a5fa;
}

.clickable-row {
  cursor: pointer;
  
  &:hover {
    background: var(--surface-variant);
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
}

.modal-content {
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--modal-bg);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  
  .modal-header {
    padding: 28px 32px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--modal-header-bg);
    position: sticky;
    top: 0;
    z-index: 1;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 12px;

      &::after {
        content: '';
        display: block;
        width: 6px;
        height: 6px;
        background: var(--accent-color);
        border-radius: 50%;
      }
    }

    .close-button {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      font-size: 20px;
      color: var(--text-secondary);
      
      &:hover {
        background: rgba(0, 0, 0, 0.08);
        color: var(--text-primary);
      }
    }
  }

  .modal-body {
    padding: 32px;
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    
    .info-group {
      position: relative;
      
      label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;

        &::before {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          background: var(--accent-color);
          border-radius: 50%;
          opacity: 0.5;
        }
      }

      div {
        font-size: 15px;
        color: var(--text-primary);
        font-weight: 500;
        padding: 12px 16px;
        background: var(--surface-variant);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        min-height: 44px;
        display: flex;
        align-items: center;
        transition: all 0.2s;

        &:hover {
          background: var(--hover-bg);
          border-color: var(--hover-border);
        }
      }

      // 중요 정보 강조
      &.important {
        div {
          background: var(--hover-bg);
          border-color: var(--hover-border);
          font-weight: 600;
        }
      }

      .location-inputs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}

.location-input-group {
  position: relative;
  display: flex;
  gap: 4px;
  align-items: flex-start;

  select.edit-input.location,
  input.edit-input.location {
    text-align: center;
    padding: 6px;
    width: 100%;
    min-width: 60px;
    height: 32px;
    font-size: 13px;
    appearance: none;  // 기본 select 스타일 제거
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    padding-right: 24px;
    background-color: var(--modal-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;

    &:focus {
      border-color: var(--accent-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }
  }

  input.edit-input.location {
    background-image: none;
    padding-right: 6px;
  }

  .custom-toggle {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--surface-variant);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    margin-top: 6px;

    i {
      font-size: 10px;
    }

    &:hover {
      background: var(--hover-bg);
      border-color: var(--hover-border);
      color: var(--text-primary);
    }

    &.active {
      background: var(--accent-color);
      border-color: var(--accent-color);
      color: white;
    }
  }
}

.image-icon-cell {
  width: 40px;
  text-align: center !important;
  padding: 12px 4px !important;
  
  i {
    font-size: 16px;
    opacity: 0.8;
    transition: all 0.2s;
  }
  
  tr:hover & i {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 모바일 대응
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;

    .header-left {
      width: 100%;
    }

    .header-right {
      flex-direction: row;
      justify-content: space-between;
      
      .view-controls {
        order: 2;
      }
      
      .search-box {
        flex: 1;
        margin-right: 16px;
      }
    }
  }

  // 테이블을 카드 형태로 변경
  .tools-table {
    display: block;
    
    thead {
      display: none;  // 헤더 숨기기
    }
    
    tbody {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      
      tr {
        display: flex;
        flex-direction: column;
        background: var(--surface-variant);
        border-radius: 12px;
        padding: 16px;
        border: 1px solid var(--border-color);
        
        td {
          border: none;
          padding: 8px 0;
          display: grid;
          grid-template-columns: 100px 1fr;
          align-items: center;
          
          &::before {
            content: attr(data-label);
            font-weight: 500;
            color: var(--text-secondary);
          }
        }
        
        &:hover {
          background: var(--hover-bg);
          border-color: var(--hover-border);
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .inventory-view {
    padding: 12px;
  }

  .header {
    .header-left {
      .title-section h1 {
        font-size: 20px;
      }
      
      .description-section {
        font-size: 14px;
      }
    }
  }

  .header {
    .header-right {
      flex-direction: column;
      
      .view-controls {
        order: 1;
        align-self: flex-end;
      }
      
      .search-box {
        order: 2;
        width: 100%;
        margin-right: 0;
      }
    }
  }

  .tools-table {
    tbody {
      grid-template-columns: 1fr;  // 한 열로 변경
      
      tr {
        td {
          grid-template-columns: 80px 1fr;  // 라벨 영역 축소
          font-size: 13px;
        }
      }
    }
  }
}

.full-screen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  
  img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
  }
  
  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.image-modal {
  max-width: 800px;
  
  .modal-header {
    h2 {
      .image-count {
        font-size: 16px;
        color: var(--text-secondary);
        margin-left: 8px;
      }
    }
  }
  
  .tool-swiper {
    width: 100%;
    height: 500px;
    margin: 20px 0;
    
    :deep(.swiper-button-next),
    :deep(.swiper-button-prev) {
      color: var(--text-primary);
      
      &::after {
        font-size: 24px;
      }
    }
    
    :deep(.swiper-pagination-bullet) {
      background: var(--text-primary);
      opacity: 0.5;
      
      &.swiper-pagination-bullet-active {
        opacity: 1;
      }
    }
    
    :deep(.swiper-slide) {
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: var(--mac-radius);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--system-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-icon i {
  font-size: 1.5rem;
  color: white;
}

.stat-icon.warning {
  background: var(--mac-warning);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

// 모바일 대응 추가
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
    
    .stat-card {
      padding: 16px;
      
      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
      
      .stat-content {
        .stat-value {
          font-size: 20px;
        }
        
        .stat-label {
          font-size: 13px;
        }
      }
    }
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  
  .tool-card {
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border-color);
    
    &:hover {
      transform: translateY(-2px);
      border-color: var(--hover-border);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    .tool-image {
      height: 160px;
      position: relative;
      overflow: hidden;
      border-radius: 12px 12px 0 0;
      background: var(--surface-variant);
      cursor: pointer;
      
      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        
        i {
          font-size: 24px;
          opacity: 0.8;
          transition: all 0.2s;
          
          &.fa-image {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            
            &:hover {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          
          &.placeholder-icon {
            font-size: 48px;
            color: var(--text-secondary);
            opacity: 0.5;
          }
        }
      }
    }
    
    .tool-info {
      padding: 20px;
      border-top: 1px solid var(--border-color);
      background: var(--modal-bg);
      border-radius: 0 0 12px 12px;
      
      .tool-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .tool-code {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .tool-category {
          font-size: 13px;
          color: var(--accent-color);
          font-weight: 500;
        }
      }
      
      .tool-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }
      
      .tool-spec {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 12px;
      }
      
      .tool-stock {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;
        
        span {
          font-size: 14px;
          
          &.current-stock {
            color: var(--accent-color);
            font-weight: 500;
            
            &.warning {
              color: #ff4444;
              font-weight: bold;
            }
          }
          
          &.safety-stock {
            color: var(--text-secondary);
          }
        }
      }
      
      .tool-location {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }
  }
}

// 모바일 대응 수정
@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--surface-variant);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 14px;
  }

  &:hover {
    background: var(--hover-bg);
    border-color: var(--hover-border);
    color: var(--text-primary);
  }

  &.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);

    i {
      color: white;
    }

    &:hover {
      background: #60a5fa;
      border-color: #60a5fa;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
    }
  }
}

.edit-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--modal-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
  appearance: none; // 기본 select 스타일 제거

  &:focus {
    border-color: var(--accent-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  // select 화살표 커스텀
  &[type="select"] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 35px;
  }
}

.order-btn {
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: all 0.2s;
}

.order-btn:hover {
  transform: scale(1.1);
}

.low-stock {
  color: #ff4444;
  font-weight: bold;
}

.tools-table td.low-stock {
  color: #ff4444;
  font-weight: bold;
}

.tool-stock .current-stock.warning {
  color: #ff4444;
  font-weight: bold;
}
</style> 
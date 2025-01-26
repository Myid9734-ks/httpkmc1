<template>
  <div class="transaction-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>공구 입출고 관리</h1>
        </div>
        <div class="description-section">
          <p class="description">공구 및 지그의 입고/출고 내역을 관리할 수 있습니다.</p>
        </div>
      </div>
      <div class="header-right">
        <button class="action-button success" @click="openTransactionModal('in')">
          <i class="fa-solid fa-arrow-down-to-line"></i>
          입고 등록
        </button>
        <button class="action-button warning" @click="openTransactionModal('out')">
          <i class="fa-solid fa-arrow-up-from-line"></i>
          출고 등록
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-container">
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-arrow-down-to-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ todayInCount }}</div>
          <div class="stat-label">금일 입고</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon warning">
          <i class="fa-solid fa-arrow-up-from-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ todayOutCount }}</div>
          <div class="stat-label">금일 출고</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ weeklyTransactionCount }}</div>
          <div class="stat-label">주간 거래량</div>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ monthlyTransactionCount }}</div>
          <div class="stat-label">월간 거래량</div>
        </div>
      </div>
    </div>

    <!-- 필터 섹션 -->
    <div class="filter-section glass-card">
      <div class="filter-group">
        <label>기간</label>
        <div class="date-range">
          <input type="date" v-model="startDate" />
          <span>~</span>
          <input type="date" v-model="endDate" />
        </div>
      </div>

      <div class="filter-group">
        <label>공장</label>
        <select v-model="selectedFactory" class="mac-input">
          <option value="">전체</option>
          <option v-for="factory in factories" :key="factory.id" :value="factory.id">
            {{ factory.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>부서</label>
        <select v-model="selectedDepartment" class="mac-input" :disabled="!selectedFactory">
          <option value="">전체</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>라인명</label>
        <select v-model="selectedLine" class="mac-input" :disabled="!selectedDepartment">
          <option value="">전체</option>
          <option v-for="line in lines" :key="line.id" :value="line.id">
            {{ line.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>거래 유형</label>
        <select v-model="transactionType">
          <option value="all">전체</option>
          <option value="in">입고</option>
          <option value="out">출고</option>
        </select>
      </div>

      <div class="filter-group">
        <label>검색</label>
        <input type="text" v-model="searchQuery" placeholder="공구 코드/이름 검색..." />
      </div>
    </div>

    <!-- 거래 내역 테이블 -->
    <div class="content glass-card">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>거래일시</th>
            <th>유형</th>
            <th>관리번호</th>
            <th>품명</th>
            <th>수량</th>
            <th>담당자</th>
            <th>비고</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td>{{ transaction.transaction_date }}</td>
            <td>
              <span :class="['badge', transaction.type === 'in' ? 'success' : 'warning']">
                {{ transaction.type === 'in' ? '입고' : '출고' }}
              </span>
            </td>
            <td>{{ transaction.tool_code }}</td>
            <td>{{ transaction.tool_name }}</td>
            <td>{{ transaction.quantity }}</td>
            <td>{{ transaction.manager }}</td>
            <td>{{ transaction.remarks }}</td>
            <td class="actions">
              <el-tooltip content="상세 정보" placement="top">
                <el-button
                  type="primary"
                  link
                  :icon="View"
                  @click="viewDetails(transaction)"
                />
              </el-tooltip>
              <el-tooltip content="수정" placement="top">
                <el-button
                  type="warning"
                  link
                  :icon="Edit"
                  @click="editTransaction(transaction)"
                />
              </el-tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 입출고 등록 모달 -->
    <div v-if="showTransactionModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>
            {{ transactionMode === 'in' ? '입고' : '출고' }} 등록
          </h2>
          <button class="close-button" @click="closeTransactionModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitTransaction" class="transaction-form">
            <div class="form-group">
              <label>관리번호</label>
              <div class="tool-search">
                <input 
                  type="text" 
                  v-model="newTransaction.tool_code"
                  class="mac-input" 
                  @input="searchTool"
                >
                <!-- 검색 결과 드롭다운 -->
                <div v-if="toolSuggestions.length" class="search-results">
                  <div 
                    v-for="tool in toolSuggestions" 
                    :key="tool.code"
                    class="search-item"
                    @click="selectTool(tool)"
                  >
                    <div class="tool-info">
                      <div class="tool-code">{{ tool.code }}</div>
                      <div class="tool-name">{{ tool.name }}</div>
                    </div>
                    <div class="tool-stock">
                      재고: {{ tool.current_stock }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 선택된 공구 정보 표시 -->
            <div v-if="selectedTool" class="selected-tool-info">
              <div class="info-header">
                <div class="info-content">
                  <div class="info-row">
                    <span class="label">공구명:</span>
                    <span class="value">{{ selectedTool.name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">현재고:</span>
                    <span class="value">{{ selectedTool.current_stock }}</span>
                  </div>
                  <div class="info-row" v-if="selectedTool.specification">
                    <span class="label">규격:</span>
                    <span class="value">{{ selectedTool.specification }}</span>
                  </div>
                </div>
                <div class="tool-image" v-if="selectedTool.images && selectedTool.images.length > 0" @click="openImageViewer(selectedTool)">
                  <img 
                    :src="`data:image/jpeg;base64,${selectedTool.images[0].image}`" 
                    alt="공구 이미지" 
                    @error="handleImageError"
                  >
                </div>
                <div class="tool-image placeholder" v-else>
                  <i class="fa-solid fa-image"></i>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>수량</label>
              <input 
                type="number" 
                v-model="newTransaction.quantity"
                class="mac-input" 
                min="1"
                required
              >
            </div>

            <div class="form-group">
              <label>담당자</label>
              <input 
                type="text" 
                v-model="newTransaction.manager"
                class="mac-input" 
                required
                disabled
                :style="{ backgroundColor: 'var(--surface-variant)', cursor: 'not-allowed' }"
              >
            </div>

            <div class="form-group">
              <label>비고</label>
              <textarea 
                v-model="newTransaction.remarks"
                class="mac-input" 
                rows="3"
                placeholder="추가 설명이 필요한 경우 입력하세요."
              ></textarea>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-button"
                @click="closeTransactionModal"
              >
                취소
              </button>
              <button 
                type="submit" 
                class="submit-button"
                :class="transactionMode === 'in' ? 'success' : 'warning'"
              >
                {{ transactionMode === 'in' ? '입고' : '출고' }} 등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 이미지 뷰어 모달 -->
    <div v-if="showImageViewer" class="image-viewer-modal">
      <div class="image-viewer-content">
        <button class="close-button" @click="closeImageViewer">×</button>
        <div class="image-container">
          <img 
            :src="images[currentImageIndex]" 
            alt="공구 이미지"
            @error="handleImageError"
          />
        </div>
        <div class="image-controls" v-if="images.length > 1">
          <button 
            class="nav-button prev" 
            @click="prevImage"
            :disabled="currentImageIndex === 0"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div class="image-counter">
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </div>
          <button 
            class="nav-button next" 
            @click="nextImage"
            :disabled="currentImageIndex === images.length - 1"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useDbToolsStore } from '@/stores/dbTools'
import { useAuthStore } from '@/stores/auth'
import '@/styles/macBaseStyle.scss'
import client from '@/api/client'
import { View, Edit } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { h } from 'vue'

interface ToolImage {
  image: string;  // base64 이미지 데이터
}

interface Tool {
  id: number;
  code: string;
  name: string;
  current_stock: number;
  specification?: string;
  images?: ToolImage[];
  image_count?: number;
}

interface Line {
  id: number
  parent_id: number | null
  level: number
  name: string
  status: 'active' | 'maintenance' | 'inactive'
  children?: Line[]
}

interface Transaction {
  id: number
  transaction_date: string
  formatted_date?: string
  type: string
  tool_code: string
  tool_name: string
  quantity: number
  manager: string
  remarks: string
  factory: string
  department: string
  line_name: string
  tool_factory?: string
  tool_department?: string
}

// 상태 관리
const toolsStore = useToolsStore()
const dbToolsStore = useDbToolsStore()
const authStore = useAuthStore()
const showTransactionModal = ref(false)
const transactionMode = ref<'in' | 'out'>('in')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const transactionType = ref('all')
const searchQuery = ref('')
const selectedTool = ref<Tool | null>(null)

// 필터링 상태 추가
const selectedFactory = ref<number | string>('')
const selectedDepartment = ref<number | string>('')
const selectedLine = ref('')

// 필터 옵션
const factories = computed(() => {
  return dbToolsStore.factories.map((factory: Line) => ({
    id: factory.id,
    name: factory.name
  }))
})

const departments = computed(() => {
  if (!selectedFactory.value) return []
  const factory = dbToolsStore.lines.find((f: Line) => f.id === Number(selectedFactory.value))
  return factory?.children?.map((dept: Line) => ({
    id: dept.id,
    name: dept.name
  })) || []
})

const lines = computed(() => {
  if (!selectedDepartment.value) return []
  const factory = dbToolsStore.lines.find((f: Line) => f.id === Number(selectedFactory.value))
  const department = factory?.children?.find((d: Line) => d.id === Number(selectedDepartment.value))
  return department?.children?.map((line: Line) => ({
    id: line.id,
    name: line.name
  })) || []
})

// DB 데이터 로드 및 사용자 기본값 설정
onMounted(async () => {
  await dbToolsStore.fetchLines()
  await fetchTransactions()
  
  // 사용자의 공장 정보로 기본값 설정
  const userFactory = authStore.user?.factory || ''
  if (userFactory) {
    // 공백을 제거하고 공장명 비교
    const userFactoryNoSpace = userFactory.replace(/\s+/g, '')
    const foundFactory = factories.value.find((factory: { id: number, name: string }) => 
      factory.name.replace(/\s+/g, '') === userFactoryNoSpace
    )
    
    if (foundFactory) {
      selectedFactory.value = foundFactory.id
      
      // 사용자의 부서 정보로 기본값 설정
      const userDepartment = authStore.user?.department || ''
      if (userDepartment) {
        // departments computed가 업데이트될 때까지 잠시 대기
        setTimeout(() => {
          const userDepartmentNoSpace = userDepartment.replace(/\s+/g, '')
          const foundDepartment = departments.value.find((dept: { id: number, name: string }) => 
            dept.name.replace(/\s+/g, '') === userDepartmentNoSpace
          )
          
          if (foundDepartment) {
            selectedDepartment.value = foundDepartment.id
          }
        }, 100)
      }
    }
  }
})

// 상태 관리
const transactions = ref<Transaction[]>([])

// 통계 계산
const todayInCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return transactions.value.filter(t => 
    t.type === 'in' && t.transaction_date.startsWith(today)
  ).length
})

const todayOutCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return transactions.value.filter(t => 
    t.type === 'out' && t.transaction_date.startsWith(today)
  ).length
})

const weeklyTransactionCount = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return transactions.value.filter(t => 
    new Date(t.transaction_date) >= oneWeekAgo
  ).length
})

const monthlyTransactionCount = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return transactions.value.filter(t => 
    new Date(t.transaction_date) >= oneMonthAgo
  ).length
})

// 새 거래 정보
const newTransaction = ref({
  tool_code: '',
  tool_name: '',
  quantity: 1,
  manager: authStore.user?.name || '',
  remarks: ''
})

// 공구 검색 제안
const toolSuggestions = ref<Tool[]>([])

// 필터링된 거래 내역
const filteredTransactions = computed(() => {
  console.log('[거래내역 필터] 전체 데이터 수:', transactions.value?.length)
  return transactions.value.filter(transaction => {
    try {
      // 날짜 필터 - 날짜 문자열에서 시간 부분을 제외하고 비교
      const transactionDate = transaction.formatted_date?.split(' ')[0] || 
                            transaction.transaction_date?.split(' ')[0]
      
      if (!transactionDate) {
        console.log('[거래내역 필터] 날짜 정보 누락:', transaction)
        return false
      }

      // 날짜 비교
      const isInDateRange = transactionDate >= startDate.value && 
                          transactionDate <= endDate.value
      
      if (!isInDateRange) {
        console.log('[거래내역 필터] 날짜 범위 제외:', {
          id: transaction.id,
          transactionDate,
          start: startDate.value,
          end: endDate.value
        })
        return false
      }

      // 거래 유형 필터
      if (transactionType.value !== 'all' && transaction.type !== transactionType.value) {
        console.log('[거래내역 필터] 거래유형 제외:', {
          id: transaction.id,
          expected: transactionType.value,
          actual: transaction.type
        })
        return false
      }

      // 공장 필터
      if (selectedFactory.value && transaction.tool_factory) {
        const factory = factories.value.find(f => f.id === Number(selectedFactory.value))
        if (factory && factory.name !== transaction.tool_factory) {
          console.log('[거래내역 필터] 공장 제외:', {
            id: transaction.id,
            expected: factory.name,
            actual: transaction.tool_factory
          })
          return false
        }
      }

      // 부서 필터
      if (selectedDepartment.value && transaction.tool_department) {
        const department = departments.value.find(d => d.id === Number(selectedDepartment.value))
        if (department && department.name !== transaction.tool_department) {
          console.log('[거래내역 필터] 부서 제외:', {
            id: transaction.id,
            expected: department.name,
            actual: transaction.tool_department
          })
          return false
        }
      }

      // 라인 필터
      if (selectedLine.value && transaction.line_name) {
        const line = lines.value.find(l => l.id === Number(selectedLine.value))
        if (line && line.name !== transaction.line_name) {
          console.log('[거래내역 필터] 라인 제외:', {
            id: transaction.id,
            expected: line.name,
            actual: transaction.line_name
          })
          return false
        }
      }

      // 검색어 필터
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        const matchesSearch = (transaction.tool_code?.toLowerCase().includes(query) ||
                             transaction.tool_name?.toLowerCase().includes(query))
        if (!matchesSearch) {
          console.log('[거래내역 필터] 검색어 제외:', {
            id: transaction.id,
            query: searchQuery.value,
            code: transaction.tool_code,
            name: transaction.tool_name
          })
          return false
        }
      }

      return true
    } catch (error) {
      console.error('[거래내역 필터] 필터링 오류:', error, transaction)
      return false
    }
  })
})

// 모달 제어
const openTransactionModal = (mode: 'in' | 'out') => {
  transactionMode.value = mode
  showTransactionModal.value = true
  newTransaction.value.manager = authStore.user?.name || ''
}

const closeTransactionModal = () => {
  showTransactionModal.value = false
  selectedTool.value = null
  newTransaction.value = {
    tool_code: '',
    tool_name: '',
    quantity: 1,
    manager: '',
    remarks: ''
  }
}

// 거래 내역 조회
const fetchTransactions = async (params = {}) => {
  try {
    const response = await client.get('/inventory/transactions', { params })
    transactions.value = response.data
  } catch (error) {
    console.error('거래 내역 조회 실패:', error)
  }
}

// 공구 검색
const searchTool = async () => {
  if (!newTransaction.value.tool_code) {
    toolSuggestions.value = []
    return
  }

  try {
    console.log('공구 검색 요청:', {
      search: newTransaction.value.tool_code,
      factory: selectedFactory.value,
      department: selectedDepartment.value,
      line: selectedLine.value
    })

    // 공장과 부서 이름으로 변환
    const factoryName = factories.value.find(f => f.id === Number(selectedFactory.value))?.name
    const departmentName = departments.value.find(d => d.id === Number(selectedDepartment.value))?.name

    const response = await client.get('/inventory/tools', {
      params: {
        search: newTransaction.value.tool_code,
        factory: factoryName,
        department: departmentName,
        line: selectedLine.value
      }
    })
    
    if (response.data) {
      console.log('공구 검색 응답:', response.data)
      toolSuggestions.value = response.data
    }
  } catch (error) {
    console.error('공구 검색 실패:', error)
    toolSuggestions.value = []
  }
}

const selectTool = (tool: Tool) => {
  console.log('공구 선택:', tool)
  newTransaction.value.tool_code = tool.code
  newTransaction.value.tool_name = tool.name
  selectedTool.value = tool
  toolSuggestions.value = []
}

// 거래 등록
const submitTransaction = async () => {
  try {
    // 출고 시 재고 확인
    if (transactionMode.value === 'out' && selectedTool.value && selectedTool.value.current_stock !== undefined) {
      if (selectedTool.value.current_stock < newTransaction.value.quantity) {
        alert('재고가 부족합니다.')
        return
      }
    }

    const transactionData = {
      ...newTransaction.value,
      type: transactionMode.value,
      factory: selectedFactory.value,
      department: selectedDepartment.value,
      line: selectedLine.value,
      timestamp: new Date().toISOString()
    }

    console.log('거래 등록 요청:', transactionData)
    await client.post('/inventory/transactions', transactionData)
    
    alert(`${transactionMode.value === 'in' ? '입고' : '출고'} 처리가 완료되었습니다.`)
    closeTransactionModal()
    fetchTransactions()
  } catch (error) {
    console.error('거래 등록 실패:', error)
    alert('처리 중 오류가 발생했습니다.')
  }
}

// 이미지 데이터 파싱 함수
const parseToolImages = (imageData: any): ToolImage[] => {
  if (!imageData) return [];
  
  // 이미지 데이터가 이미 배열인 경우
  if (Array.isArray(imageData)) {
    return imageData.filter(img => img && img.image);
  }
  
  return [];
}

const viewDetails = async (transaction: any) => {
  try {
    const response = await client.get(`/inventory/tools/${transaction.tool_code}`)
    const toolData = response.data as Tool
    
    console.log('[상세정보] 공구 데이터:', toolData)
    console.log('[상세정보] 이미지 데이터:', toolData.images)
    
    // 이미지 데이터 파싱
    const parsedImages = parseToolImages(toolData.images)
    console.log('[상세정보] 파싱된 이미지 데이터:', parsedImages[0])

    // 이미지 데이터 유효성 검사
    const hasValidImage = parsedImages.length > 0 && parsedImages[0]?.image
    
    console.log('[상세정보] 이미지 유효성:', {
      hasValidImage,
      imagesLength: parsedImages.length,
      firstImage: parsedImages[0]
    })
    
    const detailsHtml = h('div', { class: 'transaction-details' }, [
      // 이미지 섹션
      h('div', { class: 'image-section' }, [
        hasValidImage
          ? h('img', { 
              src: `data:image/jpeg;base64,${parsedImages[0].image}`,
              class: 'tool-detail-image',
              onClick: () => openImageViewer({ ...toolData, images: parsedImages }),
              onError: (e: Event) => {
                console.error('[상세정보] 이미지 로드 실패:', e)
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="no-image"><i class="fa-solid fa-image"></i><p>이미지를 불러올 수 없습니다.</p></div>'
                }
              }
            })
          : h('div', { class: 'no-image' }, [
              h('i', { class: 'fa-solid fa-image' }),
              h('p', '이미지가 없습니다.')
            ])
      ]),
      // 기본 정보 섹션
      h('div', { class: 'info-section' }, [
        h('p', { class: 'tool-name' }, [
          h('span', { class: 'label' }, '공구명'),
          h('span', { class: 'value' }, transaction.tool_name)
        ]),
        h('p', { class: 'tool-code' }, [
          h('span', { class: 'label' }, '관리번호'),
          h('span', { class: 'value' }, transaction.tool_code)
        ]),
        h('p', { class: 'transaction-info' }, [
          h('span', { class: 'label' }, '입출고 정보'),
          h('div', { class: 'info-value' }, [
            h('span', { class: `badge ${transaction.type === 'in' ? 'success' : 'warning'}` },
              transaction.type === 'in' ? '입고' : '출고'
            ),
            h('span', { class: 'quantity' }, `수량: ${transaction.quantity}`),
            h('span', { class: 'date' }, transaction.transaction_date)
          ])
        ])
      ])
    ])

    ElMessageBox.alert(
      detailsHtml,
      '거래 상세 정보',
      {
        confirmButtonText: '확인',
        customClass: 'transaction-details-dialog'
      }
    )
  } catch (error) {
    console.error('[상세정보] 조회 실패:', error)
    ElMessage.error('상세 정보를 불러오는 중 오류가 발생했습니다.')
  }
}

// 거래 수정
const editTransaction = (transaction: any) => {
  ElMessageBox.confirm(
    '이 기능은 아직 개발 중입니다. 추후 업데이트될 예정입니다.',
    '알림',
    {
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      type: 'warning'
    }
  )
}

// 위치 정보 포맷팅
const formatLocation = (transaction: any) => {
  const parts = []
  if (transaction.location_zone) parts.push(`구역: ${transaction.location_zone}`)
  if (transaction.location_row) parts.push(`열: ${transaction.location_row}`)
  if (transaction.location_column) parts.push(`행: ${transaction.location_column}`)
  if (transaction.location_position) parts.push(`위치: ${transaction.location_position}`)
  return parts.length > 0 ? parts.join(', ') : '-'
}

// 유틸리티 함수
const formatDateTime = (dateStr: string) => {
  try {
    // 이미 한국어 형식으로 되어있는 경우 날짜만 추출
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.')
      return `${parts[0]}.${parts[1]}.${parts[2].trim()}`
    }

    // ISO 형식의 날짜를 한국어 형식으로 변환
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      console.error('유효하지 않은 날짜:', dateStr)
      return dateStr
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('날짜 변환 중 오류:', error)
    return dateStr
  }
}

// 이미지 로드 실패 처리
const handleImageError = (e: Event) => {
  console.error('[이미지 로드 실패]', e)
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    parent.innerHTML = '<div class="no-image"><i class="fa-solid fa-image"></i><p>이미지를 불러올 수 없습니다.</p></div>'
  }
}

// 필터 변경 시 데이터 새로고침
watch([startDate, endDate, selectedFactory, selectedDepartment, selectedLine, transactionType], () => {
  fetchTransactions()
})

// 이미지 뷰어 상태 관리
const showImageViewer = ref(false)
const images = ref<string[]>([])
const currentImageIndex = ref(0)

// 이미지 뷰어 관련 함수들
const openImageViewer = (tool: Tool) => {
  try {
    if (!tool.images || tool.images.length === 0) {
      ElMessage.warning('표시할 이미지가 없습니다.')
      return
    }

    // base64 이미지 데이터 사용
    const imageUrls = tool.images
      .filter(img => img && img.image)
      .map(img => `data:image/jpeg;base64,${img.image}`)
    
    console.log('[이미지 뷰어] 이미지 URL 수:', imageUrls.length)
    
    if (imageUrls.length === 0) {
      ElMessage.warning('유효한 이미지가 없습니다.')
      return
    }
    
    // ref 값 업데이트
    images.value = imageUrls
    currentImageIndex.value = 0
    showImageViewer.value = true
  } catch (error) {
    console.error('[이미지 뷰어] 오류:', error)
    ElMessage.error('이미지를 불러오는 중 오류가 발생했습니다.')
  }
}

// 이미지 뷰어 컨트롤 함수들
const closeImageViewer = () => {
  showImageViewer.value = false
  images.value = []
  currentImageIndex.value = 0
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  }
}
</script>

<style scoped lang="scss">
.transaction-view {
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
    gap: 12px;
    align-items: center;

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      color: white;

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      &.success {
        background: rgb(34, 197, 94);
      }

      &.warning {
        background: #f59e0b;
      }

      i {
        font-size: 16px;
      }
    }
  }
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    transition: all 0.2s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      background: #22c55e;

      i {
        font-size: 24px;
      }

      &.warning {
        background: #f59e0b;
      }
    }
    
    &:nth-child(3) .stat-icon {
      background: #3b82f6;
    }
    
    &:nth-child(4) .stat-icon {
      background: #8b5cf6;
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.2;
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }
  }
}

.filter-section {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: var(--text-color);
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-color);
  color: var(--text-color);
  min-width: 120px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range span {
  color: var(--text-color);
}

.transaction-table {
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

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;

    &.success {
      background: rgba(34, 197, 94, 0.1);
      color: rgb(34, 197, 94);
    }

    &.warning {
      background: rgba(245, 158, 11, 0.1);
      color: rgb(245, 158, 11);
    }
  }

  .icon-button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: var(--surface-variant);
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 4px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--hover-border);
      color: var(--text-primary);
    }

    i {
      font-size: 14px;
    }
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
  max-width: 400px;  // 모달 너비 조정
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--modal-bg);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .close-button {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  .modal-body {
    padding: 20px;
  }
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
    }

    input, textarea {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;

    button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.cancel-button {
        background: none;
        border: none;
        color: var(--text-secondary);

        &:hover {
          color: var(--text-primary);
        }
      }

      &.submit-button {
        border: none;
        color: white;

        &.success {
          background: rgb(34, 197, 94);
        }

        &.warning {
          background: #f59e0b;
        }

        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}

.tool-search {
  position: relative;
  width: 100%;

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .search-item {
    padding: 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    background: white;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--surface-variant);
    }

    .tool-info {
      .tool-code {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .tool-name {
        font-size: 13px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }

    .tool-stock {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--surface-variant);
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
  }
}

.selected-tool-info {
  background: var(--surface-variant);
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .info-content {
    flex: 1;
  }

  .info-row {
    margin-bottom: 8px;
    display: flex;
    gap: 10px;
  }

  .info-row .label {
    color: #666;
    min-width: 80px;
  }

  .info-row .value {
    font-weight: 500;
  }

  .tool-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .tool-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tool-image.placeholder {
    color: #ccc;
    font-size: 24px;
  }
}

// 모바일 대응
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;

    .header-right {
      width: 100%;
      
      .action-button {
        flex: 1;
        justify-content: center;
      }
    }
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-section {
    flex-direction: column;
    gap: 16px;

    .filter-group {
      width: 100%;

      select, input, .date-range {
        width: 100%;
      }
    }
  }

  .transaction-table {
    display: block;
    
    thead {
      display: none;
    }
    
    tbody {
      display: block;
      
      tr {
        display: block;
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
        
        td {
          display: grid;
          grid-template-columns: 100px 1fr;
          padding: 4px 0;
          border: none;
          
          &::before {
            content: attr(data-label);
            font-weight: 500;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;

    .form-row {
      grid-template-columns: 1fr;
    }
  }
}

.image-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .image-viewer-content {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
    background: transparent;
    border-radius: 8px;
    padding: 20px;

    .close-button {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: white;
      z-index: 1;
      padding: 10px;

      &:hover {
        color: #ddd;
      }
    }

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      max-height: calc(90vh - 100px);
      
      img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      }
    }

    .image-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      gap: 20px;

      .nav-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 15px;
        color: white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
      }

      .image-counter {
        font-size: 16px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 8px 16px;
        border-radius: 20px;
      }
    }
  }
}

.no-image {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  color: #999;
  border-radius: 8px;
  
  i {
    font-size: 48px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
}

.transaction-details {
  padding: 20px;
  
  .image-section {
    margin-bottom: 24px;
    text-align: center;
    background: var(--surface-variant);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .tool-detail-image {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
    }

    .no-image {
      padding: 40px;
      background: var(--surface-variant);
      border-radius: 8px;
      color: var(--text-secondary);
      text-align: center;
      border: 2px dashed var(--border-color);

      i {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.7;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }

  .info-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    p {
      margin: 12px 0;
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 500;
      }

      .value {
        flex: 1;
        font-weight: 500;
        color: var(--text-primary);
      }

      &.transaction-info {
        .info-value {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            
            &.success {
              background: rgba(34, 197, 94, 0.1);
              color: rgb(34, 197, 94);
            }
            
            &.warning {
              background: rgba(245, 158, 11, 0.1);
              color: rgb(245, 158, 11);
            }
          }

          .quantity {
            color: var(--text-secondary);
            font-size: 13px;
            background: var(--surface-variant);
            padding: 4px 8px;
            border-radius: 4px;
          }

          .date {
            color: var(--text-secondary);
            font-size: 13px;
          }
        }
      }
    }
  }
}

:deep(.transaction-details-dialog) {
  .el-message-box__header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    
    .el-message-box__title {
      font-size: 18px;
      font-weight: 600;
    }
    
    .el-message-box__headerbtn {
      top: 20px;
      right: 20px;
    }
  }

  .el-message-box__content {
    padding: 0;
  }

  .el-message-box__container {
    margin: 0;
  }

  .el-message-box__btns {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    
    .el-button {
      padding: 8px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      
      &--primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        
        &:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .transaction-details {
    .info-section {
      p {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .label {
          width: 100%;
          margin-bottom: 4px;
        }

        &.transaction-info {
          .info-value {
            width: 100%;
            justify-content: flex-start;
          }
        }
      }
    }
  }
}
</style> 
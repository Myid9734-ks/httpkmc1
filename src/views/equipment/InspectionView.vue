<template>
  <div class="inspection-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>설비 점검</h1>
            <span class="item-count">총 {{ equipmentInspectionStore.filteredInspections.length }}개</span>
          </div>
          <div class="description-section">
            <p class="description">설비 점검 항목을 추가, 편집, 삭제하여 효율적인 점검 관리가 가능합니다.</p>
          </div>
        </div>
        <div class="header-right">
          <!-- 필터 섹션 -->
          <div class="filter-section">
            <select 
              class="mac-input" 
              v-model="equipmentInspectionStore.selectedFactory"
            >
              <option :value="null">전체 공장</option>
              <option 
                v-for="factory in factories" 
                :key="factory.id" 
                :value="factory.id"
              >
                {{ factory.name }}
              </option>
            </select>
            <select 
              class="mac-input" 
              v-model="equipmentInspectionStore.selectedDepartment"
            >
              <option :value="null">전체 부서</option>
              <option 
                v-for="dept in departments" 
                :key="dept.id" 
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
            <select 
              class="mac-input" 
              v-model="equipmentInspectionStore.selectedLine"
            >
              <option :value="null">전체 라인</option>
              <option 
                v-for="line in lines" 
                :key="line.id" 
                :value="line.id"
              >
                {{ line.name }}
              </option>
            </select>
            <button class="mac-button secondary" @click="showCompletedList">
              <span class="button-text">완료목록</span>
            </button>
          </div>
          <button class="mac-button primary" @click="generateInspections" :disabled="!isSystemAdmin">
            <span class="button-icon">+</span>
            <span class="button-text">계획 생성</span>
          </button>
          <button class="mac-button secondary" @click="quickInspection">
            <span class="button-icon">⚡</span>
            <span class="button-text">간단점검</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 테이블/카드 뷰 -->
    <div class="inspection-content glass-card">
      <!-- 데스크톱 테이블 뷰 -->
      <div class="desktop-view">
        <table class="mac-table">
          <thead>
            <tr>
              <th>점검코드</th>
              <th>라인명</th>
              <th>점검항목</th>
              <th>점검기준</th>
              <th>예정일</th>
              <th>주기</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="equipmentInspectionStore.filteredInspections.length === 0">
              <td colspan="7" class="empty-message">등록된 점검이 없습니다.</td>
            </tr>
            <tr v-else v-for="item in equipmentInspectionStore.filteredInspections" :key="item.id">
              <td>INS{{ String(item.id).padStart(3, '0') }}</td>
              <td>{{ item.line_name }}</td>
              <td>{{ item.inspection_name }}</td>
              <td>{{ item.inspection_standard }}</td>
              <td>{{ item.scheduled_date }}</td>
              <td>{{ item.inspection_cycle }}</td>
              <td>
                <div class="table-actions">
                  <button 
                    v-if="item.status === 'pending'"
                    class="mac-button primary small" 
                    @click="startInspection(item)"
                    :disabled="!equipmentInspectionStore.isInspectionEnabled(item.scheduled_date, item.execution_due_date)"
                  >
                    점검시작
                  </button>
                  <button 
                    class="mac-button secondary small" 
                    @click="sendNotification(item)"
                  >
                    <font-awesome-icon :icon="['fas', 'bell']" />
                    알림
                  </button>
                  <span 
                    class="remaining-days" 
                    :class="getRemainingDaysClass(item)"
                  >
                    {{ formatRemainingDays(item) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 모바일 카드 뷰 -->
      <div class="mobile-view">
        <div v-if="equipmentInspectionStore.filteredInspections.length === 0" class="empty-message">
          등록된 점검이 없습니다.
        </div>
        <div 
          v-else 
          v-for="item in equipmentInspectionStore.filteredInspections" 
          :key="item.id" 
          class="inspection-card glass-card"
        >
          <div class="card-header">
            <span class="code">INS{{ String(item.id).padStart(3, '0') }}</span>
            <span class="status-badge" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">라인명:</span>
              <span class="value">{{ item.line_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검항목:</span>
              <span class="value">{{ item.inspection_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검기준:</span>
              <span class="value">{{ item.inspection_standard }}</span>
            </div>
            <div class="info-row">
              <span class="label">예정일:</span>
              <span class="value">{{ item.scheduled_date }}</span>
            </div>
            <div class="info-row">
              <span class="label">주기:</span>
              <span class="value">{{ item.inspection_cycle }}</span>
            </div>
            <div class="info-row">
              <span class="label">남은일수:</span>
              <span 
                class="value remaining-days" 
                :class="getRemainingDaysClass(item)"
              >
                {{ formatRemainingDays(item) }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button 
              v-if="item.status === 'pending'"
              class="mac-button primary" 
              @click="startInspection(item)"
              :disabled="!equipmentInspectionStore.isInspectionEnabled(item.scheduled_date, item.execution_due_date)"
            >
              점검시작
            </button>
            <button 
              class="mac-button secondary" 
              @click="sendNotification(item)"
            >
              <font-awesome-icon :icon="['fas', 'bell']" />
              알림
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 상세 보기 모달 -->
  <div v-if="showDetailModal" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <div class="header-title">
          <h2>점검 상세 정보</h2>
          <span class="inspection-code">INS{{ String(selectedInspection?.id).padStart(3, '0') }}</span>
        </div>
      </div>
      <div class="modal-body" v-if="selectedInspection">
        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            <h3>기본 정보</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">라인명</span>
              <span class="value">{{ selectedInspection.line_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검항목</span>
              <span class="value">{{ selectedInspection.inspection_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검기준</span>
              <span class="value">{{ selectedInspection.inspection_standard }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검주기</span>
              <span class="value">{{ selectedInspection.inspection_cycle }}</span>
            </div>
            <div class="info-row">
              <span class="label">예정일</span>
              <span class="value">{{ selectedInspection.scheduled_date }}</span>
            </div>
            <div class="info-row">
              <span class="label">상태</span>
              <span class="status-badge" :class="getStatusClass(selectedInspection.status)">
                {{ getStatusText(selectedInspection.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'clipboard-check']" />
            <h3>체크리스트</h3>
          </div>
          <div class="checklist">
            <div v-for="(item, index) in selectedInspection.checklist" :key="index" class="checklist-item">
              <div class="item-header">
                <div class="item-number">{{ index + 1 }}</div>
                <div class="item-content">
                  <span class="content">{{ item.content }}</span>
                  <span class="required-mark">*</span>
                </div>
              </div>
              <div class="check-actions">
                <div class="photo-upload">
                  <input 
                    type="file" 
                    :id="'photo-' + index"
                    @change="handlePhotoUpload($event, index)"
                    accept="image/*"
                    class="hidden"
                  >
                  <label :for="'photo-' + index" class="upload-button">
                    <font-awesome-icon :icon="['fas', 'camera']" />
                    {{ photos[index] ? '사진 변경' : '사진 등록' }}
                  </label>
                  <div v-if="photos[index]" class="photo-preview">
                    <img :src="photos[index]" alt="점검 사진" />
                    <button class="remove-photo" @click="removePhoto(index)">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
                <div class="check-buttons">
                  <button 
                    :class="['check-button', { active: checkResults[index] === true }]"
                    @click="checkResults[index] = true"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" />
                    적합
                  </button>
                  <button 
                    :class="['check-button danger', { active: checkResults[index] === false }]"
                    @click="checkResults[index] = false"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" />
                    부적합
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'comment']" />
            <h3>특이사항</h3>
          </div>
          <div class="notes-input">
            <textarea 
              v-model="inspectionNotes" 
              class="mac-input" 
              placeholder="특이사항을 입력하세요..."
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 점검 시작 모달 -->
  <div v-if="showStartModal && selectedInspection" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <div class="header-title">
          <h2>점검 실시</h2>
          <span class="inspection-code">INS{{ String(selectedInspection.id).padStart(3, '0') }}</span>
        </div>
      </div>

      <div class="modal-body">
        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            <h3>기본 정보</h3>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">점검일자</span>
              <span class="value">{{ new Date().toLocaleDateString() }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검항목</span>
              <span class="value">{{ selectedInspection.inspection_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검기준</span>
              <span class="value">{{ selectedInspection.inspection_standard }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검자</span>
              <span class="value">{{ inspectorName }}</span>
            </div>
          </div>
        </div>

        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'clipboard-check']" />
            <h3>체크리스트</h3>
          </div>
          <div class="checklist">
            <div v-for="(item, index) in selectedInspection.checklist" :key="index" class="checklist-item">
              <div class="item-header">
                <div class="item-number">{{ index + 1 }}</div>
                <div class="item-content">
                  <span class="content">{{ item.content }}</span>
                  <span class="required-mark">*</span>
                </div>
              </div>
              <div class="check-actions">
                <div class="photo-upload">
                  <input 
                    type="file" 
                    :id="'photo-' + index"
                    @change="handlePhotoUpload($event, index)"
                    accept="image/*"
                    class="hidden"
                  >
                  <label :for="'photo-' + index" class="upload-button">
                    <font-awesome-icon :icon="['fas', 'camera']" />
                    {{ photos[index] ? '사진 변경' : '사진 등록' }}
                  </label>
                  <div v-if="photos[index]" class="photo-preview">
                    <img :src="photos[index]" alt="점검 사진" />
                    <button class="remove-photo" @click="removePhoto(index)">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
                <div class="check-buttons">
                  <button 
                    :class="['check-button', { active: checkResults[index] === true }]"
                    @click="checkResults[index] = true"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" />
                    적합
                  </button>
                  <button 
                    :class="['check-button danger', { active: checkResults[index] === false }]"
                    @click="checkResults[index] = false"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" />
                    부적합
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'comment']" />
            <h3>특이사항</h3>
          </div>
          <div class="notes-input">
            <textarea 
              v-model="inspectionNotes" 
              class="mac-input" 
              placeholder="특이사항을 입력하세요..."
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="mac-button primary" @click="submitInspection" :disabled="!inspectorName.trim()">
          완료
        </button>
        <button class="mac-button secondary" @click="closeStartModal">
          취소
        </button>
      </div>
    </div>
  </div>

  <!-- 알림 전송 모달 -->
  <div v-if="showNotificationModal" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h2>알림 전송 확인</h2>
      </div>
      <div class="modal-body">
        <p>이 알림은 다음과 같은 용도로 사용됩니다:</p>
        <ol>
          <li>점검 담당자에게 예정된 점검 일정을 알립니다</li>
          <li>알림 전송 시점부터 5일 이내에 점검을 완료하도록 요청합니다</li>
          <li>실행기한이 설정되며, 기한 내 점검이 가능합니다</li>
        </ol>
      </div>
      <div class="modal-footer">
        <button class="mac-button secondary" @click="showNotificationModal = false">취소</button>
        <button class="mac-button primary" @click="confirmAndSendNotification">확인</button>
      </div>
    </div>
  </div>

  <!-- 간단점검 모달 -->
  <div v-if="showQuickInspectionModal" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <div class="header-title">
          <h2>간단점검</h2>
        </div>
      </div>

      <div class="modal-body">
        <div class="info-group">
          <div class="info-header">
            <font-awesome-icon :icon="['fas', 'clipboard-check']" />
            <h3>점검 내용</h3>
          </div>
          <div class="quick-inspection-form">
            <div class="form-row">
              <span class="label">점검항목</span>
              <input 
                v-model="quickInspectionData.name" 
                class="mac-input" 
                placeholder="예: 필터청소"
              />
            </div>
            <div class="form-row">
              <span class="label">점검주기</span>
              <div class="cycle-input">
                <input 
                  v-model="quickInspectionData.cycle_number" 
                  type="number" 
                  min="1"
                  class="mac-input cycle-number" 
                  placeholder="예: 2"
                />
                <select v-model="quickInspectionData.cycle_unit" class="mac-input cycle-unit">
                  <option value="day">일</option>
                  <option value="week">주</option>
                  <option value="month">개월</option>
                </select>
                <span class="cycle-text">마다</span>
              </div>
            </div>
            <div class="form-row">
              <span class="label">점검요일</span>
              <div class="weekday-buttons">
                <button 
                  v-for="(day, index) in weekdays" 
                  :key="day"
                  :class="['weekday-button', { active: quickInspectionData.weekdays.includes(index) }]"
                  @click="toggleWeekday(index)"
                >
                  {{ day }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          class="mac-button primary" 
          @click="submitQuickInspection" 
          :disabled="!canSubmitQuickInspection"
        >
          완료
        </button>
        <button class="mac-button secondary" @click="closeQuickInspectionModal">
          취소
        </button>
      </div>

      <!-- 간단점검 목록 -->
      <div class="quick-inspection-list">
        <div class="list-header">
          <h3>등록된 간단점검 목록</h3>
        </div>
        <div class="list-content">
          <div v-if="quickInspections.length === 0" class="empty-message">
            등록된 간단점검이 없습니다.
          </div>
          <div v-else class="inspection-items">
            <div v-for="item in quickInspections" :key="item.id" class="inspection-item">
              <div class="item-info">
                <span class="name">{{ item.inspection_name }}</span>
                <span class="cycle">{{ item.cycle }}</span>
                <span class="weekdays">{{ formatWeekdays(item.weekdays) }}</span>
              </div>
              <button 
                v-if="isSystemAdmin"
                class="delete-button" 
                @click="deleteQuickInspection(item.id)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import client from '@/api/client'
import '@/styles/macBaseStyle.scss'
import '@/styles/components/table.scss'
import { useEquipmentInspectionStore } from '@/stores/equipmentInspection'
import { useCompletedInspectionStore } from '@/stores/completedInspection'
import { useLinesStore } from '@/stores/lines'
import { useAuthStore } from '@/stores/auth'
import type { EquipmentInspection } from '@/types/equipment'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faInfoCircle, 
  faCamera, 
  faTimes,
  faCheck,
  faBell,
  faClipboardCheck,
  faComment,
  faTrash
} from '@fortawesome/free-solid-svg-icons'

// Font Awesome 아이콘 등록
library.add(
  faInfoCircle,
  faCamera,
  faTimes,
  faCheck,
  faBell,
  faClipboardCheck,
  faComment,
  faTrash
)

// Store
const equipmentInspectionStore = useEquipmentInspectionStore()
const completedInspectionStore = useCompletedInspectionStore()
const lineStore = useLinesStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// 상태
const showDetailModal = ref(false)
const showStartModal = ref(false)
const selectedInspection = ref<EquipmentInspection | null>(null)
const inspectorName = ref(authStore.user?.name || '')
const checkResults = ref<(boolean | null)[]>([])
const inspectionNotes = ref('')

// 사용자 정보
const userFactory = authStore.user?.factory || ''
const userDepartment = authStore.user?.department || ''

// 이전 선택값 저장
const previousFactory = ref<number | null>(null)
const previousDepartment = ref<number | null>(null)

// 요일 데이터 추가
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 간단점검 모달 상태
const showQuickInspectionModal = ref(false)
const quickInspections = ref([])

// 간단점검 데이터
const quickInspectionData = ref({
  name: '',
  cycle_number: 1,
  cycle_unit: 'week',
  weekdays: []
})

// 데이터 로드
const refreshData = async () => {
  console.log('데이터 새로고침 시작 - refreshData()')
  await equipmentInspectionStore.fetchInspections()
  console.log('데이터 새로고침 완료 - refreshData()')
}

// 페이지 진입 시 데이터 로드
onMounted(async () => {
  console.log('페이지 마운트 - onMounted()')
  await refreshData()
  try {
    await lineStore.fetchLines()
    
    // 사용자의 공장 설정
    const userFactoryLine = factories.value.find(f => f.name === userFactory)
    if (userFactoryLine) {
      equipmentInspectionStore.selectedFactory = userFactoryLine.id
      previousFactory.value = userFactoryLine.id
    }

    // 사용자의 부서 설정
    const userDeptLine = departments.value.find(d => 
      d.name.replace(/\s+/g, '') === userDepartment.replace(/\s+/g, '')
    )
    if (userDeptLine) {
      equipmentInspectionStore.selectedDepartment = userDeptLine.id
      previousDepartment.value = userDeptLine.id
    }
  } catch (error) {
    console.error('라인 데이터 로드 실패:', error)
  }
  console.log('페이지 마운트 완료')
})

// 라우트 변경 감지
watch(
  () => route.fullPath,
  async () => {
    console.log('라우트 변경 감지됨:', route.fullPath)
    await refreshData()
    console.log('라우트 변경 후 데이터 새로고침 완료')
  }
)

// 공장과 부서, 라인 목록
const factories = computed(() => {
  const allLines = lineStore.lines
  return allLines.filter(line => line.level === 1)
})

const departments = computed(() => {
  const allLines = lineStore.lines
  if (!equipmentInspectionStore.selectedFactory) {
    // 전체 공장이 선택된 경우 모든 부서 반환
    return allLines.flatMap(line => line.children || [])
      .filter(line => line.level === 2)
  }
  // 특정 공장이 선택된 경우 해당 공장의 부서만 반환
  const selectedFactory = allLines.find(line => line.id === equipmentInspectionStore.selectedFactory)
  return (selectedFactory?.children || []).filter(line => line.level === 2)
})

const lines = computed(() => {
  const allLines = lineStore.lines
  const flattenedLines = allLines.flatMap(line => 
    line.children?.flatMap(dept => dept.children || []) || []
  ).filter(line => line.level === 3)

  if (!equipmentInspectionStore.selectedFactory && !equipmentInspectionStore.selectedDepartment) {
    // 전체 공장, 전체 부서가 선택된 경우 모든 라인 반환
    return flattenedLines
  }

  if (equipmentInspectionStore.selectedFactory && !equipmentInspectionStore.selectedDepartment) {
    // 특정 공장, 전체 부서가 선택된 경우 해당 공장의 모든 라인 반환
    const selectedFactory = allLines.find(line => line.id === equipmentInspectionStore.selectedFactory)
    return flattenedLines.filter(line => {
      const parentDept = selectedFactory?.children?.find(dept => 
        dept.children?.some(l => l.id === line.id)
      )
      return !!parentDept
    })
  }

  // 특정 부서가 선택된 경우 해당 부서의 라인만 반환
  return flattenedLines.filter(line => {
    const parentDept = allLines.flatMap(f => f.children || [])
      .find(d => d.id === equipmentInspectionStore.selectedDepartment)
    return parentDept?.children?.some(l => l.id === line.id)
  })
})

// 상태 관련 유틸리티 함수
const getStatusClass = (status: string) => {
  return {
    'pending': status === 'pending',
    'in-progress': status === 'in_progress',
    'completed': status === 'completed'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '대기중'
    case 'in_progress': return '진행중'
    case 'completed': return '완료'
    default: return ''
  }
}

// 점검 계획 생성
const generateInspections = async () => {
  if (confirm('새로운 점검 계획을 생성하시겠습니까?')) {
    try {
      await equipmentInspectionStore.generateRandomInspections()
    } catch (error) {
      console.error('점검 계획 생성 실패:', error)
    }
  }
}

// 상세 보기
const viewDetails = (item: EquipmentInspection) => {
  selectedInspection.value = item
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedInspection.value = null
}

// 현재 날짜 가져오기
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 점검 유효성 검사
const isInspectionValid = computed(() => {
  if (!inspectorName.value.trim()) return false
  
  // 모든 필수 항목이 체크되었는지 확인
  const requiredChecks = selectedInspection.value?.checklist
    .map((item, index) => item.required ? checkResults.value[index] !== null : true)
    .every(Boolean)
    
  return requiredChecks
})

// 모달 확장 상태
const isModalExpanded = ref(false)
const photos = ref<string[]>([])

// 모달 확장 토글
const toggleModalExpand = () => {
  isModalExpanded.value = !isModalExpanded.value
}

// 사진 업로드 처리
const handlePhotoUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const newPhotos = [...photos.value]
    newPhotos[index] = e.target?.result as string
    photos.value = newPhotos
  }
  reader.readAsDataURL(file)
}

// 사진 제거
const removePhoto = (index: number) => {
  const newPhotos = [...photos.value]
  newPhotos[index] = ''
  photos.value = newPhotos
}

// 점검 시작
const startInspection = (inspection: EquipmentInspection) => {
  selectedInspection.value = inspection
  inspectorName.value = authStore.user?.name || ''
  // 모든 체크리스트 항목을 기본적으로 부적합으로 설정
  checkResults.value = new Array(inspection.checklist.length).fill(false)
  photos.value = new Array(inspection.checklist.length).fill('')
  inspectionNotes.value = ''
  showStartModal.value = true
}

const closeStartModal = () => {
  showStartModal.value = false
  selectedInspection.value = null
  inspectorName.value = ''
  checkResults.value = []
  inspectionNotes.value = ''
}

const submitInspection = async () => {
  if (!selectedInspection.value || !inspectorName.value.trim()) return

  try {
    // 체크리스트 결과 구성
    const checklistResults = selectedInspection.value.checklist.map((item, index) => ({
      content: item.content,
      result: checkResults.value[index],
      photo: photos.value[index] || null,
      required: item.required || false
    }))

    // 필수 항목 체크 확인
    const hasUncheckedRequired = checklistResults.some(item => 
      item.required && item.result === null
    )

    if (hasUncheckedRequired) {
      toast.error('필수 항목을 모두 체크해주세요.')
      return
    }

    // 완료 처리 요청
    await completedInspectionStore.completeInspection({
      original_inspection_id: selectedInspection.value.id,
      inspector: inspectorName.value,
      checklist_results: checklistResults,
      photos: photos.value.filter(Boolean).join(','),
      notes: inspectionNotes.value,
      scheduled_date: selectedInspection.value.scheduled_date,
      line_name: selectedInspection.value.line_name,
      inspection_name: selectedInspection.value.inspection_name,
      inspection_standard: selectedInspection.value.inspection_standard,
      inspection_cycle: selectedInspection.value.inspection_cycle
    })

    // 성공 메시지
    toast.success('점검이 완료되었습니다.')
    
    // 모달 닫기
    closeStartModal()
    
    // 목록 새로고침
    await equipmentInspectionStore.fetchInspections()
  } catch (error) {
    console.error('점검 완료 처리 실패:', error)
    toast.error('점검 완료 처리에 실패했습니다.')
  }
}

// 완료목록 보기
const showCompletedList = () => {
  router.push({ name: 'equipment-inspection-completed' })
}

// 알림 전송 함수
const showNotificationModal = ref(false)
const selectedNotificationItem = ref(null)

const sendNotification = async (item: any) => {
  selectedNotificationItem.value = item
  showNotificationModal.value = true
}

const confirmAndSendNotification = async () => {
  try {
    await equipmentInspectionStore.sendInspectionNotification(selectedNotificationItem.value.id);
    showNotificationModal.value = false
    toast.success('점검 알림이 전송되었습니다.');
  } catch (error) {
    console.error('알림 전송 실패:', error);
    toast.error('알림 전송에 실패했습니다.');
  }
}

// 남은 일수 포맷팅
const formatRemainingDays = (item: any) => {
  if (!item) return ''
  
  const today = new Date()
  const targetDate = item.execution_due_date 
    ? new Date(item.execution_due_date)
    : new Date(item.scheduled_date)
  
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'D-Day'
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`
}

// 남은 일수에 따른 클래스
const getRemainingDaysClass = (item: any) => {
  if (!item) return ''
  
  const today = new Date()
  const targetDate = item.execution_due_date 
    ? new Date(item.execution_due_date)
    : new Date(item.scheduled_date)
  
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (item.execution_due_date) {
    // 실행예정일이 설정된 경우
    return {
      'warning': diffDays >= 0 && diffDays <= 5,
      'danger': diffDays < 0,
      'normal': false
    }
  } else {
    // 일반 예정일 기준
    return {
      'warning': diffDays >= -5 && diffDays <= 5,
      'danger': diffDays < -5,
      'normal': diffDays > 5
    }
  }
}

// 공장 선택 변경 감시
watch(() => equipmentInspectionStore.selectedFactory, (newValue) => {
  // 이전 선택값과 비교
  if (previousFactory.value !== null && newValue !== previousFactory.value) {
    equipmentInspectionStore.selectedDepartment = null
    equipmentInspectionStore.selectedLine = null
  }
  previousFactory.value = newValue
})

// 부서 선택 변경 감시
watch(() => equipmentInspectionStore.selectedDepartment, (newValue) => {
  // 이전 선택값과 비교
  if (previousDepartment.value !== null && newValue !== previousDepartment.value) {
    equipmentInspectionStore.selectedLine = null
  }
  previousDepartment.value = newValue
})

// 간단점검 관련 상태
const quickInspection = async () => {
  showQuickInspectionModal.value = true
  resetQuickInspectionForm()
  await fetchQuickInspections()
}

// 간단점검 폼 초기화
const resetQuickInspectionForm = () => {
  quickInspectionData.value = {
    name: '',
    cycle_number: 1,
    cycle_unit: 'week',
    weekdays: []
  }
}

// 간단점검 제출 가능 여부 확인
const canSubmitQuickInspection = computed(() => {
  return (
    quickInspectionData.value.name.trim() !== '' &&
    quickInspectionData.value.cycle_number !== null &&
    quickInspectionData.value.cycle_number > 0 &&
    quickInspectionData.value.weekdays.length > 0
  )
})

// 간단점검 제출
const submitQuickInspection = async () => {
  try {
    const requestData = {
      inspection_name: quickInspectionData.value.name,
      cycle: `${quickInspectionData.value.cycle_number}${quickInspectionData.value.cycle_unit}`,
      weekdays: quickInspectionData.value.weekdays
    }
    
    console.log('전송할 데이터:', requestData)
    await createQuickInspection(requestData)
    
    // 모달창 닫기
    showQuickInspectionModal.value = false
  } catch (error) {
    console.error('간단점검 저장 실패:', error)
    toast.error('간단점검 저장에 실패했습니다.')
  }
}

// 간단점검 모달 닫기
const closeQuickInspectionModal = () => {
  showQuickInspectionModal.value = false
  resetQuickInspectionForm()
}

// 간단점검 목록 조회
const fetchQuickInspections = async () => {
  try {
    console.log('간단점검 목록 조회 시작')
    const response = await client.get('/quick-inspections')
    console.log('조회된 데이터:', response.data)
    quickInspections.value = response.data
  } catch (error) {
    console.error('간단점검 목록 조회 실패:', error)
    toast.error('간단점검 목록을 불러오는데 실패했습니다.')
  }
}

// 요일 포맷팅
const formatWeekdays = (weekdaysStr) => {
  if (!weekdaysStr) return '';
  try {
    const weekdaysArr = typeof weekdaysStr === 'string' ? JSON.parse(weekdaysStr) : weekdaysStr;
    return weekdaysArr.map(day => weekdays[day]).join(', ');
  } catch (error) {
    console.error('요일 파싱 오류:', error);
    return '';
  }
}

// 간단점검 삭제
const deleteQuickInspection = async (id) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  
  try {
    await client.delete(`/quick-inspections/${id}`)
    toast.success('간단점검이 삭제되었습니다.')
    await fetchQuickInspections()
  } catch (error) {
    console.error('간단점검 삭제 실패:', error)
    toast.error('간단점검 삭제에 실패했습니다.')
  }
}

// 요일 토글
const toggleWeekday = (index: number) => {
  const weekdayIndex = quickInspectionData.value.weekdays.indexOf(index)
  if (weekdayIndex === -1) {
    quickInspectionData.value.weekdays.push(index)
  } else {
    quickInspectionData.value.weekdays.splice(weekdayIndex, 1)
  }
  quickInspectionData.value.weekdays.sort((a, b) => a - b)
}

const createQuickInspection = async (requestData) => {
  try {
    await client.post('/quick-inspections', requestData)
    await fetchQuickInspections()
  } catch (error) {
    console.error('빠른 점검 생성 실패:', error)
  }
}

// 시스템 관리자 확인
const isSystemAdmin = computed(() => {
  console.log('Current user:', authStore.user)
  console.log('Current user role:', authStore.user?.role)
  return authStore.user?.role?.toLowerCase() === 'system_admin'
})
</script>

<style lang="scss" scoped>
:root {
  // 라이트 모드
  --icon-button-bg: #f5f7fa;
  --icon-button-border: #e4e7ed;
  --icon-button-color: #606266;
  --icon-button-hover-bg: #ecf5ff;
  --icon-button-hover-border: #c6e2ff;
  --icon-button-hover-color: #409eff;
  --select-background: #ffffff;
  --select-text: #333333;
  --select-option-bg: #0066FF;
  --select-option-text: #ffffff;
  --select-hover-bg: #0052cc;
}

:root[data-theme="dark"] {
  // 다크 모드
  --icon-button-bg: #363636;
  --icon-button-border: #4a4a4a;
  --icon-button-color: #c0c4cc;
  --icon-button-hover-bg: #404854;
  --icon-button-hover-border: #4c5664;
  --icon-button-hover-color: #79bbff;
  --select-background: #2d2d2d;
  --select-text: #e0e0e0;
  --select-option-bg: #0066FF;
  --select-option-text: #ffffff;
  --select-hover-bg: #0052cc;
}

.inspection-view {
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
}

.header {
  padding: 1.5rem;
  margin-bottom: 1rem;

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 769px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
  }

  .header-left {
    flex: 1;
  }

  .header-right {
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (min-width: 769px) {
      flex-direction: row;
      align-items: center;
    }
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;

    h1 {
      font-size: 1.5rem;
      margin: 0;
    }

    .item-count {
      font-size: 0.875rem;
      color: var(--mac-text-secondary);
    }
  }

  .description {
    margin: 0;
    color: var(--mac-text-secondary);
  }

  .mac-button {
    width: 100%;
    
    @media (min-width: 769px) {
      width: auto;
    }

    .button-icon {
      margin-right: 0.5rem;
    }
  }
}

.inspection-content {
  padding: 1rem;

  .desktop-view {
    display: none;
    
    @media (min-width: 769px) {
      display: block;
    }
  }

  .mobile-view {
    display: none;
    
    @media (max-width: 768px) {
      display: block;
    }

  }
}

.status-badge {
  padding: 2px 8px;
  border-radius: var(--mac-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;

  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.in-progress {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  &.completed {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
}

.inspection-card {
  margin-bottom: 1rem;
  padding: 1rem;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .code {
      font-weight: 600;
    }
  }

  .card-body {
    .info-row {
      display: flex;
      margin-bottom: 0.5rem;

      .label {
        width: 80px;
        color: var(--mac-text-secondary);
        font-size: 0.875rem;
      }

      .value {
        flex: 1;
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;

    .mac-button {
      flex: 1;
    }
  }
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 180px;

  .mac-button {
    &.small {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      white-space: nowrap;
    }
  }

  .remaining-days {
    white-space: nowrap;
  }
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--mac-border-color);
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
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  margin: 2rem auto;
  padding: 0;
  border-radius: 12px;
  background: var(--mac-background);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--mac-border-color);
  background: var(--mac-background);
  flex-shrink: 0;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.info-group {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  .info-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #2563eb;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--mac-text);
    }
  }

  .info-content {
    background: var(--mac-surface);
    border: 1px solid var(--mac-border-color);
    border-radius: var(--mac-radius);
    padding: 1rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid var(--mac-border-color);

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 100px;
      color: var(--mac-text-secondary);
      font-size: 0.875rem;
    }

    .value {
      flex: 1;
      font-weight: 500;
      color: var(--mac-text);
    }
  }
}

.checklist {
  background: var(--mac-background);
  border: 1px solid var(--mac-border-color);
  border-radius: var(--mac-radius);
  padding: 1rem;

  .checklist-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: var(--mac-radius);
    background-color: var(--mac-surface);
    border: 1px solid var(--mac-border-color);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .item-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-number {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--mac-primary);
    color: var(--mac-text-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .item-content {
    flex-grow: 1;

    .content {
      font-size: 0.875rem;
      color: var(--mac-text);
      line-height: 1.5;
    }

    .required-mark {
      color: var(--mac-error);
      margin-left: 0.25rem;
    }
  }

  .check-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--mac-border-color);
  }

  .check-buttons {
    display: flex;
    gap: 0.5rem;
    position: relative;

    &::after {
      content: '필수 선택';
      position: absolute;
      bottom: -1.25rem;
      right: 0;
      font-size: 0.75rem;
      color: var(--mac-error);
      opacity: 0.8;
    }
  }
}

.check-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  select {
    min-width: 150px;
  }

  .mac-button {
    height: 38px;
    padding: 0 1rem;
    white-space: nowrap;
  }
}

thead {
  tr {
    th {
      &:nth-child(1) { width: 80px; }
      &:nth-child(2) { width: 15%; }
      &:nth-child(3) { width: 20%; }
      &:nth-child(4) { width: 20%; }
      &:nth-child(5) { width: 100px; }
      &:nth-child(6) { width: 80px; }
      &:nth-child(7) { width: 200px; }
    }
  }
}

.modal-footer {
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid var(--mac-border-color);
  background: var(--mac-background);
}

.checklist-item.required {
  background: var(--mac-error-surface);
}

.checklist-section {
  margin-top: 1.5rem;
}

.mac-input {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--mac-border-color);
  border-radius: var(--mac-radius-sm);
  background: var(--mac-background);
  color: var(--mac-text);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--mac-primary);
  }

  &::placeholder {
    color: var(--mac-text-secondary);
  }
}

.photo-upload {
  display: flex;
  align-items: center;
  gap: 1rem;

  .hidden {
    display: none;
  }

  .upload-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--mac-border-color);
    border-radius: var(--mac-radius-sm);
    background: var(--mac-background);
    color: var(--mac-text);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--mac-primary);
      color: var(--mac-primary);
    }
  }

  .photo-preview {
    width: 36px;
    height: 36px;
    border-radius: var(--mac-radius-sm);
    overflow: hidden;
    border: 1px solid var(--mac-border-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: 0.125rem;
      right: 0.125rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--mac-overlay-dark);
      color: var(--mac-text-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.75rem;

      &:hover {
        background: var(--mac-error);
      }
    }
  }
}

.table-actions, .card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  button {
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #e5e7eb;
      color: #9ca3af;
      border-color: #d1d5db;
      
      &:hover {
        background-color: #e5e7eb;
        color: #9ca3af;
        border-color: #d1d5db;
      }
    }
  }
}

.mac-button {
  &.primary {
    &:disabled {
      background-color: var(--mac-disabled-background);
      color: var(--mac-disabled-text);
      border-color: var(--mac-disabled-border);
      cursor: not-allowed;
      opacity: 0.7;
      
      &:hover {
        background-color: var(--mac-disabled-background);
        color: var(--mac-disabled-text);
        border-color: var(--mac-disabled-border);
      }
    }
  }
}

.quick-inspection-form {
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    .label {
      width: 100px;
      flex-shrink: 0;
    }

    .cycle-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-grow: 1;

      .cycle-number {
        width: 80px;
        flex-shrink: 0;
      }

      select.cycle-unit {
        width: 100px;
        flex-shrink: 0;
        height: 38px;
        padding: 0 32px 0 12px;
        border: 1px solid var(--mac-border-color);
        border-radius: var(--mac-radius);
        background-color: #2d2d2d;
        color: #e0e0e0;
        cursor: pointer;
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        overflow: hidden;
        box-sizing: border-box;
        
        option {
          background-color: #2d2d2d;
          color: #e0e0e0;
          padding: 8px 12px;

          &:hover {
            background-color: #363636;
          }
        }
        
        &:focus {
          outline: none;
          border-color: var(--mac-primary);
        }

        &:hover {
          border-color: var(--mac-primary);
        }
      }
    }
  }
}

.quick-photo-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .upload-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-secondary);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-secondary-hover);
    }
  }

  .photo-preview {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 0.5rem;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background-color: var(--color-danger);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-danger-hover);
      }
    }
  }
}

.inspection-item {
  background: var(--mac-surface);
  border: 1px solid var(--mac-border-color);
  border-radius: var(--mac-radius);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  .item-info {
    display: flex;
    gap: 1rem;
    align-items: center;
    
    .name {
      min-width: 120px;
      font-weight: 500;
    }
    
    .cycle {
      color: var(--mac-text-secondary);
      min-width: 80px;
    }
    
    .weekdays {
      color: var(--mac-text-secondary);
    }
  }

  .delete-button {
    color: var(--mac-error);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      color: var(--mac-error-hover);
    }
  }
}

.weekday-buttons {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;

  .weekday-button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--mac-border-color);
    border-radius: var(--mac-radius-sm);
    background: var(--mac-background);
    color: var(--mac-text);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--mac-primary);
    }

    &.active {
      background: var(--mac-primary);
      border-color: var(--mac-primary);
      color: var(--mac-text-on-primary);
    }
  }
}
</style> 
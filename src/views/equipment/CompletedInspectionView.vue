<template>
  <div class="completed-inspection-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>완료된 점검 목록</h1>
            <span class="item-count">총 {{ completedInspections.length }}개</span>
          </div>
          <div class="description-section">
            <p class="description">완료된 점검 내역을 조회하고 상세 정보를 확인할 수 있습니다.</p>
          </div>
        </div>
        <div class="header-right">
          <!-- 필터 섹션 -->
          <div class="filter-section">
            <select 
              class="mac-input" 
              v-model="selectedYear"
            >
              <option value="">전체 년도</option>
              <option 
                v-for="year in years" 
                :key="year" 
                :value="year"
              >
                {{ year }}년
              </option>
            </select>
            <select 
              class="mac-input" 
              v-model="selectedFactory"
            >
              <option value="">전체 공장</option>
              <option 
                v-for="factory in factories" 
                :key="factory" 
                :value="factory"
              >
                {{ factory }}
              </option>
            </select>
            <select 
              class="mac-input" 
              v-model="selectedDepartment"
            >
              <option value="">전체 부서</option>
              <option 
                v-for="dept in departments" 
                :key="dept" 
                :value="dept"
              >
                {{ dept }}
              </option>
            </select>
            <select 
              class="mac-input" 
              v-model="selectedLine"
            >
              <option value="">전체 라인</option>
              <option 
                v-for="line in lines" 
                :key="line" 
                :value="line"
              >
                {{ line }}
              </option>
            </select>
            <button class="mac-button secondary" @click="goToInspectionList">
              <font-awesome-icon icon="fas fa-list" />
              점검 목록
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 통계 카드 섹션 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stats-card glass-card">
          <div class="stats-icon">
            <font-awesome-icon icon="fas fa-calendar-check" />
          </div>
          <div class="stats-content">
            <h3>이번 달 완료</h3>
            <p class="stats-number">{{ monthlyStats.count }}건</p>
            <p class="stats-trend" :class="monthlyStats.trend >= 0 ? 'positive' : 'negative'">
              <font-awesome-icon :icon="monthlyStats.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" />
              {{ Math.abs(monthlyStats.trend) }}% 전월 대비
            </p>
          </div>
        </div>

        <div class="stats-card glass-card">
          <div class="stats-icon">
            <font-awesome-icon icon="fas fa-chart-line" />
          </div>
          <div class="stats-content">
            <h3>평균 완료율</h3>
            <p class="stats-number">{{ completionRate }}%</p>
            <p class="stats-description">전체 점검항목 대비</p>
          </div>
        </div>

        <div class="stats-card glass-card">
          <div class="stats-icon">
            <font-awesome-icon icon="fas fa-exclamation-triangle" />
          </div>
          <div class="stats-content">
            <h3>부적합 항목</h3>
            <p class="stats-number">{{ failureStats.count }}건</p>
            <p class="stats-description">전체 {{ failureStats.total }}건 중</p>
          </div>
        </div>

        <div class="stats-card glass-card">
          <div class="stats-icon">
            <font-awesome-icon icon="fas fa-clock" />
          </div>
          <div class="stats-content">
            <h3>평균 처리시간</h3>
            <p class="stats-number">{{ avgProcessingTime.days }}일</p>
            <p class="stats-description">{{ avgProcessingTime.cycle }} 주기 기준</p>
            <div class="stats-details">
              <span v-for="stat in avgProcessingTime.details" :key="stat.cycle" class="cycle-stat">
                {{ stat.cycle }}: {{ stat.avgDays }}일
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 테이블 뷰 -->
    <div class="content glass-card">
      <div v-if="!filteredInspections.length" class="empty-message">
        완료된 점검 내역이 없습니다.
      </div>
      <div v-else>
        <table class="mac-table">
          <thead>
            <tr>
              <th style="width: 10%;">라인명</th>
              <th style="width: 20%;">점검항목</th>
              <th style="width: 20%;">점검기준</th>
              <th style="width: 8%;">주기</th>
              <th style="width: 12%;">예정일</th>
              <th style="width: 12%;">완료일</th>
              <th style="width: 8%;">점검자</th>
              <th style="width: 10%; text-align: center;">사진/결과</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredInspections" :key="item.id || index">
              <td data-label="라인명" class="line-name">{{ item.line_name || '-' }}</td>
              <td data-label="점검항목" class="inspection-name">{{ item.inspection_name || '-' }}</td>
              <td data-label="점검기준" class="inspection-standard">{{ item.inspection_standard || '-' }}</td>
              <td data-label="주기" class="cycle">{{ item.inspection_cycle || '-' }}</td>
              <td data-label="예정일" class="date">{{ formatDate(item.scheduled_date) || '-' }}</td>
              <td data-label="완료일" class="date">{{ formatDate(item.completion_date) || '-' }}</td>
              <td data-label="점검자" class="inspector">{{ item.inspector || '-' }}</td>
              <td data-label="사진/결과" class="actions" style="text-align: center;">
                <div class="table-actions">
                  <button 
                    class="mac-button icon-button" 
                    @click="viewChecklist(item)" 
                    title="체크리스트 결과"
                  >
                    <font-awesome-icon icon="fas fa-clipboard-check" />
                  </button>
                  <button 
                    v-if="item.photos"
                    class="mac-button icon-button" 
                    @click="viewPhotos(item)"
                    title="점검 사진"
                  >
                    <font-awesome-icon icon="fas fa-camera" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 상세 보기 모달 -->
    <div v-if="showDetailModal && selectedInspection" class="modal-overlay">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>점검 상세 정보</h2>
          <button class="close-button" @click="showDetailModal = false">
            <font-awesome-icon icon="fas fa-times" />
          </button>
        </div>
        <div class="modal-body">
          <div class="inspection-detail">
            <div class="detail-section">
              <h3>기본 정보</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>공장:</label>
                  <span>{{ selectedInspection.factory_name }}</span>
                </div>
                <div class="detail-item">
                  <label>부서:</label>
                  <span>{{ selectedInspection.department_name }}</span>
                </div>
                <div class="detail-item">
                  <label>라인:</label>
                  <span>{{ selectedInspection.line_name }}</span>
                </div>
                <div class="detail-item">
                  <label>하위라인:</label>
                  <span>{{ selectedInspection.sub_line_name }}</span>
                </div>
                <div class="detail-item">
                  <label>점검항목:</label>
                  <span>{{ selectedInspection.inspection_name }}</span>
                </div>
                <div class="detail-item">
                  <label>점검기준:</label>
                  <span>{{ selectedInspection.inspection_standard }}</span>
                </div>
                <div class="detail-item">
                  <label>주기:</label>
                  <span>{{ selectedInspection.inspection_cycle }}일</span>
                </div>
                <div class="detail-item">
                  <label>완료일:</label>
                  <span>{{ formatDate(selectedInspection.completion_date) }}</span>
                </div>
                <div class="detail-item">
                  <label>점검자:</label>
                  <span>{{ selectedInspection.inspector }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>체크리스트 결과</h3>
              <div class="checklist-results">
                <div v-for="(result, index) in selectedInspection.checklist_results" 
                     :key="index" 
                     class="checklist-item">
                  <span class="content">{{ result.content }}</span>
                  <span class="result" :class="result.result ? 'pass' : 'fail'">
                    {{ result.result ? '적합' : '부적합' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedInspection.photos">
              <h3>점검 사진</h3>
              <div class="photos-grid">
                <img :src="'data:image/jpeg;base64,' + selectedInspection.photos" 
                     alt="점검 사진" 
                     @click="showFullImage = true">
              </div>
            </div>

            <div class="detail-section" v-if="selectedInspection.notes">
              <h3>비고</h3>
              <p class="notes">{{ selectedInspection.notes }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="mac-button secondary" @click="showDetailModal = false">닫기</button>
        </div>
      </div>
    </div>

    <!-- 전체화면 이미지 모달 -->
    <div v-if="showFullImage" class="modal-overlay" @click="showFullImage = false">
      <div class="full-image">
        <img :src="'data:image/jpeg;base64,' + selectedInspection?.photos" alt="점검 사진">
      </div>
    </div>

    <!-- 체크리스트 결과 모달 -->
    <Modal v-if="showChecklistModal && selectedChecklistItem" @close="showChecklistModal = false">
      <template #header>
        <h3>점검 상세 정보</h3>
      </template>
      <template #body>
        <div class="inspection-detail">
          <div class="detail-section">
            <h3>기본 정보</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>공장:</label>
                <span>{{ selectedChecklistItem.factory_name }}</span>
              </div>
              <div class="detail-item">
                <label>부서:</label>
                <span>{{ selectedChecklistItem.department_name }}</span>
              </div>
              <div class="detail-item">
                <label>라인:</label>
                <span>{{ selectedChecklistItem.line_name }}</span>
              </div>
              <div class="detail-item">
                <label>하위라인:</label>
                <span>{{ selectedChecklistItem.sub_line_name }}</span>
              </div>
              <div class="detail-item">
                <label>점검항목:</label>
                <span>{{ selectedChecklistItem.inspection_name }}</span>
              </div>
              <div class="detail-item">
                <label>점검기준:</label>
                <span>{{ selectedChecklistItem.inspection_standard }}</span>
              </div>
              <div class="detail-item">
                <label>주기:</label>
                <span>{{ selectedChecklistItem.inspection_cycle }}일</span>
              </div>
              <div class="detail-item">
                <label>완료일:</label>
                <span>{{ formatDate(selectedChecklistItem.completion_date) }}</span>
              </div>
              <div class="detail-item">
                <label>점검자:</label>
                <span>{{ selectedChecklistItem.inspector }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>체크리스트 결과</h3>
            <div class="checklist-results">
              <div v-for="(result, index) in selectedChecklistItem.checklist_results" 
                   :key="index" 
                   class="checklist-item">
                <span class="content">{{ result.content }}</span>
                <span class="result" :class="result.result ? 'pass' : 'fail'">
                  {{ result.result ? '적합' : '부적합' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedChecklistItem.notes">
            <h3>특이사항</h3>
            <p class="notes">{{ selectedChecklistItem.notes }}</p>
          </div>
        </div>
      </template>
    </Modal>

    <!-- 사진 모달 -->
    <Modal v-if="showPhotoModal" @close="showPhotoModal = false">
      <template #header>
        <h3>점검 사진</h3>
      </template>
      <template #body>
        <div class="photo-container" v-if="selectedPhotoItem && selectedPhotoItem.photos">
          <div v-for="(photo, index) in getPhotoArray(selectedPhotoItem.photos)" :key="index" class="photo-item">
            <img 
              :src="photo.startsWith('data:image') ? photo : `data:image/jpeg;base64,${photo}`" 
              @error="handleImageError"
              alt="점검 사진"
              @click="openFullImage(photo)"
            />
          </div>
        </div>
        <div v-else class="no-photos">
          등록된 사진이 없습니다.
        </div>
      </template>
    </Modal>

    <!-- 전체화면 이미지 모달 -->
    <Modal v-if="showFullImageModal" @close="showFullImageModal = false" class="full-image-modal">
      <template #body>
        <img 
          :src="fullImageSrc" 
          alt="전체화면 사진" 
          class="full-image"
          @click="showFullImageModal = false"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCompletedInspectionStore } from '@/stores/completedInspection'
import { useAuthStore } from '@/stores/auth'
import type { CompletedInspection } from '@/types/equipment'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Modal from '@/components/Modal.vue'
import { 
  faList,
  faCalendarCheck,
  faChartLine,
  faExclamationTriangle,
  faClock,
  faClipboardCheck,
  faCamera,
  faTimes,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons'

// Font Awesome 아이콘 등록
library.add(
  faList,
  faCalendarCheck,
  faChartLine,
  faExclamationTriangle,
  faClock,
  faClipboardCheck,
  faCamera,
  faTimes,
  faArrowUp,
  faArrowDown
)

const router = useRouter()
const completedInspectionStore = useCompletedInspectionStore()
const authStore = useAuthStore()

// 상태 관리
const selectedYear = ref('')
const selectedFactory = ref('')
const selectedDepartment = ref('')
const selectedLine = ref('')
const selectedInspection = ref<CompletedInspection | null>(null)
const showDetailModal = ref(false)
const showFullImage = ref(false)
const showChecklistModal = ref(false)
const selectedChecklistItem = ref<CompletedInspection | null>(null)
const showPhotoModal = ref(false)
const showFullImageModal = ref(false)
const selectedPhotoItem = ref<any>(null)
const fullImageSrc = ref('')

// 사용자 정보에서 공장과 부서 가져오기
const getUserDefaults = () => {
  const userFactory = authStore.user?.factory?.trim() || ''
  const userDepartment = authStore.user?.department?.replace(/\s+/g, '') || ''
  
  console.log('사용자 정보:', {
    전체: authStore.user,
    공장: userFactory,
    부서: userDepartment,
    공장_원본: authStore.user?.factory,
    부서_원본: authStore.user?.department
  })
  
  return { userFactory, userDepartment }
}

// 완료된 점검 목록 조회
onMounted(async () => {
  console.log('컴포넌트 마운트됨')
  try {
    await completedInspectionStore.fetchCompletedInspections()
    
    // 현재 년도를 기본값으로 설정
    const currentYear = new Date().getFullYear().toString()
    selectedYear.value = currentYear
    
    // 사용자의 공장과 부서를 기본값으로 설정
    const { userFactory, userDepartment } = getUserDefaults()
    
    console.log('초기 설정:', {
      현재년도: currentYear,
      선택된년도: selectedYear.value
    })
    
    // 공장 목록에서 사용자의 공장과 일치하는 항목 찾기 (띄어쓰기 무시)
    const matchingFactory = (factories.value as string[]).find((factory: string) => {
      const match = factory.trim().toLowerCase() === userFactory.toLowerCase()
      console.log('공장 비교:', {
        DB공장: factory,
        사용자공장: userFactory,
        일치여부: match
      })
      return match
    })
    
    if (matchingFactory) {
      selectedFactory.value = matchingFactory
      
      // 공장이 선택된 후 departments computed가 업데이트되길 기다림
      await nextTick()
      
      // 해당 공장의 부서 목록에서 사용자의 부서와 일치하는 항목 찾기
      const matchingDepartment = findMatchingDepartment(userDepartment, departments.value as string[])
      
      if (matchingDepartment) {
        selectedDepartment.value = matchingDepartment
        console.log('부서 선택 완료:', {
          매칭된부서: matchingDepartment,
          사용자부서: userDepartment
        })
      } else {
        console.log('일치하는 부서를 찾을 수 없음:', {
          사용자부서: userDepartment,
          사용자부서_공백제거: userDepartment.replace(/\s+/g, ''),
          가능한부서목록: departments.value,
          가능한부서목록_공백제거: (departments.value as string[]).map(d => d.replace(/\s+/g, ''))
        })
      }
    } else {
      console.log('일치하는 공장을 찾을 수 없음:', {
        사용자공장: userFactory,
        가능한공장목록: factories.value
      })
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
})

// watch를 추가하여 공장 선택이 변경될 때 부서 초기화
watch(selectedFactory, (newFactory) => {
  if (!newFactory) {
    selectedDepartment.value = ''
    selectedLine.value = ''
  } else {
    // 공장이 변경되면 해당 공장의 부서 중에서 사용자의 부서와 일치하는 것을 찾아 설정
    const { userDepartment } = getUserDefaults()
    const matchingDepartment = (departments.value as string[]).find(dept =>
      dept.trim().toLowerCase() === userDepartment.toLowerCase()
    )
    selectedDepartment.value = matchingDepartment || ''
  }
})

// 부서가 변경될 때 라인 초기화
watch(selectedDepartment, () => {
  selectedLine.value = ''
})

// 필터링된 점검 목록
const completedInspections = computed(() => {
  const inspections = completedInspectionStore.completedInspections || []
  console.log('completedInspections computed 실행:', {
    스토어데이터: completedInspectionStore.completedInspections,
    데이터타입: typeof completedInspectionStore.completedInspections,
    데이터길이: inspections.length,
    첫번째항목: inspections[0]
  })
  return inspections
})

// 필터 옵션 계산
const factories = computed(() => 
  [...new Set(completedInspections.value
    .filter(i => i.factory_name)
    .map(i => i.factory_name))]
    .sort() // 알파벳 순 정렬
)

// 부서 매칭 로직 수정
const findMatchingDepartment = (userDepartment: string, departments: string[]) => {
  // 1. 정확한 매칭
  let match = departments.find(dept => 
    dept.trim().toLowerCase() === userDepartment.toLowerCase()
  )
  
  if (match) return match

  // 2. 공백을 제거한 매칭
  match = departments.find(dept => 
    dept.replace(/\s+/g, '').toLowerCase() === userDepartment.replace(/\s+/g, '').toLowerCase()
  )
  
  if (match) return match

  // 3. 부분 매칭 (숫자만 비교)
  const userDeptNumber = userDepartment.match(/\d+/)?.[0]
  if (userDeptNumber) {
    match = departments.find(dept => {
      const deptNumber = dept.match(/\d+/)?.[0]
      return deptNumber === userDeptNumber
    })
  }

  return match
}

const departments = computed(() => {
  // 선택된 공장이 있는 경우만 해당 공장의 부서 목록 반환
  if (!selectedFactory.value) return []
  
  const depts = [...new Set(completedInspections.value
    .filter(i => {
      const factoryMatch = i.factory_name?.trim().toLowerCase() === selectedFactory.value.trim().toLowerCase()
      console.log('부서 필터링:', {
        DB공장: i.factory_name,
        선택된공장: selectedFactory.value,
        일치여부: factoryMatch,
        해당부서: i.department_name
      })
      return factoryMatch
    })
    .map(i => i.department_name)
    .filter(Boolean))] // null/undefined 제거
    .sort() // 알파벳 순 정렬

  console.log('부서 목록 계산:', {
    선택된공장: selectedFactory.value,
    필터링된부서목록: depts
  })

  return depts
})

const lines = computed(() => {
  if (!selectedFactory.value || !selectedDepartment.value) return []
  
  return [...new Set(completedInspections.value
    .filter(i => 
      i.factory_name?.trim().toLowerCase() === selectedFactory.value.trim().toLowerCase() &&
      i.department_name?.trim().toLowerCase() === selectedDepartment.value.trim().toLowerCase()
    )
    .map(i => i.line_name)
    .filter(Boolean))]
})

// 년도 옵션 계산 추가
const years = computed(() => {
  const uniqueYears = [...new Set(completedInspections.value
    .filter(i => i.completion_date) // 완료일이 있는 항목만 필터링
    .map(i => {
      const completionDate = new Date(i.completion_date)
      return completionDate.getFullYear()
    }))] as number[]
  return uniqueYears.sort((a, b) => b - a) // 내림차순 정렬
})

// 필터링된 결과 수정
const filteredInspections = computed(() => {
  const result = completedInspections.value
  
  if (!Array.isArray(result)) {
    console.log('데이터가 배열이 아님')
    return []
  }

  return result.filter(item => {
    if (!item || !item.completion_date) return false
    
    const completionDate = new Date(item.completion_date)
    const itemYear = completionDate.getFullYear()
    const selectedYearNum = selectedYear.value ? parseInt(selectedYear.value) : null
    
    const matches = {
      year: !selectedYearNum || itemYear === selectedYearNum,
      factory: !selectedFactory.value || 
               item.factory_name?.trim().toLowerCase() === selectedFactory.value.trim().toLowerCase(),
      department: !selectedDepartment.value || 
                 item.department_name?.trim().toLowerCase() === selectedDepartment.value.trim().toLowerCase(),
      line: !selectedLine.value || 
            item.line_name?.trim().toLowerCase() === selectedLine.value.trim().toLowerCase()
    }

    return matches.year && matches.factory && matches.department && matches.line
  })
})

// 상세 보기
const viewDetails = (inspection: CompletedInspection) => {
  selectedInspection.value = inspection
  showDetailModal.value = true
}

// 체크리스트 결과 모달 표시
const viewChecklist = (inspection: CompletedInspection) => {
  selectedChecklistItem.value = inspection
  showChecklistModal.value = true
}

// 날짜 포맷
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 통계 계산
const monthlyStats = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const inspections = filteredInspections.value as CompletedInspection[]
  
  // 이번 달 완료 건수
  const thisMonthCount = inspections.filter(inspection => {
    const completionDate = new Date(inspection.completion_date)
    return completionDate.getMonth() === thisMonth && 
           completionDate.getFullYear() === thisYear
  }).length

  // 지난 달 완료 건수
  const lastMonthCount = inspections.filter(inspection => {
    const completionDate = new Date(inspection.completion_date)
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
    return completionDate.getMonth() === lastMonth && 
           completionDate.getFullYear() === lastMonthYear
  }).length

  // 평균 처리 일수 계산
  const totalDays = (inspections as CompletedInspection[]).reduce((sum, inspection) => {
    const completionDate = new Date(inspection.completion_date)
    const scheduledDate = new Date(inspection.scheduled_date)
    const days = Math.floor((completionDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  const avgDays = Math.round(totalDays / inspections.length)

  // 증감률 계산
  const trend = lastMonthCount === 0 ? 0 : 
    Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)

  return {
    count: inspections.length,
    trend,
    avgDays
  }
})

// 평균 완료율 계산
const completionRate = computed(() => {
  if (filteredInspections.value.length === 0) return 0

  // 전체 점검항목 수
  const totalInspections = filteredInspections.value.length

  // 모든 체크리스트가 적합인 점검항목 수
  const passedInspections = filteredInspections.value.filter(inspection => 
    inspection.checklist_results.every(result => result.result)
  ).length

  return Math.round((passedInspections / totalInspections) * 100)
})

// 부적합 통계 계산
const failureStats = computed(() => {
  const total = filteredInspections.value.reduce((sum, inspection) => 
    sum + inspection.checklist_results.length, 0)
  
  const failures = filteredInspections.value.reduce((sum, inspection) => 
    sum + inspection.checklist_results.filter(result => !result.result).length, 0)

  return {
    count: failures,
    total
  }
})

// 평균 처리시간 계산
const avgProcessingTime = computed(() => {
  if (filteredInspections.value.length === 0) return 0

  // 주기별로 그룹화
  const cycleGroups = filteredInspections.value.reduce((groups, inspection) => {
    const cycle = inspection.inspection_cycle
    if (!groups[cycle]) {
      groups[cycle] = []
    }
    groups[cycle].push(inspection)
    return groups
  }, {} as Record<string, CompletedInspection[]>)

  // 주기별 평균 처리시간 계산
  const cycleStats = Object.entries(cycleGroups).map(([cycle, inspections]) => {
    const inspectionsArray = inspections as CompletedInspection[];
    const totalDays = inspectionsArray.reduce((sum: number, inspection: CompletedInspection) => {
      const scheduled = new Date(inspection.scheduled_date)
      const completed = new Date(inspection.completion_date)
      const diffTime = completed.getTime() - scheduled.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return sum + diffDays
    }, 0)

    const avgDays = Math.round(totalDays / inspectionsArray.length)
    return {
      cycle,
      avgDays,
      count: inspectionsArray.length
    }
  })

  // 가장 많은 건수의 주기 통계 반환
  const mainCycleStat = cycleStats.reduce((prev, curr) => 
    curr.count > prev.count ? curr : prev
  )

  return {
    days: mainCycleStat.avgDays,
    cycle: mainCycleStat.cycle,
    details: cycleStats
  }
})

// 점검 목록 페이지로 이동
const goToInspectionList = () => {
  router.push({ name: 'equipment-inspection' })
}

// 사진 보기 메소드
const viewPhotos = (item: any) => {
  if (!item.photos) {
    alert('등록된 사진이 없습니다.')
    return
  }

  try {
    console.log('원본 사진 데이터:', item.photos)
    
    // 쉼표로 구분된 여러 사진 처리
    const photoArray = item.photos.split(',').map(photo => {
      let photoData = photo.trim()
      
      // 콜론 제거
      photoData = photoData.replace(/;base64:/g, ';base64,')
      
      // 이미 올바른 형식인 경우
      if (photoData.startsWith('data:image/') && photoData.includes(';base64,')) {
        return photoData
      }
      
      // Base64 문자열만 있는 경우
      if (/^[A-Za-z0-9+/]+=*$/.test(photoData)) {
        return `data:image/jpeg;base64,${photoData}`
      }
      
      return null
    }).filter(Boolean)

    if (photoArray.length === 0) {
      throw new Error('유효한 이미지가 없습니다.')
    }

    selectedPhotoItem.value = {
      ...item,
      photos: photoArray.join(',')
    }
    showPhotoModal.value = true
    
  } catch (error) {
    console.error('이미지 데이터 처리 실패:', error)
    alert('이미지를 불러올 수 없습니다.')
  }
}

// 사진 배열 변환 함수
const getPhotoArray = (photos: string) => {
  if (!photos) return []
  
  try {
    return photos.split(',')
      .map(photo => {
        let photoData = photo.trim()
        
        // 콜론 제거
        photoData = photoData.replace(/;base64:/g, ';base64,')
        
        // 이미 올바른 형식인 경우
        if (photoData.startsWith('data:image/') && photoData.includes(';base64,')) {
          return photoData
        }
        
        // Base64 문자열만 있는 경우
        if (/^[A-Za-z0-9+/]+=*$/.test(photoData)) {
          return `data:image/jpeg;base64,${photoData}`
        }
        
        return null
      })
      .filter(Boolean) as string[]
  } catch (error) {
    console.error('사진 배열 변환 실패:', error)
    return []
  }
}

// 이미지 에러 처리
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('이미지 로드 실패:', img.src)
  
  // 기본 이미지로 대체 (1x1 투명 PNG)
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
}

// 전체화면으로 이미지 열기
const openFullImage = (photo: string) => {
  try {
    let photoData = photo.trim()
    
    // 콜론 제거
    photoData = photoData.replace(/;base64:/g, ';base64,')
    
    // 이미 올바른 형식인 경우
    if (photoData.startsWith('data:image/') && photoData.includes(';base64,')) {
      fullImageSrc.value = photoData
    } else if (/^[A-Za-z0-9+/]+=*$/.test(photoData)) {
      // Base64 문자열만 있는 경우
      fullImageSrc.value = `data:image/jpeg;base64,${photoData}`
    } else {
      throw new Error('잘못된 이미지 형식')
    }
    
    showFullImageModal.value = true
  } catch (error) {
    console.error('전체화면 이미지 처리 실패:', error)
    alert('이미지를 표시할 수 없습니다.')
  }
}
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
}

:root[data-theme="dark"] {
  // 다크 모드
  --icon-button-bg: #363636;
  --icon-button-border: #4a4a4a;
  --icon-button-color: #c0c4cc;
  --icon-button-hover-bg: #404854;
  --icon-button-hover-border: #4c5664;
  --icon-button-hover-color: #79bbff;
}

.completed-inspection-view {
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.header {
  padding: 1.5rem;
  margin-bottom: 1rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-left {
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
        color: var(--text-secondary);
      }
    }

    .description-section {
      .description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }

  .header-right {
    .filter-section {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      .mac-input {
        min-width: 150px;
      }
    }
  }
}

.content {
  padding: 1.5rem;
  margin-top: 1rem;
}

.mac-table {
  width: 100%;
  border-collapse: collapse;
}

.mac-table th {
  background-color: #f5f7fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e2e8f0;
}

.mac-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

.mac-table .inspection-name,
.mac-table .inspection-standard {
  font-weight: 500;
  line-height: 1.4;
}

.mac-table .date {
  white-space: nowrap;
}

.mac-table tr:hover {
  background-color: #f8fafc;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.icon-button {
  padding: 6px;
  border-radius: 4px;
  background-color: transparent;
  color: #4a5568;
  transition: all 0.2s;
}

.icon-button:hover {
  background-color: #e2e8f0;
  color: #2d3748;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--mac-text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  background: var(--mac-background);
  border-radius: var(--mac-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--mac-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--mac-text);
  }

  .close-button {
    background: none;
    border: none;
    color: var(--mac-text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.25rem;

    &:hover {
      color: var(--mac-text);
    }
  }
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--mac-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.inspection-detail {
  .detail-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    h3 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: var(--mac-text);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .icon {
        color: var(--mac-primary);
      }
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    background: var(--mac-background-secondary);
    padding: 1rem;
    border-radius: var(--mac-radius);

    .detail-item {
      display: flex;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: var(--mac-text-secondary);
        min-width: 80px;
      }

      span {
        color: var(--mac-text);
      }
    }
  }

  .checklist-results {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .checklist-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--mac-background-secondary);
      border-radius: var(--mac-radius);

      .content {
        flex: 1;
        color: var(--mac-text);
      }

      .result {
        padding: 0.5rem 1rem;
        border-radius: var(--mac-radius);
        font-size: 0.875rem;
        font-weight: 500;

        &.pass {
          background: var(--mac-success-light);
          color: var(--mac-success);
        }

        &.fail {
          background: var(--mac-error-light);
          color: var(--mac-error);
        }
      }
    }
  }
}

.full-image {
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
  }
}

.stats-section {
  margin: 1rem 0;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .stats-card {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;

    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(var(--primary-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(var(--primary-rgb));
      font-size: 1.5rem;
    }

    .stats-content {
      flex: 1;

      h3 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0 0 0.5rem 0;
      }

      .stats-number {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .stats-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0.25rem 0 0 0;
      }

      .stats-trend {
        font-size: 0.875rem;
        margin: 0.25rem 0 0 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        &.positive {
          color: var(--success);
        }

        &.negative {
          color: var(--error);
        }
      }
    }
  }
}

.photo-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  
  .photo-item {
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.no-photos {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.full-image-modal {
  :deep(.modal-content) {
    max-width: 90vw;
    max-height: 90vh;
    background: rgba(0, 0, 0, 0.9);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    padding: 0;
    width: auto;
    height: auto;
    
    .modal-body {
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      width: fit-content;
      margin: auto;
    }
  }
}

.full-image {
  max-width: min(90vw, 1200px);
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  cursor: zoom-out;
  transition: transform 0.3s ease;
  margin: auto;
  display: block;
  
  &:hover {
    transform: scale(1.02);
  }
}

.close-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 1000;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  .modal-content {
    border-radius: 8px;
    overflow: hidden;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.stats-details {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .cycle-stat {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--mac-background-secondary);
    border-radius: var(--mac-radius-sm);
    color: var(--mac-text-secondary);
  }
}

// 모바일 대응 스타일
@media screen and (max-width: 768px) {
  .header {
    .header-content {
      flex-direction: column;
      gap: 1rem;
    }

    .header-right {
      width: 100%;
      
      .filter-section {
        flex-direction: column;
        width: 100%;

        .mac-input {
          width: 100%;
          min-width: 100%;
        }

        .mac-button {
          width: 100%;
        }
      }
    }
  }

  .stats-section {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stats-card {
      padding: 1rem;
    }
  }

  // 테이블 반응형 처리
  .mac-table {
    display: block;
    
    thead {
      display: none; // 모바일에서는 헤더 숨김
    }

    tbody {
      display: block;
      
      tr {
        display: block;
        padding: 1rem;
        margin-bottom: 1rem;
        background: var(--mac-background-secondary);
        border-radius: var(--mac-radius);
        
        td {
          display: flex;
          padding: 0.5rem 0;
          border: none;
          
          &:before {
            content: attr(data-label);
            font-weight: 500;
            width: 120px;
            min-width: 120px;
            color: var(--mac-text-secondary);
          }
        }

        .table-actions {
          justify-content: flex-start;
          margin-top: 0.5rem;
        }
      }
    }
  }

  // 모달 반응형 처리
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .inspection-detail {
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style> 
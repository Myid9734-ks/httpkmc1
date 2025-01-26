<template>
  <div class="inventory-view">
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>라인 등록</h1>
            <span class="item-count">총 {{ totalLines }}개</span>
          </div>
          <div class="description-section">
            <p class="description">생산 라인을 추가, 편집, 삭제를 실시간으로 모니터링하여 효율적인 라인 관리가 가능합니다.</p>
            <div class="status-info">
              <span class="status-item">
                <span class="dot success"></span>
                사용
              </span>
              <span class="status-item">
                <span class="dot danger"></span>
                미사용
              </span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="filter-box">
            <select class="mac-input" v-model="factoryFilter">
              <option value="">전체 공장</option>
              <option v-for="factory in factories" :key="factory.id" :value="factory.id">
                {{ factory.name }}
              </option>
            </select>
            <select class="mac-input" v-model="departmentFilter">
              <option value="">전체 부서</option>
              <option v-for="dept in filteredDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <button class="mac-button primary" @click="openDialog">
            <PlusIcon class="button-icon" />
            <span class="button-text">공장 추가</span>
          </button>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div class="stats-card glass-card">
          <div class="stats-content">
            <div class="stats-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V10M5 7H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="stats-text">
              <span class="stats-value">{{ totalLines }}개</span>
              <span class="stats-label">전체 라인</span>
            </div>
          </div>
        </div>

        <div class="stats-card glass-card">
          <div class="stats-content">
            <div class="stats-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L7 11L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stats-text">
              <span class="stats-value">{{ activeLines }}개</span>
              <span class="stats-label">사용중</span>
            </div>
          </div>
        </div>

        <div class="stats-card glass-card">
          <div class="stats-content">
            <div class="stats-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L12 4M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="stats-text">
              <span class="stats-value">{{ inactiveLines }}개</span>
              <span class="stats-label">미사용</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="line-tree glass-card">
      <div v-if="linesStore.loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>로딩중...</span>
      </div>
      <div v-else-if="linesStore.error" class="error-message">
        {{ linesStore.error }}
      </div>
      <div v-else>
        <div v-if="isAddingLine" class="add-line-form glass-card">
          <div class="edit-fields">
            <div class="edit-field">
              <input 
                ref="newLineInput"
                type="text" 
                v-model="newLineData.name"
                class="mac-input" 
                placeholder="새 공장명을 입력하세요"
                @keyup.enter="saveNewLine"
                @keyup.esc="cancelAddLine"
                @blur="handleBlur"
                required
              >
            </div>
            <div class="edit-field">
              <select v-model="newLineData.status" class="mac-input">
                <option value="active">사용</option>
                <option value="inactive">미사용</option>
              </select>
            </div>
            <div class="edit-actions">
              <button class="mac-button primary" @click="saveNewLine">
                추가
              </button>
              <button class="mac-button" @click="cancelAddLine">
                취소
              </button>
            </div>
          </div>
        </div>
        <div class="tree-container">
          <TreeItem
            v-for="line in lines"
            :key="line.id"
            :line="line"
            :level="0"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- 삭제 확인 다이얼로그 -->
    <dialog ref="confirmDialog" class="mac-dialog">
      <div class="dialog-content">
        <h2>라인 삭제</h2>
        <p>정말로 이 라인을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button class="mac-button" @click="() => confirmDialog?.close()">취소</button>
          <button class="mac-button danger" @click="deleteLine">삭제</button>
        </div>
      </div>
    </dialog>

    <!-- 알림 다이얼로그 추가 -->
    <dialog ref="alertDialog" class="mac-dialog">
      <div class="dialog-content">
        <h2>알림</h2>
        <p>{{ alertMessage }}</p>
        <div class="dialog-actions">
          <button class="mac-button primary" @click="handleAlertConfirm">확인</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import { useLinesStore } from '@/stores/lines'
import type { Line } from '@/stores/lines'
import TreeItem from '@/components/TreeItem.vue'
import '@/styles/macBaseStyle.scss'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'

const linesStore = useLinesStore()
const confirmDialog = ref<HTMLDialogElement | null>(null)
const searchQuery = ref('')
const isAddingLine = ref(false)
const newLineInput = ref<HTMLInputElement | null>(null)
const selectedLineId = ref<number | null>(null)

// 새 라인 데이터
const newLineData = reactive({
  name: '',
  status: 'active' as const
})

// 라인 추가 시작
function openDialog() {
  isAddingLine.value = true
  newLineData.name = ''
  newLineData.status = 'active'
  nextTick(() => {
    newLineInput.value?.focus()
  })
}

// 새 라인 저장
async function saveNewLine() {
  try {
    if (!newLineData.name.trim()) {
      showAlert('라인명을 입력해주세요.');
      return;
    }

    await linesStore.addLine({
      parent_id: null,
      level: 1,
      name: newLineData.name.trim(),
      status: newLineData.status
    });
    
    isAddingLine.value = false;
  } catch (error: any) {
    console.error('Error adding new line:', error);
    showAlert(error.response?.data?.error || '라인 추가에 실패했습니다.');
  }
}

// 라인 추가 취소
function cancelAddLine() {
  isAddingLine.value = false
  newLineData.name = ''
  newLineData.status = 'active'
}

// 검색 필터링된 라인 목록
const lines = computed(() => {
  let filteredLines = linesStore.lines

  if (factoryFilter.value) {
    filteredLines = filteredLines.filter(line => {
      return line.id === Number(factoryFilter.value)
    })
  }

  if (departmentFilter.value) {
    filteredLines = filteredLines.map(factory => {
      if (!factory.children) return factory
      return {
        ...factory,
        children: factory.children.filter(dept => dept.id === Number(departmentFilter.value))
      }
    })
  }

  return filteredLines
})

// 사용 가능한 부모 라인 목록
const availableParents = computed(() => {
  const result: Line[] = []
  function collectLines(lines: Line[], level: number) {
    lines.forEach(line => {
      if (level < 4) { // 최대 4단계까지만 부모가 될 수 있음
        result.push(line)
        if (line.children) {
          collectLines(line.children, level + 1)
        }
      }
    })
  }
  collectLines(linesStore.lines, 1)
  return result
})

const formData = ref({
  parent_id: null as number | null,
  level: 1,
  name: '',
  status: 'active' as 'active' | 'inactive' | 'maintenance'
})

// 총 라인 수 계산
const totalLines = computed(() => {
  const countLines = (lines: any[]): number => {
    if (!Array.isArray(lines)) return 0
    return lines.reduce((acc, line) => {
      return acc + 1 + (line.children ? countLines(line.children) : 0)
    }, 0)
  }
  return countLines(linesStore.lines)
})

// 필터링된 부서 목록
const filteredDepartments = computed(() => {
  if (!factoryFilter.value) return []
  const factory = linesStore.lines.find(line => line.id === factoryFilter.value)
  return factory?.children || []
})

// 통계 계산
const activeLines = computed(() => countLinesByStatus(linesStore.lines, 'active'))
const maintenanceLines = computed(() => countLinesByStatus(linesStore.lines, 'maintenance'))
const inactiveLines = computed(() => countLinesByStatus(linesStore.lines, 'inactive'))

// 상태별 라인 수 계산
function countLinesByStatus(lines: Line[], status: Line['status']): number {
  return lines.reduce((count, line) => {
    const currentCount = line.status === status ? 1 : 0
    return count + currentCount + (line.children ? countLinesByStatus(line.children, status) : 0)
  }, 0)
}

// 삭제 처리
async function handleDelete(line: Line) {
  selectedLineId.value = line.id
  confirmDialog.value?.showModal()
}

async function deleteLine() {
  try {
    if (!selectedLineId.value) return;
    
    await linesStore.deleteLine(selectedLineId.value);
    confirmDialog.value?.close();
    showAlert('라인이 삭제되었습니다.');
  } catch (error: any) {
    console.error('Error deleting line:', error);
    showAlert(error.response?.data?.error || '라인 삭제에 실패했습니다.');
  }
}

// 라인 수정 핸들러
async function handleEdit(line: Line) {
  try {
    await linesStore.updateLine(line.id, {
      name: line.name,
      status: line.status
    });
    showAlert('라인이 수정되었습니다.');
  } catch (error: any) {
    console.error('Error updating line:', error);
    showAlert(error.response?.data?.error || '라인 수정에 실패했습니다.');
  }
}

// 초기 데이터 로드
onMounted(async () => {
  console.log('LinesView가 마운트되었습니다.')
  console.log('linesStore 상태:', linesStore.$state)
  try {
    await linesStore.fetchLines()
    console.log('라인 데이터 로드 완료:', linesStore.lines)
  } catch (error) {
    console.error('라인 데이터 로드 실패:', error)
    showAlert('라인 데이터를 불러오는데 실패했습니다.')
  }
})

function handleBlur(event: FocusEvent) {
  // 클릭된 요소가 같은 폼 내부의 다른 요소가 아닐 경우에만 닫기
  const clickedElement = event.relatedTarget as HTMLElement
  const form = (event.target as HTMLElement).closest('.add-line-form')
  if (!clickedElement || !form?.contains(clickedElement)) {
    cancelAddLine()
  }
}

const alertDialog = ref<HTMLDialogElement | null>(null);
const alertMessage = ref('');

// 알림 표시 함수
function showAlert(message: string) {
  alertMessage.value = message;
  alertDialog.value?.showModal();
}

// 알림 확인 버튼 처리
async function handleAlertConfirm() {
  alertDialog.value?.close();
  await linesStore.fetchLines();  // 데이터 재로딩
}

const factoryFilter = ref('')
const departmentFilter = ref('')

// 공장 목록 계산
const factories = computed(() => {
  return linesStore.lines.filter(line => line.level === 1)
})

// 필터 초기화
function resetFilters() {
  factoryFilter.value = ''
  departmentFilter.value = ''
}
</script>

<style lang="scss" scoped>
.inventory-view {
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
    flex-direction: column;
    gap: 1rem;

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
    flex-wrap: wrap;

    h1 {
      font-size: 1.5rem;
      margin: 0;
    }

    .item-count {
      font-size: 0.875rem;
      color: var(--mac-text-secondary);
    }
  }

  .description-section {
    .description {
      margin: 0 0 0.5rem 0;
      color: var(--mac-text-secondary);
    }

    .status-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.success {
        background-color: var(--mac-success);
      }

      &.danger {
        background-color: var(--mac-danger);
      }
    }
  }

  .search-box {
    position: relative;
    width: 100%;
    
    @media (min-width: 769px) {
      width: 240px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--mac-text-secondary);
    }

    .mac-input {
      padding-left: 2.5rem;
      width: 100%;
    }
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

.stats-section {
  margin-bottom: 1rem;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stats-card {
    padding: 1rem;

    .stats-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stats-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--mac-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stats-text {
      display: flex;
      flex-direction: column;
    }

    .stats-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .stats-label {
      font-size: 0.875rem;
      color: var(--mac-text-secondary);
    }
  }
}

.line-tree {
  padding: 1rem;
  
  @media (max-width: 768px) {
    .tree-container {
      margin-left: -0.5rem;
    }
  }
}

// 다이얼로그 모바일 대응
.mac-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .dialog-content {
    padding: 24px;
    min-width: 320px;

    h2 {
      margin: 0 0 16px 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}

// 트리 아이템 모바일 대응
:deep(.tree-item) {
  @media (max-width: 768px) {
    .item-content {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .item-actions {
      width: 100%;
      justify-content: flex-start;
      margin-top: 0.5rem;
    }
  }
}

.filter-box {
  display: flex;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 769px) {
    width: auto;
  }

  .mac-input {
    min-width: 160px;
  }
}
</style> 
<template>
  <div class="inventory-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>정기점검 항목 관리</h1>
            <span class="item-count">총 {{ inspectionsList.length }}개</span>
          </div>
          <div class="description-section">
            <p class="description">정기점검 항목을 추가, 편집, 삭제하여 효율적인 점검 관리가 가능합니다.</p>
          </div>
        </div>
        <div class="header-right">
          <div class="search-box">
            <input 
              type="text" 
              class="mac-input" 
              placeholder="품목 검색..."
              v-model="searchQuery"
            />
          </div>
          <button class="mac-button primary" @click="openAddDialog">
            <span class="button-icon">+</span>
            <span class="button-text">새 항목 추가</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 통계 섹션 -->
    <div class="stats-section">
      <div class="stats-grid">
        <!-- 전체 점검항목 -->
        <div class="stats-card glass-card">
          <div class="stats-icon success">
            <font-awesome-icon :icon="['fas', 'list-check']" />
          </div>
          <div class="stats-content">
            <span class="stats-value">{{ inspectionsList.length }}개</span>
            <span class="stats-label">전체 점검항목</span>
          </div>
        </div>

        <!-- 월간 점검 -->
        <div class="stats-card glass-card">
          <div class="stats-icon warning">
            <font-awesome-icon :icon="['fas', 'calendar']" />
          </div>
          <div class="stats-content">
            <span class="stats-value">{{ inspectionStore.oneMonthCount }}개</span>
            <span class="stats-label">1개월 점검</span>
          </div>
        </div>

        <!-- 3개월 점검 -->
        <div class="stats-card glass-card">
          <div class="stats-icon primary">
            <font-awesome-icon :icon="['fas', 'calendar-week']" />
          </div>
          <div class="stats-content">
            <span class="stats-value">{{ inspectionStore.threeMonthCount }}개</span>
            <span class="stats-label">3개월 점검</span>
          </div>
        </div>

        <!-- 6개월 점검 -->
        <div class="stats-card glass-card">
          <div class="stats-icon danger">
            <font-awesome-icon :icon="['fas', 'calendar-day']" />
          </div>
          <div class="stats-content">
            <span class="stats-value">{{ inspectionStore.sixMonthCount }}개</span>
            <span class="stats-label">6개월 점검</span>
          </div>
        </div>

        <!-- 12개월 점검 -->
        <div class="stats-card glass-card">
          <div class="stats-icon info">
            <font-awesome-icon :icon="['fas', 'calendar-alt']" />
          </div>
          <div class="stats-content">
            <span class="stats-value">{{ inspectionStore.twelveMonthCount }}개</span>
            <span class="stats-label">12개월 점검</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 테이블/카드 뷰 -->
    <div class="inventory-content glass-card">
      <!-- 데스크톱 테이블 뷰 -->
      <div class="desktop-view">
        <table class="mac-table">
          <thead>
            <tr>
              <th>점검코드</th>
              <th>점검항목</th>
              <th>점검기준</th>
              <th>주기</th>
              <th>중요도</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="inspectionsList.length === 0">
              <td colspan="7" class="empty-message">등록된 점검항목이 없습니다.</td>
            </tr>
            <tr v-else v-for="item in inspectionsList" :key="item.id">
              <td>{{ item.code }}</td>
              <td>
                <div v-if="editingItem?.id === item.id" class="edit-field">
                  <input type="text" class="mac-input" v-model="editingItem.name" />
                </div>
                <span v-else>{{ item.name }}</span>
              </td>
              <td>
                <div v-if="editingItem?.id === item.id" class="edit-field">
                  <input type="text" class="mac-input" v-model="editingItem.standard" />
                </div>
                <span v-else>{{ item.standard }}</span>
              </td>
              <td>
                <div v-if="editingItem?.id === item.id" class="edit-field">
                  <select class="mac-input" v-model="editingItem.cycle">
                    <option value="1개월">1개월</option>
                    <option value="3개월">3개월</option>
                    <option value="6개월">6개월</option>
                    <option value="12개월">12개월</option>
                  </select>
                </div>
                <span v-else>{{ item.cycle }}</span>
              </td>
              <td>
                <div v-if="editingItem?.id === item.id" class="edit-field">
                  <select class="mac-input" v-model="editingItem.priority">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <span v-else class="priority-badge" :class="getPriorityClass(item.priority)">
                  {{ item.priority }}
                </span>
              </td>
              <td>
                <span class="mac-badge" :class="getStatusClass(item.status)">
                  {{ item.status === 'active' ? '사용' : '미사용' }}
                </span>
              </td>
              <td class="actions">
                <div v-if="editingItem?.id === item.id" class="edit-actions">
                  <button class="mac-button primary small" @click="saveEdit">저장</button>
                  <button class="mac-button secondary small" @click="cancelEdit">취소</button>
                </div>
                <div v-else class="normal-actions">
                  <button 
                    class="mac-button secondary small" 
                    :class="item.status === 'active' ? '' : ''"
                    @click="toggleStatus(item)"
                  >
                    {{ item.status === 'active' ? '사용' : '미사용' }}
                  </button>
                  <button class="mac-button secondary small" @click="openChecklistModal(item)">
                    체크리스트
                  </button>
                  <button class="mac-button secondary small" @click="startEdit(item)">
                    수정
                  </button>
                  <button class="mac-button danger small" @click="deleteItem(item)">
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 모바일 카드 뷰 -->
      <div class="mobile-view">
        <div v-if="inspectionsList.length === 0" class="empty-message">
          등록된 점검항목이 없습니다.
        </div>
        <div v-else v-for="item in inspectionsList" :key="item.id" class="inspection-card glass-card">
          <div class="card-header">
            <span class="code">{{ item.code }}</span>
            <div class="status-badges">
              <span class="priority-badge" :class="getPriorityClass(item.priority)">
                {{ item.priority }}
              </span>
              <span class="mac-badge" :class="getStatusClass(item.status)">
                {{ item.status === 'active' ? '사용' : '미사용' }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">점검항목:</span>
              <div v-if="editingItem?.id === item.id" class="edit-field">
                <input type="text" class="mac-input" v-model="editingItem.name" />
              </div>
              <span v-else class="value">{{ item.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검기준:</span>
              <div v-if="editingItem?.id === item.id" class="edit-field">
                <input type="text" class="mac-input" v-model="editingItem.standard" />
              </div>
              <span v-else class="value">{{ item.standard }}</span>
            </div>
            <div class="info-row">
              <span class="label">주기:</span>
              <div v-if="editingItem?.id === item.id" class="edit-field">
                <select class="mac-input" v-model="editingItem.cycle">
                  <option value="1개월">1개월</option>
                  <option value="3개월">3개월</option>
                  <option value="6개월">6개월</option>
                  <option value="12개월">12개월</option>
                </select>
              </div>
              <span v-else class="value">{{ item.cycle }}</span>
            </div>
            <div class="info-row">
              <span class="label">중요도:</span>
              <div v-if="editingItem?.id === item.id" class="edit-field">
                <select class="mac-input" v-model="editingItem.priority">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <span v-else class="value">
                <span class="priority-badge" :class="getPriorityClass(item.priority)">
                  {{ item.priority }}
                </span>
              </span>
            </div>
          </div>
          <div class="card-actions">
            <div v-if="editingItem?.id === item.id" class="edit-actions">
              <button class="mac-button primary small" @click="saveEdit">저장</button>
              <button class="mac-button secondary small" @click="cancelEdit">취소</button>
            </div>
            <div v-else class="normal-actions">
              <button 
                class="mac-button secondary small" 
                :class="item.status === 'active' ? '' : ''"
                @click="toggleStatus(item)"
              >
                {{ item.status === 'active' ? '사용' : '미사용' }}
              </button>
              <button class="mac-button secondary small" @click="openChecklistModal(item)">
                체크리스트
              </button>
              <button class="mac-button secondary small" @click="startEdit(item)">
                수정
              </button>
              <button class="mac-button danger small" @click="deleteItem(item)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 새 항목 추가 모달 -->
  <div v-if="showAddModal" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h2>새 점검항목 추가</h2>
        <button class="mac-button icon" @click="closeAddModal">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>점검항목</label>
          <input type="text" class="mac-input" v-model="newItem.name" placeholder="점검항목 입력..." />
        </div>
        <div class="form-group">
          <label>점검기준</label>
          <input type="text" class="mac-input" v-model="newItem.standard" placeholder="점검기준 입력..." />
        </div>
        <div class="form-group">
          <label>점검주기</label>
          <select class="mac-input" v-model="newItem.cycle">
            <option value="1개월">1개월</option>
            <option value="3개월">3개월</option>
            <option value="6개월">6개월</option>
            <option value="12개월">12개월</option>
          </select>
        </div>
        <div class="form-group">
          <label>중요도</label>
          <select class="mac-input" v-model="newItem.priority">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="mac-button secondary" @click="closeAddModal">취소</button>
        <button 
          class="mac-button primary" 
          @click="addNewItem"
          :disabled="!isValidNewItem"
        >
          추가
        </button>
      </div>
    </div>
  </div>

  <!-- 체크리스트 모달 -->
  <div v-if="showChecklistModal" class="modal-overlay">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h2>체크리스트 관리</h2>
        <button class="mac-button icon" @click="closeChecklistModal">×</button>
      </div>
      <div class="modal-body">
        <!-- 체크리스트 목록 -->
        <div v-if="selectedItem?.checklist?.length" class="checklist-items">
          <div v-for="item in selectedItem.checklist" :key="item.id" class="checklist-item">
            <div v-if="editingChecklistItem?.id === item.id" class="edit-form">
              <input 
                type="text" 
                class="mac-input" 
                v-model="editingChecklistItem.content" 
                placeholder="체크리스트 항목 입력..."
              />
              <div class="form-check">
                <input 
                  type="checkbox" 
                  class="mac-checkbox" 
                  v-model="editingChecklistItem.required"
                  :id="'edit-required-' + item.id"
                />
                <label :for="'edit-required-' + item.id">필수 항목</label>
              </div>
              <div class="actions">
                <button class="mac-button primary small" @click="saveChecklistEdit">저장</button>
                <button class="mac-button secondary small" @click="cancelChecklistEdit">취소</button>
              </div>
            </div>
            <div v-else class="item-content">
              <div class="content-wrapper">
                <span class="content">{{ item.content }}</span>
                <span v-if="item.required" class="required-badge">필수</span>
              </div>
              <div class="actions">
                <button class="mac-button secondary small" @click="startChecklistEdit(item)">수정</button>
                <button class="mac-button danger small" @click="deleteChecklistItem(item.id)">삭제</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-message">
          등록된 체크리스트가 없습니다.
        </div>

        <!-- 새 체크리스트 항목 추가 폼 -->
        <div class="add-checklist-form">
          <h3>새 체크리스트 항목 추가</h3>
          <div class="form-group">
            <input 
              type="text" 
              class="mac-input" 
              v-model="newChecklistItem.content" 
              placeholder="체크리스트 항목 입력..."
              @keyup.enter="addChecklistItem"
            />
          </div>
          <div class="form-check">
            <input 
              type="checkbox" 
              class="mac-checkbox" 
              v-model="newChecklistItem.required"
              id="new-required"
            />
            <label for="new-required">필수 항목</label>
          </div>
          <button 
            class="mac-button primary" 
            @click="addChecklistItem"
            :disabled="!newChecklistItem.content"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import '@/styles/macBaseStyle.scss'
import '@/styles/components/table.scss'
import client from '@/api/client'
import { useInspectionStore } from '@/stores/inspection'

interface ChecklistItem {
  id: number
  content: string
  required: boolean
}

interface InspectionItem {
  id: number
  code: string
  name: string
  standard: string
  cycle: '1개월' | '3개월' | '6개월' | '12개월'
  priority: 'A' | 'B' | 'C'
  status: 'active' | 'inactive'
  checklist: ChecklistItem[]
}

interface NewInspectionItem {
  name: string
  standard: string
  cycle: '1개월' | '3개월' | '6개월' | '12개월'
  priority: 'A' | 'B' | 'C'
  status: 'active' | 'inactive'
  checklist: ChecklistItem[]
}

const searchQuery = ref('')
const inspectionStore = useInspectionStore()
const inspectionsList = computed(() => inspectionStore.inspections)

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  inspectionStore.fetchInspections()
})

const oneMonthCount = computed(() => 
  inspectionsList.value.filter(item => item.cycle === '1개월').length
)

const threeMonthCount = computed(() => 
  inspectionsList.value.filter(item => item.cycle === '3개월').length
)

const sixMonthCount = computed(() => 
  inspectionsList.value.filter(item => item.cycle === '6개월').length
)

const getPriorityClass = (priority: string) => {
  return {
    'priority-a': priority === 'A',
    'priority-b': priority === 'B',
    'priority-c': priority === 'C'
  }
}

const getStatusClass = (status: string) => {
  return {
    'success': status === 'active',
    'danger': status === 'inactive'
  }
}

const openAddDialog = () => {
  showAddModal.value = true
}

const editItem = (item: InspectionItem) => {
  // TODO: 수정 모달 구현
}

const deleteItem = async (item: InspectionItem) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await inspectionStore.deleteInspection(item.id!)
  } catch (error) {
    // 로그 제거
  }
}

const toggleStatus = async (item: any) => {
  try {
    await inspectionStore.toggleInspectionStatus(item)
  } catch (error) {
    // 로그 제거
  }
}

// 수정 관련 상태와 함수들
const editingItem = ref<InspectionItem | null>(null)

// 수정 유효성 검사
const isValidEdit = computed(() => {
  if (!editingItem.value) return false
  return editingItem.value.name && editingItem.value.standard
})

// 수정 시작
const startEdit = (item: InspectionItem) => {
  editingItem.value = { ...item }
}

// 수정 저장
const saveEdit = async () => {
  if (!editingItem.value) return
  
  try {
    await inspectionStore.updateInspection(editingItem.value)
    editingItem.value = null
  } catch (error) {
    // 로그 제거
  }
}

// 수정 취소
const cancelEdit = () => {
  editingItem.value = null
}

// 체크리스트 관련 상태
const showChecklistModal = ref(false)
const selectedItem = ref<InspectionItem | null>(null)
const editingChecklistItem = ref<ChecklistItem | null>(null)
const newChecklistItem = ref({
  content: '',
  required: false
})

// 체크리스트 모달 열기/닫기
const openChecklistModal = (item: InspectionItem) => {
  selectedItem.value = item
  showChecklistModal.value = true
}

const closeChecklistModal = () => {
  selectedItem.value = null
  showChecklistModal.value = false
  editingChecklistItem.value = null
  newChecklistItem.value = {
    content: '',
    required: false
  }
}

// 체크리스트 항목 추가
const addChecklistItem = async () => {
  if (!selectedItem.value) return
  
  try {
    const response = await client.post(`/inspections/${selectedItem.value.id}/checklist`, {
      item: newChecklistItem.value
    })
    selectedItem.value.checklist = response.data
    newChecklistItem.value = { content: '', required: false }
  } catch (error) {
    console.error('체크리스트 항목 추가 실패:', error)
  }
}

// 체크리스트 항목 수정
const startChecklistEdit = (item: ChecklistItem) => {
  editingChecklistItem.value = { ...item }
}

const saveChecklistEdit = async () => {
  if (!editingChecklistItem.value || !selectedItem.value) return

  try {
    const response = await client.put(
      `/inspections/${selectedItem.value.id}/checklist/${editingChecklistItem.value.id}`,
      { item: editingChecklistItem.value.content }
    )

    const index = selectedItem.value.checklist.findIndex(
      item => item.id === editingChecklistItem.value?.id
    )
    if (index !== -1) {
      selectedItem.value.checklist[index] = response.data
    }

    editingChecklistItem.value = null
  } catch (error) {
    console.error('체크리스트 항목 수정 실패:', error)
  }
}

const cancelChecklistEdit = () => {
  editingChecklistItem.value = null
}

// 체크리스트 항목 삭제
const deleteChecklistItem = async (checklistId: number) => {
  if (!selectedItem.value) return
  
  try {
    await client.delete(`/inspections/${selectedItem.value.id}/checklist/${checklistId}`)
    selectedItem.value.checklist = selectedItem.value.checklist.filter(item => item.id !== checklistId)
  } catch (error) {
    console.error('체크리스트 항목 삭제 실패:', error)
  }
}

const showAddModal = ref(false)
const newItem = ref<NewInspectionItem>({
  name: '',
  standard: '',
  cycle: '1개월',
  priority: 'B',
  status: 'active',
  checklist: []
})

const isValidNewItem = computed(() => {
  return newItem.value.name && 
         newItem.value.standard
})

const closeAddModal = () => {
  showAddModal.value = false
  // 입력 폼 초기화
  newItem.value = {
    name: '',
    standard: '',
    cycle: '1개월',
    priority: 'B',
    status: 'active',
    checklist: []
  }
}

const generateInspectionCode = () => {
  const lastItem = [...inspectionsList.value].sort((a, b) => {
    const numA = parseInt(a.code.replace('INS', ''))
    const numB = parseInt(b.code.replace('INS', ''))
    return numB - numA
  })[0]

  if (!lastItem) return 'INS001'

  const lastNumber = parseInt(lastItem.code.replace('INS', ''))
  const newNumber = (lastNumber + 1).toString().padStart(3, '0')
  return `INS${newNumber}`
}

const addNewItem = async () => {
  try {
    await inspectionStore.addInspection(newItem.value)
    showAddModal.value = false
    newItem.value = {
      name: '',
      standard: '',
      cycle: '1개월',
      priority: 'B',
      status: 'active',
      checklist: []
    }
  } catch (error) {
    // 로그 제거
  }
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

  .search-box {
    width: 100%;
    
    @media (min-width: 769px) {
      width: 240px;
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
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;

    .stats-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stats-content {
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

.inventory-content {
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

    .status-badges {
      display: flex;
      gap: 0.5rem;
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
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;

    .mac-button {
      flex: 1;
      min-width: calc(50% - 0.25rem);
      justify-content: center;
    }
  }
}

.priority-badge {
  padding: 2px 8px;
  border-radius: var(--mac-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;

  &.priority-a {
    background: rgba(220, 38, 38, 0.1);
    color: #dc2626;
  }

  &.priority-b {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.priority-c {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--mac-background);
  border-radius: var(--mac-radius);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .icon {
    font-size: 1.5rem;
    line-height: 1;
    padding: 0.25rem 0.5rem;
  }
}

.modal-body {
  margin-bottom: 1.5rem;

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .mac-input {
      width: 100%;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.checklist-items {
  margin-bottom: 2rem;

  .checklist-item {
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: var(--mac-radius-sm);
    background: var(--mac-surface);

    .item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;

      .content-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .required-badge {
        font-size: 0.75rem;
        padding: 0.125rem 0.5rem;
        border-radius: var(--mac-radius-sm);
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    }
  }
}

.add-checklist-form {
  padding-top: 1rem;
  border-top: 1px solid var(--mac-border);

  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }

  .form-check {
    margin: 0.5rem 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    color: var(--mac-text-secondary);
  }
}

.edit-field {
  .mac-input {
    width: 100%;
    min-width: 120px;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  select.mac-input {
    padding-right: 1.5rem;
  }
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  width: 100%;

  .mac-button {
    flex: 1;
  }
}

.normal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  width: 100%;

  .mac-button {
    flex: 1;

    &.secondary {
      @media (prefers-color-scheme: light) {
        &:nth-child(1) {
          background-color: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;

          &:hover {
            background-color: #bbf7d0;
          }
        }
        
        &:nth-child(2) {
          background-color: #dbeafe;
          color: #1e40af;
          border-color: #bfdbfe;

          &:hover {
            background-color: #bfdbfe;
          }
        }
      }
    }
  }
}

.info-row {
  .edit-field {
    flex: 1;
  }
}
</style> 
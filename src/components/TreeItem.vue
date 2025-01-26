<template>
  <div class="tree-item" :style="{ marginLeft: `${level * 24}px` }">
    <div class="item-content" 
      :class="{ 
        'is-editing': isEditing,
        'has-children': hasChildren,
        'status-active': line.status === 'active',
        'status-inactive': line.status === 'inactive',
        [`level-${level}`]: true
      }"
    >
      <div v-if="!isEditing" 
        class="item-view"
        @click="toggleCollapse"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <div class="item-info">
          <button 
            v-if="hasChildren" 
            class="collapse-button" 
            @click.stop="isCollapsed = !isCollapsed"
            :class="{ 'is-collapsed': isCollapsed }"
          >
            <span class="collapse-icon">▼</span>
          </button>
          <span class="status-dot" :class="line.status"></span>
          <span class="level-icon">{{ getLevelIcon() }}</span>
          <span class="item-name">{{ line.name }}</span>
          <div v-if="showTooltip" class="custom-tooltip">
            {{ getFullPath() }}
          </div>
        </div>
        <div class="item-actions">
          <button 
            class="action-button toggle" 
            @click="toggleStatus" 
            :title="line.status === 'active' ? '미사용으로 전환' : '사용으로 전환'"
            :disabled="isStatusButtonDisabled()"
          >
            <span class="icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="20" height="12" rx="6" :fill="line.status === 'active' ? '#22c55e' : '#ef4444'"/>
                <circle cx="8" cy="12" r="4" :fill="line.status === 'active' ? '#ffffff' : '#ffffff'" :transform="line.status === 'active' ? 'translate(8,0)' : ''"/>
              </svg>
            </span>
          </button>
          <button class="action-button add" @click="addSubLine" title="하위 라인 추가">
            <span class="icon">+</span>
          </button>
          <button class="action-button edit" @click="startEdit" title="수정">
            <span class="icon">✎</span>
          </button>
          <button class="action-button delete" 
            @click="$emit('delete', line)" 
            :disabled="hasChildren"
            :title="hasChildren ? '하위 라인이 있어 삭제할 수 없습니다' : '삭제'">
            <span class="icon">×</span>
          </button>
        </div>
      </div>
      <div v-else class="item-edit">
        <div class="edit-fields">
          <div class="edit-field">
            <input 
              ref="nameInput"
              type="text" 
              v-model="editData.name"
              class="edit-input"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              @blur="handleEditBlur"
              required
            >
          </div>
          <div class="edit-field">
            <select v-model="editData.status" class="edit-input">
              <option value="active">사용</option>
              <option value="inactive">미사용</option>
            </select>
          </div>
        </div>
        <div class="edit-actions">
          <button class="action-button save" @click="saveEdit" title="저장">
            <span class="icon">✓</span>
          </button>
          <button class="action-button cancel" @click="cancelEdit" title="취소">
            <span class="icon">×</span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="isAddingSubLine" class="sub-line-edit">
      <div class="item-content is-editing">
        <div class="item-edit">
          <div class="edit-fields">
            <div class="edit-field">
              <input 
                ref="newLineInput"
                type="text" 
                v-model="newLineData.name"
                class="edit-input"
                :placeholder="level === 0 ? '새 부서명을 입력하세요' : level === 1 ? '새 라인명을 입력하세요' : '새 라인명을 입력하세요'"
                @keyup.enter="saveNewLine"
                @keyup.esc="cancelNewLine"
                @blur="handleSubLineBlur"
                required
              >
            </div>
            <div class="edit-field">
              <select v-model="newLineData.status" class="edit-input">
                <option value="active">사용</option>
                <option value="inactive">미사용</option>
              </select>
            </div>
          </div>
          <div class="edit-actions">
            <button class="action-button save" @click="saveNewLine" title="저장">
              <span class="icon">✓</span>
            </button>
            <button class="action-button cancel" @click="cancelNewLine" title="취소">
              <span class="icon">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="line.children && line.children.length && !isCollapsed" class="children">
      <TreeItem
        v-for="child in line.children"
        :key="child.id"
        :line="child"
        :level="level + 1"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed, getCurrentInstance } from 'vue'
import type { Line } from '@/stores/lines'
import { useLinesStore } from '@/stores/lines'

const props = defineProps<{
  line: Line
  level: number
}>()

// 디버깅 로그 추가
console.log('TreeItem 렌더링:', {
  line: props.line,
  level: props.level
})

const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()
const linesStore = useLinesStore()
const isEditing = ref(false)
const isAddingSubLine = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)
const newLineInput = ref<HTMLInputElement | null>(null)

// 편집 데이터
const editData = reactive({
  name: props.line.name,
  status: props.line.status
})

// 새 라인 데이터
const newLineData = reactive({
  name: '',
  status: 'active' as const
})

const hasChildren = computed(() => {
  return props.line.children && props.line.children.length > 0
})

function startEdit() {
  editData.name = props.line.name
  editData.status = props.line.status
  isEditing.value = true
  nextTick(() => {
    nameInput.value?.focus()
  })
}

async function saveEdit() {
  try {
    if (!editData.name.trim()) {
      alert('라인명을 입력해주세요.')
      return
    }

    await linesStore.updateLine(props.line.id, {
      name: editData.name.trim(),
      status: editData.status
    })
    
    isEditing.value = false
  } catch (error) {
    console.error('Error saving line:', error)
  }
}

function cancelEdit() {
  editData.name = props.line.name
  editData.status = props.line.status
  isEditing.value = false
}

function addSubLine() {
  if (props.level >= 4) {
    alert('최대 4단계까지만 하위 라인을 추가할 수 있습니다.')
    return
  }

  isAddingSubLine.value = true
  newLineData.name = ''
  newLineData.status = 'active'
  nextTick(() => {
    newLineInput.value?.focus()
  })
}

async function saveNewLine() {
  try {
    if (!newLineData.name.trim()) {
      alert('라인명을 입력해주세요.')
      return
    }

    if (props.level >= 4) {
      alert('최대 4단계까지만 하위 라인을 추가할 수 있습니다.')
      isAddingSubLine.value = false
      return
    }

    await linesStore.addLine({
      parent_id: props.line.id,
      level: props.level + 1,
      name: newLineData.name.trim(),
      status: newLineData.status
    })
    
    isAddingSubLine.value = false
  } catch (error: any) {
    console.error('Error adding new line:', error)
    alert(error.message || '라인 추가에 실패했습니다.')
    if (error.message === '유효하지 않은 레벨입니다.') {
      window.location.reload()
    }
  }
}

function cancelNewLine() {
  isAddingSubLine.value = false
  newLineData.name = ''
  newLineData.status = 'active'
}

async function toggleStatus() {
  try {
    const newStatus = props.line.status === 'active' ? 'inactive' : 'active'
    
    // 현재 항목의 상태 변경
    await linesStore.updateLine(props.line.id, {
      name: props.line.name,
      status: newStatus
    })

    // 미사용으로 변경할 때는 모든 하위 항목도 미사용으로 변경
    if (newStatus === 'inactive' && props.line.children) {
      await updateChildrenStatus(props.line.children, 'inactive')
    }
  } catch (error) {
    console.error('Error toggling status:', error)
  }
}

// 하위 항목들의 상태를 재귀적으로 변경하는 함수
async function updateChildrenStatus(children: Line[], status: 'active' | 'inactive') {
  for (const child of children) {
    await linesStore.updateLine(child.id, {
      name: child.name,
      status: status
    })
    
    if (child.children) {
      await updateChildrenStatus(child.children, status)
    }
  }
}

// 상태 변경 버튼 비활성화 조건 추가
function isStatusButtonDisabled() {
  // 부모 라인을 찾아서 상태 확인
  const parentLine = findParentLine(props.line.id, linesStore.lines)
  return parentLine?.status === 'inactive'
}

// 부모 라인을 찾는 함수
function findParentLine(lineId: number, lines: Line[]): Line | null {
  for (const line of lines) {
    if (line.children) {
      for (const child of line.children) {
        if (child.id === lineId) {
          return line
        }
        const found = findParentLine(lineId, [child])
        if (found) return found
      }
    }
  }
  return null
}

function handleSubLineBlur(event: FocusEvent) {
  // 클릭된 요소가 같은 폼 내부의 다른 요소가 아닐 경우에만 닫기
  const clickedElement = event.relatedTarget as HTMLElement
  const form = (event.target as HTMLElement).closest('.sub-line-edit')
  if (!clickedElement || !form?.contains(clickedElement)) {
    cancelNewLine()
  }
}

function handleEditBlur(event: FocusEvent) {
  // 클릭된 요소가 같은 폼 내부의 다른 요소가 아닐 경우에만 닫기
  const clickedElement = event.relatedTarget as HTMLElement
  const form = (event.target as HTMLElement).closest('.item-edit')
  if (!clickedElement || !form?.contains(clickedElement)) {
    cancelEdit()
  }
}

function getLevelIcon() {
  switch(props.level) {
    case 0: return '🏭'
    case 1: return '🏢'
    default: return '⚙️'
  }
}

function getFullPath() {
  const path = []
  let currentLine = props.line
  let parentLine = findParentLine(currentLine.id, linesStore.lines)
  
  // 현재 항목 추가
  path.unshift(currentLine.name)
  
  // 부모 항목들을 찾아서 추가
  while (parentLine) {
    path.unshift(parentLine.name)
    currentLine = parentLine
    parentLine = findParentLine(currentLine.id, linesStore.lines)
  }
  
  return path.join(' > ')
}

const showTooltip = ref(false)
const isCollapsed = ref(false)

async function toggleCollapse(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!hasChildren || target.closest('.action-button') || target.closest('.collapse-button')) {
    return
  }
  
  if (isCollapsed.value) {
    // 펼칠 때는 모든 하위 항목도 펼침
    isCollapsed.value = false
    expandAllChildren(props.line)
  } else {
    // 접을 때는 그냥 접기만
    isCollapsed.value = true
  }
}

function expandAllChildren(line: Line) {
  if (line.children) {
    for (const child of line.children) {
      const childComponent = findChildComponent(child.id)
      if (childComponent) {
        childComponent.isCollapsed = false
        expandAllChildren(child)
      }
    }
  }
}

function findChildComponent(lineId: number): any {
  const children = getCurrentInstance()?.proxy?.$refs.children as any[]
  if (!children) return null
  
  for (const child of children) {
    if (child.line.id === lineId) {
      return child
    }
    const found = child.findChildComponent(lineId)
    if (found) return found
  }
  return null
}
</script>

<style scoped lang="scss">
.tree-item {
  margin-bottom: 4px;
  
  .item-content {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 4px;
    transition: all 0.2s ease;
    border: 1px solid var(--mac-border);

    // 레벨별 스타일
    &[class*="level-0"] {
      background: var(--system-card-background);
      border-left: 4px solid var(--system-accent);
    }

    &[class*="level-1"] {
      background: var(--system-secondary-background);
      border-left: 4px solid var(--system-yellow);
    }

    &[class*="level-2"], &[class*="level-3"] {
      background: var(--system-background);
      border-left: 4px solid var(--system-green);
    }

    // 상태별 스타일
    &.status-active {
      &.level-0 { background: rgba(var(--system-accent-rgb), 0.1); }
      &.level-1 { background: rgba(var(--system-yellow-rgb), 0.1); }
      &.level-2, &.level-3 { background: rgba(var(--system-green-rgb), 0.1); }
    }

    &.status-inactive {
      opacity: 0.7;
      background: rgba(239, 68, 68, 0.1) !important;
      border-left-color: #ef4444 !important;
    }

    &.is-editing {
      background: var(--system-modal-background);
    }

    &.has-children {
      cursor: pointer;
    }
  }

  .item-view {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .item-info {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    flex: 1;
  }

  .item-name {
    color: var(--mac-text);
    font-size: v-bind('props.level === 0 ? "1.125rem" : props.level === 1 ? "1rem" : "0.875rem"');
    font-weight: v-bind('props.level === 0 ? "600" : props.level === 1 ? "500" : "400"');
    
    .level-0 & {
      color: var(--system-accent);
    }
    
    .level-1 & {
      color: var(--system-yellow);
    }
    
    .level-2 &, .level-3 & {
      color: var(--system-green);
    }
    
    .status-inactive & {
      color: #666 !important;
      text-decoration: line-through;
    }
  }

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;

    &.active {
      background-color: var(--system-green);
    }

    &.inactive {
      background-color: var(--system-red);
    }
  }

  .item-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    margin-left: auto;
    flex-shrink: 0;
  }

  .item-content:hover .item-actions {
    opacity: 1;
  }

  .action-button {
    padding: 4px;
    border: none;
    background: none;
    border-radius: 4px;
    color: var(--mac-text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--system-hover);
      color: var(--mac-text);
    }

    &.add:hover { color: var(--system-accent); }
    &.edit:hover { color: var(--system-yellow); }
    &.delete:hover { color: var(--system-red); }
    &.save:hover { color: var(--system-green); }
    &.cancel:hover { color: var(--system-red); }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      background: none !important;
      color: var(--mac-text-secondary) !important;
    }

    .icon {
      font-size: 1rem;
      line-height: 1;
    }
  }

  .edit-input {
    padding: 8px 12px;
    border-radius: var(--mac-radius);
    border: 1px solid var(--mac-border);
    background: var(--input-background);
    color: var(--mac-text);
    font-family: var(--mac-font);
    width: 100%;
    
    &:focus {
      outline: none;
      border-color: var(--mac-primary);
      box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
    }
  }

  .item-edit {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 4px;

    .edit-fields {
      display: flex;
      gap: 8px;
      flex: 1;
    }

    .edit-field {
      &:first-child {
        flex: 1;
      }

      &:last-child {
        width: 120px;
      }
    }

    .edit-actions {
      display: flex;
      gap: 4px;
    }
  }

  .children {
    margin-left: 24px;
  }

  .sub-line-edit {
    margin-left: 24px;
    margin-top: 4px;
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .level-icon {
    font-size: v-bind('props.level === 0 ? "1.25rem" : "1rem"');
    opacity: v-bind('props.level === 0 ? "1" : "0.8"');
  }
}

.custom-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  z-index: 1000;
  white-space: nowrap;
  margin-top: 5px;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 10px;
    border: 5px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.8);
  }
}

.collapse-button {
  padding: 2px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  .collapse-icon {
    font-size: 0.75rem;
    line-height: 1;
  }

  &.is-collapsed {
    transform: rotate(-90deg);
  }

  &:hover {
    color: var(--color-text);
  }
}

.item-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.item-content.status-active {
  background-color: rgba(34, 197, 94, 0.1);
}

.item-content.status-inactive {
  background-color: rgba(239, 68, 68, 0.1);
  opacity: 0.7;
}

.status-inactive .item-name {
  color: #666;
  text-decoration: line-through;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.status-dot.active {
  background-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.status-dot.inactive {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
</style> 
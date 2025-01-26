<template>
  <div class="maintenance-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>장비 유지보수 관리</h1>
        </div>
        <div class="description-section">
          <p class="description">장비의 유지보수 일정과 이력을 관리하여 체계적인 장비 관리가 가능합니다.</p>
          <div class="info-section">
            <span class="info-item">
              <span class="dot info"></span>
              정기점검, 수리, 교체 등의 유지보수 작업을 등록하고 관리할 수 있습니다.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 유지보수 등록 폼 -->
    <div class="maintenance-form glass-card">
      <h2 class="section-title">{{ isEditing ? '유지보수 수정' : '유지보수 등록' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <!-- 위치 정보 그룹 -->
          <div class="form-section">
            <h3 class="subsection-title">위치 정보</h3>
            <div class="section-content">
              <div class="location-info">
                <div class="form-group full-width">
                  <label>공장</label>
                  <div class="select-container">
                    <CustomSelect
                      v-model="selectedFactoryId"
                      :options="factories.map(f => ({ value: f.id, label: f.name }))"
                      placeholder="선택하세요"
                      @change="handleFactoryChange"
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>부서</label>
                    <div class="select-container">
                      <CustomSelect
                        v-model="selectedDepartmentId"
                        :options="departments.map(d => ({ value: d.id, label: d.name }))"
                        placeholder="선택하세요"
                        :disabled="!selectedFactoryId"
                        @change="handleDepartmentChange"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>점검자</label>
                    <input type="text" class="mac-input" :value="userName" readonly required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>라인</label>
                    <div class="select-container">
                      <CustomSelect
                        v-model="selectedLineId"
                        :options="lines.map(l => ({ value: l.id, label: l.name }))"
                        placeholder="선택하세요"
                        :disabled="!selectedDepartmentId"
                        @change="handleLineChange"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>보수일</label>
                    <input v-model="form.scheduled_date" type="date" class="mac-input" required>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 기본 정보 그룹 -->
          <div class="form-section">
            <h3 class="subsection-title">기본 정보</h3>
            <div class="section-content">
              <div class="form-group">
                <label>SERIAL NO</label>
                <CustomSelect
                  v-model="selectedSerialNo"
                  :options="[
                    ...filteredEquipments.map(equipment => ({
                      value: equipment.serial_no,
                      label: equipment.serial_no
                    })),
                    { value: 'OTHER', label: '기타(설비외)' }
                  ]"
                  placeholder="선택하세요"
                  @update:modelValue="handleSerialNoChange"
                  required
                />
              </div>
              <div class="form-group">
                <label>제목</label>
                <input v-model="form.title" type="text" class="mac-input" required>
              </div>
              <div class="form-group">
                <label>설명</label>
                <textarea v-model="form.description" class="mac-input description-textarea" rows="8" required></textarea>
              </div>
            </div>
          </div>

          <!-- 첨부 파일 그룹 -->
          <div class="form-section">
            <h3 class="subsection-title">첨부 파일</h3>
            <div class="section-content">
              <div class="form-group">
                <label>사진</label>
                <div class="photos-container">
                  <div v-for="(photo, index) in photos" :key="index" class="photo-item">
                    <img :src="photo" class="photo-preview" />
                    <button type="button" class="photo-delete" @click="deletePhoto(index)">×</button>
                  </div>
                  <div class="photo-upload" @click="triggerPhotoUpload">
                    <input
                      type="file"
                      ref="photoInput"
                      accept="image/*"
                      @change="handlePhotoUpload"
                      class="hidden-input"
                      multiple
                    />
                    <div class="upload-placeholder">
                      <span class="upload-icon">+</span>
                      <span class="upload-text">사진 추가</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-footer">
          <button type="submit" class="mac-button primary">{{ isEditing ? '수정' : '등록' }}</button>
          <button v-if="isEditing" type="button" class="mac-button secondary" @click="cancelForm">취소</button>
        </div>
      </form>
    </div>

    <!-- 유지보수 목록 -->
    <div class="maintenance-list glass-card">
      <div class="list-header">
        <h2 class="section-title">유지보수 목록</h2>
        <router-link 
          to="/equipment/maintenance/other" 
          class="mac-button secondary">
          설비 외 목록
        </router-link>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else class="table-responsive">
        <table class="mac-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>SERIAL NO</th>
              <th>제목</th>
              <th>위치</th>
              <th>점검자</th>
              <th>보수일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="maintenance in filteredMaintenances" :key="maintenance.id">
              <td>{{ maintenance.id }}</td>
              <td>{{ maintenance.serial_no }}</td>
              <td>{{ maintenance.title }}</td>
              <td>{{ maintenance.factory }} / {{ maintenance.department }} / {{ maintenance.line }}</td>
              <td>{{ maintenance.inspector }}</td>
              <td>{{ formatDate(maintenance.scheduled_date) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="mac-button small primary" @click="editMaintenance(maintenance)">
                    수정
                  </button>
                  <button class="mac-button small success" @click="completeMaintenance(maintenance.id)">
                    완료
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useLinesStore } from '@/stores/lines'
import { useAuthStore } from '@/stores/auth'
import { useEquipmentStore } from '@/stores/equipment'
import CustomSelect from '@/components/CustomSelect.vue'

interface Maintenance {
  id?: number;
  serial_no: string;
  title: string;
  description: string;
  photos: string;
  inspector: string;
  factory: string;
  department: string;
  line: string;
  status: string;
  is_other: boolean;
  scheduled_date: string;
  completed_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

const maintenanceStore = useMaintenanceStore()
const linesStore = useLinesStore()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()

const isEditing = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)
const photos = ref<string[]>([])

// 공장/부서/라인 관련 상태
const selectedFactoryId = ref<number | null>(null)
const selectedDepartmentId = ref<number | null>(null)
const selectedLineId = ref<number | null>(null)

// 사용자 정보
const userName = ref(authStore.user?.name || '')

// 장비 목록 관련 상태
const equipments = ref<any[]>([])
const filteredEquipments = ref<any[]>([])

// SERIAL NO 선택 상태
const selectedSerialNo = ref('')

const form = ref<Maintenance>({
  serial_no: '',
  title: '',
  description: '',
  inspector: userName.value,
  factory: '',
  department: '',
  line: '',
  scheduled_date: new Date().toISOString().split('T')[0],
  photos: '[]',
  status: 'register',
  is_other: false
})

// maintenances를 ref로 변환
const maintenances = ref<Maintenance[]>([])
const { loading, error } = maintenanceStore

// computed 속성 수정
const filteredMaintenances = computed(() => {
  console.log('현재 maintenances 데이터:', maintenances.value)
  console.log('필터링된 데이터:', maintenances.value?.filter(m => m.status === 'register'))
  return maintenances.value?.filter(m => m.status === 'register') || []
})

// 초기화 함수
const initializeFactoryDepartment = () => {
  const userFactory = authStore.user?.factory || ''
  const userDepartment = authStore.user?.department || ''
  
  console.log('사용자 정보 초기화 시작')
  console.log('- 사용자 공장:', userFactory)
  console.log('- 사용자 부서:', userDepartment)
  
  // 공장 찾기
  const foundFactory = linesStore.lines.find(f => 
    f.name.replace(/\s+/g, '') === userFactory.replace(/\s+/g, '')
  )
  
  if (foundFactory) {
    console.log('공장 찾음:', foundFactory.name)
    selectedFactoryId.value = foundFactory.id
    form.value.factory = foundFactory.name
    
    // 부서 찾기
    const normalizedUserDept = userDepartment.replace(/\s+/g, '')
    const foundDepartment = linesStore.lines.find(d => 
      d.name.replace(/\s+/g, '') === normalizedUserDept
    )
    
    if (foundDepartment) {
      console.log('부서 찾음:', foundDepartment.name)
      selectedDepartmentId.value = foundDepartment.id
      form.value.department = foundDepartment.name
    }
  }
}

// computed 속성들
const factories = computed(() => {
  console.log('factories computed 실행')
  return linesStore.lines.filter(line => line.level === 1)
})

const departments = computed(() => {
  console.log('departments computed 실행 - selectedFactoryId:', selectedFactoryId.value)
  if (!selectedFactoryId.value) return []
  const factory = linesStore.lines.find(f => f.id === selectedFactoryId.value)
  return factory?.children || []
})

const lines = computed(() => {
  console.log('lines computed 실행 - selectedDepartmentId:', selectedDepartmentId.value)
  if (!selectedDepartmentId.value) return []
  const department = departments.value.find(d => d.id === selectedDepartmentId.value)
  return department?.children || []
})

// 핸들러 함수들
const handleFactoryChange = (event: any) => {
  console.log('=== handleFactoryChange 시작 ===')
  console.log('1. 받은 이벤트/값:', event)
  console.log('2. event.target?.value:', event.target?.value)
  
  const value = Number(event.target?.value)
  console.log('3. 변환된 value:', value)
  
  selectedFactoryId.value = value
  console.log('4. selectedFactoryId 설정됨:', selectedFactoryId.value)
  
  const factory = factories.value.find(f => f.id === value)
  console.log('5. 찾은 factory:', factory)
  
  if (factory) {
    form.value.factory = factory.name
    console.log('6. form.factory 설정됨:', form.value.factory)
  }
  
  // 부서/라인 초기화
  selectedDepartmentId.value = null
  selectedLineId.value = null
  form.value.department = ''
  form.value.line = ''
  filteredEquipments.value = [] // 장비 목록 초기화
  console.log('7. 부서/라인/장비목록 초기화 완료')
}

const handleDepartmentChange = (event: any) => {
  console.log('=== handleDepartmentChange 시작 ===')
  console.log('1. 받은 이벤트/값:', event)
  console.log('2. event.target?.value:', event.target?.value)
  
  const value = Number(event.target?.value)
  console.log('3. 변환된 value:', value)
  
  selectedDepartmentId.value = value
  console.log('4. selectedDepartmentId 설정됨:', selectedDepartmentId.value)
  
  const department = departments.value.find(d => d.id === value)
  console.log('5. 찾은 department:', department)
  
  if (department) {
    form.value.department = department.name
    console.log('6. form.department 설정됨:', form.value.department)
  }
  
  // 라인 초기화
  selectedLineId.value = null
  form.value.line = ''
  filteredEquipments.value = [] // 장비 목록 초기화
  console.log('7. 라인/장비목록 초기화 완료')
}

const handleLineChange = (event: any) => {
  console.log('=== handleLineChange 시작 ===')
  console.log('1. 받은 이벤트/값:', event)
  console.log('2. event.target?.value:', event.target?.value)
  
  const value = Number(event.target?.value)
  console.log('3. 변환된 value:', value)
  
  selectedLineId.value = value
  console.log('4. selectedLineId 설정됨:', selectedLineId.value)
  
  const line = lines.value.find(l => l.id === value)
  console.log('5. 찾은 line:', line)
  
  if (line) {
    form.value.line = line.name
    console.log('6. form.line 설정됨:', form.value.line)
    
    // 선택된 라인에 해당하는 장비들만 필터링
    filteredEquipments.value = equipments.value.filter(equipment => 
      equipment.factory === form.value.factory &&
      equipment.department === form.value.department &&
      equipment.product_model === line.name
    )
    console.log('7. 필터링된 장비 목록:', filteredEquipments.value)
  }
}

onMounted(async () => {
  try {
    console.log('1. 마운트 시작')
    
    // 라인 데이터 로드
    await linesStore.fetchLines()
    console.log('2. 라인 데이터 로드 완료')
    
    // 장비 데이터 로드
    console.log('3. 장비 데이터 로드 시작')
    await equipmentStore.fetchEquipmentsFromDatabase()
    equipments.value = equipmentStore.equipments
    
    // 유지보수 데이터 로드
    await maintenanceStore.fetchMaintenances()
    maintenances.value = maintenanceStore.maintenances
    console.log('4. 데이터 로드 완료')

  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
})

// SERIAL NO 선택 시 form 업데이트
const handleSerialNoChange = () => {
  if (selectedSerialNo.value === 'OTHER') {
    form.value.serial_no = 'OTHER';
    form.value.is_other = true;
    return;
  }

  form.value.is_other = false;
  const selectedEquipment = equipments.value.find(e => e.serial_no === selectedSerialNo.value);
  if (selectedEquipment) {
    form.value.serial_no = selectedEquipment.serial_no;
    form.value.factory = selectedEquipment.factory;
    form.value.department = selectedEquipment.department;
    form.value.line = selectedEquipment.product_model || '';
  }
}

const handleSubmit = async () => {
  // form.inspector 값 업데이트
  form.value.inspector = userName.value

  console.log('=== 폼 제출 시작 ===');
  console.log('1. 선택된 ID들:', {
    공장: selectedFactoryId.value,
    부서: selectedDepartmentId.value,
    라인: selectedLineId.value
  });

  // 위치 정보 설정
  if (selectedFactoryId.value) {
    const factory = factories.value.find(f => f.id === selectedFactoryId.value)
    if (factory) {
      form.value.factory = factory.name
      console.log('2. 공장 설정:', factory.name);
    }
  }
  
  if (selectedDepartmentId.value) {
    const department = departments.value.find(d => d.id === selectedDepartmentId.value)
    if (department) {
      form.value.department = department.name
      console.log('3. 부서 설정:', department.name);
    }
  }
  
  // 라인 정보 설정 수정
  if (selectedLineId.value) {
    const line = lines.value.find(l => l.id === selectedLineId.value)
    if (line) {
      console.log('4. 라인 찾음:', line)
      form.value.line = line.name
      console.log('5. 라인 설정 완료:', form.value.line)
    }
  } else if (form.value.is_other) {
    console.log('4. 기타 설비: 라인 정보 유지:', form.value.line)
  } else {
    console.log('4. 라인 미선택')
    form.value.line = ''
  }
  
  try {
    if (isEditing.value) {
      await maintenanceStore.updateMaintenance(form.value.id!, form.value)
    } else {
      await maintenanceStore.createMaintenance(form.value)
    }
    
    // 목록 새로고침
    await maintenanceStore.fetchMaintenances()
    maintenances.value = maintenanceStore.maintenances
    
    // 폼 초기화
    resetForm()
  } catch (error) {
    console.error('유지보수 등록/수정 실패:', error)
  }
}

const editMaintenance = (maintenance: any) => {
  form.value = { ...maintenance }
  photos.value = JSON.parse(maintenance.photos || '[]')
  isEditing.value = true  // 수정 모드로 설정
  
  // 장비 정보 찾기
  const equipment = equipments.value.find(e => e.serial_no === maintenance.serial_no)
  if (equipment) {
    // 공장/부서/라인 설정
    const factory = factories.value.find(f => f.name === equipment.factory)
    if (factory) {
      selectedFactoryId.value = factory.id
      form.value.factory = factory.name
      
      // 해당 공장의 부서 목록 추출
      const department = departments.value.find(d => d.name === equipment.department)
      if (department) {
        selectedDepartmentId.value = department.id
        form.value.department = department.name
        
        const line = lines.value.find(l => l.name === equipment.product_model)
        if (line) {
          selectedLineId.value = line.id
          form.value.line = line.name
          
          // 선택된 위치에 해당하는 장비들 필터링
          filteredEquipments.value = equipments.value.filter(e => 
            e.factory === form.value.factory &&
            e.department === form.value.department &&
            e.product_model === form.value.line
          )
        }
      }
    }
  }
  
  // SERIAL NO 설정은 필터링 후에 수행
  selectedSerialNo.value = maintenance.serial_no
}

const completeMaintenance = async (id: number) => {
  if (confirm('유지보수를 완료 처리하시겠습니까?')) {
    try {
      const maintenance = maintenances.value.find(m => m.id === id);
      if (!maintenance) return;

      await maintenanceStore.updateMaintenance(id, { 
        ...maintenance,
        status: 'completed',
        completed_date: new Date().toISOString().split('T')[0]
      });
      
      // 목록 새로고침
      await maintenanceStore.fetchMaintenances();
      maintenances.value = maintenanceStore.maintenances;
      
      console.log('유지보수 완료 처리됨:', id);
    } catch (error) {
      console.error('유지보수 완료 처리 실패:', error);
    }
  }
}

const deleteMaintenance = async (id: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await maintenanceStore.deleteMaintenance(id)
  }
}

const cancelForm = () => {
  resetForm()
}

const resetForm = () => {
  form.value = {
    serial_no: '',
    title: '',
    description: '',
    inspector: userName.value,
    factory: '',
    department: '',
    line: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    photos: '[]',
    status: 'register',
    is_other: false
  }
  photos.value = []
  selectedFactoryId.value = null
  selectedDepartmentId.value = null
  selectedLineId.value = null
  selectedSerialNo.value = ''
  isEditing.value = false
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'status-badge warning',
    in_progress: 'status-badge info',
    completed: 'status-badge success'
  }
  return classes[status] || 'status-badge secondary'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료'
  }
  return texts[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  for (const file of input.files) {
    if (!file.type.startsWith('image/')) continue

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        photos.value.push(result)
        form.value.photos = JSON.stringify(photos.value)
      }
    }
    reader.readAsDataURL(file)
  }
  
  // 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
  input.value = ''
}

const deletePhoto = (index: number) => {
  photos.value.splice(index, 1)
  form.value.photos = JSON.stringify(photos.value)
}

// watch로 값 변경 감지
watch(selectedFactoryId, (value) => {
  if (!value) {
    form.value.factory = ''
    form.value.department = ''
    form.value.line = ''
    return
  }
  const factory = factories.value.find(f => f.id === value)
  if (factory) {
    form.value.factory = factory.name
  }
})

watch(selectedDepartmentId, (value) => {
  if (!value) {
    form.value.department = ''
    form.value.line = ''
    return
  }
  const department = departments.value.find(d => d.id === value)
  if (department) {
    form.value.department = department.name
  }
})

watch(selectedLineId, (value) => {
  if (!value) {
    form.value.line = ''
    return
  }
  const line = lines.value.find(l => l.id === value)
  if (line) {
    form.value.line = line.name
  }
})
</script>

<style scoped>
.maintenance-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--mac-shadow);
  border: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.title-section h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.description-section {
  margin-top: 12px;
}

.description {
  margin: 0;
  color: #666;
}

.info-section {
  margin-top: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.info {
  background-color: #3498db;
}

.maintenance-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  max-width: 100%;
}

.form-section {
  background: var(--background-secondary);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
  min-width: 0; /* 추가: 자식 요소가 부모 너비를 초과하지 않도록 함 */
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.section-content {
  width: 100%;
  overflow: hidden; /* 추가: 내용이 넘치지 않도록 함 */
}

.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap; /* 추가: 라벨 텍스트가 줄바꿈되지 않도록 함 */
}

.mac-input {
  width: 100%;
  max-width: 100%; /* 추가: 입력 필드가 부모 너비를 초과하지 않도록 함 */
  padding: var(--space-8) var(--space-12);
  border: 1px solid #666666;
  border-radius: var(--radius-medium);
  background: var(--system-secondary-background);
  color: var(--system-text);
  font-size: 14px;
  transition: var(--transition-base);
  box-sizing: border-box; /* 추가: padding이 너비에 포함되도록 함 */
}

.mac-input:focus {
  outline: none;
  border-color: #666666;
}

.mac-input:hover:not(:focus) {
  border-color: #666666;
}

/* select 요소 스타일링 */
select.mac-input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  text-overflow: ellipsis; /* 추가: 긴 텍스트를 ...으로 표시 */
  white-space: nowrap; /* 추가: 텍스트가 줄바꿈되지 않도록 함 */
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding: 8px 32px 8px 8px;
  background-color: var(--select-background) !important;
  color: var(--system-text) !important;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #666666;
  border-radius: var(--radius-medium);
}

/* select 옵션 스타일링 */
select.mac-input option {
  background-color: var(--select-option-background) !important;
  color: var(--system-text) !important;
  padding: 8px 12px;
}

/* 호버/포커스 상태 */
select.mac-input option:hover,
select.mac-input option:focus,
select.mac-input option:active {
  background-color: var(--select-hover-background) !important;
  color: var(--system-text) !important;
}

.mac-input:disabled {
  background-color: var(--system-tertiary-background);
  border-color: var(--system-border);
  color: var(--system-secondary-text);
  cursor: not-allowed;
}

.mac-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.mac-button.primary {
  background-color: #3498db;
  color: white;
}

.mac-button.primary:hover {
  background-color: #2980b9;
}

.mac-button.secondary {
  background-color: #95a5a6;
  color: white;
}

.mac-button.secondary:hover {
  background-color: #7f8c8d;
}

.mac-button.success {
  background-color: #2ecc71;
  color: white;
}

.mac-button.success:hover {
  background-color: #27ae60;
}

.mac-button.danger {
  background-color: #e74c3c;
  color: white;
}

.mac-button.danger:hover {
  background-color: #c0392b;
}

.mac-button.small {
  padding: 4px 8px;
  font-size: 12px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.mac-table {
  width: 100%;
  border-collapse: collapse;
}

.mac-table th,
.mac-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--system-border);
  color: var(--system-text);
}

.mac-table th {
  font-weight: 600;
  background-color: var(--system-secondary-background);
  color: var(--system-text);
  border-bottom: 1px solid var(--system-border);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.info {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.success {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.photos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.photo-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.photo-delete:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.photo-upload {
  width: 120px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.photo-upload:hover {
  border-color: #3498db;
  background-color: rgba(52, 152, 219, 0.05);
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666;
}

.upload-icon {
  font-size: 24px;
  font-weight: 300;
}

.upload-text {
  font-size: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
}

/* 위치 정보 컨테이너 스타일 추가 */
.location-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group.full-width {
  width: 100%;
}

.select-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 36px;  /* 모든 select 컨테이너의 높이를 동일하게 설정 */
}

.mac-input {
  height: 36px !important;  /* 모든 입력 필드의 높이를 동일하게 설정 */
}

/* select 요소 스타일링 재정의 */
:deep(.mac-input) {
  width: 100% !important;
  height: 36px !important;
  padding: 8px 32px 8px 8px !important;
  font-size: 14px !important;
  border-radius: 4px !important;
  border: 1px solid #666666 !important;
  background-color: var(--input-background, #ffffff) !important;
  color: var(--system-text, #333333) !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  box-sizing: border-box !important;

  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 8px center !important;
  background-size: 16px !important;
}

:deep(.mac-input:hover:not(:disabled)) {
  border-color: #3498db !important;
}

:deep(.mac-input:focus) {
  outline: none !important;
  border-color: #3498db !important;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2) !important;
}

:deep(.mac-input:disabled) {
  background-color: var(--system-tertiary-background, #f5f5f5) !important;
  border-color: var(--system-border, #ddd) !important;
  color: var(--system-secondary-text, #999) !important;
  cursor: not-allowed !important;
}

:deep(.mac-input option) {
  background-color: var(--input-background, #ffffff) !important;
  color: var(--system-text, #333333) !important;
  padding: 8px !important;
  font-size: 14px !important;
  white-space: normal !important;
  word-wrap: break-word !important;
}

/* 모바일 반응형 스타일 */
@media screen and (max-width: 768px) {
  .maintenance-view {
    padding: 12px;
  }

  .location-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .glass-card {
    padding: 16px;
  }

  .form-section {
    padding: 12px;
    margin-bottom: 12px;
  }
}

.description-textarea {
  min-height: 200px;
  resize: vertical;
  line-height: 1.5;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  width: 100%;
}

.form-row .form-group {
  flex: 1;
  min-width: 0;
}

.form-group.full-width {
  width: 100%;
}
</style> 
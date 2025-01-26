<template>
  <div class="tools-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>공구/지그 등록</h1>
        </div>
        <div class="description-section">
          <p class="description">공구 및 지그의 기본 정보를 등록할 수 있습니다.</p>
        </div>
      </div>
    </div>

    <!-- 등록 폼 -->
    <div class="form-section glass-card">
      <div class="form-grid">
        <!-- 왼쪽 컬럼 -->
        <div class="left-column">
          <!-- 관리번호 & QR -->
          <div class="form-group code-group glass-inner-card">
            <div class="code-container">
              <div class="code-section">
                <label>관리번호</label>
                <input 
                  type="text" 
                  class="mac-input" 
                  v-model="formData.code"
                  placeholder="자동생성"
                  disabled
                />
              </div>
              <div class="qr-section">
                <QRCode
                  :value="formData.code"
                  :size="120"
                  level="H"
                  render-as="svg"
                />
              </div>
            </div>
          </div>

          <!-- 기본 정보 그룹 -->
          <div class="form-group glass-inner-card">
            <h3 class="section-title">기본 정보</h3>
            <div class="form-grid-2">
              <div class="input-group">
                <label>분류</label>
                <select class="mac-input" v-model="formData.category">
                  <option value="">선택하세요</option>
                  <option value="절삭공구">절삭공구</option>
                  <option value="측정공구">측정공구</option>
                  <option value="수공구">수공구</option>
                  <option value="전동공구">전동공구</option>
                  <option value="지그류">지그류</option>
                </select>
              </div>
              <div class="input-group">
                <label>품명</label>
                <input 
                  type="text" 
                  class="mac-input" 
                  v-model="formData.name"
                  placeholder="예: 엔드밀"
                />
              </div>
            </div>
            <div class="form-grid-2">
              <div class="input-group">
                <label>규격</label>
                <input 
                  type="text" 
                  class="mac-input" 
                  v-model="formData.specification"
                  placeholder="예: Φ10mm"
                />
              </div>
              <div class="input-group">
                <label>제조사</label>
                <input 
                  type="text" 
                  class="mac-input" 
                  v-model="formData.manufacturer"
                  placeholder="예: OSG"
                />
              </div>
            </div>
          </div>

          <!-- 보관위치 그룹 -->
          <div class="form-group location-group glass-inner-card">
            <h3 class="section-title">보관 위치</h3>
            <div class="location-grid">
              <div class="location-input">
                <template v-if="!isDirectInput.zone">
                  <label>구역</label>
                  <select class="mac-input" v-model="selectedLocation.zone" @change="handleLocationChange('zone')">
                    <option value="">선택하세요</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="direct">직접입력</option>
                  </select>
                </template>
                <template v-else>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      class="mac-input" 
                      v-model="formData.location.zone"
                      placeholder="구역 입력"
                      @blur="validateLocation('zone')"
                    />
                    <button class="mac-button small" @click="cancelDirectInput('zone')">
                      취소
                    </button>
                  </div>
                </template>
              </div>

              <div class="location-input">
                <template v-if="!isDirectInput.row">
                  <label>열</label>
                  <select class="mac-input" v-model="selectedLocation.row" @change="handleLocationChange('row')">
                    <option value="">선택하세요</option>
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                    <option value="direct">직접입력</option>
                  </select>
                </template>
                <template v-else>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      class="mac-input" 
                      v-model="formData.location.row"
                      placeholder="열 입력"
                      @blur="validateLocation('row')"
                    />
                    <button class="mac-button small" @click="cancelDirectInput('row')">
                      취소
                    </button>
                  </div>
                </template>
              </div>

              <div class="location-input">
                <template v-if="!isDirectInput.column">
                  <label>단</label>
                  <select class="mac-input" v-model="selectedLocation.column" @change="handleLocationChange('column')">
                    <option value="">선택하세요</option>
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                    <option value="direct">직접입력</option>
                  </select>
                </template>
                <template v-else>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      class="mac-input" 
                      v-model="formData.location.column"
                      placeholder="단 입력"
                      @blur="validateLocation('column')"
                    />
                    <button class="mac-button small" @click="cancelDirectInput('column')">
                      취소
                    </button>
                  </div>
                </template>
              </div>

              <div class="location-input">
                <template v-if="!isDirectInput.position">
                  <label>칸</label>
                  <select class="mac-input" v-model="selectedLocation.position" @change="handleLocationChange('position')">
                    <option value="">선택하세요</option>
                    <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                    <option value="direct">직접입력</option>
                  </select>
                </template>
                <template v-else>
                  <div class="input-with-button">
                    <input 
                      type="text" 
                      class="mac-input" 
                      v-model="formData.location.position"
                      placeholder="칸 입력"
                      @blur="validateLocation('position')"
                    />
                    <button class="mac-button small" @click="cancelDirectInput('position')">
                      취소
                    </button>
                  </div>
                </template>
              </div>
            </div>
            <div class="location-display" v-if="formattedLocation">
              <span class="location-label">현재 위치:</span>
              <span class="location-value">{{ formattedLocation }}</span>
            </div>
          </div>

          <!-- 재고/단가 그룹 -->
          <div class="form-group glass-inner-card">
            <h3 class="section-title">재고 정보</h3>
            <div class="form-grid-3">
              <div class="input-group">
                <label>현재고</label>
                <input 
                  type="number" 
                  class="mac-input" 
                  v-model="formData.currentStock"
                  placeholder=""
                  min="0"
                />
              </div>
              <div class="input-group">
                <label>안전재고</label>
                <input 
                  type="number" 
                  class="mac-input" 
                  v-model="formData.safetyStock"
                  placeholder=""
                  min="0"
                />
              </div>
              <div class="input-group">
                <label>단가</label>
                <input 
                  type="number" 
                  class="mac-input" 
                  v-model="formData.unitPrice"
                  placeholder=""
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽 컬럼 -->
        <div class="right-column">
          <!-- 이미지 업로드 섹션 -->
          <div class="form-group image-upload-group glass-inner-card">
            <h3 class="section-title">이미지</h3>
            <div class="image-upload-container">
              <div class="image-preview-grid">
                <div 
                  v-for="(preview, index) in imagePreviews" 
                  :key="index" 
                  class="image-preview-item"
                >
                  <img :src="preview.url" alt="미리보기" />
                  <button 
                    class="delete-button" 
                    @click="removeImage(index)"
                    type="button"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div 
                  v-if="imagePreviews.length < 10" 
                  class="image-upload-button"
                  @click="triggerFileInput"
                >
                  <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p>이미지 추가</p>
                  <span class="upload-hint">클릭하여 업로드</span>
                </div>
              </div>
              <input
                type="file"
                ref="fileInput"
                multiple
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
              />
              <p class="image-upload-help">
                <i class="fas fa-info-circle"></i>
                최대 10장까지 업로드 가능합니다
              </p>
            </div>
          </div>

          <!-- 공장/부서/라인 그룹 -->
          <div class="form-group factory-info-group glass-inner-card">
            <h3 class="section-title">위치 정보</h3>
            <div class="form-grid-3">
              <div class="input-group">
                <label>공장</label>
                <select 
                  class="mac-input" 
                  v-model="selectedFactoryId"
                  @change="handleFactoryChange"
                >
                  <option value="">선택하세요</option>
                  <option 
                    v-for="factory in factories" 
                    :key="factory.id" 
                    :value="factory.id"
                  >
                    {{ factory.name }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>부서</label>
                <select 
                  class="mac-input" 
                  v-model="selectedDepartmentId"
                  @change="handleDepartmentChange"
                  :disabled="!selectedFactoryId"
                >
                  <option value="">선택하세요</option>
                  <option 
                    v-for="department in departments" 
                    :key="department.id" 
                    :value="department.id"
                  >
                    {{ department.name }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>라인명</label>
                <select 
                  class="mac-input" 
                  v-model="selectedLineId"
                  @change="handleLineChange"
                  :disabled="!selectedDepartmentId"
                >
                  <option value="">선택하세요</option>
                  <option 
                    v-for="line in lines" 
                    :key="line.id" 
                    :value="line.id"
                  >
                    {{ line.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- 특이사항 -->
          <div class="form-group remarks-group glass-inner-card">
            <h3 class="section-title">특이사항</h3>
            <textarea 
              class="mac-input remarks-input" 
              v-model="formData.remarks"
              placeholder="특이사항을 입력하세요"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="mac-button primary" @click="handleSubmit">
          <i class="fas fa-save"></i>
          등록하기
        </button>
        <button class="mac-button secondary" @click="handleReset">
          <i class="fas fa-undo"></i>
          초기화
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import '@/styles/macBaseStyle.scss'
import { useLinesStore } from '@/stores/lines'
import type { Line } from '@/stores/lines'
import { useAuthStore } from '@/stores/auth'
import QRCode from 'qrcode.vue'
import { useToolsStore } from '@/stores/tools'

// 타입 정의
interface IsDirectInput {
  zone: boolean;
  row: boolean;
  column: boolean;
  position: boolean;
}

interface SelectedLocation {
  zone: string;
  row: string;
  column: string;
  position: string;
}

interface ImagePreview {
  url: string;
  file: File;
}

interface Location {
  zone: string;
  row: number | '';
  column: number | '';
  position: number | '';
}

interface FormData {
  [key: string]: any; // 인덱스 시그니처 추가
  code: string;
  category: string;
  name: string;
  specification: string;
  manufacturer: string;
  manager: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  location: Location;
  factory: string;
  department: string;
  lineName: string;
  remarks: string;
}

// 관리번호 생성 함수
const generateCode = () => {
  const prefix = 'ikm_'
  const randomNum = Math.random().toString().slice(2, 10)
  return prefix + randomNum
}

// 상태 관리
const isDirectInput = ref<IsDirectInput>({
  zone: false,
  row: false,
  column: false,
  position: false
})

const selectedLocation = ref<SelectedLocation>({
  zone: '',
  row: '',
  column: '',
  position: ''
})

const formData = ref<FormData>({
  code: generateCode(),
  category: '',
  name: '',
  specification: '',
  manufacturer: '',
  manager: '',
  currentStock: null as unknown as number,
  safetyStock: null as unknown as number,
  unitPrice: null as unknown as number,
  location: {
    zone: '',
    row: '',
    column: '',
    position: ''
  },
  factory: '',
  department: '',
  lineName: '',
  remarks: ''
})

const formattedLocation = computed(() => {
  const { zone, row, column, position } = formData.value.location
  if (!zone || !row || !column || !position) return ''
  return `${zone}-${row}-${column}-${position}`
})

const toolsStore = useToolsStore()

const handleSubmit = async () => {
  try {
    // 필수 필드 검증
    const requiredFields = {
      category: '분류',
      name: '품명',
      specification: '규격',
      currentStock: '현재고',
      safetyStock: '안전재고'
    }

    const emptyFields = []
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData.value[field]) {
        emptyFields.push(label)
      }
    }

    if (emptyFields.length > 0) {
      alert(`다음 필수 항목을 입력해주세요:\n${emptyFields.join('\n')}`)
      return
    }

    const toolData = {
      code: formData.value.code,
      category: formData.value.category,
      name: formData.value.name,
      specification: formData.value.specification,
      manufacturer: formData.value.manufacturer || undefined,
      manager: formData.value.manager || undefined,
      current_stock: Number(formData.value.currentStock),
      safety_stock: Number(formData.value.safetyStock),
      unit_price: formData.value.unitPrice ? Number(formData.value.unitPrice) : undefined,
      location_zone: formData.value.location.zone || undefined,
      location_row: formData.value.location.row ? String(formData.value.location.row) : undefined,
      location_column: formData.value.location.column ? String(formData.value.location.column) : undefined,
      location_position: formData.value.location.position ? String(formData.value.location.position) : undefined,
      factory: formData.value.factory || undefined,
      department: formData.value.department || undefined,
      line_name: formData.value.lineName || undefined,
      remarks: formData.value.remarks || undefined,
      images: imageFiles.value // 이미지 배열 전체 전송
    }

    // 디버깅용 로그
    console.log('폼 데이터 원본:', {
      factory: formData.value.factory,
      department: formData.value.department,
      lineName: formData.value.lineName
    })
    console.log('서버로 보내는 데이터:', toolData)

    await toolsStore.createTool(toolData)
    alert('저장되었습니다.')
    handleReset() // 폼 초기화
  } catch (error: any) {
    console.error('저장 실패:', error)
    alert('저장에 실패했습니다: ' + (error.response?.data?.error || '알 수 없는 오류가 발생했습니다.'))
  }
}

const handleReset = () => {
  formData.value = {
    code: generateCode(),
    category: '',
    name: '',
    specification: '',
    manufacturer: '',
    manager: '',
    currentStock: null as unknown as number,
    safetyStock: null as unknown as number,
    unitPrice: null as unknown as number,
    location: {
      zone: '',
      row: '',
      column: '',
      position: ''
    },
    factory: '',
    department: '',
    lineName: '',
    remarks: ''
  }
  // 직접입력 상태 초기화
  Object.keys(isDirectInput.value).forEach(key => {
    isDirectInput.value[key as keyof IsDirectInput] = false
  })
  // 선택값 초기화
  Object.keys(selectedLocation.value).forEach(key => {
    selectedLocation.value[key as keyof SelectedLocation] = ''
  })
  imagePreviews.value = []
  imageFiles.value = []
}

// 컴포넌트 마운트 시 초기 코드 생성
onMounted(() => {
  formData.value.code = generateCode()
})

const handleLocationChange = (type: 'zone' | 'row' | 'column' | 'position') => {
  const value = selectedLocation.value[type]
  if (value === 'direct') {
    isDirectInput.value[type] = true
    formData.value[`location_${type}`] = ''
  } else {
    formData.value[`location_${type}`] = value
  }
}

const validateLocation = (type: 'zone' | 'row' | 'column' | 'position') => {
  if (!String(formData.value[`location_${type}`]).trim()) {
    cancelDirectInput(type)
  }
}

const cancelDirectInput = (type: 'zone' | 'row' | 'column' | 'position') => {
  isDirectInput.value[type] = false
  selectedLocation.value[type] = ''
  formData.value[`location_${type}`] = ''
}

const authStore = useAuthStore()
const linesStore = useLinesStore()
const factories = ref<Line[]>([])
const departments = ref<Line[]>([])
const lines = ref<Line[]>([])

// select box를 위한 상태 추가
const selectedFactoryId = ref<number | ''>('')
const selectedDepartmentId = ref<number | ''>('')
const selectedLineId = ref<number | ''>('')

// 공장, 부서, 라인 데이터 로드 및 사용자 기본값 설정
onMounted(async () => {
  try {
    await linesStore.fetchLines()
    // 최상위 레벨(공장)만 필터링
    factories.value = linesStore.lines.filter(line => line.level === 1)
    
    // 사용자의 공장과 부서 정보
    const userFactory = authStore.user?.factory || ''
    const userDepartment = authStore.user?.department || ''

    // 공장 찾기 (띄어쓰기 고려)
    const foundFactory = factories.value.find(f => 
      f.name.replace(/\s+/g, '') === userFactory.replace(/\s+/g, '')
    )

    if (foundFactory) {
      selectedFactoryId.value = foundFactory.id
      formData.value.factory = foundFactory.name
      departments.value = foundFactory.children || []

      // 부서 찾기 (띄어쓰기 고려)
      const foundDepartment = departments.value.find(d => 
        d.name.replace(/\s+/g, '') === userDepartment.replace(/\s+/g, '')
      )

      if (foundDepartment) {
        selectedDepartmentId.value = foundDepartment.id
        formData.value.department = foundDepartment.name
        lines.value = foundDepartment.children || []
      }
    }
  } catch (error) {
    console.error('Error fetching lines:', error)
  }
})

// 공장 선택 시
const handleFactoryChange = (event: Event) => {
  const factoryId = selectedFactoryId.value
  if (factoryId) {
    const selectedFactory = linesStore.findLineById(linesStore.lines, factoryId)
    if (selectedFactory) {
      formData.value.factory = selectedFactory.name
      // 해당 공장의 부서 목록 가져오기
      departments.value = selectedFactory.children || []
      // 부서, 라인 초기화
      selectedDepartmentId.value = ''
      selectedLineId.value = ''
      formData.value.department = ''
      formData.value.lineName = ''
      lines.value = []
    }
  } else {
    formData.value.factory = ''
    formData.value.department = ''
    formData.value.lineName = ''
    departments.value = []
    lines.value = []
  }
}

// 부서 선택 시
const handleDepartmentChange = (event: Event) => {
  const departmentId = selectedDepartmentId.value
  if (departmentId) {
    const selectedDepartment = linesStore.findLineById(linesStore.lines, departmentId)
    if (selectedDepartment) {
      formData.value.department = selectedDepartment.name
      // 해당 부서의 라인 목록 가져오기
      lines.value = selectedDepartment.children || []
      // 라인 초기화
      selectedLineId.value = ''
      formData.value.lineName = ''
    }
  } else {
    formData.value.department = ''
    formData.value.lineName = ''
    lines.value = []
  }
}

// 라인 선택 시
const handleLineChange = (event: Event) => {
  const lineId = selectedLineId.value
  if (lineId) {
    const selectedLine = linesStore.findLineById(linesStore.lines, lineId)
    if (selectedLine) {
      formData.value.lineName = selectedLine.name
    }
  } else {
    formData.value.lineName = ''
  }
}

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreviews = ref<ImagePreview[]>([])
const imageFiles = ref<File[]>([])

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    const remainingSlots = 10 - imagePreviews.value.length
    const newFiles = files.slice(0, remainingSlots)

    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return
        imagePreviews.value.push({
          url: e.target.result as string,
          file
        })
        imageFiles.value.push(file)
      }
      reader.readAsDataURL(file)
    })

    // 입력 필드 초기화
    input.value = ''
  }
}

const removeImage = (index: number) => {
  imagePreviews.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.tools-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
}

.glass-card {
  background: var(--card-background);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.header {
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
}

.form-section {
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .left-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .mac-input, select {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      background: var(--input-background);
      color: var(--text-primary);
      
      &:focus {
        border-color: #3b82f6;
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      &::placeholder {
        color: var(--text-placeholder);
      }

      &:disabled {
        background: var(--input-disabled);
        color: var(--text-disabled);
        cursor: not-allowed;
      }
    }

    select {
      option {
        background: var(--input-background);
        color: var(--text-primary);
      }
    }

    &.location-group {
      .location-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 15px;
      }

      .location-input {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .location-input select {
        width: 100%;
        min-width: 0;
      }

      .location-display {
        margin-top: 8px;
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    &.manufacturer-manager-group {
      .input-pair {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }

    &.stock-price-group {
      .input-triple {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }

    &.factory-info-group {
      .input-triple {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }

    &.image-upload-group {
      margin-top: 1rem;
    }

    .image-upload-container {
      .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
        margin-top: 12px;
      }

      .image-preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-color);
        background: var(--surface-variant);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;

          &:hover {
            background: rgba(0, 0, 0, 0.8);
            transform: scale(1.1);
          }
        }
      }

      .image-upload-button {
        aspect-ratio: 1;
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--surface-variant);
        padding: 24px;

        .upload-icon {
          font-size: 32px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        p {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .upload-hint {
          font-size: 12px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        &:hover {
          border-color: var(--button-primary);
          background: var(--button-secondary-hover);

          .upload-icon {
            color: var(--button-primary);
            transform: scale(1.1);
          }

          p, .upload-hint {
            color: var(--button-primary);
          }
        }
      }

      .image-upload-help {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        font-size: 13px;
        color: var(--text-secondary);

        i {
          font-size: 14px;
        }
      }
    }

    &.remarks-group {
      .remarks-input {
        resize: vertical;
        min-height: 100px;
        line-height: 1.5;
      }
    }

    .mac-input[type="number"] {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;
    }
  }

  .form-actions {
    margin-top: 32px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 8px;

      .mac-button {
        width: 100%;
      }
    }

    .mac-button {
      padding: 8px 24px;
    }
  }
}

.glass-inner-card {
  background: var(--surface-variant);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(5px);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.input-group select,
.input-group input {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.mac-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: inherit;
}

.location-display {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--surface-variant);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);

  .location-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .location-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

:root {
  // Light mode
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-disabled: rgba(0, 0, 0, 0.38);
  --text-placeholder: rgba(0, 0, 0, 0.3);
  --border-color: rgba(0, 0, 0, 0.12);
  --input-background: #ffffff;
  --input-disabled: rgba(0, 0, 0, 0.04);
  --surface-variant: #ffffff;
  --card-background: rgba(255, 255, 255, 0.7);
  
  // 버튼 색상 - 라이트 모드
  --button-primary: #2563eb;
  --button-primary-hover: #1d4ed8;
  --button-secondary: #ffffff;
  --button-secondary-hover: #f8fafc;
}

.dark {
  // Dark mode
  --text-primary: rgba(255, 255, 255, 0.87);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-disabled: rgba(255, 255, 255, 0.38);
  --text-placeholder: rgba(255, 255, 255, 0.3);
  --border-color: rgba(255, 255, 255, 0.15);
  --input-background: rgba(30, 31, 34, 0.6);
  --input-disabled: rgba(30, 31, 34, 0.45);
  --surface-variant: rgba(30, 31, 34, 0.6);
  --card-background: rgba(30, 31, 34, 0.7);
  
  // 버튼 색상 - 다크 모드
  --button-primary: #3b82f6;
  --button-primary-hover: #2563eb;
  --button-secondary: rgba(30, 31, 34, 0.8);
  --button-secondary-hover: rgba(30, 31, 34, 0.9);
}

.code-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  .code-section {
    flex: 1;
  }

  .qr-section {
    flex-shrink: 0;
  }
}
</style> 
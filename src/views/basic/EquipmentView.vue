<template>
  <div class="equipment-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>설비 등록</h1>
        </div>
        <div class="description-section">
          <p class="description">설비의 기본 정보와 사진을 등록하여 체계적인 설비 관리가 가능합니다.</p>
          <div class="info-section">
            <span class="info-item">
              <span class="dot info"></span>
              정면 사진과 명판 사진을 등록해주세요!!
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="equipment-form glass-card">
      <div class="form-grid">
        <!-- 기본 정보 그룹 -->
        <div class="form-section">
          <h2 class="section-title">기본 정보</h2>
          <div class="section-content">
            <div class="form-group">
              <label>관리번호</label>
              <input v-model="form.management_no" type="text" class="mac-input" />
            </div>
            <div class="form-group">
              <label>설비명</label>
              <input v-model="form.name" type="text" class="mac-input" />
            </div>
            <div class="form-group">
              <label>MODEL</label>
              <input v-model="form.model" type="text" class="mac-input" />
            </div>
            <div class="form-group">
              <label>SERIAL NO</label>
              <input v-model="form.serial_no" type="text" class="mac-input" />
            </div>
          </div>
        </div>

        <!-- 제조/구매 정보 그룹 -->
        <div class="form-section">
          <h2 class="section-title">제조/구매 정보</h2>
          <div class="section-content">
            <div class="form-group">
              <label>제작업체</label>
              <input v-model="form.manufacturer" type="text" class="mac-input" />
            </div>
            <div class="form-group">
              <label>제조일</label>
              <input v-model="form.manufacture_date" type="date" class="mac-input" />
            </div>
            <div class="form-group">
              <label>구입일</label>
              <input v-model="form.purchase_date" type="date" class="mac-input" />
            </div>
            <div class="form-group">
              <label>유효년수</label>
              <input v-model="form.lifespan" type="number" class="mac-input" @input="handleLifespanInput" />
            </div>
          </div>
        </div>

        <!-- 설치/운영 정보 그룹 -->
        <div class="form-section">
          <h2 class="section-title">설치/운영 정보</h2>
          <div class="section-content">
            <div class="form-group">
              <label>공장</label>
              <select 
                class="mac-input" 
                v-model="selectedFactoryId" 
                @change="(e) => handleFactoryChange((e.target as HTMLSelectElement).value)"
              >
                <option :value="null">선택하세요</option>
                <option v-for="factory in factories" :key="factory.id" :value="factory.id">
                  {{ factory.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>설치장소</label>
              <input v-model="form.location" type="text" class="mac-input" />
            </div>
            <div class="form-group">
              <label>부서</label>
              <select 
                class="mac-input" 
                v-model="selectedDepartmentId" 
                @change="(e) => handleDepartmentChange((e.target as HTMLSelectElement).value)"
                :disabled="!selectedFactoryId"
              >
                <option :value="null">선택하세요</option>
                <option v-for="department in departments" :key="department.id" :value="department.id">
                  {{ department.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 제품 정보 그룹 -->
        <div class="form-section">
          <h2 class="section-title">제품 정보</h2>
          <div class="section-content">
            <div class="form-group">
              <label>제품모델</label>
              <select 
                class="mac-input" 
                v-model="selectedLineId" 
                @change="(e) => handleLineChange((e.target as HTMLSelectElement).value)"
                :disabled="!selectedDepartmentId"
              >
                <option :value="null">선택하세요</option>
                <option v-for="line in lines" :key="line.id" :value="line.id">
                  {{ line.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>고객사</label>
              <input v-model="form.client" type="text" class="mac-input" />
            </div>
          </div>
        </div>

        <!-- 사진 등록 그룹 -->
        <div class="form-section full-width">
          <h2 class="section-title">사진 등록</h2>
          <div class="section-content">
            <div class="image-preview-container">
              <!-- 기존 이미지 업로드 코드 유지 -->
              <div class="image-preview-box">
                <div class="preview-area" @click="triggerFrontImageUpload">
                  <input
                    type="file"
                    ref="frontImageInput"
                    accept="image/*"
                    @change="handleFrontImage"
                    class="hidden-input"
                  />
                  <template v-if="form.front_image">
                    <img :src="form.front_image" class="preview-image" />
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <span class="upload-icon">+</span>
                      <span class="upload-text">정면 사진</span>
                    </div>
                  </template>
                </div>
              </div>
              <div class="image-preview-box">
                <div class="preview-area" @click="triggerNameplateImageUpload">
                  <input
                    type="file"
                    ref="nameplateImageInput"
                    accept="image/*"
                    @change="handleNameplateImage"
                    class="hidden-input"
                  />
                  <template v-if="form.nameplate_image">
                    <img :src="form.nameplate_image" class="preview-image" />
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <span class="upload-icon">+</span>
                      <span class="upload-text">명판 사진</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="mac-button primary" @click="saveEquipment">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineExpose, computed } from 'vue'
import { useLinesStore } from '@/stores/lines'
import { useEquipmentStore } from '@/stores/equipment'
import type { Line, Equipment } from '@/types'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '@/stores/auth'

interface Factory {
  id: number
  name: string
  level?: number
}

interface Department {
  id: number
  name: string
}

interface ProductLine {
  id: number
  name: string
}

interface ExtendedLine extends Line {
  parent_id: number | null
  level: number
  status: 'active' | 'maintenance' | 'inactive'
  children?: ExtendedLine[]
}

const toast = useToast()
const equipmentStore = useEquipmentStore()
const authStore = useAuthStore()
const linesStore = useLinesStore()

const form = ref<Partial<Equipment>>({
  management_no: '',
  name: '',
  model: '',
  serial_no: '',
  manufacturer: '',
  manufacture_date: '',
  purchase_date: '',
  lifespan: null,
  factory: '',
  location: '',
  department: '',
  product_model: '',
  client: '',
  front_image: null,
  nameplate_image: null
})

const frontImageInput = ref<HTMLInputElement | null>(null)
const nameplateImageInput = ref<HTMLInputElement | null>(null)
const selectedFactoryId = ref<number | null>(null)
const selectedDepartmentId = ref<number | null>(null)
const selectedLineId = ref<number | null>(null)

const factories = computed<Factory[]>(() => {
  if (!Array.isArray(linesStore.lines)) {
    console.error('lines가 배열이 아님:', linesStore.lines)
    return []
  }
  
  return Array.from(new Set(linesStore.lines
    .filter(line => line.level === 1)
    .map(line => ({ id: line.id, name: line.name }))));
});

const departments = computed<Department[]>(() => {
  if (selectedFactoryId.value) {
    const selectedFactory = linesStore.lines.find(
      line => line.level === 1 && line.id === selectedFactoryId.value
    );
    if (selectedFactory?.children) {
      return Array.from(new Set(selectedFactory.children
        .filter(line => line.level === 2)
        .map(line => ({ id: line.id, name: line.name }))));
    }
  }
  return [];
});

const lines = computed<ProductLine[]>(() => {
  if (selectedDepartmentId.value) {
    const selectedFactory = linesStore.lines.find(
      line => line.level === 1 && line.id === selectedFactoryId.value
    );
    const selectedDepartment = selectedFactory?.children?.find(
      line => line.level === 2 && line.id === selectedDepartmentId.value
    );
    if (selectedDepartment?.children) {
      return Array.from(new Set(selectedDepartment.children
        .filter(line => line.level === 3)
        .map(line => ({ id: line.id, name: line.name }))));
    }
  }
  return [];
});

onMounted(async () => {
  try {
    await linesStore.fetchLines()
    console.log('Lines data:', JSON.stringify(linesStore.lines, null, 2))

    // 사용자 정보가 있는 경우 공장과 부서 설정
    if (authStore.user?.factory) {
      console.log('사용자 공장:', authStore.user.factory)
      
      // 공백을 제거하고 공장명 비교
      const userFactoryNoSpace = authStore.user.factory.replace(/\s+/g, '')
      const matchingFactory = factories.value.find(factory => 
        factory.name.replace(/\s+/g, '') === userFactoryNoSpace
      ) as Factory | undefined

      if (matchingFactory) {
        console.log('매칭된 공장:', matchingFactory)
        selectedFactoryId.value = matchingFactory.id
        form.value.factory = matchingFactory.name

        // 부서 정보가 있는 경우
        if (authStore.user.department) {
          console.log('사용자 부서:', authStore.user.department)
          
          // departments computed가 업데이트될 때까지 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const userDeptNoSpace = authStore.user.department.replace(/\s+/g, '')
          const matchingDept = departments.value.find(dept =>
            dept.name.replace(/\s+/g, '') === userDeptNoSpace
          ) as Department | undefined

          if (matchingDept) {
            console.log('매칭된 부서:', matchingDept)
            selectedDepartmentId.value = matchingDept.id
            form.value.department = matchingDept.name
          } else {
            console.log('매칭되는 부서를 찾을 수 없음')
          }
        }
      } else {
        console.log('매칭되는 공장을 찾을 수 없음')
      }
    }
  } catch (error) {
    console.error('라인 데이터 로드 실패:', error)
    toast.error('라인 데이터를 불러오는데 실패했습니다.')
  }
})

const handleFactoryChange = (value: string) => {
  console.log('Selected factory:', value);
  const factoryId = parseInt(value);
  selectedFactoryId.value = factoryId;
  selectedDepartmentId.value = null;
  selectedLineId.value = null;
  
  const selectedFactory = linesStore.lines.find(line => line.id === factoryId);
  form.value.factory = selectedFactory?.name || '';
  form.value.department = '';
  form.value.product_model = '';
};

const handleDepartmentChange = (value: string) => {
  console.log('Selected department:', value);
  const departmentId = parseInt(value);
  selectedDepartmentId.value = departmentId;
  selectedLineId.value = null;
  
  const selectedFactory = linesStore.lines.find(line => line.id === selectedFactoryId.value);
  const selectedDepartment = selectedFactory?.children?.find(line => line.id === departmentId);
  form.value.department = selectedDepartment?.name || '';
  form.value.product_model = '';
};

const handleLineChange = (value: string) => {
  console.log('Selected line:', value);
  const lineId = parseInt(value);
  selectedLineId.value = lineId;
  
  const selectedFactory = linesStore.lines.find(line => line.id === selectedFactoryId.value);
  const selectedDepartment = selectedFactory?.children?.find(line => line.id === selectedDepartmentId.value);
  const selectedLine = selectedDepartment?.children?.find(line => line.id === lineId);
  form.value.product_model = selectedLine?.name || '';
};

const triggerFrontImageUpload = () => {
  frontImageInput.value?.click()
}

const triggerNameplateImageUpload = () => {
  nameplateImageInput.value?.click()
}

const handleFrontImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        form.value.front_image = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleNameplateImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        form.value.nameplate_image = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleLifespanInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  // 숫자가 아닌 문자 제거
  input.value = input.value.replace(/[^0-9]/g, '')
  // 입력값이 있을 때만 숫자로 변환하여 저장
  form.value.lifespan = input.value ? parseInt(input.value) : null
}

const validateForm = () => {
  if (!form.value.serial_no) {
    toast.error('SERIAL NO는 필수 항목입니다.')
    return false
  }
  if (!form.value.front_image) {
    toast.error('정면 사진은 필수 항목입니다.')
    return false
  }
  if (!form.value.nameplate_image) {
    toast.error('명판 사진은 필수 항목입니다.')
    return false
  }
  return true
}

const saveEquipment = async () => {
  if (!validateForm()) return

  try {
    await equipmentStore.createEquipment(form.value)
    toast.success('설비가 성공적으로 등록되었습니다.')
    resetForm()
  } catch (error: any) {
    toast.error(error.response?.data?.error || '설비 등록에 실패했습니다.')
  }
}

const resetForm = () => {
  form.value = {
    management_no: '',
    name: '',
    model: '',
    serial_no: '',
    manufacturer: '',
    manufacture_date: '',
    purchase_date: '',
    lifespan: null,
    factory: '',
    location: '',
    department: '',
    product_model: '',
    client: '',
    front_image: null,
    nameplate_image: null
  }
  
  if (frontImageInput.value) frontImageInput.value.value = ''
  if (nameplateImageInput.value) nameplateImageInput.value.value = ''
}

// 템플릿에서 사용할 속성과 메서드 노출
defineExpose({
  form,
  frontImageInput,
  nameplateImageInput,
  factories,
  departments,
  lines,
  selectedFactoryId,
  selectedDepartmentId,
  selectedLineId,
  handleLifespanInput,
  handleFactoryChange,
  handleDepartmentChange,
  handleLineChange,
  triggerFrontImageUpload,
  triggerNameplateImageUpload,
  handleFrontImage,
  handleNameplateImage,
  saveEquipment
})
</script>

<style scoped lang="scss">
.equipment-view {
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      padding: 15px;
      
      .header-left {
        .title-section h1 {
          font-size: 20px;
        }
        
        .description-section {
          .description {
            font-size: 13px;
          }
          
          .info-section .info-item {
            font-size: 13px;
          }
        }
      }
    }

    .header-left {
      .title-section {
        margin-bottom: 8px;

        h1 {
          font-size: 24px;
          font-weight: 600;
          color: var(--system-text);
          margin: 0;
        }
      }

      .description-section {
        .description {
          color: var(--system-secondary-text);
          margin-bottom: 12px;
          font-size: 14px;
        }

        .info-section {
          display: flex;
          gap: 16px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--system-secondary-text);
            font-size: 14px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;

              &.info {
                background: var(--system-accent);
              }
            }
          }
        }
      }
    }
  }

  .equipment-form {
    padding: 20px;

    @media (max-width: 768px) {
      padding: 15px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    .form-section {
      background: var(--system-secondary-background);
      border-radius: 8px;
      padding: 20px;
      border: 1px solid var(--system-separator);

      &.full-width {
        grid-column: span 2;

        @media (max-width: 768px) {
          grid-column: span 1;
        }
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--system-text);
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--system-separator);
      }

      .section-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .form-group {
          margin: 0;
        }
      }
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;

      @media (max-width: 768px) {
        margin-top: 30px;
      }
    }
  }
}

.mac-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--system-separator);
  border-radius: 6px;
  font-size: 14px;
  background: var(--input-background);
  color: var(--system-text);
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;

  &:hover {
    border-color: var(--system-accent);
  }

  &:focus {
    outline: none;
    border-color: var(--system-accent);
  }

  option {
    background: var(--input-background);
    color: var(--system-text);
    padding: 8px;
  }
}

.mac-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &.primary {
    background: var(--system-accent);
    color: white;

    &:hover {
      background: var(--system-accent-dark);
    }

    &:disabled {
      background: var(--system-secondary-background);
      color: var(--system-secondary-text);
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 16px;
    width: 100%;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-preview-container {
  display: flex;
  gap: 20px;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    
    .image-preview-box {
      max-width: 100%;
    }
  }

  .image-preview-box {
    flex: 1;
    max-width: 300px;
    aspect-ratio: 4/3;
    
    .preview-area {
      width: 100%;
      height: 100%;
      border: 2px dashed var(--system-separator);
      border-radius: 8px;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      transition: all 0.2s;
      background: var(--system-background);

      &:hover {
        border-color: var(--system-accent);
      }

      .hidden-input {
        display: none;
      }

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 0;
        transform: scale(1.5);
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
      }

      .upload-placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: var(--system-secondary-text);

        .upload-icon {
          display: block;
          font-size: 32px;
          margin-bottom: 8px;
        }

        .upload-text {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
}

label {
  color: var(--system-text);
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}
</style> 
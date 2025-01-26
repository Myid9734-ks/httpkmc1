<template>
  <div class="edit-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>설비 수정</h1>
          </div>
        </div>
        <div class="header-right">
          <div class="button-group">
            <button class="mac-button primary" @click="saveEquipment">
              <span class="button-text">저장</span>
            </button>
            <button class="mac-button secondary" @click="goBack">
              <span class="button-text">취소</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 수정 폼 -->
    <div class="edit-content glass-card">
      <!-- 로딩 상태 표시 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>설비 정보를 불러오는 중...</p>
      </div>
      
      <template v-else>
        <!-- 기본 정보 섹션 -->
        <div class="edit-section">
          <h3>기본 정보</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>관리번호:</label>
              <input type="text" v-model="equipment.management_no" placeholder="관리번호 입력" />
            </div>
            <div class="form-item">
              <label>설비명:</label>
              <input type="text" v-model="equipment.name" placeholder="설비명 입력" />
            </div>
            <div class="form-item">
              <label>모델:</label>
              <input type="text" v-model="equipment.model" placeholder="모델명 입력" />
            </div>
            <div class="form-item">
              <label>시리얼번호:</label>
              <input type="text" v-model="equipment.serial_no" placeholder="시리얼번호 입력" />
            </div>
          </div>
        </div>

        <!-- 제조/구매 정보 섹션 -->
        <div class="edit-section">
          <h3>제조/구매 정보</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>제조사:</label>
              <input type="text" v-model="equipment.manufacturer" placeholder="제조사 입력" />
            </div>
            <div class="form-item">
              <label>제조일:</label>
              <input type="date" v-model="equipment.manufacture_date" />
            </div>
            <div class="form-item">
              <label>구입일:</label>
              <input type="date" v-model="equipment.purchase_date" />
            </div>
            <div class="form-item">
              <label>유효년수:</label>
              <input type="number" v-model="equipment.lifespan" placeholder="유효년수 입력" />
            </div>
          </div>
        </div>

        <!-- 설치 정보 섹션 -->
        <div class="edit-section">
          <h3>설치 정보</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>공장:</label>
              <select v-model="equipment.factory" class="mac-select" @change="handleFactoryChange">
                <option value="">공장 선택</option>
                <option v-for="factory in factories" :key="factory.id" :value="factory.name">
                  {{ factory.name }}
                </option>
              </select>
            </div>
            <div class="form-item">
              <label>설치장소:</label>
              <input type="text" v-model="equipment.location" placeholder="설치장소 입력" />
            </div>
            <div class="form-item">
              <label>부서:</label>
              <select v-model="equipment.department" class="mac-select" @change="handleDepartmentChange">
                <option value="">부서 선택</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.name">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="form-item">
              <label>제품모델:</label>
              <select v-model="equipment.product_model" class="mac-select">
                <option value="">제품모델 선택</option>
                <option v-for="model in productModels" :key="model.id" :value="model.name">
                  {{ model.name }}
                </option>
              </select>
            </div>
            <div class="form-item">
              <label>고객사:</label>
              <input type="text" v-model="equipment.client" placeholder="고객사 입력" />
            </div>
          </div>
        </div>

        <!-- 설비 사진 섹션 -->
        <div class="edit-section">
          <h3>설비 사진</h3>
          <div class="photos-grid">
            <div class="photo-item">
              <h4>정면 사진</h4>
              <div class="image-container">
                <img 
                  v-if="equipment.front_image"
                  :src="getImageUrl(equipment.front_image)" 
                  alt="설비 정면 사진"
                >
                <div v-else class="no-image">
                  이미지가 없습니다
                </div>
              </div>
              <input type="file" @change="handleFrontImageUpload" accept="image/*" />
            </div>
            <div class="photo-item">
              <h4>명판 사진</h4>
              <div class="image-container">
                <img 
                  v-if="equipment.nameplate_image"
                  :src="getImageUrl(equipment.nameplate_image)" 
                  alt="설비 명판 사진"
                >
                <div v-else class="no-image">
                  이미지가 없습니다
                </div>
              </div>
              <input type="file" @change="handleNameplateImageUpload" accept="image/*" />
            </div>
          </div>
        </div>

        <!-- 수리내역 섹션 -->
        <div class="edit-section">
          <h3>수리내역</h3>
          <div class="table-container">
            <table class="maintenance-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>보수일자</th>
                  <th>보수내역</th>
                  <th>보수자</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="5" class="empty-row">등록된 수리내역이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLinesStore } from '@/stores/lines'
import { useEquipmentStore } from '@/stores/equipment'
import '@/styles/macBaseStyle.scss'

const router = useRouter()
const route = useRoute()
const linesStore = useLinesStore()
const equipmentStore = useEquipmentStore()

const equipment = ref({
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

// 데이터 로딩 상태
const isLoading = ref(true)

// 공장 목록 (level 1)
const factories = computed(() => {
  return linesStore.lines.map(line => ({
    id: line.id,
    name: line.name
  }))
})

// 선택된 공장의 부서 목록 (level 2)
const departments = computed(() => {
  const depts = []
  const selectedFactory = linesStore.lines.find(
    factory => factory.name === equipment.value.factory
  )
  
  if (selectedFactory?.children) {
    selectedFactory.children.forEach(dept => {
      depts.push({
        id: dept.id,
        name: dept.name
      })
    })
  }
  return depts
})

// 선택된 부서의 제품 라인 목록 (level 3)
const productModels = computed(() => {
  const models = []
  const selectedFactory = linesStore.lines.find(
    factory => factory.name === equipment.value.factory
  )
  
  if (selectedFactory?.children) {
    const selectedDepartment = selectedFactory.children.find(
      dept => dept.name === equipment.value.department
    )
    
    if (selectedDepartment?.children) {
      selectedDepartment.children.forEach(line => {
        models.push({
          id: line.id,
          name: line.name
        })
      })
    }
  }
  return models
})

// 공장이 변경되면 부서와 제품모델 초기화
const handleFactoryChange = () => {
  equipment.value.department = ''
  equipment.value.product_model = ''
}

// 부서가 변경되면 제품모델 초기화
const handleDepartmentChange = () => {
  equipment.value.product_model = ''
}

// 기존 데이터 로드
const loadEquipmentData = async () => {
  const equipmentId = Number(route.params.id)
  if (equipmentId) {
    try {
      await equipmentStore.fetchEquipment(equipmentId)
      if (equipmentStore.currentEquipment) {
        // 기존 데이터로 폼 초기화
        Object.assign(equipment.value, equipmentStore.currentEquipment)
      }
    } catch (error) {
      console.error('설비 데이터 로드 실패:', error)
    } finally {
      isLoading.value = false
    }
  }
}

// 설비 정보 저장
const saveEquipment = async () => {
  try {
    await equipmentStore.updateEquipment(Number(route.params.id), equipment.value)
    // 설비 목록 새로고침
    await equipmentStore.fetchEquipments()
    router.push('/equipment/list')
  } catch (error) {
    console.error('설비 정보 업데이트 실패:', error)
  }
}

// 취소하고 돌아가기
const goBack = () => {
  router.push('/equipment/list')
}

// 이미지 URL 가져오기
const getImageUrl = (imageData) => {
  if (!imageData) return ''
  if (imageData.startsWith('http')) return imageData
  if (imageData.startsWith('data:')) return imageData
  return `data:image/jpeg;base64,${imageData}`
}

// 정면 사진 업로드 처리
const handleFrontImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result && typeof e.target.result === 'string') {
      equipment.value.front_image = e.target.result.split(',')[1]
    }
  }
  reader.readAsDataURL(file)
}

// 명판 사진 업로드 처리
const handleNameplateImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result && typeof e.target.result === 'string') {
      equipment.value.nameplate_image = e.target.result.split(',')[1]
    }
  }
  reader.readAsDataURL(file)
}

// onMounted 훅 수정
onMounted(async () => {
  await linesStore.fetchLines()
  await loadEquipmentData()
})
</script>

<style lang="scss" scoped>
.edit-view {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  // 로딩 상태 스타일
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--system-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    p {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .header {
    padding: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        .title-section {
          h1 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--mac-text);
          }
        }
      }
    }
  }

  .edit-content {
    padding: 20px;
    
    .edit-section {
      margin-bottom: 32px;
      padding: 24px;
      background: var(--mac-background);
      border-radius: var(--mac-radius);
      border: 1px solid var(--mac-border-color);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h3 {
        margin: 0 0 20px;
        font-size: 1.1rem;
        color: var(--mac-text);
        font-weight: 600;
      }
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      
      .form-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        label {
          color: var(--mac-text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        input, .mac-select {
          width: 100%;
          height: 40px;
          padding: 8px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--mac-radius-sm);
          background-color: #ffffff;
          color: var(--mac-text);
          font-size: 0.875rem;
          transition: all 0.2s ease;
          
          &:focus {
            outline: none;
            border-color: var(--mac-primary);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
          }
          
          &::placeholder {
            color: #94a3b8;
          }

          &[type="date"] {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }

          &[type="number"] {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            &::-webkit-inner-spin-button,
            &::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          }
        }

        .mac-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px;
          
          &::-ms-expand {
            display: none;
          }
        }
      }
    }
    
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      
      .photo-item {
        h4 {
          margin: 0 0 12px;
          font-size: 0.9rem;
          color: var(--mac-text-secondary);
          font-weight: 500;
        }
        
        .image-container {
          width: 100%;
          height: 300px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--mac-radius-sm);
          overflow: hidden;
          background: #ffffff;
          margin-bottom: 12px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 8px;
          }
          
          .no-image {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 0.875rem;
          }
        }
        
        input[type="file"] {
          width: 100%;
          height: 40px;
          padding: 8px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--mac-radius-sm);
          background: #ffffff;
          color: var(--mac-text);
          font-size: 0.875rem;
          cursor: pointer;
          
          &::-webkit-file-upload-button {
            height: 100%;
            padding: 0 12px;
            margin-right: 8px;
            border: none;
            border-right: 1.5px solid #e2e8f0;
            background: #f8fafc;
            color: var(--mac-text);
            font-size: 0.875rem;
            cursor: pointer;
            
            &:hover {
              background: #f1f5f9;
            }
          }
        }
      }
    }
  }

  .header-right {
    .button-group {
      display: flex;
      gap: 8px;
    }
  }

  // 반응형 스타일
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .photos-grid {
      grid-template-columns: 1fr !important;
    }

    .header {
      .header-content {
        .header-right {
          .button-group {
            display: flex;
            flex-direction: column;
            width: 100%;
            
            .mac-button {
              width: 100%;
            }
          }
        }
      }
    }
  }

  .table-container {
    overflow-x: auto;
    
    .maintenance-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        font-size: 0.875rem;
      }
      
      th {
        background-color: #f8fafc;
        font-weight: 600;
        color: var(--mac-text);
      }
      
      .empty-row {
        text-align: center;
        color: #94a3b8;
        padding: 24px;
      }
    }
  }
}
</style> 
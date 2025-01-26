<template>
  <div class="detail-view">
    <!-- 헤더 섹션 -->
    <div class="header glass-card">
      <div class="header-content">
        <div class="header-left">
          <div class="title-section">
            <h1>설비 상세 정보</h1>
          </div>
        </div>
        <div class="header-right">
          <div class="button-group">
            <button class="mac-button primary" @click="goToEdit">
              <span class="button-text">수정하기</span>
            </button>
            <button class="mac-button secondary" @click="goBack">
              <span class="button-text">목록으로</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div class="detail-content glass-card">
      <!-- 기본 정보 섹션 -->
      <div class="detail-section">
        <h3>기본 정보</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>관리번호:</label>
            <span>{{ equipment?.management_no || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>설비명:</label>
            <span>{{ equipment?.name || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>모델:</label>
            <span>{{ equipment?.model || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>시리얼번호:</label>
            <span>{{ equipment?.serial_no || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 제조/구매 정보 섹션 -->
      <div class="detail-section">
        <h3>제조/구매 정보</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>제조사:</label>
            <span>{{ equipment?.manufacturer || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>제조일:</label>
            <span>{{ formatDate(equipment?.manufacture_date) }}</span>
          </div>
          <div class="detail-item">
            <label>구입일:</label>
            <span>{{ formatDate(equipment?.purchase_date) }}</span>
          </div>
          <div class="detail-item">
            <label>유효년수:</label>
            <span>{{ equipment?.lifespan ? `${equipment.lifespan}년` : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 설치 정보 섹션 -->
      <div class="detail-section">
        <h3>설치 정보</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>공장:</label>
            <span>{{ equipment?.factory || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>설치장소:</label>
            <span>{{ equipment?.location || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>부서:</label>
            <span>{{ equipment?.department || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>제품모델:</label>
            <span>{{ equipment?.product_model || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>고객사:</label>
            <span>{{ equipment?.client || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 설비 사진 섹션 -->
      <div class="detail-section photos-section">
        <h3>설비 사진</h3>
        <div class="photos-grid">
          <div class="photo-item">
            <h4>정면 사진</h4>
            <div class="image-container">
              <img 
                v-if="equipment?.front_image"
                :src="getImageUrl(equipment.front_image)" 
                alt="설비 정면 사진"
                @click="showFullImage('front')"
              >
              <div v-else class="no-image">
                이미지가 없습니다
              </div>
            </div>
          </div>
          <div class="photo-item">
            <h4>명판 사진</h4>
            <div class="image-container">
              <img 
                v-if="equipment?.nameplate_image"
                :src="getImageUrl(equipment.nameplate_image)" 
                alt="설비 명판 사진"
                @click="showFullImage('nameplate')"
              >
              <div v-else class="no-image">
                이미지가 없습니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 설비보전 카드 섹션 -->
    <div class="detail-content glass-card">
      <div class="detail-section">
        <h3>설비보전 이력</h3>
        <table class="mac-table">
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
            <tr v-if="maintenances.length === 0">
              <td colspan="5" class="empty-message">등록된 보전 이력이 없습니다.</td>
            </tr>
            <tr v-else v-for="(item, index) in maintenances" 
                :key="item.id" 
                @click="handleRowClick(item)"
                class="clickable-row">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(item.scheduled_date) }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.inspector }}</td>
              <td>{{ item.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 전체화면 이미지 모달 -->
    <div v-if="showFullImageModal" class="modal full-image-modal" @click="closeFullImageModal">
      <div class="modal-content">
        <img 
          :src="fullImageSrc" 
          :alt="fullImageType === 'front' ? '설비 정면 사진' : '설비 명판 사진'"
        >
      </div>
    </div>

    <!-- 유지보수 상세 모달 -->
    <div v-if="showMaintenanceModal" class="modal-overlay" @click="closeMaintenanceModal">
      <div class="modal-content glass-card" @click.stop>
        <div class="modal-header">
          <h2>유지보수 상세 정보</h2>
          <button class="close-button" @click="closeMaintenanceModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedMaintenance">
          <div class="info-group">
            <div class="info-row">
              <span class="label">제목</span>
              <span class="value">{{ selectedMaintenance.title }}</span>
            </div>
            <div class="info-row">
              <span class="label">설명</span>
              <span class="value">{{ selectedMaintenance.description }}</span>
            </div>
            <div class="info-row">
              <span class="label">점검자</span>
              <span class="value">{{ selectedMaintenance.inspector }}</span>
            </div>
            <div class="info-row">
              <span class="label">공장</span>
              <span class="value">{{ selectedMaintenance.factory }}</span>
            </div>
            <div class="info-row">
              <span class="label">부서</span>
              <span class="value">{{ selectedMaintenance.department }}</span>
            </div>
            <div class="info-row">
              <span class="label">라인</span>
              <span class="value">{{ selectedMaintenance.line }}</span>
            </div>
            <div class="info-row">
              <span class="label">예정일</span>
              <span class="value">{{ formatDate(selectedMaintenance.scheduled_date) }}</span>
            </div>
            <div class="info-row">
              <span class="label">완료일</span>
              <span class="value">{{ formatDate(selectedMaintenance.completed_date) }}</span>
            </div>
          </div>

          <!-- 유지보수 사진 섹션 -->
          <div class="photos-section" v-if="maintenancePhotos.length > 0">
            <h3>유지보수 사진</h3>
            <div class="photos-grid">
              <div v-for="(photo, index) in maintenancePhotos" 
                   :key="index" 
                   class="photo-item"
                   @click="showMaintenancePhoto(photo)">
                <img :src="getImageUrl(photo)" alt="유지보수 사진">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipment'
import { useMaintenanceStore } from '@/stores/maintenance'
import '@/styles/macBaseStyle.scss'

const router = useRouter()
const route = useRoute()
const equipmentStore = useEquipmentStore()
const maintenanceStore = useMaintenanceStore()
const equipment = ref(null)
const maintenances = ref([])
const showFullImageModal = ref(false)
const fullImageSrc = ref('')
const fullImageType = ref('')
const showMaintenanceModal = ref(false)
const selectedMaintenance = ref(null)
const maintenancePhotos = ref([])

// 설비 정보 조회
const loadEquipment = async () => {
  try {
    console.log('설비 ID:', route.params.id)
    const data = await equipmentStore.fetchEquipment(Number(route.params.id))
    console.log('받아온 설비 데이터:', data)
    equipment.value = equipmentStore.currentEquipment
    await loadMaintenanceHistory()
  } catch (error) {
    console.error('설비 정보 로드 실패:', error)
    alert('설비 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}

// 설비보전 이력 조회
const loadMaintenanceHistory = async () => {
  if (!equipment.value?.serial_no) return
  
  try {
    const data = await maintenanceStore.getMaintenancesByEquipment(equipment.value.serial_no)
    maintenances.value = data
    console.log('로드된 유지보수 이력:', maintenances.value)
  } catch (error) {
    console.error('유지보수 이력 로드 실패:', error)
    maintenances.value = []
  }
}

// 목록으로 돌아가기
const goBack = () => {
  router.push('/equipment/list')
}

// 수정 페이지로 이동
const goToEdit = () => {
  router.push({
    path: `/equipment/edit/${route.params.id}`,
    query: { mode: 'edit' }
  })
}

// 전체화면 이미지 보기
const showFullImage = (type) => {
  if (!equipment.value) return
  
  fullImageType.value = type
  const imageData = type === 'front' ? equipment.value.front_image : equipment.value.nameplate_image
  fullImageSrc.value = getImageUrl(imageData)
  showFullImageModal.value = true
}

// 전체화면 이미지 모달 닫기
const closeFullImageModal = () => {
  showFullImageModal.value = false
  fullImageSrc.value = ''
  fullImageType.value = ''
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 이미지 URL 가져오기
const getImageUrl = (imageData) => {
  if (!imageData) return ''
  // Base64 문자열이 이미 data:image 형식을 포함하고 있는지 확인
  if (imageData.startsWith('data:image')) return imageData
  // Base64 문자열만 있는 경우 완전한 data URL 형식으로 변환
  return `data:image/jpeg;base64,${imageData}`
}

// 유지보수 상세 정보 조회
const showMaintenanceDetail = async (maintenance) => {
  try {
    const data = await maintenanceStore.getCompletedMaintenance(maintenance.id)
    selectedMaintenance.value = data
    // 사진 데이터 파싱
    maintenancePhotos.value = JSON.parse(data.photos || '[]')
    showMaintenanceModal.value = true
  } catch (error) {
    console.error('완료된 유지보수 정보 로드 실패:', error)
  }
}

// 모달 닫기
const closeMaintenanceModal = () => {
  showMaintenanceModal.value = false
  selectedMaintenance.value = null
}

// 테이블 행 클릭 이벤트 추가
const handleRowClick = (maintenance) => {
  showMaintenanceDetail(maintenance)
}

// 유지보수 사진 전체화면 보기
const showMaintenancePhoto = (photo) => {
  fullImageSrc.value = getImageUrl(photo)
  showFullImageModal.value = true
}

// 컴포넌트 마운트 시 설비 정보 조회
onMounted(() => {
  loadEquipment()
})
</script>

<style scoped lang="scss">
.detail-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.detail-content {
  padding: 20px;
  
  .detail-section {
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
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    
    .detail-item {
      display: flex;
      gap: 12px;
      align-items: center;
      
      label {
        min-width: 90px;
        color: var(--mac-text-secondary);
        font-weight: 500;
        font-size: 0.875rem;
      }
      
      span {
        flex: 1;
        color: var(--mac-text);
        padding: 8px 12px;
        background-color: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: var(--mac-radius-sm);
        font-size: 0.875rem;
        min-height: 40px;
        display: flex;
        align-items: center;
      }
    }
  }
  
  .photos-section {
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
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 8px;
            cursor: pointer;
            transition: transform 0.2s;
            
            &:hover {
              transform: scale(1.02);
            }
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
      }
    }
  }
}

.modal.full-image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  
  .modal-content {
    background: none;
    max-width: none;
    width: auto;
    height: auto;
    max-height: 90vh;
    padding: 0;
    
    img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
    }
    
    .close-button {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      
      &:hover {
        opacity: 0.8;
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
  .detail-grid {
    grid-template-columns: 1fr !important;
  }
  
  .photos-grid {
    grid-template-columns: 1fr !important;
  }

  .header {
    .header-content {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        width: 100%;
        
        .button-group {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 8px;
          
          .mac-button {
            width: 100%;
          }
        }
      }
    }
  }
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--mac-hover-background);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--mac-background);
  border-radius: var(--mac-radius);
  padding: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: var(--mac-text);
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--mac-text);
    
    &:hover {
      color: var(--mac-primary);
    }
  }
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 12px;
  
  .label {
    min-width: 80px;
    font-weight: bold;
    color: var(--mac-text-light);
  }
  
  .value {
    color: var(--mac-text);
  }
}

.photos-section {
  margin-top: 24px;
  
  h3 {
    margin-bottom: 16px;
    font-size: 1.1rem;
    color: var(--mac-text);
  }
  
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    
    .photo-item {
      aspect-ratio: 1;
      border-radius: var(--mac-radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--mac-border-color);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}
</style> 
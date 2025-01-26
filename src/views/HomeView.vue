<template>
  <div class="home-view">
    <!-- 히어로 섹션 -->
    <div class="hero-section glass-card">
      <div class="hero-content">
        <h1>스마트 공구 & 설비 관리 시스템</h1>
        <p>효율적인 공구 관리와 체계적인 설비 보전의 시작</p>
        <div class="hero-buttons">
          <button class="mac-button primary" @click="showGuide">자세히 보기</button>
        </div>
      </div>
    </div>

    <!-- 주요 기능 바로가기 -->
    <div class="quick-access glass-card">
      <h2>주요 기능</h2>
      <div class="quick-access-grid">
        <div class="quick-access-item" @click="navigateTo('equipment/maintenance')">
          <i class="fa-solid fa-wrench"></i>
          <span>설비보전등록</span>
        </div>
        <div class="quick-access-item" @click="navigateTo('equipment/inspection')">
          <i class="fa-solid fa-calendar-check"></i>
          <span>정기점검</span>
        </div>
        <div class="quick-access-item" @click="navigateTo('tools/inventory')">
          <i class="fa-solid fa-warehouse"></i>
          <span>공구재고현황</span>
        </div>
        <div class="quick-access-item" @click="navigateTo('tools/transaction')">
          <i class="fa-solid fa-right-left"></i>
          <span>입출고 처리</span>
        </div>
        <div class="quick-access-item" @click="navigateTo('handover/daily')">
          <i class="fa-solid fa-book"></i>
          <span>교대일지</span>
        </div>
      </div>
    </div>

    <!-- 실시간 현황 섹션 -->
    <div class="dashboard-grid">
      <!-- 알림 섹션 -->
      <div class="notifications glass-card">
        <h2>최근 알림</h2>
        <div v-if="notificationStore.loading" class="loading-state">
          알림을 불러오는 중...
        </div>
        <div v-else-if="notificationStore.error" class="error-state">
          {{ notificationStore.error }}
        </div>
        <div v-else class="notification-list">
          <div v-for="notification in recentNotifications" 
               :key="notification.id" 
               class="notification-item"
               :class="{ 'read': notification.read }"
               @click="notificationStore.markAsRead(notification.id)">
            <i :class="notification.icon"></i>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
          </div>
          <div v-if="recentNotifications.length === 0" class="empty-notifications">
            새로운 알림이 없습니다.
          </div>
        </div>
      </div>

      <!-- 설비 상태 -->
      <div class="equipment-status glass-card">
        <h2>설비 상태</h2>
        <div v-if="equipmentStore.loading" class="loading-state">
          데이터를 불러오는 중...
        </div>
        <div v-else-if="equipmentStore.error" class="error-state">
          {{ equipmentStore.error }}
        </div>
        <div v-else class="status-list">
          <div v-for="status in equipmentStatus" 
               :key="status.id" 
               class="status-item">
            <div class="status-header">
              <span class="status-name">{{ status.equipmentName }}</span>
              <span class="status-indicator maintenance">보전작업중</span>
            </div>
            <div class="status-details">
              <div>작업: {{ status.maintenanceTitle }}</div>
              <div>보수일: {{ formatDateTime(status.startTime) }}</div>
              <div>위치: {{ status.location }}</div>
              <div>점검자: {{ status.inspector }}</div>
            </div>
          </div>
          <div v-if="equipmentStatus.length === 0" class="empty-status">
            현재 진행중인 보전작업이 없습니다.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 자세히 보기 모달 -->
  <div v-if="showGuideModal" class="modal-overlay" @click="showGuideModal = false">
    <div class="modal-content glass-card" @click.stop>
      <div class="modal-header">
        <h2>스마트 공구 & 설비 관리 시스템 소개</h2>
        <button class="close-button" @click="showGuideModal = false">×</button>
      </div>
      <div class="modal-body">
        <div v-for="(section, index) in guideContent.sections" 
             :key="index" 
             class="guide-section">
          <h3>{{ section.title }}</h3>
          <ul>
            <li v-for="(item, itemIndex) in section.items" 
                :key="itemIndex">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { useEquipmentStore } from '@/stores/equipment';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Notification {
  id: number;
  icon: string;
  title: string;
  time: string;
}

const router = useRouter();
const notificationStore = useNotificationStore();
const equipmentStore = useEquipmentStore();
const showGuideModal = ref(false);

// 데이터
const recentNotifications = computed(() => notificationStore.recentNotifications);
const equipmentStatus = computed(() => equipmentStore.equipmentStatus);

// 자세히 보기 모달 데이터
const guideContent = {
  sections: [
    {
      title: '시스템 소개',
      items: [
        '공구 관리: 재고 현황, 입출고 관리, QR 코드 스캔',
        '설비 보전: 점검 일정, 정비 이력, 설비 매뉴얼',
        '실시간 모니터링: 설비 상태, 알림, 통계'
      ]
    },
    {
      title: '주요 기능',
      items: [
        '체계적인 공구 재고 관리',
        '설비 점검 일정 관리',
        '실시간 설비 상태 모니터링',
        'QR 코드를 통한 빠른 정보 확인'
      ]
    },
    {
      title: '시스템 장점',
      items: [
        '효율적인 재고 관리로 비용 절감',
        '체계적인 설비 관리로 수명 연장',
        '실시간 모니터링으로 신속한 대응',
        '데이터 기반 의사결정 지원'
      ]
    }
  ]
};

// 메서드
const navigateTo = (path: string) => {
  router.push({ path: '/' + path });
};

const showGuide = () => {
  showGuideModal.value = true;
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(value);
};

const formatDateTime = (dateStr: string) => {
  try {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return '-';
    }
    return format(date, 'MM/dd HH:mm', { locale: ko });
  } catch (error) {
    console.error('날짜 형식 변환 실패:', error);
    return '-';
  }
};

const loadNotifications = async () => {
  try {
    await notificationStore.fetchRecentNotifications();
  } catch (error) {
    console.error('알림을 불러오는데 실패했습니다:', error);
  }
};

// 라이프사이클 훅
onMounted(async () => {
  try {
    await Promise.all([
      notificationStore.fetchRecentNotifications(),
      equipmentStore.fetchEquipmentStatus()
    ]);
  } catch (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
  }
});
</script>

<style lang="scss">
@use '@/assets/styles/glass' as glass;

.home-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  height: 400px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2));
  position: relative;
  overflow: hidden;
}

.hero-content {
  z-index: 1;
}

.hero-section h1 {
  font-size: 2.5em;
  margin-bottom: 15px;
  color: var(--text-color);
}

.hero-section p {
  font-size: 1.2em;
  margin-bottom: 30px;
  color: var(--text-secondary);
}

.hero-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.quick-access {
  padding: 30px;
  margin-bottom: 30px;
}

.quick-access h2 {
  margin-bottom: 20px;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.quick-access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 15px;
  background: rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-access-item:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-5px);
}

.quick-access-item i {
  font-size: 2em;
  color: var(--accent-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.notifications, .equipment-status {
  padding: 20px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
}

.notification-item i {
  color: var(--accent-color);
}

.notification-time {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-name {
  font-weight: bold;
}

.status-indicator {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
}

.status-indicator.running {
  background: var(--success-color);
  color: white;
}

.status-indicator.maintenance {
  background: var(--warning-color);
  color: white;
}

.status-details {
  font-size: 0.9em;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .hero-section h1 {
    font-size: 2em;
  }

  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  padding: 0 10px;
}

.modal-body {
  padding: 20px;
}

.guide-section {
  margin-bottom: 30px;

  h3 {
    color: var(--accent-color);
    margin-bottom: 15px;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;

      &:before {
        content: "•";
        color: var(--accent-color);
        position: absolute;
        left: 0;
      }
    }
  }
}

.loading-state, .error-state {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.error-state {
  color: var(--error-color);
}
</style> 
<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <!-- 시스템 알림 -->
      <div v-if="notificationStore.systemNotification" 
           class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg"
           :class="{
             'bg-green-100 text-green-800': notificationStore.systemNotification.type === 'success',
             'bg-yellow-100 text-yellow-800': notificationStore.systemNotification.type === 'warning',
             'bg-red-100 text-red-800': notificationStore.systemNotification.type === 'error',
             'bg-blue-100 text-blue-800': notificationStore.systemNotification.type === 'info'
           }">
        {{ notificationStore.systemNotification.message }}
      </div>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEquipmentInspectionStore } from '@/stores/equipmentInspection'
import { useNotificationStore } from '@/stores/notification'
import NavBar from '@/components/NavBar.vue'

const authStore = useAuthStore()
const equipmentInspectionStore = useEquipmentInspectionStore()
const notificationStore = useNotificationStore()

onBeforeMount(() => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    authStore.token = token
    authStore.user = JSON.parse(user)
    authStore.isAuthenticated = true
  }
})

// D-day 체크 함수
const checkDdayInspections = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    // 점검 데이터 가져오기
    await equipmentInspectionStore.fetchInspections()
    
    // inspections가 배열인지 확인
    if (!Array.isArray(equipmentInspectionStore.inspections)) {
      console.error('D-day 체크 실패: inspections가 배열이 아님', {
        type: typeof equipmentInspectionStore.inspections,
        value: equipmentInspectionStore.inspections
      })
      return
    }
    
    const ddayItems = equipmentInspectionStore.inspections.filter(item => {
      if (!item || item.status !== 'pending') return false
      if (item.execution_due_date) return false
      
      const targetDate = new Date(item.scheduled_date)
      targetDate.setHours(0, 0, 0, 0)
      
      return targetDate.getTime() === today.getTime()
    })
    
    // D-day 항목에 대해 알림 전송
    for (const item of ddayItems) {
      await equipmentInspectionStore.sendInspectionNotification(item.id)
    }
  } catch (error) {
    console.error('D-day 체크 실패:', error)
  }
}

// 매일 자정에 체크하기 위한 타이머 설정
let timer: number | null = null

const setupDdayCheck = () => {
  // 즉시 한 번 체크
  checkDdayInspections()

  // 다음 자정까지의 시간 계산
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime()

  // 첫 실행을 자정에 맞추고, 그 이후 24시간마다 실행
  setTimeout(() => {
    checkDdayInspections()
    timer = setInterval(checkDdayInspections, 24 * 60 * 60 * 1000)
  }, timeUntilMidnight)
}

// 컴포넌트 마운트 시 타이머 설정
onMounted(() => {
  setupDdayCheck()
})

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer)
  }
})
</script>

<style>
/* 전역 스크롤바 스타일 */
html, body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Chrome, Safari and Opera */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-top: 80px; /* NavBar 높이 + 여유공간 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* Chrome, Safari and Opera */
.main-content::-webkit-scrollbar {
  display: none;
}
</style> 
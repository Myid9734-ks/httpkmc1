<template>
  <div class="inspection-view">
    <!-- 기존 템플릿 내용 -->
    <button 
      v-if="item.status === 'pending' && !item.execution_due_date"
      class="mac-button secondary small"
      @click="confirmNotification(item)"
    >
      알림전송
    </button>
  </div>
</template>

<script setup>
import { useEquipmentInspectionStore } from '@/stores/equipmentInspection'

const equipmentInspectionStore = useEquipmentInspectionStore()

const confirmNotification = (item) => {
  const message = `이 알림은 다음과 같은 용도로 사용됩니다:

1. 점검 담당자에게 예정된 점검 일정을 알립니다
2. 알림 전송 시점부터 5일 이내에 점검을 완료하도록 요청합니다
3. 실행기한이 설정되며, 기한 내 점검이 가능합니다

알림을 전송하시겠습니까?`

  if (window.confirm(message)) {
    equipmentInspectionStore.sendInspectionNotification(item.id)
  }
}
</script>

<style scoped>
.inspection-view {
  /* 스타일 내용 */
}
</style> 
<template>
  <div class="under-development-view">
    <div class="content glass-card">
      <div class="message-container">
        <div class="icon">
          <font-awesome-icon icon="tools" size="3x" />
        </div>
        <h2>개발 진행 중</h2>
        <p class="message">이 기능은 아직 개발 중입니다. 추후 업데이트될 예정입니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FontAwesome 아이콘 사용을 위한 import
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTools } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faTools)
</script>

<style lang="scss" scoped>
.under-development-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;

  .content {
    text-align: center;
    padding: 40px;
    max-width: 500px;
    width: 100%;

    .message-container {
      .icon {
        color: var(--primary-color);
        margin-bottom: 20px;
      }

      h2 {
        font-size: 24px;
        margin-bottom: 16px;
        color: var(--text-primary);
      }

      .message {
        font-size: 16px;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
  }
}
</style> 
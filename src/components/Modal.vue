<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content glass-card" @click.stop>
      <div class="modal-header">
        <slot name="header"></slot>
        <button class="close-button" @click="$emit('close')">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
      <div class="modal-body">
        <slot name="body"></slot>
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button class="mac-button secondary" @click="$emit('close')">닫기</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

// Font Awesome 아이콘 등록
library.add(faTimes)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--mac-background);
  border-radius: var(--mac-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--mac-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2, h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--mac-text);
  }
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--mac-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-button {
  background: none;
  border: none;
  color: var(--mac-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;

  &:hover {
    color: var(--mac-text);
  }
}
</style> 
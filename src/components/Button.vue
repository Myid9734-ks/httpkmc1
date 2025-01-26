<template>
  <button 
    class="button" 
    :class="type"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'primary'
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: linear-gradient(to bottom, #fff 0%, #f7f7f7 100%);
  color: #000000;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.button:hover {
  background: linear-gradient(to bottom, #f7f7f7 0%, #f1f1f1 100%);
}

.button:active {
  background: linear-gradient(to bottom, #f1f1f1 0%, #e8e8e8 100%);
  transform: translateY(0.5px);
}

.button.primary {
  background: linear-gradient(to bottom, #0D61FE 0%, #0956E9 100%);
  color: white;
  border: 0.5px solid rgba(0, 0, 0, 0.2);
}

.button.primary:hover {
  background: linear-gradient(to bottom, #1668FE 0%, #1057E9 100%);
}

.button.primary:active {
  background: linear-gradient(to bottom, #0956E9 0%, #084CD8 100%);
}

.button.secondary {
  background: linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%);
  color: #000000;
  border: 0.5px solid rgba(0, 0, 0, 0.15);
}

.button.danger {
  background: linear-gradient(to bottom, #FF453A 0%, #FF3B30 100%);
  color: white;
  border: 0.5px solid rgba(0, 0, 0, 0.2);
}

.button.danger:hover {
  background: linear-gradient(to bottom, #FF574E 0%, #FF4B42 100%);
}

.button.danger:active {
  background: linear-gradient(to bottom, #FF3B30 0%, #FF2D21 100%);
}
</style> 
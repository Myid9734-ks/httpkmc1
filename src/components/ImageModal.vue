<template>
  <div v-if="show" class="custom-image-modal-overlay" @click="close">
    <div class="custom-image-modal-wrapper">
      <div class="custom-image-modal-content" @click.stop>
        <img :src="imageSrc" :alt="imageAlt">
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  imageSrc: String,
  imageAlt: String
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.custom-image-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.custom-image-modal-wrapper {
  width: 50vw;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-image-modal-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-image-modal-content img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
</style> 
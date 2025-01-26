<template>
  <Button
    variant="ghost"
    size="small"
    :icon="currentTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'"
    @click="toggleTheme"
  >
    {{ currentTheme === 'dark' ? '라이트 모드' : '다크 모드' }}
  </Button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import Button from './Button.vue'

const { currentTheme, toggleTheme } = useTheme()
</script> 
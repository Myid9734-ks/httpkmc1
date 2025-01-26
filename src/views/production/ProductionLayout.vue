<template>
  <div class="production-layout">
    <nav class="sub-nav glass-card">
      <router-link 
        v-for="route in routes" 
        :key="route.path"
        :to="{ name: route.name }"
        class="nav-link"
      >
        {{ route.title }}
      </router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
const routes = [
  { 
    path: 'daily-plan',
    name: 'daily-plan',
    title: '일일 생산계획'
  },
  {
    path: 'period-plan',
    name: 'period-plan',
    title: '주간/월간 계획'
  },
  {
    path: 'performance-input',
    name: 'performance-input',
    title: '실적등록'
  },
  {
    path: 'performance-status',
    name: 'performance-status',
    title: '실적현황'
  }
]
</script>

<style lang="scss" scoped>
.production-layout {
  padding: 20px;
  
  .sub-nav {
    display: flex;
    gap: 20px;
    padding: 16px 20px;
    margin-bottom: 20px;

    .nav-link {
      text-decoration: none;
      color: var(--text-primary);
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--background-hover);
      }

      &.router-link-active {
        background-color: var(--primary-color);
        color: white;
      }
    }
  }
}
</style> 
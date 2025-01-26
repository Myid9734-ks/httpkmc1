<template>
  <nav class="glass-nav">
    <div class="nav-content">
      <div class="nav-left">
        <button class="menu-toggle" @click="toggleMobileMenu" v-show="isMobile">
          <font-awesome-icon :icon="['fas', 'bars']" />
        </button>
        <div class="logo">
          <img :src="logoSrc" alt="자동차 부품 관리 시스템" />
        </div>
      </div>
      
      <NavMenu :is-mobile-menu-open="isMobileMenuOpen" @close-mobile-menu="closeMobileMenu" />
      
      <div class="nav-right">
        <div class="user-section" v-if="authStore.isAuthenticated">
          <div class="user-menu" @click="toggleDropdown" ref="userMenuRef">
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-icon" :class="{ 'rotated': isDropdownOpen }" />
            </div>
            <div v-if="isDropdownOpen" class="dropdown-menu glass-card">
              <div class="dropdown-item" @click="goToProfile">
                <font-awesome-icon :icon="['fas', 'user']" />
                프로필 수정
              </div>
              <div v-if="authStore.user?.role === 'system_admin'" class="dropdown-item" @click="goToUserManagement">
                <font-awesome-icon :icon="['fas', 'users-cog']" />
                ID 관리
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="handleLogout">
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
                로그아웃
              </div>
            </div>
          </div>
        </div>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'">
          <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import NavMenu from './NavMenu.vue';
import { logger } from '@/utils/logger';
import ciKorImg from '@/assets/ci-kor-img.png';
import ciDarkImg from '@/assets/ci.png';

const router = useRouter();
const authStore = useAuthStore();
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const isDark = ref(localStorage.getItem('theme') === 'dark');
const isMobile = ref(window.innerWidth <= 768);

const logoSrc = computed(() => isDark.value ? ciDarkImg : ciKorImg);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const goToProfile = () => {
  logger.debug('프로필 페이지로 이동', {
    username: authStore.user?.username
  });
  router.push('/profile');
  isDropdownOpen.value = false;
  closeMobileMenu();
};

const goToUserManagement = () => {
  logger.debug('ID 관리 페이지로 이동', {
    username: authStore.user?.username
  });
  router.push('/user-management');
  isDropdownOpen.value = false;
  closeMobileMenu();
};

const handleLogout = async () => {
  logger.info('로그아웃 시도', {
    username: authStore.user?.username
  });
  await authStore.logout();
  isDropdownOpen.value = false;
  closeMobileMenu();
};

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    closeMobileMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  if (isDark.value) {
    document.documentElement.classList.add('dark-mode');
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1920px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--system-text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  padding-right: 1rem;

  img {
    height: 45px;
    width: auto;
    
    @media (max-width: 768px) {
      height: 35px;
    }
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
  
  .user-info {
    font-size: 0.9rem;
    color: var(--system-text);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
      padding: 0.25rem;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .user-name {
      @media (max-width: 768px) {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .dropdown-icon {
      font-size: 0.8rem;
      transition: transform 0.2s ease;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 200px;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    right: 1rem;
    width: calc(100% - 2rem);
    max-width: 300px;
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--system-text);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    color: var(--system-text);
    opacity: 0.7;
  }
  
  &:hover {
    background: rgba(0, 122, 255, 0.1);
    color: var(--system-accent);

    svg {
      color: var(--system-accent);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.dropdown-divider {
  height: 1px;
  background: var(--system-separator);
  margin: 0.5rem 0;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: inherit;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 4px;
  }
}

.theme-toggle:hover {
  opacity: 0.8;
}
</style> 
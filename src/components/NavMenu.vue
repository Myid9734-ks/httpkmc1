<template>
  <div class="nav-menu" :class="{ 'mobile': isMobile, 'open': isMobileMenuOpen }">
    <router-link to="/" class="menu-item" @click="handleMenuClick">
      <font-awesome-icon icon="home" />
      <span>홈</span>
    </router-link>
    <div class="menu-item dropdown" v-if="isSystemAdmin" ref="dropdownRef"
         :class="{ 'active': isDropdownOpen }">
      <div class="dropdown-trigger" @click="toggleDropdown"
           :class="{ 'active': isDropdownOpen }">
        <font-awesome-icon icon="cog" />
        <span>기본</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isDropdownOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isDropdownOpen">
        <router-link to="/basic/equipment" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="industry" />
          <span>설비등록</span>
        </router-link>
        <router-link to="/basic/tools" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="tools" />
          <span>공구등록</span>
        </router-link>
        <router-link to="/basic/lines" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="stream" />
          <span>라인등록</span>
        </router-link>
        <router-link to="/basic/processes" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="tasks" />
          <span>공정등록</span>
        </router-link>
        <router-link to="/basic/inspections" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="clipboard-check" />
          <span>정기점검 등록</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item dropdown" ref="productionRef"
         :class="{ 'active': isProductionOpen }">
      <div class="dropdown-trigger" @click="toggleProduction"
           :class="{ 'active': isProductionOpen }">
        <font-awesome-icon icon="industry" />
        <span>생산</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isProductionOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isProductionOpen">
        <router-link to="/production/daily-plan" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="calendar-day" />
          <span>일일 생산계획</span>
        </router-link>
        <router-link to="/production/period-plan" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="calendar-week" />
          <span>주간/월간 계획</span>
        </router-link>
        <router-link to="/production/performance-input" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="edit" />
          <span>실적등록</span>
        </router-link>
        <router-link to="/production/performance-status" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="chart-line" />
          <span>실적현황</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item dropdown" ref="documentsRef"
         :class="{ 'active': isDocumentsOpen }">
      <div class="dropdown-trigger" @click="toggleDocuments"
           :class="{ 'active': isDocumentsOpen }">
        <font-awesome-icon icon="file-alt" />
        <span>문서</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isDocumentsOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isDocumentsOpen">
        <router-link to="/documents/work-daily" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="clipboard-list" />
          <span>작업일보</span>
        </router-link>
        <router-link to="/documents/equipment-check" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="tasks" />
          <span>설비일상점검</span>
        </router-link>
        <router-link to="/documents/self-inspection" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="check-square" />
          <span>자주검사</span>
        </router-link>
        <router-link to="/documents/tool-change" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="tools" />
          <span>공구교환일지</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item dropdown" ref="equipmentMgmtRef"
         :class="{ 'active': isEquipmentMgmtOpen }">
      <div class="dropdown-trigger" @click="toggleEquipmentMgmt"
           :class="{ 'active': isEquipmentMgmtOpen }">
        <font-awesome-icon icon="industry" />
        <span>설비</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isEquipmentMgmtOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isEquipmentMgmtOpen">
        <router-link to="/equipment/list" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="list" />
          <span>전체설비목록</span>
        </router-link>
        <router-link to="/equipment/maintenance" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="tools" />
          <span>설비보전등록</span>
        </router-link>
        <router-link to="/equipment/inspection" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="clipboard-check" />
          <span>정기점검</span>
        </router-link>
        <router-link to="/equipment/transfer" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="exchange-alt" />
          <span>이관/삭제설비</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item dropdown" ref="toolMgmtRef"
         :class="{ 'active': isToolMgmtOpen }">
      <div class="dropdown-trigger" @click="toggleToolMgmt"
           :class="{ 'active': isToolMgmtOpen }">
        <font-awesome-icon icon="tools" />
        <span>공구</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isToolMgmtOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isToolMgmtOpen">
        <router-link to="/tools/inventory" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="box" />
          <span>공구 재고 현황</span>
        </router-link>
        <router-link to="/tools/transaction" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="exchange-alt" />
          <span>입출고 처리</span>
        </router-link>
        <router-link to="/tools/order" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="shopping-cart" />
          <span>발주관리</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item dropdown" ref="handoverRef"
         :class="{ 'active': isHandoverOpen }">
      <div class="dropdown-trigger" @click="toggleHandover"
           :class="{ 'active': isHandoverOpen }">
        <font-awesome-icon icon="handshake" />
        <span>교대</span>
        <font-awesome-icon 
          icon="chevron-down" 
          class="dropdown-arrow"
          :class="{ 'rotated': isHandoverOpen }" 
        />
      </div>
      <div class="dropdown-menu glass-card" v-show="isHandoverOpen">
        <router-link to="/handover/daily" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="clipboard" />
          <span>교대 일지</span>
        </router-link>
        <router-link to="/handover/history" class="dropdown-item" @click="handleMenuClick">
          <font-awesome-icon icon="history" />
          <span>교대일지 이력</span>
        </router-link>
      </div>
    </div>
    <div class="menu-item" @click="openTelegramModal">
      <font-awesome-icon icon="paper-plane" />
      <span>메세지 전송</span>
    </div>
  </div>
  <!-- 텔레그램 메시지 모달 -->
  <div class="modal" v-if="isTelegramModalOpen">
    <div class="modal-content glass-card">
      <h3>텔레그램 메시지 전송</h3>
      
      <!-- 수신자 선택 -->
      <div class="receiver-select">
        <label class="radio-label">
          <input 
            type="radio" 
            v-model="messageType" 
            value="personal"
            name="messageType"
          >
          <span>개인 메시지</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            v-model="messageType" 
            value="group"
            name="messageType"
          >
          <span>단체 메시지</span>
        </label>
      </div>

      <textarea 
        v-model="telegramMessage" 
        placeholder="전송할 메시지를 입력하세요..."
        rows="4"
      ></textarea>
      <div class="modal-buttons">
        <button @click="sendTelegramMessage" :disabled="!telegramMessage.trim()">
          전송
        </button>
        <button @click="closeTelegramModal" class="cancel">
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import client from '@/api/client'
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const props = defineProps<{
  isMobileMenuOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'closeMobileMenu'): void
}>()

const route = useRoute()
const authStore = useAuthStore()
const isSystemAdmin = computed(() => authStore.user?.role === 'system_admin')
const isDropdownOpen = ref(false)
const isHandoverOpen = ref(false)
const isProductionOpen = ref(false)
const isDocumentsOpen = ref(false)
const isEquipmentMgmtOpen = ref(false)
const isToolMgmtOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const handoverRef = ref<HTMLElement | null>(null)
const productionRef = ref<HTMLElement | null>(null)
const documentsRef = ref<HTMLElement | null>(null)
const equipmentMgmtRef = ref<HTMLElement | null>(null)
const toolMgmtRef = ref<HTMLElement | null>(null)
const isMobile = ref(window.innerWidth <= 768)

// 라우트 변경 감지하여 메뉴 닫기
watch(
  () => route.path,
  () => {
    isDropdownOpen.value = false
    isHandoverOpen.value = false
    isProductionOpen.value = false
    isDocumentsOpen.value = false
    isEquipmentMgmtOpen.value = false
    isToolMgmtOpen.value = false
  }
)

const updateDropdownPosition = (event: MouseEvent, dropdownMenu: HTMLElement) => {
  const trigger = event.currentTarget as HTMLElement;
  const rect = trigger.getBoundingClientRect();
  dropdownMenu.style.left = `${rect.left}px`;
  
  // 화면 오른쪽 끝에서 넘치는지 확인
  const dropdownRight = rect.left + dropdownMenu.offsetWidth;
  if (dropdownRight > window.innerWidth) {
    dropdownMenu.style.left = `${window.innerWidth - dropdownMenu.offsetWidth - 20}px`;
  }
};

const toggleDropdown = (event: MouseEvent) => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value && dropdownRef.value) {
    const menu = dropdownRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isHandoverOpen.value = false;
  isProductionOpen.value = false;
  isDocumentsOpen.value = false;
};

const toggleHandover = (event: MouseEvent) => {
  isHandoverOpen.value = !isHandoverOpen.value;
  if (isHandoverOpen.value && handoverRef.value) {
    const menu = handoverRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isDropdownOpen.value = false;
  isProductionOpen.value = false;
  isDocumentsOpen.value = false;
};

const toggleProduction = (event: MouseEvent) => {
  isProductionOpen.value = !isProductionOpen.value;
  if (isProductionOpen.value && productionRef.value) {
    const menu = productionRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isDropdownOpen.value = false;
  isHandoverOpen.value = false;
  isDocumentsOpen.value = false;
};

const toggleDocuments = (event: MouseEvent) => {
  isDocumentsOpen.value = !isDocumentsOpen.value;
  if (isDocumentsOpen.value && documentsRef.value) {
    const menu = documentsRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isDropdownOpen.value = false;
  isHandoverOpen.value = false;
  isProductionOpen.value = false;
};

const toggleEquipmentMgmt = (event: MouseEvent) => {
  isEquipmentMgmtOpen.value = !isEquipmentMgmtOpen.value;
  if (isEquipmentMgmtOpen.value && equipmentMgmtRef.value) {
    const menu = equipmentMgmtRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isDropdownOpen.value = false;
  isHandoverOpen.value = false;
  isProductionOpen.value = false;
  isDocumentsOpen.value = false;
};

const toggleToolMgmt = (event: MouseEvent) => {
  isToolMgmtOpen.value = !isToolMgmtOpen.value;
  if (isToolMgmtOpen.value && toolMgmtRef.value) {
    const menu = toolMgmtRef.value.querySelector('.dropdown-menu') as HTMLElement;
    if (menu) updateDropdownPosition(event, menu);
  }
  isDropdownOpen.value = false;
  isHandoverOpen.value = false;
  isProductionOpen.value = false;
  isDocumentsOpen.value = false;
  isEquipmentMgmtOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
  if (handoverRef.value && !handoverRef.value.contains(event.target as Node)) {
    isHandoverOpen.value = false
  }
  if (productionRef.value && !productionRef.value.contains(event.target as Node)) {
    isProductionOpen.value = false
  }
  if (documentsRef.value && !documentsRef.value.contains(event.target as Node)) {
    isDocumentsOpen.value = false
  }
  if (equipmentMgmtRef.value && !equipmentMgmtRef.value.contains(event.target as Node)) {
    isEquipmentMgmtOpen.value = false
  }
  if (toolMgmtRef.value && !toolMgmtRef.value.contains(event.target as Node)) {
    isToolMgmtOpen.value = false
  }
}

const handleMenuClick = () => {
  if (isMobile.value) {
    emit('closeMobileMenu')
    isDropdownOpen.value = false
    isHandoverOpen.value = false
    isProductionOpen.value = false
    isDocumentsOpen.value = false
    isEquipmentMgmtOpen.value = false
    isToolMgmtOpen.value = false
  }
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isDropdownOpen.value = false
    isHandoverOpen.value = false
    isProductionOpen.value = false
    isDocumentsOpen.value = false
  }
}

// 텔레그램 관련 상태
const telegramMessage = ref('');
const isTelegramModalOpen = ref(false);
const messageType = ref('personal'); // 기본값은 개인 메시지

// 모달 열기/닫기
const openTelegramModal = () => {
  isTelegramModalOpen.value = true;
};

const closeTelegramModal = () => {
  isTelegramModalOpen.value = false;
  telegramMessage.value = '';
};

// 메시지 전송
const toast = useToast();
const sendTelegramMessage = async () => {
  try {
    await client.post('/telegram/send-message', {
      message: telegramMessage.value,
      type: messageType.value
    })
    console.log('텔레그램 메시지 전송 성공')
    toast.success('메시지가 성공적으로 전송되었습니다.', {
      position: 'top-right',
      duration: 3000,
      dismissible: true
    });
    closeTelegramModal();
  } catch (error) {
    console.error('텔레그램 메시지 전송 실패:', error)
    toast.error('메시지 전송에 실패했습니다.', {
      position: 'top-right',
      duration: 3000,
      dismissible: true
    });
  }
};

const isDarkMode = computed(() => document.documentElement.getAttribute('data-theme') === 'dark');

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.nav-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-left: 1rem;
  font-size: 0.85rem;
  max-width: calc(100vw - 400px);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--system-separator);
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: none;
    background: var(--system-background);
    margin: 0;
    padding: 1rem;
    flex-direction: column;
    gap: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 999;
    overflow-y: auto;
    overflow-x: hidden;
    
    &.open {
      transform: translateX(0);
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--system-text);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    border-radius: 0;
    border-bottom: 1px solid var(--system-separator);
    
    &:last-child {
      border-bottom: none;
    }
  }

  &:hover {
    background: var(--system-secondary-background);
    color: var(--system-text);
  }

  &.router-link-active {
    color: var(--system-text);
    background: var(--system-secondary-background);
  }

  svg {
    font-size: 1rem;
    min-width: 1rem;
    color: var(--system-text);
  }
}

.dropdown {
  cursor: pointer;
  height: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
  }
}

.dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dropdown-arrow {
  font-size: 0.8rem;
  margin-left: auto;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: fixed;
  top: 60px;
  min-width: 180px;
  padding: 0.4rem;
  border-radius: 6px;
  z-index: 1000;
  background: var(--system-menu-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    position: static;
    box-shadow: none;
    background: none;
    padding: 0 0 0 1rem;
    min-width: 0;
    width: 100%;
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  color: var(--system-text);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-decoration: none;

  svg {
    width: 14px;
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
    border-radius: 0;
  }
}

.dropdown-item.router-link-active {
  color: var(--system-accent);
  background: var(--system-secondary-background);
  
  svg {
    color: var(--system-accent);
    opacity: 1;
  }
}

.dropdown.active {
  color: var(--system-accent);
  background: rgba(255, 255, 255, 0.2);
}

.dropdown-trigger.active {
  color: var(--system-accent);
}

.telegram-button {
  // 이 스타일 블록 전체 삭제
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: var(--system-background);
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  top: 0;
  transform: none;
  color: var(--system-text);
  border: 1px solid var(--system-separator);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-content textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--system-separator);
  border-radius: 4px;
  margin-bottom: 15px;
  resize: vertical;
  background: var(--system-background);
  color: var(--system-text);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-buttons button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.modal-buttons button:first-child {
  background: var(--system-accent, #007bff);
  color: white;
  
  &:hover {
    background: var(--system-accent-dark, #0056b3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--system-secondary-background);
  }
}

.modal-buttons button.cancel {
  background: transparent;
  color: var(--system-text);
  border: 1px solid var(--system-separator);
  
  &:hover {
    background: var(--system-secondary-background);
  }
}

.receiver-select {
  margin-bottom: 15px;
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--system-text);
  
  input[type="radio"] {
    cursor: pointer;
  }
  
  span {
    font-size: 0.9rem;
  }
}
</style> 
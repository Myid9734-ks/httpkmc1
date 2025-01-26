<template>
  <div class="user-management-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>사용자 관리</h1>
          <span class="item-count">총 {{ users?.length || 0 }}명</span>
        </div>
        <div class="description-section">
          <p class="description">사용자 계정의 상태와 권한을 관리할 수 있습니다.</p>
          <div class="status-info">
            <span class="status-item">
              <span class="dot success"></span>
              활성화
            </span>
            <span class="status-item">
              <span class="dot warning"></span>
              대기중
            </span>
            <span class="status-item">
              <span class="dot danger"></span>
              비활성화
            </span>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="search-box">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.6667 14.6667L10.5 10.5M12 6.66667C12 9.61334 9.61334 12 6.66667 12C3.72 12 1.33333 9.61334 1.33333 6.66667C1.33333 3.72 3.72 1.33333 6.66667 1.33333C9.61334 1.33333 12 3.72 12 6.66667Z" 
                stroke="currentColor" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
            </svg>
          </span>
          <input 
            type="text" 
            class="mac-input" 
            v-model="searchQuery"
            placeholder="사용자 검색..."
          />
        </div>
      </div>
    </div>

    <div class="user-content glass-card">
      <!-- 데스크톱 테이블 뷰 -->
      <table class="mac-table desktop-only">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>공장</th>
            <th>부서</th>
            <th>직위</th>
            <th>역할</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.factory }}</td>
            <td>{{ user.department }}</td>
            <td>{{ user.position }}</td>
            <td>
              <select 
                class="mac-select compact" 
                :value="user.role"
                @change="(e) => updateRole(user.id, (e.target as HTMLSelectElement).value as 'user' | 'admin' | 'system_admin')"
                :disabled="currentUser?.id === user.id"
              >
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
                <option value="system_admin">시스템 관리자</option>
              </select>
            </td>
            <td>
              <span class="mac-badge" :class="getStatusClass(user.status)">
                <span class="status-dot"></span>
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="currentUser?.id !== user.id"
                  class="mac-button"
                  :class="user.status === 'inactive' ? 'secondary' : 'danger'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.status === 'inactive' ? '계정 활성화' : '계정 비활성화' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 모바일 카드 뷰 -->
      <div class="mobile-cards mobile-only">
        <div v-for="user in filteredUsers" 
             :key="user.id" 
             class="user-card glass-card"
        >
          <div class="card-header">
            <span class="mac-badge" :class="getStatusClass(user.status)">
              <span class="status-dot"></span>
              {{ getStatusText(user.status) }}
            </span>
            <button v-if="currentUser?.id !== user.id" 
                    class="menu-button"
                    @click="showActionMenu(user)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor" stroke="currentColor" stroke-width="2"/>
                <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">ID:</span>
              <span class="value">{{ user.username }}</span>
            </div>
            <div class="info-row">
              <span class="label">이름:</span>
              <span class="value">{{ user.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">공장:</span>
              <span class="value">{{ user.factory }}</span>
            </div>
            <div class="info-row">
              <span class="label">부서:</span>
              <span class="value">{{ user.department }}</span>
            </div>
            <div class="info-row">
              <span class="label">직위:</span>
              <span class="value">{{ user.position }}</span>
            </div>
            <div class="info-row">
              <span class="label">역할:</span>
              <select 
                class="mac-select compact" 
                :value="user.role"
                @change="(e) => updateRole(user.id, (e.target as HTMLSelectElement).value as 'user' | 'admin' | 'system_admin')"
                :disabled="currentUser?.id === user.id"
              >
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
                <option value="system_admin">시스템 관리자</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 모바일 액션 메뉴 -->
    <div v-if="selectedUser" class="mobile-action-menu" :class="{ 'show': showMenu }">
      <div class="menu-backdrop" @click="hideActionMenu"></div>
      <div class="menu-content">
        <div class="menu-header">
          <h3>{{ selectedUser.name }}</h3>
          <button class="close-button" @click="hideActionMenu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="menu-items">
          <button 
            class="menu-item"
            :class="selectedUser.status === 'inactive' ? 'secondary' : 'danger'"
            @click="handleMenuAction"
          >
            {{ selectedUser.status === 'inactive' ? '계정 활성화' : '계정 비활성화' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import '@/styles/macBaseStyle.scss'
import '@/styles/components/table.scss'
import '@/styles/responsive.scss'

interface User {
  id: number
  username: string
  name: string
  email: string
  factory: string
  department: string
  position: string
  role: 'user' | 'admin' | 'system_admin'
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  last_login: string | null
}

const authStore = useAuthStore()
const { user: currentUser } = storeToRefs(authStore)

const users = ref<User[]>([])
const searchQuery = ref('')

// 사용자 목록 조회
const loadUsers = async () => {
  try {
    const response = await authStore.getUsers()
    users.value = response.users
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
  }
}

// 검색 결과 필터링
const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.department.toLowerCase().includes(query)
  )
})

// 상태 변경
const updateStatus = async (userId: number, newStatus: 'pending' | 'active' | 'inactive') => {
  try {
    await authStore.updateUserStatus(userId, newStatus)
    await loadUsers() // 목록 새로고침
  } catch (error) {
    console.error('상태 변경 실패:', error)
  }
}

// 역할 변경
const updateRole = async (userId: number, newRole: 'user' | 'admin' | 'system_admin') => {
  try {
    await authStore.updateUserRole(userId, newRole)
    await loadUsers() // 목록 새로고침
  } catch (error) {
    console.error('역할 변경 실패:', error)
  }
}

// 상태에 따른 클래스
const getStatusClass = (status: 'pending' | 'active' | 'inactive') => {
  return {
    'success': status === 'active',
    'warning': status === 'pending',
    'danger': status === 'inactive'
  }
}

// 상태 텍스트 변환
const getStatusText = (status: 'pending' | 'active' | 'inactive') => {
  const statusMap = {
    'active': '활성화',
    'pending': '대기중',
    'inactive': '비활성화'
  } as const
  return statusMap[status]
}

// 계정 비활성화 확인
const confirmDeactivate = async (user: User) => {
  if (!confirm(`${user.name}(${user.username}) 계정을 비활성화하시겠습니까?`)) {
    return
  }
  
  try {
    await authStore.updateUserStatus(user.id, 'inactive')
    await loadUsers() // 목록 새로고침
  } catch (error) {
    console.error('계정 비활성화 실패:', error)
  }
}

// 계정 활성화/비활성화 토글
const toggleUserStatus = async (user: User) => {
  const newStatus = user.status === 'inactive' ? 'active' : 'inactive'
  const actionText = newStatus === 'inactive' ? '비활성화' : '활성화'
  
  if (!confirm(`${user.name}(${user.username}) 계정을 ${actionText}하시겠습니까?`)) {
    return
  }
  
  try {
    await authStore.updateUserStatus(user.id, newStatus)
    await loadUsers() // 목록 새로고침
  } catch (error) {
    console.error(`계정 ${actionText} 실패:`, error)
  }
}

// 모바일 메뉴 관련 상태
const showMenu = ref(false)
const selectedUser = ref<User | null>(null)

// 메뉴 표시
const showActionMenu = (user: User) => {
  selectedUser.value = user
  showMenu.value = true
}

// 메뉴 숨기기
const hideActionMenu = () => {
  showMenu.value = false
  setTimeout(() => {
    selectedUser.value = null
  }, 300) // 애니메이션 완료 후 선택된 사용자 초기화
}

// 메뉴 액션 처리
const handleMenuAction = async () => {
  if (!selectedUser.value) return
  
  await toggleUserStatus(selectedUser.value)
  hideActionMenu()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="scss">
.user-management-view {
  padding: 2rem;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    margin-bottom: 1rem;

    .header-left {
      .title-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;

        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .item-count {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }

      .description-section {
        .description {
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
        }

        .status-info {
          display: flex;
          gap: 1rem;

          .status-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-secondary);

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;

              &.success { background-color: var(--success); }
              &.warning { background-color: var(--warning); }
              &.danger { background-color: var(--danger); }
            }
          }
        }
      }
    }

    .actions {
      .search-box {
        position: relative;
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6B7280;
        }
        
        input.mac-input {
          padding-left: 40px;
          background: var(--card-background);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          backdrop-filter: blur(8px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          
          &:focus {
            background: var(--card-background);
            border-color: var(--system-accent);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
          }
          
          &::placeholder {
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .user-content {
    padding: 0.5rem;
    
    .mac-table {
      width: 100%;
    }
  }
}

// 모바일 카드 스타일
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .user-card {
    padding: 1rem;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      .menu-button {
        background: none;
        border: none;
        padding: 0.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    
    .card-content {
      .info-row {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--mac-border);
        
        &:last-child {
          border-bottom: none;
        }
        
        .label {
          width: 80px;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .value {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .mac-select {
          width: 100%;
        }
      }
    }
  }
}

// 모바일 액션 메뉴
.mobile-action-menu {
  position: fixed;
  inset: 0;
  z-index: 1000;
  visibility: hidden;
  
  &.show {
    visibility: visible;
    
    .menu-backdrop {
      opacity: 1;
    }
    
    .menu-content {
      transform: translateY(0);
    }
  }
  
  .menu-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .menu-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: 16px 16px 0 0;
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 0.3s;
    
    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--mac-border);
      
      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
      }
      
      .close-button {
        background: none;
        border: none;
        padding: 0.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        
        &:hover {
          color: var(--text-primary);
        }
      }
    }
    
    .menu-items {
      .menu-item {
        width: 100%;
        padding: 1rem;
        text-align: left;
        background: none;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &.danger {
          color: var(--danger);
          
          &:hover {
            background-color: var(--danger-bg);
          }
        }
        
        &.secondary {
          color: var(--text-primary);
          
          &:hover {
            background-color: var(--mac-hover);
          }
        }
      }
    }
  }
}
</style> 
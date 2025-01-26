<template>
  <div class="profile-container">
    <h1>프로필 관리</h1>
    <div class="content glass-card">
      <form @submit.prevent="handleSubmit" class="profile-form">
        <!-- 기본 정보 섹션 -->
        <div class="form-section">
          <div class="section-title">기본 정보</div>
          <div class="form-grid">
            <div class="form-group">
              <label>사용자 ID</label>
              <input
                v-model="formData.username"
                type="text"
                class="mac-input"
                disabled
                required
              />
            </div>
            <div class="form-group">
              <label>이름</label>
              <input
                v-model="formData.name"
                type="text"
                class="mac-input"
                required
              />
            </div>
            <div class="form-group">
              <label>이메일</label>
              <input
                v-model="formData.email"
                type="email"
                class="mac-input"
                required
              />
            </div>
          </div>
        </div>

        <!-- 소속 정보 섹션 -->
        <div class="form-section">
          <div class="section-title">소속 정보</div>
          <div class="form-grid">
            <div class="form-group">
              <label>공장</label>
              <input
                v-model="formData.factory"
                type="text"
                class="mac-input"
                required
              />
            </div>
            <div class="form-group">
              <label>부서</label>
              <input
                v-model="formData.department"
                type="text"
                class="mac-input"
                required
              />
            </div>
            <div class="form-group">
              <label>직책</label>
              <input
                v-model="formData.position"
                type="text"
                class="mac-input"
                required
              />
            </div>
          </div>
        </div>

        <!-- 비밀번호 변경 섹션 -->
        <div class="form-section">
          <div class="section-title">비밀번호 변경</div>
          <div class="form-grid">
            <div class="form-group">
              <label>현재 비밀번호</label>
              <input
                v-model="formData.currentPassword"
                type="password"
                class="mac-input"
                placeholder="변경하려면 입력하세요"
              />
            </div>
            <div class="form-group">
              <label>새 비밀번호</label>
              <input
                v-model="formData.newPassword"
                type="password"
                class="mac-input"
                placeholder="새 비밀번호"
                :disabled="!formData.currentPassword"
              />
            </div>
            <div class="form-group">
              <label>새 비밀번호 확인</label>
              <input
                v-model="formData.newPasswordConfirm"
                type="password"
                class="mac-input"
                placeholder="새 비밀번호 확인"
                :disabled="!formData.currentPassword"
              />
            </div>
          </div>
        </div>

        <!-- 버튼 섹션 -->
        <div class="form-section">
          <div class="form-grid">
            <div class="form-group full-width">
              <div class="button-group">
                <button type="submit" class="btn-primary" :disabled="isLoading">
                  {{ isLoading ? '저장 중...' : '저장' }}
                </button>
                <button type="button" class="btn-secondary" @click="handleCancel">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 메시지 표시 -->
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logger } from '@/utils/logger'

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const formData = ref({
  username: '',
  name: '',
  email: '',
  factory: '',
  department: '',
  position: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: ''
})

// 폼 초기화 함수
const initForm = () => {
  const user = authStore.user
  if (!user) {
    error.value = '사용자 정보를 불러올 수 없습니다.'
    return
  }

  formData.value = {
    username: user.username,
    name: user.name,
    email: user.email,
    factory: user.factory,
    department: user.department,
    position: user.position,
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  }
  
  // 메시지 초기화
  error.value = ''
  success.value = ''
}

onMounted(() => {
  initForm()
})

const handleSubmit = async () => {
  try {
    error.value = ''
    success.value = ''
    isLoading.value = true

    // 기본 데이터
    const updateData: {
      name: string
      email: string
      factory: string
      department: string
      position: string
      currentPassword?: string
      newPassword?: string
    } = {
      name: formData.value.name,
      email: formData.value.email,
      factory: formData.value.factory,
      department: formData.value.department,
      position: formData.value.position
    }

    // 새 비밀번호와 현재 비밀번호가 모두 입력된 경우에만 비밀번호 변경
    if (formData.value.newPassword && formData.value.currentPassword) {
      if (formData.value.newPassword !== formData.value.newPasswordConfirm) {
        error.value = '새 비밀번호가 일치하지 않습니다.'
        isLoading.value = false
        return
      }

      if (formData.value.newPassword.length < 6) {
        error.value = '비밀번호는 6자 이상이어야 합니다.'
        isLoading.value = false
        return
      }

      // 비밀번호 변경 시에만 추가
      updateData.currentPassword = formData.value.currentPassword
      updateData.newPassword = formData.value.newPassword

      logger.info('비밀번호 변경 시도', {
        hasCurrentPassword: true,
        hasNewPassword: true
      })
    }

    await authStore.updateProfile(updateData)
    
    // 비밀번호 필드 초기화
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.newPasswordConfirm = ''

    // 비밀번호가 변경된 경우
    if (updateData.currentPassword && updateData.newPassword) {
      let countdown = 3;
      success.value = `비밀번호가 변경되었습니다. ${countdown}초 후 자동으로 로그아웃됩니다.`
      
      const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          success.value = `비밀번호가 변경되었습니다. ${countdown}초 후 자동으로 로그아웃됩니다.`
        } else {
          clearInterval(timer)
          alert('비밀번호가 변경되었습니다.\n새 비밀번호로 다시 로그인해주세요.')
          success.value = '새 비밀번호로 다시 로그인해주세요.'
          authStore.logout()
        }
      }, 1000)
    } else {
      success.value = '프로필이 성공적으로 업데이트되었습니다.'
    }
  } catch (err: any) {
    error.value = err.message || '프로필 업데이트에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 취소 버튼 처리
const handleCancel = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2rem;
    text-align: center;
  }

  .content {
    background: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
}

.profile-form {
  .form-section {
    margin-bottom: 2rem;
    
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }
  }

  .form-group {
    margin-bottom: 1.25rem;
    
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      background: var(--input-background);
      color: var(--text-primary);
      
      &:focus {
        outline: none;
        border-color: #2563EB;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
      }
      
      &:disabled {
        background: var(--background-secondary);
        border-color: var(--border-color);
        color: var(--text-secondary);
      }

      &::placeholder {
        color: var(--text-secondary);
      }
    }
  }
}

.button-group {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;

  button {
    min-width: 6rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    
    &.btn-primary {
      background: #2563EB;
      color: white;
      border: none;
      
      &:hover:not(:disabled) {
        background: #1D4ED8;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    &.btn-secondary {
      background: var(--input-background);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      
      &:hover {
        background: var(--background-secondary);
      }
    }
  }
}

.error-message {
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.625rem 0.75rem;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 6px;
}

.success-message {
  color: #059669;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.625rem 0.75rem;
  background: #D1FAE5;
  border: 1px solid #6EE7B7;
  border-radius: 6px;
}
</style> 
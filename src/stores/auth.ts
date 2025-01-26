import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, updateProfile as updateProfileApi, getUsers as getUsersApi } from '@/api/auth'
import type { UpdateProfileResponse, LoginCredentials } from '@/api/auth'
import router from '@/router'
import { logger } from '@/utils/logger'

// User 타입 정의
interface User {
  id: number
  username: string
  name: string
  email: string
  factory: string
  department: string
  position: string
  role: 'user' | 'admin' | 'admin_normal' | 'system_admin'
  status?: 'pending' | 'active' | 'inactive'
  created_at?: string
  last_login?: string | null
}

// UpdateProfileData 타입 정의
interface UpdateProfileData {
  name?: string
  email?: string
  factory?: string
  department?: string
  position?: string
  currentPassword?: string
  newPassword?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // 관리자 여부 확인
  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'system_admin'
  })

  // 일반 관리자 여부 확인
  const isAdminNormal = computed(() => {
    return user.value?.role === 'admin_normal'
  })

  // 일반 사용자 여부 확인
  const isUser = computed(() => {
    return user.value?.role === 'user'
  })

  // 로그인
  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('[로그인 시도 - Store]', {
        receivedCredentials: credentials,
        username: credentials?.username,
        hasPassword: !!credentials?.password
      })

      // API 호출
      const response = await loginApi({
        username: credentials.username,
        password: credentials.password
      })

      // 사용자 상태 검증
      if (response.user.status === 'inactive') {
        throw new Error('비활성화된 계정입니다. 관리자에게 문의하세요.')
      }
      
      if (response.user.status === 'pending') {
        throw new Error('승인 대기중인 계정입니다. 관리자의 승인을 기다려주세요.')
      }

      // 토큰 저장
      localStorage.setItem('token', response.token)
      
      // 사용자 정보 저장
      const userToStore = {
        ...response.user,
        password: undefined
      }
      localStorage.setItem('user', JSON.stringify(userToStore))

      // 상태 업데이트
      token.value = response.token
      user.value = response.user
      isAuthenticated.value = true

      // 홈 페이지로 이동
      router.push('/')

      return response
    } catch (error) {
      console.error('[로그인 실패]', error)
      throw error
    }
  }

  // 로그아웃
  const logout = () => {
    const username = user.value?.username;
    logger.info('로그아웃', { username });
    
    token.value = ''
    user.value = null
    isAuthenticated.value = false
    
    // 토큰 제거
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    router.push('/login')
  }

  // 토큰 검증
  const validateAuth = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!savedToken || !savedUser) {
      logger.debug('저장된 인증 정보 없음');
      logout()
      return
    }

    try {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
      if (user.value) {
        logger.debug('인증 상태 복원 성공', { username: user.value.username });
      }
    } catch (error) {
      logger.error('인증 상태 복원 실패', { error: (error as Error).message });
      logout()
    }
  }

  const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
    try {
      logger.info('프로필 업데이트 시도', { 
        username: user.value?.username,
        updatedFields: Object.keys(data)
      });
      const response = await updateProfileApi(data)
      user.value = response.user
      // 로컬 스토리지 업데이트
      localStorage.setItem('user', JSON.stringify(response.user))
      logger.info('프로필 업데이트 성공', { 
        username: user.value?.username 
      });
      return response
    } catch (error) {
      console.error('[프로필 업데이트 실패]', error)
      throw error
    }
  }

  // 사용자 목록 조회
  const getUsers = async () => {
    try {
      logger.info('사용자 목록 조회 시도');
      const response = await getUsersApi();
      logger.info('사용자 목록 조회 성공', { count: response.users.length });
      return response;
    } catch (error) {
      logger.error('사용자 목록 조회 실패', { error: (error as Error).message });
      throw error;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isAdminNormal,
    isUser,
    login,
    logout,
    validateAuth,
    updateProfile,
    getUsers
  }
}) 
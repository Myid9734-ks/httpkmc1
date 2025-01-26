import client from './client'
import axios from 'axios'

interface LoginCredentials {
  username: string
  password: string
}

interface UpdateProfileData {
  name?: string
  email?: string
  factory?: string
  department?: string
  position?: string
  currentPassword?: string
  newPassword?: string
}

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

interface LoginResponse {
  token: string
  user: User
}

interface UpdateProfileResponse {
  user: User
}

interface RegisterData {
  username: string
  password: string
  name: string
  email: string
  factory: string
  department: string
  position: string
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // 데이터 검증
    if (!credentials?.username || !credentials?.password) {
      throw new Error('아이디와 비밀번호를 모두 입력해주세요.')
    }

    console.log('[로그인 요청 시작]', {
      url: '/auth/login',
      username: credentials.username,
      baseURL: client.defaults.baseURL,
      headers: client.defaults.headers
    })

    // API 요청
    const response = await client.post('/auth/login', {
      username: credentials.username,
      password: credentials.password
    })
    
    console.log('[로그인 응답]', {
      status: response.status,
      data: response.data ? '데이터 있음' : '데이터 없음',
      headers: response.headers
    })
    
    // 응답 검증
    if (!response.data?.token || !response.data?.user) {
      console.error('[로그인 실패] 응답 데이터 누락', response.data)
      throw new Error('서버 응답 데이터가 올바르지 않습니다.')
    }

    console.log('[로그인 성공]', {
      username: response.data.user.username,
      role: response.data.user.role
    })

    return response.data
  } catch (error) {
    console.error('[로그인 오류 상세]', {
      error,
      request: error.request ? {
        url: error.request.responseURL,
        status: error.request.status,
        response: error.request.response
      } : '요청 객체 없음'
    })
    throw error
  }
}

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await client.get('/auth/me')
  return response.data
}

export const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  const response = await client.put('/auth/profile', data)
  return response.data
}

export const register = async (data: RegisterData): Promise<{ message: string }> => {
  const response = await client.post('/auth/register', data)
  return response.data
}

// 전체 사용자 목록 조회
export const getUsers = async (): Promise<{ users: User[] }> => {
  const response = await client.get('/auth/users')
  return response.data
}

// 사용자 상태 변경
export const updateUserStatus = async (userId: number, status: 'pending' | 'active' | 'inactive'): Promise<{ message: string }> => {
  const response = await client.put(`/auth/users/${userId}/status`, { status })
  return response.data
}

// 사용자 역할 변경
export const updateUserRole = async (userId: number, role: 'user' | 'admin' | 'system_admin'): Promise<{ message: string }> => {
  const response = await client.put(`/auth/users/${userId}/role`, { role })
  return response.data
}

export type { LoginResponse, UpdateProfileResponse, UpdateProfileData, User, LoginCredentials }; 
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터
client.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
client.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      const notificationStore = useNotificationStore()
      
      await authStore.logout()
      if ('showNotification' in notificationStore) {
        notificationStore.showNotification({
          type: 'warning',
          message: '세션이 만료되었습니다. 다시 로그인해주세요.'
        })
      }
    }
    return Promise.reject(error)
  }
)

export default client 
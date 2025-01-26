import { defineStore } from 'pinia';
import router from '@/router';
import { 
  login as apiLogin, 
  getCurrentUser, 
  updateProfile as apiUpdateProfile, 
  getUsers as getUsersApi,
  updateUserStatus as updateUserStatusApi,
  updateUserRole as updateUserRoleApi
} from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isAdminNormal: (state) => state.user?.role === 'admin_normal',
    isUser: (state) => state.user?.role === 'user',
  },

  actions: {
    async login(credentials) {
      try {
        console.log('[로그인 시도]', {
          username: credentials.username,
          timestamp: new Date().toISOString()
        });

        const data = await apiLogin(credentials);
        console.log('[로그인 응답]', data);

        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('[로그인 성공]', {
          username: data.user.username,
          role: data.user.role,
          timestamp: new Date().toISOString()
        });

        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
      } catch (error) {
        console.error('[로그인 실패]', error);
        throw error;
      }
    },

    async logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      router.push('/login');
    },

    async validateToken() {
      try {
        if (!this.token) {
          this.isAuthenticated = false;
          return false;
        }

        try {
          const { user } = await getCurrentUser();
          
          this.user = user;
          this.isAuthenticated = true;

          return true;
        } catch (error) {
          await this.logout();
          return false;
        }
      } catch (error) {
        await this.logout();
        return false;
      }
    },

    async updateProfile(data) {
      try {
        const response = await apiUpdateProfile(data);
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error) {
        throw error;
      }
    },

    // 사용자 목록 조회
    async getUsers() {
      try {
        console.log('[사용자 목록 조회 시도]');
        const response = await getUsersApi();
        console.log('[사용자 목록 조회 성공]', { count: response.users.length });
        return response;
      } catch (error) {
        console.error('[사용자 목록 조회 실패]', error);
        throw error;
      }
    },

    // 사용자 상태 변경
    async updateUserStatus(userId, status) {
      try {
        console.log('[사용자 상태 변경 시도]', { userId, status });
        const response = await updateUserStatusApi(userId, status);
        console.log('[사용자 상태 변경 성공]');
        return response;
      } catch (error) {
        console.error('[사용자 상태 변경 실패]', error);
        throw error;
      }
    },

    // 사용자 역할 변경
    async updateUserRole(userId, role) {
      try {
        console.log('[사용자 역할 변경 시도]', { userId, role });
        const response = await updateUserRoleApi(userId, role);
        console.log('[사용자 역할 변경 성공]');
        return response;
      } catch (error) {
        console.error('[사용자 역할 변경 실패]', error);
        throw error;
      }
    }
  }
}); 
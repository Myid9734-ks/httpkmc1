import { defineStore } from 'pinia';
import { ref } from 'vue';
import client from '@/api/client';

interface Notification {
  id: number;
  icon: string;
  title: string;
  time: string;
  read: boolean;
}

interface SystemNotification {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface NotificationOptions {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

export const useNotificationStore = defineStore('notification', () => {
  const recentNotifications = ref<Notification[]>([]);
  const systemNotification = ref<SystemNotification | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 최근 알림 가져오기
  const fetchRecentNotifications = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.get('/notifications/recent');
      recentNotifications.value = response.data;
    } catch (err: any) {
      console.error('알림 데이터를 가져오는데 실패했습니다:', err);
      error.value = err.response?.data?.error || '알림을 가져오는데 실패했습니다.';
      recentNotifications.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (id: number) => {
    try {
      await client.put(`/notifications/${id}/read`);
      const notification = recentNotifications.value.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    } catch (err: any) {
      console.error('알림 읽음 처리에 실패했습니다:', err);
      throw err;
    }
  };

  // 시스템 알림 표시 (토스트 메시지)
  const showSystemNotification = (type: SystemNotification['type'], message: string) => {
    systemNotification.value = { type, message };
    setTimeout(() => {
      systemNotification.value = null;
    }, 3000);
  };

  const showNotification = (options: NotificationOptions) => {
    const { message, type = 'info', duration = 3000 } = options;
    // ... 기존 로직 유지
  };

  return {
    recentNotifications,
    systemNotification,
    loading,
    error,
    fetchRecentNotifications,
    markAsRead,
    showSystemNotification,
    showNotification
  };
}); 
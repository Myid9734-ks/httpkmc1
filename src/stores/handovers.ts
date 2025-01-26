import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as handoverApi from '@/api/handovers';

export const useHandoversStore = defineStore('handovers', () => {
  const handovers = ref<any[]>([]);
  const historyRecords = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 일일 인수인계 목록 조회
  const fetchHandovers = async (filters: any) => {
    try {
      loading.value = true;
      error.value = null;
      console.log('[HandoversStore] 일일 인수인계 조회 시작', filters);
      handovers.value = await handoverApi.fetchDailyHandovers(filters);
      console.log('[HandoversStore] 일일 인수인계 조회 완료', handovers.value);
    } catch (err: any) {
      console.error('[HandoversStore] 일일 인수인계 조회 오류', err);
      error.value = err.response?.data?.error || '데이터 조회 중 오류가 발생했습니다.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 인수인계 이력 조회
  const fetchHistory = async (startDate: string, endDate: string) => {
    try {
      loading.value = true;
      error.value = null;
      console.log('[HandoversStore] 인수인계 이력 조회 시작', { startDate, endDate });
      historyRecords.value = await handoverApi.getHandoverHistory(startDate, endDate);
      console.log('[HandoversStore] 인수인계 이력 조회 완료', historyRecords.value);
    } catch (err: any) {
      console.error('[HandoversStore] 인수인계 이력 조회 오류', err);
      error.value = err.response?.data?.error || '이력 조회 중 오류가 발생했습니다.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 일일 인수인계 등록
  const createHandover = async (data: any) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await handoverApi.createDailyHandover(data);
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.error || '등록 중 오류가 발생했습니다.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 일일 인수인계 수정
  const updateHandover = async (id: number, data: any) => {
    try {
      loading.value = true;
      error.value = null;
      await handoverApi.updateDailyHandover(id, data);
    } catch (err: any) {
      error.value = err.response?.data?.error || '수정 중 오류가 발생했습니다.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    handovers,
    historyRecords,
    loading,
    error,
    fetchHandovers,
    fetchHistory,
    createHandover,
    updateHandover
  };
}); 
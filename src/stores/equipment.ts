import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Equipment } from '@/types'
import client from '@/api/client'

interface EquipmentStatus {
  id: number;
  equipmentName: string;    // 설비명
  maintenanceTitle: string; // 보전 작업명
  startTime: string;        // 보수일
  location: string;        // 위치 (공장/부서)
  inspector: string;       // 점검자
}

export const useEquipmentStore = defineStore('equipment', () => {
  const equipments = ref<Equipment[]>([])
  const filteredEquipments = ref<Equipment[]>([])
  const currentEquipment = ref<Equipment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const equipmentStatus = ref<EquipmentStatus[]>([])

  // 필터 적용
  const applyFilters = (filters) => {
    console.log('Applying filters in store:', filters)
    if (!filters.factory && !filters.department && !filters.line) {
      filteredEquipments.value = equipments.value
      return
    }

    filteredEquipments.value = equipments.value.filter(item => {
      console.log('Checking equipment:', item)
      const factoryMatch = !filters.factory || item.factory?.toLowerCase() === filters.factory?.toLowerCase()
      const departmentMatch = !filters.department || item.department?.toLowerCase() === filters.department?.toLowerCase()
      const lineMatch = !filters.line || item.product_model?.toLowerCase() === filters.line?.toLowerCase()
      
      console.log('Matches:', { factoryMatch, departmentMatch, lineMatch })
      return factoryMatch && departmentMatch && lineMatch
    })
    console.log('Filtered results:', filteredEquipments.value)
  }

  // 설비 목록 조회
  const fetchEquipments = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await client.get('/equipments')
      equipments.value = response.data
      filteredEquipments.value = response.data
    } catch (e) {
      error.value = '설비 목록을 불러오는데 실패했습니다.'
      console.error('설비 목록 조회 실패:', e)
    } finally {
      loading.value = false
    }
  }

  // 설비 상세 조회
  const fetchEquipment = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await client.get(`/equipments/${id}`)
      currentEquipment.value = response.data
    } catch (e) {
      error.value = '설비 정보를 불러오는데 실패했습니다.'
      console.error('설비 상세 조회 실패:', e)
    } finally {
      loading.value = false
    }
  }

  // 설비 등록
  const createEquipment = async (equipment: Equipment) => {
    loading.value = true
    error.value = null
    try {
      const response = await client.post('/equipments', equipment)
      equipments.value.unshift({ ...equipment, id: response.data.id })
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.error || '설비 등록에 실패했습니다.'
      console.error('설비 등록 실패:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // 설비 수정
  const updateEquipment = async (id: number, equipment: Equipment) => {
    loading.value = true
    error.value = null
    try {
      const response = await client.put(`/equipments/${id}`, equipment)
      const index = equipments.value.findIndex(e => e.id === id)
      if (index !== -1) {
        equipments.value[index] = { ...equipment, id }
      }
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.error || '설비 수정에 실패했습니다.'
      console.error('설비 수정 실패:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // 설비 삭제
  const deleteEquipment = async (id: number, reason: string) => {
    loading.value = true
    error.value = null
    try {
      await client.delete(`/equipments/${id}`, { data: { reason } })
      equipments.value = equipments.value.filter(e => e.id !== id)
    } catch (e) {
      error.value = '설비 삭제에 실패했습니다.'
      console.error('설비 삭제 실패:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // 현재 진행중인 보전 작업 상태 가져오기
  const fetchEquipmentStatus = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.get('/maintenances', {
        params: {
          status: 'register'
        }
      });
      
      equipmentStatus.value = response.data.map((item: any) => ({
        id: item.id,
        equipmentName: item.title || '설비명 없음',
        maintenanceTitle: item.title || '작업명 없음',
        startTime: item.scheduled_date || null,
        location: `${item.factory || '-'} / ${item.department || '-'} / ${item.line || '-'}`,
        inspector: item.inspector || '점검자 미지정'
      }));
      
    } catch (error: any) {
      console.error('API 호출 에러:', error);
      error.value = error.response?.data?.message || '설비 상태를 가져오는데 실패했습니다.';
      equipmentStatus.value = [];
    } finally {
      loading.value = false;
    }
  }

  // 새로운 데이터베이스에서 장비 목록 조회
  const fetchEquipmentsFromDatabase = async () => {
    try {
      loading.value = true;
      error.value = null;
      console.log('새로운 데이터베이스에서 장비 목록 조회 시작');
      const response = await client.get('/equipments/from-database');
      console.log('조회된 장비 목록:', response.data);
      equipments.value = response.data;
    } catch (err) {
      console.error('장비 목록 조회 실패:', err);
      error.value = '장비 목록을 불러오는데 실패했습니다.';
    } finally {
      loading.value = false;
    }
  };

  return {
    equipments,
    filteredEquipments,
    currentEquipment,
    loading,
    error,
    equipmentStatus,
    fetchEquipments,
    fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    fetchEquipmentStatus,
    fetchEquipmentsFromDatabase,
    applyFilters
  }
}) 
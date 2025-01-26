import { defineStore } from 'pinia'
import client from '@/api/client'

interface Maintenance {
  id: number
  serial_no: string
  title: string
  description: string
  photos: string
  inspector: string
  factory: string
  department: string
  line: string
  status: string
  is_other: boolean
  scheduled_date: string
  completed_date: string | null
  created_at: string
  updated_at: string
}

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    maintenances: [] as Maintenance[],
    currentMaintenance: null as Maintenance | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchMaintenances() {
      this.loading = true
      try {
        const response = await client.get('/maintenances')
        this.maintenances = response.data
      } catch (error) {
        console.error('유지보수 목록 조회 실패:', error)
        this.error = '유지보수 목록을 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    async fetchMaintenanceById(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await client.get(`/maintenances/${id}`)
        this.currentMaintenance = response.data
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createMaintenance(data) {
      this.loading = true
      try {
        const response = await client.post('/maintenances', data)
        await this.fetchMaintenances()
        return response.data
      } catch (error) {
        console.error('유지보수 등록 실패:', error)
        this.error = '유지보수 등록에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateMaintenance(id, data) {
      this.loading = true
      try {
        const response = await client.put(`/maintenances/${id}`, data)
        await this.fetchMaintenances()
        return response.data
      } catch (error) {
        console.error('유지보수 수정 실패:', error)
        this.error = '유지보수 수정에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteMaintenance(id) {
      this.loading = true
      try {
        await client.delete(`/maintenances/${id}`)
        await this.fetchMaintenances()
      } catch (error) {
        console.error('유지보수 삭제 실패:', error)
        this.error = '유지보수 삭제에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getMaintenancesByEquipment(serial_no: string) {
      this.loading = true
      this.error = null
      try {
        const response = await client.get(`/maintenances/equipment/${encodeURIComponent(serial_no)}`)
        return response.data
      } catch (error: any) {
        this.error = error.message
        console.error('설비 유지보수 이력 조회 실패:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async getCompletedMaintenance(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await client.get(`/maintenances/completed/${id}`)
        return response.data
      } catch (error: any) {
        this.error = error.message
        console.error('완료된 유지보수 상세 조회 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  },
}) 
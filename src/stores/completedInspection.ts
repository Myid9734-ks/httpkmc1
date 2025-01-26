import { defineStore } from 'pinia'
import client from '@/api/client'

// 완료된 점검 타입 정의
interface CompletedInspection {
  id: number
  original_inspection_id: number
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id?: number
  line_name: string
  factory_name: string
  department_name: string
  sub_line_name?: string
  inspection_name: string
  inspection_standard: string
  inspection_cycle: string
  scheduled_date: string
  completion_date: string
  inspector: string
  checklist_results: any[]
  photos?: string
  notes?: string
}

export const useCompletedInspectionStore = defineStore('completedInspection', {
  state: () => ({
    completedInspections: [] as CompletedInspection[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCompletedInspections() {
      this.loading = true
      this.error = null
      try {
        const response = await client.get('/equipment-inspections/completed')
        this.completedInspections = response.data
      } catch (error) {
        console.error('완료된 점검 목록 조회 실패:', error)
        this.error = '완료된 점검 목록을 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    async completeInspection(data: any) {
      this.loading = true
      this.error = null
      try {
        const response = await client.post(`/equipment-inspections/complete/${data.original_inspection_id}`, data)
        await this.fetchCompletedInspections()
        return response.data
      } catch (error) {
        console.error('점검 완료 처리 실패:', error)
        this.error = '점검 완료 처리에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 
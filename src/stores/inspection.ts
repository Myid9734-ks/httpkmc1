import { defineStore } from 'pinia'
import client from '@/api/client'

// 체크리스트 항목 인터페이스
interface ChecklistItem {
  id: number
  content: string
  required: boolean
}

// 점검항목 인터페이스
interface Inspection {
  id: number
  code: string
  name: string
  standard: string
  cycle: '1개월' | '3개월' | '6개월' | '12개월'
  priority: 'A' | 'B' | 'C'
  status: 'active' | 'inactive'
  checklist: ChecklistItem[]
}

// 새 점검항목 인터페이스
interface NewInspection {
  name: string
  standard: string
  cycle: '1개월' | '3개월' | '6개월' | '12개월'
  priority: 'A' | 'B' | 'C'
  status: 'active' | 'inactive'
  checklist: ChecklistItem[]
}

// 점검항목 스토어
export const useInspectionStore = defineStore('inspection', {
  state: () => ({
    inspections: [] as Inspection[],
  }),

  getters: {
    // 주기별 점검항목 수
    oneMonthCount: (state) => state.inspections.filter(item => item.cycle === '1개월').length,
    threeMonthCount: (state) => state.inspections.filter(item => item.cycle === '3개월').length,
    sixMonthCount: (state) => state.inspections.filter(item => item.cycle === '6개월').length,
    twelveMonthCount: (state) => state.inspections.filter(item => item.cycle === '12개월').length
  },

  actions: {
    // 코드 기준 정렬 함수
    sortByCode(items: Inspection[]) {
      return [...items].sort((a, b) => {
        const aNum = parseInt(a.code.replace('INS', ''))
        const bNum = parseInt(b.code.replace('INS', ''))
        return aNum - bNum
      })
    },

    // 점검항목 목록 조회
    async fetchInspections() {
      try {
        const response = await client.get('/inspections')
        this.inspections = this.sortByCode(response.data.data)
      } catch (error) {
        console.error('점검항목 목록 조회 실패:', error)
        throw error
      }
    },

    // 점검항목 추가
    async addInspection(item: NewInspection) {
      try {
        const response = await client.post('/inspections', item)
        this.inspections = this.sortByCode([...this.inspections, response.data])
        return response.data
      } catch (error) {
        console.error('점검항목 추가 실패:', error)
        throw error
      }
    },

    // 점검항목 수정
    async updateInspection(item: Inspection) {
      try {
        console.log('수정 요청 데이터:', item)
        const response = await client.put(`/inspections/${item.id}`, item)
        console.log('서버 응답 데이터:', response.data)
        
        const index = this.inspections.findIndex(i => i.id === item.id)
        console.log('수정할 항목 인덱스:', index)
        
        if (index !== -1) {
          // 기존 데이터 백업
          const oldData = { ...this.inspections[index] }
          console.log('수정 전 데이터:', oldData)
          
          // 새 배열 생성 및 데이터 업데이트
          const updatedInspections = [...this.inspections]
          updatedInspections[index] = {
            ...response.data,
            checklist: response.data.checklist || oldData.checklist || []
          }
          
          // 정렬 후 할당
          this.inspections = this.sortByCode(updatedInspections)
          console.log('스토어 상태 업데이트 완료:', this.inspections)
        }
        return response.data
      } catch (error) {
        console.error('점검항목 수정 실패:', error)
        throw error
      }
    },

    // 점검항목 삭제
    async deleteInspection(id: number) {
      try {
        await client.delete(`/inspections/${id}`)
        this.inspections = this.sortByCode(this.inspections.filter(item => item.id !== id))
      } catch (error) {
        console.error('점검항목 삭제 실패:', error)
        throw error
      }
    },

    // 점검항목 상태 변경
    async toggleInspectionStatus(item: Inspection) {
      try {
        const newStatus = item.status === 'active' ? 'inactive' : 'active'
        const response = await client.patch(`/inspections/${item.id}/status`, {
          status: newStatus
        })
        
        // 로컬 상태 업데이트
        const index = this.inspections.findIndex(i => i.id === item.id)
        if (index !== -1) {
          const updatedInspections = [...this.inspections]
          updatedInspections[index] = { ...updatedInspections[index], status: newStatus }
          this.inspections = this.sortByCode(updatedInspections)
        }
        
        return response.data
      } catch (error) {
        console.error('점검항목 상태 변경 실패:', error)
        throw error
      }
    }
  }
}) 
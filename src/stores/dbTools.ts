import { defineStore } from 'pinia'
import client from '@/api/client'

interface Line {
  id: number
  parent_id: number | null
  level: number
  name: string
  status: 'active' | 'maintenance' | 'inactive'
  children?: Line[]
}

interface DbToolsState {
  lines: Line[]
  loading: boolean
  error: string | null
}

export const useDbToolsStore = defineStore({
  id: 'dbTools',
  state: (): DbToolsState => ({
    lines: [],
    loading: false,
    error: null
  }),

  getters: {
    factories: (state) => state.lines.filter(line => line.level === 1),
    departments: (state) => {
      return state.lines
        .filter(line => line.level === 1)
        .flatMap(factory => factory.children || [])
    },
    productionLines: (state) => {
      return state.lines
        .filter(line => line.level === 1)
        .flatMap(factory => factory.children || [])
        .flatMap(dept => dept.children || [])
    }
  },

  actions: {
    async fetchTools() {
      this.loading = true
      try {
        const response = await client.get('/tools')
        this.tools = response.data
      } catch (error) {
        console.error('도구 목록 조회 실패:', error)
        this.error = '도구 목록을 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    async fetchLines() {
      this.loading = true
      try {
        const response = await client.get('/lines')
        return response.data
      } catch (error) {
        console.error('라인 목록 조회 실패:', error)
        this.error = '라인 목록을 불러오는데 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchFactories() {
      await this.fetchLines()
    },

    async fetchDepartments() {
      await this.fetchLines()
    }
  }
}) 
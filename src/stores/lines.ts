import { defineStore } from 'pinia'
import client from '@/api/client'

export interface Line {
  id: number
  parent_id: number | null
  level: number
  name: string
  status: 'active' | 'maintenance' | 'inactive'
  children?: Line[]
}

interface LineFormData {
  parent_id: number | null
  level: number
  name: string
  status: 'active' | 'maintenance' | 'inactive'
}

export const useLinesStore = defineStore('lines', {
  state: () => ({
    lines: [] as Line[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    // 전체 경로 찾기 함수
    findLineWithPath(lines: Line[], targetId: number): Line | null {
      const findPath = (currentLines: Line[], id: number): Line[] | null => {
        for (const line of currentLines) {
          if (line.id === id) {
            return [line]
          }
          if (line.children) {
            const childPath = findPath(line.children, id)
            if (childPath) {
              return [line, ...childPath]
            }
          }
        }
        return null
      }

      const path = findPath(lines, targetId)
      if (!path) return null

      return path[path.length - 1]
    },

    async fetchLines() {
      this.loading = true
      this.error = null
      try {
        const response = await client.get('/lines')
        this.lines = response.data.data
      } catch (error) {
        this.error = '라인 목록을 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    async addLine(lineData: LineFormData) {
      this.loading = true
      this.error = null
      try {
        if (lineData.parent_id) {
          const parentLine = this.findLineById(this.lines, lineData.parent_id)
          if (parentLine) {
            lineData.level = parentLine.level + 1
          }
        } else {
          lineData.level = 1
        }

        if (lineData.level < 1 || lineData.level > 4) {
          throw new Error('유효하지 않은 레벨입니다.')
        }

        const response = await client.post('/lines', lineData)
        await this.fetchLines()
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || '라인 추가에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLine(id: number, lineData: Partial<LineFormData>) {
      this.loading = true
      this.error = null
      try {
        const response = await client.put(`/lines/${id}`, lineData)
        await this.fetchLines()
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || '라인 수정에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLine(id: number) {
      this.loading = true
      this.error = null
      try {
        await client.delete(`/lines/${id}`)
        await this.fetchLines()
      } catch (error: any) {
        this.error = error.response?.data?.error || '라인 삭제에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    findLineById(lines: Line[], id: number): Line | null {
      for (const line of lines) {
        if (line.id === id) return line
        if (line.children) {
          const found = this.findLineById(line.children, id)
          if (found) return found
        }
      }
      return null
    }
  }
}) 
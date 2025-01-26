import { defineStore } from 'pinia';
import type { Tool, CreateToolData, UpdateToolData } from '@/types/tool';
import * as toolsApi from '@/api/tools';
import client from '@/api/client';

interface ToolsState {
  tools: Tool[];
  loading: boolean;
  error: string | null;
}

export const useToolsStore = defineStore('tools', {
  state: (): ToolsState => ({
    tools: [],
    loading: false,
    error: null
  }),

  getters: {
    getToolById: (state) => (id: number) => {
      return state.tools.find(tool => tool.id === id);
    }
  },

  actions: {
    // 에러 처리 유틸리티
    handleError(error: any) {
      console.error('Tools store error:', error);
      this.error = error.response?.data?.error || '오류가 발생했습니다.';
      this.loading = false;
    },

    // 전체 공구/도구 목록 조회
    async fetchTools() {
      this.loading = true;
      try {
        const response = await client.get('/tools');
        this.tools = response.data;
      } catch (error) {
        console.error('Error fetching tools:', error);
        this.error = '공구 목록을 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },

    // 공구/도구 상세 조회
    async fetchTool(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const tool = await toolsApi.getTool(id);
        const index = this.tools.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tools[index] = tool;
        } else {
          this.tools.push(tool);
        }
      } catch (error: any) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    // 공구/도구 등록
    async createTool(data: CreateToolData) {
      this.loading = true;
      this.error = null;
      try {
        const id = await toolsApi.createTool(data);
        await this.fetchTool(id);
        return id;
      } catch (error: any) {
        this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 공구/도구 수정
    async updateTool(tool: Tool) {
      this.loading = true;
      try {
        const response = await client.put(`/tools/${tool.id}`, tool);
        // 성공적으로 업데이트된 경우 로컬 상태도 업데이트
        const index = this.tools.findIndex(t => t.id === tool.id);
        if (index !== -1) {
          this.tools[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Error updating tool:', error);
        throw new Error('공구 정보 업데이트에 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },

    // 공구/도구 삭제
    async deleteTool(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await toolsApi.deleteTool(id);
        this.tools = this.tools.filter(tool => tool.id !== id);
      } catch (error: any) {
        this.handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 
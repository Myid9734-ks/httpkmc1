import client from './client';
import type { Process } from '@/types/process';

export const processesAPI = {
    // 모든 공정 조회
    getAll: async (): Promise<Process[]> => {
        const response = await client.get('/processes');
        return response.data;
    },

    // 단일 공정 조회
    getById: async (id: number): Promise<Process> => {
        const response = await client.get(`/processes/${id}`);
        return response.data;
    },

    // 공정 생성
    create: async (process: Omit<Process, 'id' | 'created_at' | 'updated_at'>): Promise<Process> => {
        const response = await client.post('/processes', process);
        return response.data;
    },

    // 공정 수정
    update: async (id: number, process: Partial<Process>): Promise<Process> => {
        const response = await client.put(`/processes/${id}`, process);
        return response.data;
    },

    // 공정 삭제
    delete: async (id: number): Promise<void> => {
        await client.delete(`/processes/${id}`);
    }
}; 
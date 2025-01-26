import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Process } from '@/types/process';
import { processesAPI } from '@/api/processes';

export const useProcessesStore = defineStore('processes', () => {
    const processes = ref<Process[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 모든 공정 조회
    const fetchProcesses = async () => {
        loading.value = true;
        error.value = null;
        try {
            processes.value = await processesAPI.getAll();
        } catch (e) {
            error.value = e instanceof Error ? e.message : '공정 목록을 불러오는데 실패했습니다.';
        } finally {
            loading.value = false;
        }
    };

    // 공정 생성
    const addProcess = async (process: Omit<Process, 'id' | 'created_at' | 'updated_at'>) => {
        loading.value = true;
        error.value = null;
        try {
            const newProcess = await processesAPI.create(process);
            processes.value.unshift(newProcess);
        } catch (e) {
            error.value = e instanceof Error ? e.message : '공정 생성에 실패했습니다.';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // 공정 수정
    const updateProcess = async (id: number, process: Partial<Process>) => {
        loading.value = true;
        error.value = null;
        try {
            const updatedProcess = await processesAPI.update(id, process);
            const index = processes.value.findIndex(p => p.id === id);
            if (index !== -1) {
                processes.value[index] = updatedProcess;
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : '공정 수정에 실패했습니다.';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // 공정 삭제
    const deleteProcess = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            await processesAPI.delete(id);
            processes.value = processes.value.filter(p => p.id !== id);
        } catch (e) {
            error.value = e instanceof Error ? e.message : '공정 삭제에 실패했습니다.';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    return {
        processes,
        loading,
        error,
        fetchProcesses,
        addProcess,
        updateProcess,
        deleteProcess
    };
}); 
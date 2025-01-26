import client from './client';
import type { Tool, CreateToolData, UpdateToolData } from '@/types/tool';

// FormData로 변환하는 유틸리티 함수
function toFormData(data: CreateToolData | UpdateToolData): FormData {
  const formData = new FormData();
  
  // 필드명 매핑
  const fieldMapping: { [key: string]: string } = {
    currentStock: 'current_stock',
    safetyStock: 'safety_stock',
    unitPrice: 'unit_price',
    locationZone: 'location_zone',
    locationRow: 'location_row',
    locationColumn: 'location_column',
    locationPosition: 'location_position',
    lineName: 'line_name'
  };
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      value.forEach(file => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });
    } else if (value !== undefined && !(value instanceof File)) {
      // 매핑된 필드명이 있으면 사용, 없으면 원래 키 사용
      const fieldName = fieldMapping[key] || key;
      formData.append(fieldName, String(value));
    }
  });
  
  return formData;
}

// 전체 공구/도구 목록 조회
export async function getTools(): Promise<Tool[]> {
  const response = await client.get<Tool[]>('/tools');
  return response.data;
}

// 공구/도구 상세 조회
export async function getTool(id: number): Promise<Tool> {
  const response = await client.get<Tool>(`/tools/${id}`);
  return response.data;
}

// 공구/도구 등록
export async function createTool(data: CreateToolData): Promise<number> {
  const formData = toFormData(data);
  const response = await client.post<{ id: number }>('/tools', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.id;
}

// 공구/도구 수정
export async function updateTool(data: UpdateToolData): Promise<void> {
  const formData = toFormData(data);
  await client.put(`/tools/${data.id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 공구/도구 삭제
export async function deleteTool(id: number): Promise<void> {
  await client.delete(`/tools/${id}`);
} 
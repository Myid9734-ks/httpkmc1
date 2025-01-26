import client from './client'
import type { Equipment } from '@/types'

// 설비 목록 조회
export const getEquipments = async () => {
  const response = await client.get('/equipments')
  console.log('API 응답 데이터:', response.data);
  return response.data
}

// 설비 상세 조회
export const getEquipment = async (id: number) => {
  const response = await client.get(`/equipments/${id}`)
  return response.data
}

// 설비 등록
export const createEquipment = async (equipment: Equipment) => {
  const response = await client.post('/equipments', equipment)
  return response.data
}

// 설비 수정
export const updateEquipment = async (id: number, equipment: Equipment) => {
  const response = await client.put(`/equipments/${id}`, equipment)
  return response.data
}

// 설비 삭제
export const deleteEquipment = async (id: number, reason: string) => {
  const response = await client.delete(`/equipments/${id}`, { data: { reason } })
  return response.data
} 
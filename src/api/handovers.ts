import client from './client';

interface HandoverData {
  date: string;
  factory: string;
  department: string;
  shift: string;
  writer: string;
  line_name: string;
  handover_content?: string;
  remarks?: string;
  general_remarks?: string;
  status: 'pending' | 'completed';
}

interface HandoverFilter {
  date?: string;
  factory?: string;
  department?: string;
  shift?: string;
}

// 일일 인수인계 목록 조회
export const fetchDailyHandovers = async (filters: HandoverFilter) => {
  const response = await client.get('/handovers/daily', { params: filters });
  return response.data;
};

// 일일 인수인계 등록
export const createDailyHandover = async (data: HandoverData) => {
  const response = await client.post('/handovers/daily', data);
  return response.data;
};

// 일일 인수인계 수정
export const updateDailyHandover = async (id: number, data: Partial<HandoverData>) => {
  const response = await client.put(`/handovers/daily/${id}`, data);
  return response.data;
};

// 인수인계 이력 조회
export const getHandoverHistory = async (startDate: string, endDate: string) => {
  const response = await client.get('/handovers/history', {
    params: { startDate, endDate }
  });
  return response.data;
}; 
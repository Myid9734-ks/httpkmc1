import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLinesStore, type Line } from '@/stores/lines'
import { useInspectionStore } from '@/stores/inspection'
import client from '@/api/client'

interface EquipmentInspection {
  id: number
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id?: number
  line_name: string
  inspection_id: number
  inspection_name: string
  inspection_standard: string
  inspection_cycle: string
  scheduled_date: string
  execution_due_date?: string
  status: 'pending' | 'in_progress' | 'completed'
  inspector?: string
  inspection_date?: string
  check_results?: (boolean | null)[]
  checklist: any[]
}

interface ProcessedLine {
  level1_id: number
  level2_id: number
  level3_id: number
  level4_id?: number
  line_name: string
}

interface InspectionWithChecklist {
  id: number
  checklist: any[]
}

export const useEquipmentInspectionStore = defineStore('equipmentInspection', () => {
  // 스토어
  const lineStore = useLinesStore()
  const inspectionStore = useInspectionStore()

  // 상태
  const inspections = ref<EquipmentInspection[]>([])
  const lastId = ref(0)

  // 필터
  const selectedFactory = ref<number | null>(null)
  const selectedDepartment = ref<number | null>(null)
  const selectedLine = ref<number | null>(null)

  // 라인 데이터 가공
  const processLineData = (lines: Line[]): ProcessedLine[] => {
    const result: ProcessedLine[] = []

    // 공장(level1) 순회
    lines.forEach(factory => {
      if (factory.status !== 'active') return

      // 부서(level2) 순회
      factory.children?.forEach(department => {
        if (department.status !== 'active') return

        // 생산라인(level3) 순회
        department.children?.forEach(line => {
          if (line.status !== 'active') return

          // level3 라인이 level4를 가지고 있는 경우
          if (line.children && line.children.length > 0) {
            // level4 라인만 추가 (3층 > 4층 형식으로)
            line.children.forEach(subLine => {
              if (subLine.status === 'active') {
                result.push({
                  level1_id: factory.id,
                  level2_id: department.id,
                  level3_id: line.id,
                  level4_id: subLine.id,
                  line_name: `${line.name} > ${subLine.name}`
                })
              }
            })
          } else {
            // level3 라인만 있는 경우
            result.push({
              level1_id: factory.id,
              level2_id: department.id,
              level3_id: line.id,
              line_name: line.name
            })
          }
        })
      })
    })

    return result
  }

  // 필터링된 점검 목록
  const filteredInspections = computed(() => {
    let result = [...inspections.value]

    // 공장 필터
    if (selectedFactory.value) {
      result = result.filter(item => item.level1_id === selectedFactory.value)
    }

    // 부서 필터
    if (selectedDepartment.value) {
      result = result.filter(item => item.level2_id === selectedDepartment.value)
    }

    // 라인 필터
    if (selectedLine.value) {
      result = result.filter(item => item.level3_id === selectedLine.value)
    }

    // 예정일 기준으로 정렬
    return result.sort((a, b) => {
      const dateA = new Date(a.scheduled_date).getTime()
      const dateB = new Date(b.scheduled_date).getTime()
      return dateA - dateB
    })
  })

  // 랜덤 날짜 생성 (현재 연도의 평일)
  const generateRandomWeekday = () => {
    const currentYear = new Date().getFullYear()
    const randomMonth = Math.floor(Math.random() * 12) + 1
    const daysInMonth = new Date(currentYear, randomMonth, 0).getDate()
    let randomDay
    let date
    
    do {
      randomDay = Math.floor(Math.random() * daysInMonth) + 1
      date = new Date(currentYear, randomMonth - 1, randomDay)
    } while (date.getDay() === 0 || date.getDay() === 6) // 0은 일요일, 6은 토요일

    return `${currentYear}-${String(randomMonth).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`
  }

  // 점검 계획 랜덤 생성
  const generateRandomInspections = async () => {
    try {
      // 데이터 로드
      await Promise.all([
        lineStore.fetchLines(),
        inspectionStore.fetchInspections()
      ])

      // 사용 상태인 점검 항목만 필터링
      const activeInspections = inspectionStore.inspections.filter(
        inspection => inspection.status === 'active'
      )

      // 라인 데이터 가공
      const processedLines = processLineData(lineStore.lines)
      
      if (processedLines.length === 0) {
        throw new Error('사용 가능한 라인이 없습니다.')
      }

      if (activeInspections.length === 0) {
        throw new Error('사용 가능한 점검 항목이 없습니다.')
      }

      const newInspections = []

      // 각 점검항목과 라인의 조합으로 점검 계획 생성
      for (const inspection of activeInspections) {
        for (const line of processedLines) {
          // 예정일 생성 (현재 연도 전체 범위)
          const currentYear = new Date().getFullYear()
          const startDate = new Date(currentYear, 0, 1)  // 현재 연도 1월 1일
          const endDate = new Date(currentYear, 11, 31)  // 현재 연도 12월 31일
          
          console.log('=== 날짜 계산 로그 ===')
          console.log('시작일:', startDate.toISOString())
          console.log('종료일:', endDate.toISOString())
          
          const scheduledDate = new Date(
            startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
          )
          console.log('생성된 날짜:', scheduledDate.toISOString())
          
          // 주말 제외
          while (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
            scheduledDate.setDate(scheduledDate.getDate() + 1)
          }
          console.log('최종 날짜:', scheduledDate.toISOString())
          console.log('==================')

          newInspections.push({
            level1_id: line.level1_id,
            level2_id: line.level2_id,
            level3_id: line.level3_id,
            level4_id: line.level4_id || null,
            line_name: line.line_name,
            inspection_id: inspection.id,
            inspection_name: inspection.name,
            inspection_standard: inspection.standard,
            inspection_cycle: inspection.cycle,
            scheduled_date: scheduledDate.toISOString().split('T')[0],
            status: 'pending',
            checklist: inspection.checklist
          })
        }
      }

      // API 호출로 서버에 저장
      const response = await client.post('/equipment-inspections/generate', {
        inspections: newInspections
      })

      // 서버에서 생성된 데이터로 상태 업데이트
      if (response.data.inspections && Array.isArray(response.data.inspections)) {
        inspections.value = response.data.inspections
      } else {
        console.error('서버 응답이 예상된 형식이 아닙니다:', response.data)
        inspections.value = []
      }
    } catch (error) {
      console.error('점검 계획 생성 실패:', error)
      inspections.value = []
      throw error
    }
  }

  // 점검 목록 조회
  const fetchInspections = async () => {
    try {
      const response = await client.get('/equipment-inspections')
      
      // 응답 데이터가 배열인지 확인
      if (!Array.isArray(response.data)) {
        console.error('점검 목록 조회 실패: 응답이 배열이 아님', {
          type: typeof response.data,
          value: response.data
        })
        inspections.value = []
        return
      }
      
      inspections.value = response.data
    } catch (error) {
      console.error('점검 목록 조회 실패:', error)
      inspections.value = []
    }
  }

  // 점검 상태 업데이트
  const updateInspectionStatus = async (id: number, status: string) => {
    try {
      const response = await client.patch(`/equipment-inspections/${id}`, { status })
      return response.data
    } catch (error) {
      console.error('점검 상태 업데이트 실패:', error)
      throw error
    }
  }

  // 점검 정보 업데이트
  const updateInspection = async (id: number, data: {
    status: 'completed'
    inspector: string
    inspection_date: string
    check_results: (boolean | null)[]
  }) => {
    try {
      const response = await client.patch(`/equipment-inspections/${id}`, data)
      const updatedInspection = response.data
      
      // 로컬 상태 업데이트
      const index = inspections.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inspections.value[index] = updatedInspection
      }
      
      return updatedInspection
    } catch (error) {
      console.error('점검 정보 업데이트 실패:', error)
      throw error
    }
  }

  // 점검자 할당
  const assignInspector = async (id: number, inspector: string) => {
    try {
      const response = await client.patch(`/equipment-inspections/${id}`, { inspector })
      const updatedInspection = response.data
      
      // 로컬 상태 업데이트
      const index = inspections.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inspections.value[index] = updatedInspection
      }
      
      return updatedInspection
    } catch (error) {
      console.error('점검자 할당 실패:', error)
      throw error
    }
  }

  // 알림 전송
  const sendInspectionNotification = async (id: number) => {
    try {
      const inspection = inspections.value.find(i => i.id === id)
      if (!inspection) throw new Error('점검 정보를 찾을 수 없습니다.')

      console.log('점검 정보:', inspection);  // 디버깅용 로그 추가

      // 현재 날짜로부터 5일 후 계산
      const today = new Date()
      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + 5)
      const formattedDueDate = dueDate.toISOString().split('T')[0]

      console.log('실행기한:', formattedDueDate);  // 디버깅용 로그 추가

      // 텔레그램 메시지 구성
      const message = `[설비점검 알림]
라인: ${inspection.line_name}
점검항목: ${inspection.inspection_name}
점검기준: ${inspection.inspection_standard}
예정일: ${inspection.scheduled_date}
실행기한: ${formattedDueDate}까지

※ ${formattedDueDate}까지 점검을 완료해주세요.`

      console.log('전송할 메시지:', message);  // 디버깅용 로그 추가

      // 먼저 실행기한 업데이트
      await client.patch(`/equipment-inspections/${id}`, {
        execution_due_date: formattedDueDate
      })

      // 업데이트 성공 후 메시지 전송
      await client.post('/telegram/send-message', {
        message: message,
        type: 'group'
      })

      // 로컬 상태 업데이트
      inspection.execution_due_date = formattedDueDate
      
      return true
    } catch (error) {
      console.error('알림 전송 실패:', error)
      throw error
    }
  }

  // 점검 가능 여부 확인
  const isInspectionEnabled = (scheduled_date: string, execution_due_date?: string): boolean => {
    const today = new Date()
    const targetDate = execution_due_date ? new Date(execution_due_date) : new Date(scheduled_date)
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (execution_due_date) {
      // 실행예정일이 있는 경우: 현재부터 실행예정일까지 점검 가능
      return diffDays >= 0 && diffDays <= 5
    } else {
      // 실행예정일이 없는 경우: 예정일 기준 ±5일
      return diffDays >= -5 && diffDays <= 5
    }
  }

  // 텔레그램 메시지 전송
  const sendTelegramMessage = async (message: string) => {
    try {
      const response = await client.post('/telegram/send-message', { message })
      
      if (response.status !== 200) {
        throw new Error('텔레그램 메시지 전송 실패')
      }
      
      return response.data
    } catch (error) {
      console.error('텔레그램 메시지 전송 실패:', error)
      throw error
    }
  }

  return {
    inspections,
    filteredInspections,
    selectedFactory,
    selectedDepartment,
    selectedLine,
    generateRandomInspections,
    fetchInspections,
    updateInspectionStatus,
    updateInspection,
    assignInspector,
    sendInspectionNotification,
    isInspectionEnabled,
    sendTelegramMessage
  }
}) 
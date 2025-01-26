<template>
  <div class="history-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>교대일지 이력</h1>
        </div>
        <div class="description-section">
          <p class="description">완료된 교대 일지를 조회할 수 있습니다.</p>
        </div>
      </div>
      <div class="header-right">
        <select class="mac-input" v-model="selectedDateRange" @change="handleDateRangeChange">
          <option value="today">오늘</option>
          <option value="yesterday">어제</option>
          <option value="week">최근 1주일</option>
          <option value="month">최근 1개월</option>
          <option value="custom">직접 선택</option>
        </select>
      </div>
    </div>

    <div class="history-content glass-card">
      <table class="mac-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>공장</th>
            <th>부서</th>
            <th>교대조</th>
            <th>작성자</th>
            <th>라인명</th>
            <th style="width: 40%">인수인계 사항</th>
            <th style="width: 20%">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="`${record.date}_${record.shift}_${record.writer}`">
            <td>{{ formatDate(record.date) }}</td>
            <td>{{ record.factory }}</td>
            <td>{{ record.department }}</td>
            <td>{{ record.shift }}</td>
            <td>{{ record.writer }}</td>
            <td class="content-cell">
              <table class="inner-table">
                <tbody>
                  <tr v-for="line in record.lines.filter(line => line.handover_content || line.remarks)" :key="`${record.date}_${record.shift}_${line.line_name}`">
                    <td>{{ line.line_name }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="content-cell">
              <table class="inner-table">
                <tbody>
                  <tr v-for="line in record.lines.filter(line => line.handover_content || line.remarks)" :key="`${record.date}_${record.shift}_${line.line_name}_content`">
                    <td>{{ line.handover_content }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td class="content-cell">
              <table class="inner-table">
                <tbody>
                  <tr v-for="line in record.lines.filter(line => line.handover_content || line.remarks)" :key="`${record.date}_${record.shift}_${line.line_name}_remarks`">
                    <td>{{ line.remarks }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr v-if="filteredRecords.length > 0" class="general-remarks-row">
            <td colspan="8" class="content-cell">
              <strong>전체 전달사항: </strong>
              <table class="inner-table">
                <tbody>
                  <tr v-for="record in filteredRecords" :key="`${record.date}_${record.shift}_general_remarks`">
                    <td>
                      <strong>{{ formatDate(record.date) }} {{ record.shift }}: </strong>{{ record.general_remarks }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHandoversStore } from '@/stores/handovers'
import '@/styles/macBaseStyle.scss'

interface HandoverLine {
  line_name: string;
  handover_content: string;
  remarks: string;
}

interface HandoverRecord {
  date: string;
  shift: string;
  factory: string;
  department: string;
  writer: string;
  lines: HandoverLine[];
  general_remarks: string;
}

// 스토어 초기화
const handoversStore = useHandoversStore()

// 상태 관리
const selectedDateRange = ref('today')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

// 필터링된 기록
const filteredRecords = computed(() => {
  return handoversStore.historyRecords as HandoverRecord[]
})

// 날짜 포맷팅
const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateStr))
}

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

// 이벤트 핸들러
const handleDateRangeChange = async () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  switch (selectedDateRange.value) {
    case 'today':
      startDate.value = todayStr
      endDate.value = todayStr
      break
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      startDate.value = yesterdayStr
      endDate.value = yesterdayStr
      break
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      startDate.value = weekAgo.toISOString().split('T')[0]
      endDate.value = todayStr
      break
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      startDate.value = monthAgo.toISOString().split('T')[0]
      endDate.value = todayStr
      break
  }

  await loadHistory()
}

const loadHistory = async () => {
  try {
    await handoversStore.fetchHistory(startDate.value, endDate.value)
  } catch (error) {
    // 로그 제거
  }
}

const viewRecord = (record: any) => {
  // TODO: 상세 보기 다이얼로그 열기
  // 로그 제거
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadHistory()
})
</script>

<style scoped>
.history-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-section h1 {
  font-size: 24px;
  margin: 0;
}

.description-section p {
  margin: 0;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right select.mac-input {
  min-width: 140px;
}

.mac-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.mac-input:focus {
  border-color: #007AFF;
}

.history-content {
  padding: 1rem;
  overflow-x: auto;
}

.mac-table {
  width: 100%;
  border-collapse: collapse;
}

.mac-table th {
  background-color: var(--background-secondary);
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
}

.mac-table td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.mac-table tbody tr:hover {
  background-color: var(--hover-background);
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inner-table {
  width: 100%;
  border-collapse: collapse;
}

.inner-table td {
  border: none;
  padding: 4px 0;
}

.general-remarks-row {
  background-color: var(--background-secondary);
}

.general-remarks-row strong {
  color: var(--system-accent);
}
</style> 
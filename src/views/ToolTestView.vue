<template>
  <div class="tool-test-view">
    <div class="header glass-card">
      <h1>공구 테스트</h1>
      <div class="actions">
        <Button 
          variant="secondary" 
          size="medium"
        >
          + 새 테스트 추가
        </Button>
        <div class="search-box">
          <input 
            type="text" 
            class="macos-input" 
            v-model="searchQuery"
            placeholder="테스트 검색..."
          />
        </div>
      </div>
    </div>

    <div class="tool-test-grid">
      <div class="glass-card">
        <table class="mac-table">
          <thead>
            <tr>
              <th>테스트 ID</th>
              <th>공구명</th>
              <th>테스트 항목</th>
              <th>테스트 결과</th>
              <th>테스트 일자</th>
              <th>담당자</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="test in filteredTests" :key="test.id">
              <td>{{ test.id }}</td>
              <td>{{ test.toolName }}</td>
              <td>{{ test.testItem }}</td>
              <td>
                <span class="mac-badge" :class="getResultClass(test.result)">
                  {{ test.result }}
                </span>
              </td>
              <td>{{ formatDate(test.date) }}</td>
              <td>{{ test.tester }}</td>
              <td>
                <span class="mac-badge" :class="getStatusClass(test.status)">
                  <span class="status-dot"></span>
                  {{ test.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <Button 
                    size="small" 
                    variant="primary"
                    @click="editTest(test)"
                  >
                    수정
                  </Button>
                  <Button 
                    size="small" 
                    variant="danger"
                    @click="deleteTest(test)"
                  >
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/Button.vue'
import '@/styles/components/table.scss'

// 검색어
const searchQuery = ref('')

// 임시 데이터
const tests = ref([
  {
    id: 'T001',
    toolName: '토크 렌치',
    testItem: '토크 정확도',
    result: '합격',
    date: new Date('2024-01-15'),
    tester: '김철수',
    status: '완료'
  },
  {
    id: 'T002',
    toolName: '디지털 캘리퍼스',
    testItem: '영점 조정',
    result: '불합격',
    date: new Date('2024-01-14'),
    tester: '박영희',
    status: '재검사 필요'
  }
])

// 검색 결과 필터링
const filteredTests = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return tests.value.filter(test => 
    test.toolName.toLowerCase().includes(query) ||
    test.id.toLowerCase().includes(query)
  )
})

// 날짜 포맷팅
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR').format(date)
}

// 결과에 따른 클래스 반환
const getResultClass = (result: string) => {
  return {
    'success': result === '합격',
    'danger': result === '불합격'
  }
}

// 상태에 따른 클래스 반환
const getStatusClass = (status: string) => {
  return {
    'success': status === '완료',
    'warning': status === '진행중',
    'danger': status === '재검사 필요'
  }
}

// 테스트 수정
const editTest = (test: any) => {
  console.log('Edit test:', test)
}

// 테스트 삭제
const deleteTest = (test: any) => {
  console.log('Delete test:', test)
}
</script>

<style lang="scss" scoped>
.tool-test-view {
  padding: 20px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 24px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: var(--system-text);
    }
    
    .actions {
      display: flex;
      gap: 16px;
      align-items: center;
      
      .search-box {
        width: 300px;
      }
    }
  }
}
</style> 
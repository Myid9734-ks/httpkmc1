<template>
  <div class="daily-plan-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>일일 생산계획</h1>
          <span class="item-count">총 0개 계획</span>
      </div>
        <div class="description-section">
          <p class="description">일일 생산계획을 등록하고 관리할 수 있습니다.</p>
        </div>
      </div>
      <div class="actions">
        <div class="search-box">
          <span class="search-icon">
            <font-awesome-icon icon="search" />
          </span>
          <input 
            type="text" 
            class="mac-input" 
            v-model="searchQuery"
            placeholder="계획 검색..."
          />
        </div>
        <button class="mac-button primary" @click="openAddDialog">
          <span class="button-icon">+</span>
          새 계획 추가
        </button>
      </div>
    </div>

    <div class="content glass-card">
      <table class="mac-table">
        <thead>
          <tr>
            <th>계획일자</th>
            <th>라인</th>
            <th>품목</th>
            <th>계획수량</th>
            <th>작업자</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in filteredPlans" :key="plan.id">
            <td>{{ plan.date }}</td>
            <td>{{ plan.line }}</td>
            <td>{{ plan.item }}</td>
            <td>{{ plan.quantity }}</td>
            <td>{{ plan.worker }}</td>
            <td>
              <span class="mac-badge" :class="getStatusClass(plan.status)">
                {{ plan.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="mac-button secondary" @click="editPlan(plan)">
                  수정
                </button>
                <button class="mac-button danger" @click="deletePlan(plan)">
                  삭제
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 검색어
const searchQuery = ref('')

// 임시 데이터
const plans = ref([
  {
    id: 1,
    date: '2024-01-15',
    line: 'A라인',
    item: '제품A',
    quantity: 1000,
    worker: '홍길동',
    status: '대기'
  }
])

// 검색 결과 필터링
const filteredPlans = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return plans.value.filter(plan => 
    plan.item.toLowerCase().includes(query) ||
    plan.line.toLowerCase().includes(query)
  )
})

// 상태에 따른 클래스 반환
const getStatusClass = (status: string) => {
  return {
    'success': status === '완료',
    'warning': status === '진행중',
    'danger': status === '지연'
  }
}

// 계획 추가 다이얼로그 열기
const openAddDialog = () => {
  // TODO: 구현
}

// 계획 수정
const editPlan = (plan: any) => {
  // TODO: 구현
}

// 계획 삭제
const deletePlan = (plan: any) => {
  // TODO: 구현
}
</script>

<style lang="scss" scoped>
.daily-plan-view {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  padding: 20px;
    margin-bottom: 20px;

    .header-left {
      .title-section {
        margin-bottom: 8px;

        h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          margin-bottom: 4px;
        }

        .item-count {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }

      .description {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .actions {
      display: flex;
      gap: 12px;

      .search-box {
        position: relative;
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .mac-input {
          padding-left: 36px;
          width: 240px;
        }
      }
    }
}

  .content {
  padding: 20px;

    .mac-table {
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}
</style> 
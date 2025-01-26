<template>
  <div class="performance-input-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>실적등록</h1>
          <span class="item-count">총 0개 실적</span>
        </div>
        <div class="description-section">
          <p class="description">생산 실적을 등록하고 관리할 수 있습니다.</p>
        </div>
      </div>
      <div class="actions">
        <div class="date-selector">
          <input 
            type="date" 
            class="mac-input"
            v-model="selectedDate"
          />
        </div>
        <div class="search-box">
          <span class="search-icon">
            <font-awesome-icon icon="search" />
          </span>
          <input 
            type="text" 
            class="mac-input" 
            v-model="searchQuery"
            placeholder="실적 검색..."
          />
        </div>
        <button class="mac-button primary" @click="openAddDialog">
          <span class="button-icon">+</span>
          실적 등록
        </button>
      </div>
    </div>

    <div class="content glass-card">
      <table class="mac-table">
        <thead>
          <tr>
            <th>등록일시</th>
            <th>라인</th>
            <th>품목</th>
            <th>계획수량</th>
            <th>실적수량</th>
            <th>달성률</th>
            <th>작업자</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="performance in filteredPerformances" :key="performance.id">
            <td>{{ performance.datetime }}</td>
            <td>{{ performance.line }}</td>
            <td>{{ performance.item }}</td>
            <td>{{ performance.planQuantity }}</td>
            <td>{{ performance.actualQuantity }}</td>
            <td>
              <span class="mac-badge" :class="getAchievementClass(performance.achievement)">
                {{ performance.achievement }}%
              </span>
            </td>
            <td>{{ performance.worker }}</td>
            <td>
              <div class="action-buttons">
                <button class="mac-button secondary" @click="editPerformance(performance)">
                  수정
                </button>
                <button class="mac-button danger" @click="deletePerformance(performance)">
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

// 검색어와 선택된 날짜
const searchQuery = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])

// 임시 데이터
const performances = ref([
  {
    id: 1,
    datetime: '2024-01-15 14:30',
    line: 'A라인',
    item: '제품A',
    planQuantity: 1000,
    actualQuantity: 950,
    achievement: 95,
    worker: '홍길동'
  }
])

// 검색 결과 필터링
const filteredPerformances = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return performances.value.filter(performance => 
    performance.item.toLowerCase().includes(query) ||
    performance.line.toLowerCase().includes(query)
  )
})

// 달성률에 따른 클래스 반환
const getAchievementClass = (achievement: number) => {
  if (achievement >= 100) return 'success'
  if (achievement >= 90) return 'warning'
  return 'danger'
}

// 실적 추가 다이얼로그 열기
const openAddDialog = () => {
  // TODO: 구현
}

// 실적 수정
const editPerformance = (performance: any) => {
  // TODO: 구현
}

// 실적 삭제
const deletePerformance = (performance: any) => {
  // TODO: 구현
}
</script>

<style lang="scss" scoped>
.performance-input-view {
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

      .date-selector {
        width: 160px;
      }

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
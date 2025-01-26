<template>
  <div class="performance-status-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>실적현황</h1>
        </div>
        <div class="description-section">
          <p class="description">생산 실적 현황을 조회하고 분석할 수 있습니다.</p>
        </div>
      </div>
      <div class="actions">
        <div class="period-selector">
          <select class="mac-input" v-model="selectedPeriod">
            <option value="day">일간</option>
            <option value="week">주간</option>
            <option value="month">월간</option>
          </select>
        </div>
        <div class="date-range">
          <input 
            type="date" 
            class="mac-input"
            v-model="startDate"
          />
          <span class="date-separator">~</span>
          <input 
            type="date" 
            class="mac-input"
            v-model="endDate"
          />
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-card glass-card">
        <div class="stats-icon success">
          <font-awesome-icon icon="check-circle" />
        </div>
        <div class="stats-content">
          <span class="stats-value">95%</span>
          <span class="stats-label">평균 달성률</span>
        </div>
      </div>

      <div class="stats-card glass-card">
        <div class="stats-icon primary">
          <font-awesome-icon icon="box" />
        </div>
        <div class="stats-content">
          <span class="stats-value">15,000</span>
          <span class="stats-label">총 생산수량</span>
        </div>
      </div>

      <div class="stats-card glass-card">
        <div class="stats-icon warning">
          <font-awesome-icon icon="exclamation-triangle" />
        </div>
        <div class="stats-content">
          <span class="stats-value">3</span>
          <span class="stats-label">미달성 건수</span>
        </div>
      </div>

      <div class="stats-card glass-card">
        <div class="stats-icon info">
          <font-awesome-icon icon="clock" />
        </div>
        <div class="stats-content">
          <span class="stats-value">98%</span>
          <span class="stats-label">가동률</span>
        </div>
      </div>
    </div>

    <div class="content glass-card">
      <table class="mac-table">
        <thead>
          <tr>
            <th>일자</th>
            <th>라인</th>
            <th>품목</th>
            <th>계획수량</th>
            <th>실적수량</th>
            <th>달성률</th>
            <th>가동시간</th>
            <th>비가동시간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="status in performanceStatus" :key="status.id">
            <td>{{ status.date }}</td>
            <td>{{ status.line }}</td>
            <td>{{ status.item }}</td>
            <td>{{ status.planQuantity }}</td>
            <td>{{ status.actualQuantity }}</td>
            <td>
              <span class="mac-badge" :class="getAchievementClass(status.achievement)">
                {{ status.achievement }}%
              </span>
            </td>
            <td>{{ status.operatingTime }}</td>
            <td>{{ status.downtime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 기간 선택
const selectedPeriod = ref('day')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

// 임시 데이터
const performanceStatus = ref([
  {
    id: 1,
    date: '2024-01-15',
    line: 'A라인',
    item: '제품A',
    planQuantity: 1000,
    actualQuantity: 950,
    achievement: 95,
    operatingTime: '7h 30m',
    downtime: '30m'
  }
])

// 달성률에 따른 클래스 반환
const getAchievementClass = (achievement: number) => {
  if (achievement >= 100) return 'success'
  if (achievement >= 90) return 'warning'
  return 'danger'
}
</script>

<style lang="scss" scoped>
.performance-status-view {
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

      .period-selector {
        width: 120px;
      }

      .date-range {
        display: flex;
        align-items: center;
        gap: 8px;

        .date-separator {
          color: var(--text-secondary);
        }

        .mac-input {
          width: 160px;
        }
      }
    }
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stats-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      .stats-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;

        &.success {
          background: rgba(52, 199, 89, 0.1);
          color: var(--mac-success);
        }

        &.primary {
          background: rgba(0, 122, 255, 0.1);
          color: var(--mac-primary);
        }

        &.warning {
          background: rgba(255, 159, 10, 0.1);
          color: var(--mac-warning);
        }

        &.info {
          background: rgba(90, 200, 250, 0.1);
          color: var(--mac-info);
        }
      }

      .stats-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stats-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stats-label {
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .content {
    padding: 20px;

    .mac-table {
      width: 100%;
    }
  }
}
</style> 
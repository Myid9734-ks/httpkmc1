<template>
  <div class="test-view">
    <h1>저장된 점검항목 데이터</h1>
    
    <div class="stats-section">
      <div class="stat-item">
        <h3>1개월 점검</h3>
        <p>{{ inspectionStore.oneMonthCount }}개</p>
      </div>
      <div class="stat-item">
        <h3>3개월 점검</h3>
        <p>{{ inspectionStore.threeMonthCount }}개</p>
      </div>
      <div class="stat-item">
        <h3>6개월 점검</h3>
        <p>{{ inspectionStore.sixMonthCount }}개</p>
      </div>
      <div class="stat-item">
        <h3>12개월 점검</h3>
        <p>{{ inspectionStore.twelveMonthCount }}개</p>
      </div>
    </div>

    <div class="data-section">
      <div v-for="item in inspectionStore.inspections" :key="item.id" class="inspection-card">
        <div class="card-header">
          <span class="code">{{ item.code }}</span>
          <span class="status" :class="item.status">{{ item.status === 'active' ? '사용' : '미사용' }}</span>
        </div>
        <div class="card-body">
          <h3>{{ item.name }}</h3>
          <p class="standard">점검기준: {{ item.standard }}</p>
          <div class="info">
            <span class="cycle">주기: {{ item.cycle }}</span>
            <span class="priority" :class="'priority-' + item.priority.toLowerCase()">
              중요도: {{ item.priority }}
            </span>
          </div>
          <div class="checklist" v-if="item.checklist?.length">
            <h4>체크리스트</h4>
            <ul>
              <li v-for="check in item.checklist" :key="check.id">
                <span class="required-badge" v-if="check.required">필수</span>
                {{ check.content }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useInspectionStore } from '@/stores/inspection'

const inspectionStore = useInspectionStore()

onMounted(() => {
  inspectionStore.fetchInspections()
})
</script>

<style scoped lang="scss">
.test-view {
  padding: 2rem;

  h1 {
    margin-bottom: 2rem;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .stat-item {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;

    h3 {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    p {
      margin: 0.5rem 0 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
  }
}

.data-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.inspection-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;

  .card-header {
    padding: 1rem;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .code {
      font-weight: bold;
      color: #666;
    }

    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;

      &.active {
        background: #e6f4ea;
        color: #1e7e34;
      }

      &.inactive {
        background: #feeced;
        color: #dc3545;
      }
    }
  }

  .card-body {
    padding: 1rem;

    h3 {
      margin: 0 0 0.5rem;
      color: #333;
    }

    .standard {
      color: #666;
      margin: 0 0 1rem;
    }

    .info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      span {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
      }

      .cycle {
        background: #e9ecef;
        color: #495057;
      }

      .priority {
        &.priority-a {
          background: #feeced;
          color: #dc3545;
        }
        &.priority-b {
          background: #fff3cd;
          color: #856404;
        }
        &.priority-c {
          background: #e6f4ea;
          color: #1e7e34;
        }
      }
    }

    .checklist {
      h4 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        color: #666;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style: none;

        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
          color: #495057;

          .required-badge {
            background: #feeced;
            color: #dc3545;
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}
</style> 
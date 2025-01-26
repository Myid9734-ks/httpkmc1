<template>
  <div class="handover-view">
    <div class="header glass-card">
      <div class="header-left">
        <div class="title-section">
          <h1>교대 일지</h1>
        </div>
        <div class="description-section">
          <p class="description">교대 시 인수인계 사항을 기록하고 관리할 수 있습니다.</p>
        </div>
      </div>
    </div>

    <div class="filters glass-card">
      <div class="filter-group">
        <label>날짜</label>
        <input type="date" class="mac-input" v-model="filters.date" @change="loadHandovers" />
      </div>
      <div class="filter-group">
        <label>공장</label>
        <select class="mac-input" v-model="filters.factory" @change="handleFactoryChange">
          <option value="">전체</option>
          <option v-for="factory in factories" :key="factory" :value="factory">
            {{ factory }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>부서</label>
        <select class="mac-input" v-model="filters.department" @change="loadHandovers">
          <option value="">전체</option>
          <option v-for="department in departments" :key="department" :value="department">
            {{ department }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>근무조</label>
        <select class="mac-input" v-model="filters.shift" @change="loadHandovers">
          <option value="주간조">주간조</option>
          <option value="야간조">야간조</option>
        </select>
      </div>
    </div>

    <div class="handover-content glass-card">
      <div v-if="handoversStore.loading" class="loading">
        데이터를 불러오는 중...
      </div>
      <div v-else-if="handoversStore.error" class="error">
        {{ handoversStore.error }}
      </div>
      <table v-else class="mac-table">
        <colgroup>
          <col style="width: 20%" />
          <col style="width: 50%" />
          <col style="width: 30%" />
        </colgroup>
        <thead>
          <tr>
            <th>라인명</th>
            <th>인수인계 사항</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in filteredLines" :key="line.id">
            <td>
              <div>{{ line.name }}</div>
            </td>
            <td>
              <textarea 
                class="mac-input handover-textarea" 
                :placeholder="line.name + '의 인수인계 사항을 입력하세요'"
                v-model="handoverContents[line.id]"
                rows="5"
                :disabled="isCompleted"
              ></textarea>
            </td>
            <td>
              <textarea 
                class="mac-input handover-textarea" 
                placeholder="비고 사항을 입력하세요"
                v-model="remarks[line.id]"
                rows="5"
                :disabled="isCompleted"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="handover-footer glass-card">
      <div class="footer-content">
        <div class="form-group">
          <label>전달사항 및 건의사항</label>
          <textarea 
            class="mac-input handover-textarea" 
            placeholder="전체 라인에 대한 전달사항이나 건의사항을 입력하세요"
            v-model="generalRemarks"
            rows="5"
            :disabled="isCompleted"
          ></textarea>
        </div>
        <div class="button-group">
          <button class="mac-button" @click="saveHandover" :disabled="handoversStore.loading || isCompleted">
            <font-awesome-icon icon="save" class="button-icon" />
            작성중
          </button>
          <button class="mac-button primary" 
            @click="completeHandover" 
            :disabled="handoversStore.loading || isCompleted || !isHandoverTimeEnabled">
            <font-awesome-icon icon="check" class="button-icon" />
            {{ isCompleted ? '인수인계 완료됨' : (isHandoverTimeEnabled ? '인수인계 완료' : '인수인계 시간이 아닙니다') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useLinesStore } from '@/stores/lines';
import { useAuthStore } from '@/stores/auth';
import { useHandoversStore } from '@/stores/handovers';
import '@/styles/macBaseStyle.scss';

// 스토어 초기화
const linesStore = useLinesStore();
const authStore = useAuthStore();
const handoversStore = useHandoversStore();

// 상태 관리
const filters = ref({
  date: new Date().toISOString().split('T')[0],
  factory: authStore.user?.factory || '',
  department: authStore.user?.department || '',
  shift: getDefaultShift()
});

const handoverContents = ref<Record<number, string>>({});
const remarks = ref<Record<number, string>>({});
const generalRemarks = ref('');
const isCompleted = ref(false);

// 공장과 부서 목록
const factories = computed(() => {
  return Array.from(new Set(linesStore.lines
    .filter(line => line.level === 1)
    .map(line => line.name)));
});

const departments = computed(() => {
  if (filters.value.factory) {
    const selectedFactory = linesStore.lines.find(
      line => line.level === 1 && line.name === filters.value.factory
    );
    if (selectedFactory?.children) {
      return Array.from(new Set(selectedFactory.children
        .filter(line => line.level === 2)
        .map(line => line.name)));
    }
  }
  return Array.from(new Set(linesStore.lines
    .flatMap(factory => factory.children || [])
    .filter(line => line?.level === 2)
    .map(line => line.name)));
});

const filteredLines = computed(() => {
  let lines = linesStore.lines;
  
  // 공장 필터링
  if (filters.value.factory) {
    const factory = lines.find(l => l.level === 1 && l.name === filters.value.factory);
    lines = factory?.children || [];
  } else {
    lines = lines.flatMap(factory => factory.children || []);
  }
  
  // 부서 필터링
  if (filters.value.department) {
    const department = lines.find(l => l.level === 2 && l.name === filters.value.department);
    lines = department?.children || [];
  } else {
    lines = lines.flatMap(department => department.children || []);
  }
  
  // level 3 라인들을 가져옴
  const level3Lines = lines.filter(l => l.level === 3);
  
  // 결과 배열 초기화
  const result: typeof level3Lines = [];
  
  // 각 라인을 처리
  level3Lines.forEach(line => {
    if (line.children?.length) {
      // 하위 항목이 있는 경우 각각을 독립적인 라인으로 추가
      line.children.forEach((child, index) => {
        result.push({
          ...line,
          id: result.length + 1,  // 배열의 길이 + 1로 순차적인 ID 부여
          name: `${line.name} ${child.name}`,
          level: 3
        });
      });
    } else {
      // 하위 항목이 없는 라인은 그대로 추가
      result.push({
        ...line,
        id: result.length + 1  // 배열의 길이 + 1로 순차적인 ID 부여
      });
    }
  });
  
  return result;
});

// 현재 시간에 따른 기본 근무조 설정
function getDefaultShift() {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 8 && hours < 20 ? '주간조' : '야간조';
}

// 공장 선택이 변경될 때 부서 선택 초기화 및 재설정
const handleFactoryChange = () => {
  filters.value.department = '';
  loadHandovers();
};

// 인수인계 데이터 로드
const loadHandovers = async () => {
  try {
    await handoversStore.fetchHandovers(filters.value);
    
    // 조회된 데이터로 폼 초기화
    handoverContents.value = {};
    remarks.value = {};
    generalRemarks.value = '';
    
    // 완료 상태 확인
    const completedHandover = handoversStore.handovers.find(h => h.status === 'completed');
    isCompleted.value = !!completedHandover;
    
    handoversStore.handovers.forEach(handover => {
      const line = filteredLines.value.find(l => l.name === handover.line_name);
      if (line) {
        handoverContents.value[line.id] = handover.handover_content || '';
        remarks.value[line.id] = handover.remarks || '';
        if (handover.general_remarks) {
          generalRemarks.value = handover.general_remarks;
        }
      }
    });
  } catch (error) {
    // 에러 처리
  }
};

// 인수인계 저장
const saveHandover = async () => {
  try {
    if (!filters.value.date || !filters.value.shift) {
      alert('날짜와 근무조는 필수 입력 사항입니다.');
      return;
    }

    const promises = filteredLines.value.map(line => {
      const handoverData = {
        date: filters.value.date,
        factory: filters.value.factory || '전체',
        department: filters.value.department || '전체',
        shift: filters.value.shift,
        writer: authStore.user?.name || '',
        line_name: line.name,
        handover_content: handoverContents.value[line.id] || '',
        remarks: remarks.value[line.id] || '',
        general_remarks: generalRemarks.value,
        status: 'pending'
      };

      return handoversStore.createHandover(handoverData);
    });

    await Promise.all(promises);
    alert('저장되었습니다.');
    await loadHandovers();
  } catch (error) {
    alert('저장에 실패했습니다.');
  }
};

// 인수인계 완료
const completeHandover = async () => {
  try {
    if (!filters.value.date || !filters.value.shift) {
      alert('날짜와 근무조는 필수 입력 사항입니다.');
      return;
    }

    const promises = filteredLines.value.map(line => {
      const handoverData = {
        date: filters.value.date,
        factory: filters.value.factory || '전체',
        department: filters.value.department || '전체',
        shift: filters.value.shift,
        writer: authStore.user?.name || '',
        line_name: line.name,
        handover_content: handoverContents.value[line.id] || '',
        remarks: remarks.value[line.id] || '',
        general_remarks: generalRemarks.value,
        status: 'completed'
      };

      return handoversStore.createHandover(handoverData);
    });

    await Promise.all(promises);
    isCompleted.value = true;
    alert('인수인계가 완료되었습니다.');
    await loadHandovers();
  } catch (error) {
    alert('인수인계 완료에 실패했습니다.');
  }
};

// 인수인계 완료 버튼 활성화 시간 체크
const isHandoverTimeEnabled = computed(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;  // 현재 시간을 분으로 변환

  // 활성화 시간대 (분 단위로 변환)
  const enabledTimeRanges = [
    { start: 16 * 60 + 30, end: 17 * 60 + 30 },  // 16:30 ~ 17:30
    { start: 19 * 60 + 30, end: 20 * 60 + 30 },  // 19:30 ~ 20:30
    { start: 4 * 60 + 30, end: 5 * 60 + 30 },    // 04:30 ~ 05:30
    { start: 7 * 60 + 30, end: 8 * 60 + 30 }     // 07:30 ~ 08:30
  ];

  // 현재 시간이 활성화 시간대 중 하나에 포함되는지 확인
  return enabledTimeRanges.some(range => 
    currentTime >= range.start && currentTime <= range.end
  );
});

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    console.log('1. 마운트 시작');
    console.log('1-1. 현재 authStore 상태:', authStore.user);
    
    // 사용자 정보가 없으면 잠시 대기
    let retryCount = 0;
    while (!authStore.user && retryCount < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
      console.log('1-2. authStore 대기 중...', retryCount);
    }
    
    console.log('1-3. 최종 authStore 상태:', authStore.user);
    
    await linesStore.fetchLines();
    console.log('2. 라인 데이터 로드 완료');
    
    // factories computed가 준비될 때까지 대기
    retryCount = 0;
    while (factories.value.length === 0 && retryCount < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
      console.log('2-1. factories 대기 중...', retryCount);
    }
    console.log('3. factories 준비됨:', factories.value);
    
    // 사용자 정보로 필터 설정
    if (authStore.user?.factory) {
      console.log('4-1. 사용자 공장 정보:', authStore.user.factory);
      console.log('4-2. 사용가능한 공장 목록:', factories.value);
      
      // 공백을 제거하고 공장명 비교
      const userFactoryNoSpace = authStore.user.factory.replace(/\s+/g, '');
      const matchingFactory = (factories.value as string[]).find(factory => 
        factory.replace(/\s+/g, '') === userFactoryNoSpace
      );
      
      if (matchingFactory) {
        console.log('4-3. 공장 정보 매칭됨:', matchingFactory);
        filters.value.factory = matchingFactory;
        
        // departments computed가 준비될 때까지 대기
        retryCount = 0;
        while (departments.value.length === 0 && retryCount < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retryCount++;
          console.log('5-1. departments 대기 중...', retryCount);
        }
        console.log('5-2. departments 준비됨:', departments.value);
        
        if (authStore.user?.department) {
          console.log('6. 사용자 부서 정보:', authStore.user.department);
          const userDeptNoSpace = authStore.user.department.replace(/\s+/g, '');
          console.log('6-1. 정규화된 부서명:', userDeptNoSpace);
          
          const matchingDept = (departments.value as string[]).find(dept => 
            dept.replace(/\s+/g, '') === userDeptNoSpace
          );
          
          if (matchingDept) {
            console.log('7. 매칭되는 부서 찾음:', matchingDept);
            filters.value.department = matchingDept;
          } else {
            console.log('7-1. 매칭되는 부서 없음. 가능한 부서 목록:', departments.value);
          }
        }
      } else {
        console.log('4-4. 공장 정보 매칭 실패. 정규화된 공장명:', userFactoryNoSpace);
        console.log('4-5. 가능한 공장 목록(정규화됨):', (factories.value as string[]).map(f => f.replace(/\s+/g, '')));
      }
    } else {
      console.log('4-6. 사용자 공장 정보 없음');
    }
    
    console.log('8. 데이터 로드 시작');
    await loadHandovers();
    console.log('9. 데이터 로드 완료');
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});

// 필터 변경 시 데이터 자동 로드
watch([() => filters.value.date, () => filters.value.shift], loadHandovers);

// factory가 변경될 때 departments 업데이트 후 사용자의 department 설정
watch(() => filters.value.factory, async (newFactory) => {
  try {
    console.log('1. 공장 변경됨:', newFactory);
    filters.value.department = '';
    
    if (newFactory && authStore.user?.department) {
      console.log('2. 사용자 부서 정보 있음:', authStore.user.department);
      
      // departments computed가 준비될 때까지 대기
      let retryCount = 0;
      while (departments.value.length === 0 && retryCount < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
        console.log('2-1. departments 대기 중...', retryCount);
      }
      console.log('3. departments 준비됨:', departments.value);
      
      const userDeptNoSpace = authStore.user.department.replace(/\s+/g, '');
      const matchingDept = (departments.value as string[]).find(dept => 
        dept.replace(/\s+/g, '') === userDeptNoSpace
      );
      
      if (matchingDept) {
        console.log('4. 매칭되는 부서 찾음:', matchingDept);
        filters.value.department = matchingDept;
      } else {
        console.log('4-1. 매칭되는 부서 없음. 가능한 부서 목록:', departments.value);
      }
    }
    
    console.log('5. 데이터 로드 시작');
    await loadHandovers();
    console.log('6. 데이터 로드 완료');
  } catch (error) {
    console.error('Error in factory watch:', error);
  }
});
</script>

<style scoped lang="scss">
.handover-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title-section {
    h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  }

  .description-section {
    margin-top: 8px;
    color: #666;
  }
}

.filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 200px;

    label {
      font-size: 14px;
      color: #666;
    }

    .mac-input {
      width: 100%;
    }
  }
}

.handover-content {
  .loading, .error {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .error {
    color: #ff4444;
  }
}

.handover-textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
}

.handover-footer {
  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      color: #666;
    }
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.button-icon {
  margin-right: 8px;
}
</style> 
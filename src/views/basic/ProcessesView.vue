<template>
  <div class="processes-container">
    <!-- 필터 영역 -->
    <div class="filter-section">
      <el-select 
        v-model="selectedFactory"
        placeholder="공장 선택" 
        clearable 
        @change="handleFactoryChange"
        :loading="linesStore.loading"
      >
        <el-option
          v-for="factory in factories"
          :key="factory.id"
          :label="factory.name"
          :value="factory.id"
        />
      </el-select>
      <el-select 
        v-model="selectedDepartment"
        placeholder="부서 선택" 
        clearable
        :disabled="!selectedFactory"
        @change="handleDepartmentChange"
        :loading="linesStore.loading"
      >
        <el-option
          v-for="dept in departments"
          :key="dept.id"
          :label="dept.name"
          :value="dept.id"
        />
      </el-select>
      <el-select 
        v-model="selectedLine" 
        placeholder="라인 선택" 
        clearable
        :disabled="!selectedDepartment"
        @change="handleLineChange"
        :loading="linesStore.loading"
      >
        <el-option
          v-for="line in lines"
          :key="line.id"
          :label="line.name"
          :value="line.id"
        />
      </el-select>
      <el-select 
        v-model="selectedSubLine" 
        placeholder="세부 라인 선택" 
        clearable
        :disabled="!selectedLine || !subLines.length"
        :loading="linesStore.loading"
      >
        <el-option
          v-for="subLine in subLines"
          :key="subLine.id"
          :label="subLine.name"
          :value="subLine.id"
        />
      </el-select>
      <el-button 
        type="primary" 
        @click="showAddDialog = true"
        :disabled="!isRegisterButtonEnabled"
      >공정 등록</el-button>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="content">
      <!-- 좌측: 공정 목록 -->
      <div class="process-list">
        <h3>공정 목록</h3>
        <el-table :data="filteredProcesses" style="width: 100%">
          <template #empty>
            <div class="empty-message">
              <p>데이터를 보려면 공장 > 부서 > 라인{{ subLines.length > 0 ? ' > 세부 라인' : '' }}을 선택</p>
            </div>
          </template>
          <el-table-column label="구분" width="100">
            <template #default="{ row }">
              <span :class="{ 'internal-icon': row.isInternal, 'external-icon': !row.isInternal }">
                {{ row.isInternal ? '■ 사내' : '■ 사외' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="processCode" label="공정코드" width="100" />
          <el-table-column prop="name" label="공정명" />
          <el-table-column label="위치" min-width="200">
            <template #default="{ row }">
              {{ getLocationPath(row.selectedFactory, row.selectedDepartment, row.selectedLine, row.selectedSubLine) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="작업설명" min-width="150" />
          <el-table-column label="작업" width="80">
            <template #default="{ row }">
              <el-button size="small" @click="editProcess(row)">수정</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 우측: 공정 시각화 -->
      <div class="process-visualization">
        <div class="legend">
          <span>■ 사내공정</span>
          <span style="margin-left: 20px">□ 사외공정</span>
        </div>
        <div class="process-flow-chart">
          <div v-for="(process, index) in filteredProcesses" 
               :key="process.id" 
               class="process-node"
               :class="{ 'internal': process.isInternal }">
            <div class="node-content">
              <span :class="{ 'internal-icon': process.isInternal, 'external-icon': !process.isInternal }">
                {{ process.isInternal ? '■ 사내' : '■ 사외' }}
              </span>
              {{ process.name }}
              <div class="node-code"># {{ process.processCode }}</div>
            </div>
            <!-- 마지막 노드가 아닌 경우에만 화살표 표시 -->
            <div v-if="index < filteredProcesses.length - 1" class="arrow">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 공정 등록/수정 다이얼로그 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingProcess ? '공정 수정' : '공정 등록'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="공정명" required>
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="공정코드" required>
          <el-input 
            v-model="formData.processCode" 
            @input="handleProcessCodeInput"
            placeholder="숫자만 입력하세요"
            class="process-code-input"
          >
            <template #prefix>#</template>
          </el-input>
        </el-form-item>
        <el-form-item label="CT(초)">
          <el-input-number 
            v-model="formData.ct" 
            :min="0"
            placeholder="CT 입력"
          />
        </el-form-item>
        <el-form-item label="셋업시간(분)">
          <el-input-number 
            v-model="formData.setupTime" 
            :min="0"
            placeholder="셋업시간 입력"
          />
        </el-form-item>
        <el-form-item label="공정구분">
          <el-radio-group v-model="formData.isInternal">
            <el-radio :value="true">사내공정</el-radio>
            <el-radio :value="false">사외공정</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="작업설명">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">취소</el-button>
        <el-button type="primary" @click="saveProcess">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProcessesStore } from '@/stores/processes';
import { useLinesStore } from '@/stores/lines';
import type { Process, ProcessFormData } from '@/types/process';
import type { Line } from '@/stores/lines';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const processStore = useProcessesStore();
const linesStore = useLinesStore();
const authStore = useAuthStore();
const { user: currentUser } = storeToRefs(authStore);

// 선택된 값들
const selectedFactory = ref<number | null>(null);
const selectedDepartment = ref<number | null>(null);
const selectedLine = ref<number | null>(null);
const selectedSubLine = ref<number | null>(null);

// 공장 목록 (level 1)
const factories = computed(() => {
  return linesStore.lines.filter(line => line.level === 1);
});

// 부서 목록 (level 2)
const departments = computed(() => {
  if (!selectedFactory.value) return [];
  const factory = linesStore.findLineById(linesStore.lines, selectedFactory.value);
  return factory?.children || [];
});

// 라인 목록 (level 3)
const lines = computed(() => {
  if (!selectedDepartment.value) return [];
  const department = linesStore.findLineById(linesStore.lines, selectedDepartment.value);
  return department?.children || [];
});

// 세부 라인 목록 (level 4)
const subLines = computed(() => {
  if (!selectedLine.value) return [];
  const line = linesStore.findLineById(linesStore.lines, selectedLine.value);
  return line?.children || [];
});

// 공장 선택 시
const handleFactoryChange = (value: number | null) => {
  selectedDepartment.value = null;
  selectedLine.value = null;
  selectedSubLine.value = null;
};

// 부서 선택 시
const handleDepartmentChange = (value: number | null) => {
  selectedLine.value = null;
  selectedSubLine.value = null;
};

// 라인 선택 시
const handleLineChange = (value: number | null) => {
  selectedSubLine.value = null;
};

const processes = computed(() => processStore.processes);
const showAddDialog = ref(false);
const editingProcess = ref<Process | null>(null);

// 검색된 공정 목록
const filteredProcesses = computed(() => {
  // 공정등록 버튼이 비활성화 상태면 빈 배열 반환
  if (!isRegisterButtonEnabled.value) {
    return [];
  }

  // 공정등록 버튼이 활성화된 경우에만 필터링 적용
  let filtered = processes.value.filter((p: Process) => 
    p.selectedFactory === selectedFactory.value &&
    p.selectedDepartment === selectedDepartment.value &&
    p.selectedLine === selectedLine.value
  );

  // 세부 라인이 선택된 경우에만 세부 라인으로 추가 필터링
  if (selectedSubLine.value) {
    filtered = filtered.filter((p: Process) => p.selectedSubLine === selectedSubLine.value);
  }

  return filtered;
});

// 폼 데이터 초기화
const formData = ref<ProcessFormData>({
  name: '',
  processCode: '',
  ct: null,
  setupTime: null,
  isInternal: true,
  description: '',
  selectedFactory: 0,
  selectedDepartment: 0,
  selectedLine: 0,
  selectedSubLine: null
});

// 공정 수정 시작
const editProcess = (process: Process) => {
  editingProcess.value = process;
  formData.value = {
    name: process.name,
    processCode: process.processCode.replace('#', ''),
    ct: process.ct,
    setupTime: process.setupTime,
    isInternal: process.isInternal,
    description: process.description,
    selectedFactory: process.selectedFactory,
    selectedDepartment: process.selectedDepartment,
    selectedLine: process.selectedLine,
    selectedSubLine: process.selectedSubLine
  };
  
  // 선택된 값 설정
  selectedFactory.value = process.selectedFactory;
  selectedDepartment.value = process.selectedDepartment;
  selectedLine.value = process.selectedLine;
  selectedSubLine.value = process.selectedSubLine;
  
  showAddDialog.value = true;
};

// 공정 저장
const saveProcess = async () => {
  // 필수 필드 검증
  if (!formData.value.name || !formData.value.processCode) {
    ElMessage.error('공정명과 공정코드는 필수 입력 항목입니다.');
    return;
  }

  if (!selectedFactory.value || !selectedDepartment.value || !selectedLine.value) {
    ElMessage.error('공장, 부서, 라인을 모두 선택해주세요.');
    return;
  }

  try {
    const processData = {
      ...formData.value,
      selectedFactory: selectedFactory.value,
      selectedDepartment: selectedDepartment.value,
      selectedLine: selectedLine.value,
      selectedSubLine: selectedSubLine.value
    };

    if (editingProcess.value) {
      await processStore.updateProcess(editingProcess.value.id, processData);
      ElMessage.success('공정이 수정되었습니다.');
    } else {
      await processStore.addProcess(processData);
      ElMessage.success('공정이 등록되었습니다.');
    }
    
    showAddDialog.value = false;
    resetForm();
  } catch (error) {
    console.error('공정 저장 중 오류 발생:', error);
    ElMessage.error('공정 저장에 실패했습니다.');
  }
};

// 폼 초기화
const resetForm = () => {
  // 공정 정보만 초기화
  formData.value = {
    name: '',
    processCode: '',
    ct: null,
    setupTime: null,
    isInternal: true,
    description: '',
    selectedFactory: selectedFactory.value || 0,    // 현재 선택된 값 유지
    selectedDepartment: selectedDepartment.value || 0,  // 현재 선택된 값 유지
    selectedLine: selectedLine.value || 0,    // 현재 선택된 값 유지
    selectedSubLine: selectedSubLine.value || null  // 현재 선택된 값 유지
  };
  
  // 수정 모드 초기화
  editingProcess.value = null;
};

// 위치 경로 가져오기
const getLocationPath = (factoryId: number, departmentId: number, lineId: number, subLineId: number | null) => {
  const factory = linesStore.findLineById(linesStore.lines, factoryId);
  const department = linesStore.findLineById(linesStore.lines, departmentId);
  const line = linesStore.findLineById(linesStore.lines, lineId);
  const subLine = subLineId ? linesStore.findLineById(linesStore.lines, subLineId) : null;
  
  return [
    factory?.name, 
    department?.name, 
    line?.name,
    subLine?.name
  ].filter(Boolean).join(' > ') || '-';
};

// 공정코드 입력 처리
const handleProcessCodeInput = (value: string) => {
  // '#' 기호 제거 후 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, '');
  // 숫자만 설정 (# 기호는 UI에서 표시)
  formData.value.processCode = numbers;
};

// 공정 등록 버튼 활성화 여부
const isRegisterButtonEnabled = computed(() => {
  // 공장, 부서, 라인은 필수
  if (!selectedFactory.value || !selectedDepartment.value || !selectedLine.value) {
    return false;
  }

  // level 4가 있는 경우, level 4 선택 필요
  if (subLines.value.length > 0) {
    return !!selectedSubLine.value;
  }

  // level 4가 없는 경우, level 3까지만 선택하면 됨
  return true;
});

// 컴포넌트 마운트 시 라인 데이터 로드 및 사용자 공장/부서 설정
onMounted(async () => {
  await linesStore.fetchLines();
  await processStore.fetchProcesses();
  
  // 사용자의 공장/부서에 해당하는 라인 찾기
  if (currentUser.value) {
    // 띄어쓰기를 제거하고 비교
    const normalizeString = (str: string) => str.replace(/\s+/g, '').toLowerCase();
    const userFactoryNormalized = normalizeString(currentUser.value.factory);
    
    const userFactory = linesStore.lines.find(
      line => line.level === 1 && normalizeString(line.name) === userFactoryNormalized
    );
    
    if (userFactory) {
      selectedFactory.value = userFactory.id;
      
      // 부서 찾기 (띄어쓰기 제거하고 비교)
      const userDepartmentNormalized = normalizeString(currentUser.value.department);
      const userDepartment = userFactory.children?.find(
        dept => normalizeString(dept.name) === userDepartmentNormalized
      );
      
      if (userDepartment) {
        selectedDepartment.value = userDepartment.id;
      }
    }
  }
});
</script>

<style scoped>
.processes-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.filter-section {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
  margin-bottom: 20px;
  white-space: nowrap;
}

.filter-section .el-select {
  width: 200px;
}

.content {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 600px);
}

.process-list {
  flex: 1;
  overflow: auto;
}

.process-visualization {
  flex: 1.3;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  overflow: auto;
  min-height: 50px;
  height: auto;
}

.legend {
  margin-bottom: 20px;
  color: #606266;
  display: flex;
  gap: 20px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 4px;
}

.legend span:first-child {
  color: var(--el-color-primary);
  background-color: rgba(64, 158, 255, 0.1);
}

.legend span:last-child {
  color: var(--el-color-warning);
  background-color: rgba(230, 162, 60, 0.1);
}

.process-flow-chart {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
  height: auto;
}

.process-node {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 40px;
}

.node-content {
  min-width: 130px;
  padding: 10px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-bg-color);
  text-align: center;
  position: relative;
}

.node-content.internal {
  border-color: var(--el-color-primary);
  background-color: rgba(64, 158, 255, 0.1);
}

.node-content:not(.internal) {
  border-color: var(--el-color-warning);
  background-color: rgba(230, 162, 60, 0.1);
}

.node-code {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.arrow {
  color: var(--el-text-color-regular);
  font-size: 24px;
  display: flex;
  align-items: center;
}

.arrow::after {
  content: '→';
  font-size: 24px;
}

.empty-message {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 20px;
}

.process-code-input {
  width: 120px;
}

/* 모바일 대응 스타일 */
@media screen and (max-width: 768px) {
  .content {
    flex-direction: column;  /* 세로 방향으로 변경 */
    min-height: auto;
  }

  .process-list, 
  .process-visualization {
    flex: none;  /* flex 비율 제거 */
    width: 100%;  /* 전체 너비 사용 */
  }

  .filter-section {
    flex-direction: column;  /* 필터 섹션도 세로로 */
    align-items: stretch;
    gap: 10px;
  }

  .filter-section .el-select {
    width: 100%;  /* 셀렉트 박스 전체 너비로 */
  }

  .process-node {
    width: 100%;  /* 노드 전체 너비로 */
    flex-direction: column;  /* 노드 내용과 화살표를 세로로 */
    align-items: center;
    gap: 10px;
  }

  .node-content {
    width: 100%;  /* 노드 컨텐츠 전체 너비로 */
    min-width: auto;
  }

  .arrow {
    transform: rotate(90deg);  /* 화살표를 아래 방향으로 */
    margin: 10px 0;
  }
}

/* 태블릿 대응 스타일 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .filter-section {
    flex-wrap: wrap;  /* 태블릿에서는 wrap 허용 */
  }

  .filter-section .el-select {
    width: calc(50% - 5px);  /* 2열로 배치 */
  }
}

.internal-icon {
  color: var(--el-color-primary);
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(64, 158, 255, 0.1);
}

.external-icon {
  color: var(--el-color-warning);
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(230, 162, 60, 0.1);
}
</style> 
<template>
  <select
    class="mac-input"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLSelectElement)?.value)"
    :disabled="disabled"
    :required="required"
  >
    <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface Option {
  value: string | number;
  label: string;
}

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array as () => Option[],
    required: true
  },
  placeholder: {
    type: String,
    default: '선택하세요'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>();
</script>

<style lang="scss" scoped>
.mac-input {
  width: 100%;
  height: var(--select-height);
  padding: var(--select-padding);
  font-size: var(--select-font-size);
  border-radius: var(--select-border-radius);
  border: var(--select-border-width) solid var(--select-border);
  background-color: var(--input-background);
  color: var(--system-text);
  transition: all 0.2s ease;
  cursor: pointer;

  // 화살표 아이콘 커스텀
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;

  // Firefox에서 화살표 제거
  &::-ms-expand {
    display: none;
  }

  // placeholder 스타일
  &::placeholder {
    color: var(--select-placeholder);
  }

  // hover 상태
  &:hover:not(:disabled) {
    background-color: var(--select-hover-background);
    border-color: var(--select-hover-border);
  }

  // focus 상태
  &:focus {
    outline: none;
    border-color: var(--select-focus-border);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  // disabled 상태
  &:disabled {
    background-color: var(--select-disabled-background);
    color: var(--select-disabled-text);
    cursor: not-allowed;
  }

  // option 스타일링
  option {
    background-color: var(--input-background);
    color: var(--system-text);
    padding: 8px 12px;
  }
}

// 다크 모드
[data-theme="dark"] {
  .mac-input {
    background-color: var(--input-background);
    color: var(--system-text);
    border-color: var(--select-border);

    &:hover:not(:disabled) {
      background-color: var(--select-hover-background);
      border-color: var(--select-hover-border);
    }

    &:focus {
      border-color: var(--select-focus-border);
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    option {
      background-color: var(--input-background);
      color: var(--system-text);
    }
  }
}
</style> 
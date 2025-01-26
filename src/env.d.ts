/// <reference types="vite/client" />

declare module 'element-plus' {
  import type { App, Plugin } from 'vue'
  import type { DefineComponent } from 'vue'
  
  const ElementPlus: Plugin
  
  export const ElMessage: {
    success: (message: string) => void
    warning: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }

  export const ElMessageBox: {
    alert: (message: string, title?: string, options?: any) => Promise<void>
    confirm: (message: string, title?: string, options?: any) => Promise<void>
  }

  export const ElSelect: DefineComponent
  export const ElOption: DefineComponent
  export const ElTable: DefineComponent
  export const ElTableColumn: DefineComponent
  export const ElDialog: DefineComponent
  export const ElForm: DefineComponent
  export const ElFormItem: DefineComponent
  export const ElInput: DefineComponent
  export const ElButton: DefineComponent
  export const ElDatePicker: DefineComponent
  export const ElUpload: DefineComponent

  export default ElementPlus
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue' {
  export interface DefineComponent<Props = {}, RawBindings = {}, D = {}, C = {}, M = {}, Mixin = {}, Extends = {}, E = {}, EE = {}> {
    new (): {
      $props: Props
    }
  }

  export const ref: <T>(value: T) => { value: T }
  export const reactive: <T extends object>(target: T) => T
  export const computed: <T>(getter: () => T) => { value: T }
  export const watch: (source: any, callback: (value: any, oldValue: any) => void) => void
  export const onMounted: (callback: () => void) => void
  export const onBeforeMount: (callback: () => void) => void
  export const onUnmounted: (callback: () => void) => void
  export const nextTick: (callback?: () => void) => Promise<void>
  export const getCurrentInstance: () => any
  export const createApp: (rootComponent: any) => any
  export const h: (type: any, props?: any, children?: any) => any
  export const defineProps: <T extends Record<string, any>>(props?: T) => T
  export const defineEmits: <E extends Record<string, any>>() => E
  export const defineExpose: (exposed: Record<string, any>) => void
}

declare module 'vue-toast-notification' {
  import { Plugin } from 'vue'
  const plugin: Plugin
  export const useToast: () => {
    success: (message: string, options?: any) => void
    error: (message: string, options?: any) => void
  }
  export default plugin
} 
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    isLoading: false,
    error: null as string | null
  }),
  
  actions: {
    setLoading(status: boolean) {
      this.isLoading = status
    },
    setError(error: string | null) {
      this.error = error
    }
  }
}) 
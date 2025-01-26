import { ref, watch } from 'vue'

const THEME_KEY = 'app-theme'
const DARK_THEME = 'dark'
const LIGHT_THEME = 'light'

export function useTheme() {
  // 시스템 테마 감지
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  
  // 현재 테마 상태
  const currentTheme = ref(
    localStorage.getItem(THEME_KEY) || 
    (systemTheme.matches ? DARK_THEME : LIGHT_THEME)
  )

  // 테마 적용 함수
  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
    currentTheme.value = theme
  }

  // 테마 토글 함수
  const toggleTheme = () => {
    const newTheme = currentTheme.value === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    applyTheme(newTheme)
  }

  // 시스템 테마 변경 감지
  systemTheme.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? DARK_THEME : LIGHT_THEME)
    }
  })

  // 초기 테마 적용
  applyTheme(currentTheme.value)

  return {
    currentTheme,
    toggleTheme
  }
} 
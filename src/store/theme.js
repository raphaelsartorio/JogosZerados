import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'jogos-zerados-theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem(STORAGE_KEY) || 'dark')

  const isDark = computed(() => theme.value === 'dark')

  function applyTheme(value) {
    theme.value = value
    document.documentElement.dataset.theme = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark')
  }

  watch(
    theme,
    (value) => {
      document.documentElement.dataset.theme = value
    },
    { immediate: true },
  )

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
  }
})

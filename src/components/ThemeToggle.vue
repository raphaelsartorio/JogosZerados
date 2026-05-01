<script setup>
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '../store/theme'

const theme = useThemeStore()
</script>

<template>
  <button
    type="button"
    class="app-button-muted inline-flex items-center gap-3 rounded-2xl px-4 py-3 font-medium"
    @click="theme.toggleTheme"
  >
    <component :is="theme.isDark ? SunIcon : MoonIcon" class="h-5 w-5" />
    <span>{{ theme.isDark ? 'Modo claro' : 'Modo escuro' }}</span>
  </button>
</template>

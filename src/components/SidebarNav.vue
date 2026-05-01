<script setup>
import {
  ArrowTrendingUpIcon,
  QueueListIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGamesStore } from '../store/games'

const props = defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const route = useRoute()
const store = useGamesStore()

const items = [
  { label: 'Dashboard', to: '/', icon: ArrowTrendingUpIcon },
  { label: 'Lista de Jogos', to: '/jogos', icon: QueueListIcon },
]

const progressLabel = computed(() => `${store.jogos.length} jogos registrados`)

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="glass-panel flex h-full flex-col rounded-[2rem] p-5">
    <div class="mb-8 flex items-start justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">single user</p>
        <h2 class="mt-2 text-xl font-bold">Arquivo vivo</h2>
      </div>
      <button
        v-if="mobile"
        class="rounded-2xl border border-white/10 bg-white/5 p-2 lg:hidden"
        type="button"
        @click="$emit('close')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <div class="mb-8 rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
      <p class="text-sm text-[var(--color-muted)]">Coleção principal</p>
      <p class="mt-2 text-3xl font-bold">{{ store.jogos.length }}</p>
      <p class="mt-2 text-sm text-[var(--color-muted)]">{{ progressLabel }}</p>
    </div>

    <div class="space-y-2">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl px-4 py-3 transition"
        :class="
          isActive(item.to)
            ? 'bg-white/10 text-[var(--color-text)]'
            : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
        "
        @click="$emit('close')"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span class="font-medium">{{ item.label }}</span>
      </router-link>
    </div>

    <div class="mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-muted)]">
      <p class="font-medium text-[var(--color-text)]">Fonte inicial</p>
      <p class="mt-2">A aplicação faz seed automático com a planilha em `public/seed-jogos.xlsx` e permite reimportação manual.</p>
    </div>
  </nav>
</template>

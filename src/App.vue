<script setup>
import { computed, onMounted } from 'vue'
import AppShell from './components/AppShell.vue'
import { useGamesStore } from './store/games'
import { useStatsAnoStore } from './store/statsAno'
import { useTop10Store } from './store/top10'

const gamesStore = useGamesStore()
const top10Store = useTop10Store()
const statsAnoStore = useStatsAnoStore()

const appReady = computed(() =>
  gamesStore.initialized &&
  top10Store.initialized &&
  statsAnoStore.initialized &&
  !gamesStore.loading &&
  !top10Store.loading &&
  !statsAnoStore.loading,
)

onMounted(() => {
  Promise.all([
    gamesStore.initialize(),
    top10Store.initialize(),
    statsAnoStore.initialize(),
  ]).then(() => top10Store.ensureInitialSlots())
})
</script>

<template>
  <AppShell>
    <div
      v-if="gamesStore.error"
      class="mb-6 rounded-3xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    >
      {{ gamesStore.error }}
    </div>

    <div
      v-if="!appReady"
      class="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur"
    >
      <div class="text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[var(--color-accent)]" />
        <p class="text-sm text-[var(--color-muted)]">Carregando biblioteca local...</p>
      </div>
    </div>

    <router-view v-else />
  </AppShell>
</template>

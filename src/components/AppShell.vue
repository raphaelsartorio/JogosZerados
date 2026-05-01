<script setup>
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SidebarNav from './SidebarNav.vue'
import ThemeToggle from './ThemeToggle.vue'
import DataActions from './DataActions.vue'

const isDesktop = ref(false)
const sidebarOpen = ref(false)
let mediaQuery

const showDesktopSidebar = computed(() => isDesktop.value && sidebarOpen.value)
const showMobileSidebar = computed(() => !isDesktop.value && sidebarOpen.value)
const layoutColumns = computed(() =>
  showDesktopSidebar.value ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]',
)

function syncDesktopState(event) {
  isDesktop.value = event.matches
  sidebarOpen.value = event.matches
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  syncDesktopState(mediaQuery)
  mediaQuery.addEventListener('change', syncDesktopState)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncDesktopState)
})
</script>

<template>
  <div class="min-h-screen w-full px-2 py-4 sm:px-3 lg:px-4">
    <div class="grid w-full gap-4" :class="layoutColumns">
      <aside v-if="showDesktopSidebar" class="hidden lg:block">
        <SidebarNav />
      </aside>

      <div class="min-w-0 space-y-4">
        <header class="glass-panel rounded-[2rem] px-5 py-4">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-3">
              <button
                class="app-button-muted inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                type="button"
                :aria-label="sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'"
                @click="toggleSidebar"
              >
                <component :is="sidebarOpen ? XMarkIcon : Bars3Icon" class="h-6 w-6" />
              </button>

              <div>
                <p class="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">biblioteca pessoal</p>
                <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Jogos Zerados</h1>
                <p class="text-sm text-[var(--color-muted)]">
                  Dashboard local com importação de Excel, filtros e backup manual.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ThemeToggle />
              <DataActions />
            </div>
          </div>
        </header>

        <main>
          <slot />
        </main>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 z-50 bg-slate-950/70 p-3 backdrop-blur-sm lg:hidden"
        @click.self="sidebarOpen = false"
      >
        <div class="h-full max-w-xs translate-x-0 transition-transform duration-200 ease-out">
          <SidebarNav mobile @close="sidebarOpen = false" />
        </div>
      </div>
    </transition>
  </div>
</template>

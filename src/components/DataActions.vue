<script setup>
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { useGamesStore } from '../store/games'
import { useStatsAnoStore } from '../store/statsAno'
import { useTop10Store } from '../store/top10'

const gamesStore = useGamesStore()
const top10Store = useTop10Store()
const statsAnoStore = useStatsAnoStore()
const excelInput = ref(null)
const backupInput = ref(null)

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function handleExcelImport(event) {
  const [file] = event.target.files || []
  if (!file) return
  await gamesStore.importExcel(file, 'replace')
  event.target.value = ''
}

async function handleBackupImport(event) {
  const [file] = event.target.files || []
  if (!file) return
  await gamesStore.importBackup(file, 'replace')
  await Promise.all([top10Store.refresh(), statsAnoStore.refresh()])
  event.target.value = ''
}

async function handleExport() {
  const data = await gamesStore.exportAllData()
  const dateStamp = new Date().toISOString().slice(0, 10)
  downloadJson(`jogos-zerados-backup-${dateStamp}.json`, data)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <input ref="excelInput" class="hidden" type="file" accept=".xlsx,.xls" @change="handleExcelImport" />
    <input ref="backupInput" class="hidden" type="file" accept=".json" @change="handleBackupImport" />

    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
      @click="excelInput?.click()"
    >
      <ArrowUpTrayIcon class="h-5 w-5" />
      <span>Importar Excel</span>
    </button>

    <button
      type="button"
      class="app-button-muted inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-medium"
      @click="handleExport"
    >
      <DocumentArrowDownIcon class="h-5 w-5" />
      <span>Exportar dados</span>
    </button>

    <button
      type="button"
      class="app-button-muted inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-medium"
      @click="backupInput?.click()"
    >
      <ArrowDownTrayIcon class="h-5 w-5" />
      <span>Importar backup</span>
    </button>
  </div>
</template>

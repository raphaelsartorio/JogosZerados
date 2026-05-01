import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../services/db'

export const useStatsAnoStore = defineStore('statsAno', () => {
  const items = ref([])
  const loading = ref(false)
  const initialized = ref(false)

  const orderedItems = computed(() =>
    [...items.value].sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0)),
  )

  async function refresh() {
    items.value = await db.statsAno.orderBy('ano').reverse().toArray()
  }

  async function initialize() {
    if (initialized.value) return
    loading.value = true
    try {
      await refresh()
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  async function addItem(ano) {
    const exists = items.value.some((item) => String(item.ano) === String(ano))
    if (exists) return

    await db.statsAno.put({
      id: Date.now(),
      ano,
      jogoDoAnoId: null,
      capaUrl: '',
    })
    await refresh()
  }

  async function updateItem(id, patch) {
    const current = items.value.find((item) => item.id === id)
    if (!current) return

    if (patch.ano != null) {
      const duplicate = items.value.find(
        (item) => item.id !== id && String(item.ano) === String(patch.ano),
      )
      if (duplicate) {
        throw new Error('Já existe uma linha para esse ano.')
      }
    }

    await db.statsAno.put({
      ...current,
      ...patch,
    })
    await refresh()
  }

  async function upsertByAno(ano, patch) {
    const current = items.value.find((item) => String(item.ano) === String(ano))
    if (current) {
      await updateItem(current.id, patch)
      return
    }

    await db.statsAno.put({
      id: Date.now(),
      ano,
      jogoDoAnoId: patch.jogoDoAnoId ?? null,
      capaUrl: patch.capaUrl ?? '',
    })
    await refresh()
  }

  async function removeItem(id) {
    await db.statsAno.delete(id)
    await refresh()
  }

  async function removeByAno(ano) {
    const current = items.value.find((item) => String(item.ano) === String(ano))
    if (!current) return
    await removeItem(current.id)
  }

  return {
    items,
    loading,
    initialized,
    orderedItems,
    initialize,
    refresh,
    addItem,
    updateItem,
    upsertByAno,
    removeItem,
    removeByAno,
  }
})

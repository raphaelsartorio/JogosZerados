import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../services/db'

export const useTop10Store = defineStore('top10', () => {
  const items = ref([])
  const loading = ref(false)
  const initialized = ref(false)

  const orderedItems = computed(() => [...items.value].sort((a, b) => a.posicao - b.posicao))

  async function refresh() {
    items.value = await db.top10.orderBy('posicao').toArray()
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

  async function addItem() {
    const nextPosition = items.value.length + 1
    if (nextPosition > 10) return

    await db.top10.put({
      id: Date.now(),
      posicao: nextPosition,
      jogoId: null,
    })
    await refresh()
  }

  async function ensureInitialSlots() {
    if (items.value.length) return
    const seeds = Array.from({ length: 3 }, (_, index) => ({
      id: Date.now() + index,
      posicao: index + 1,
      jogoId: null,
    }))
    await db.top10.bulkPut(seeds)
    await refresh()
  }

  async function updateItem(id, patch) {
    const current = items.value.find((item) => item.id === id)
    if (!current) return

    await db.top10.put({
      ...current,
      ...patch,
    })
    await refresh()
  }

  async function moveItem(id, direction) {
    const current = orderedItems.value.find((item) => item.id === id)
    if (!current) return

    const targetPosition = current.posicao + direction
    const swap = orderedItems.value.find((item) => item.posicao === targetPosition)

    if (!swap) return

    await db.transaction('rw', db.top10, async () => {
      await db.top10.put({ ...current, posicao: targetPosition })
      await db.top10.put({ ...swap, posicao: current.posicao })
    })

    await refresh()
  }

  async function removeItem(id) {
    await db.top10.delete(id)
    const remaining = orderedItems.value.filter((item) => item.id !== id)
    await db.transaction('rw', db.top10, async () => {
      for (const [index, item] of remaining.entries()) {
        await db.top10.put({ ...item, posicao: index + 1 })
      }
    })
    await refresh()
  }

  return {
    items,
    loading,
    initialized,
    orderedItems,
    initialize,
    refresh,
    addItem,
    ensureInitialSlots,
    updateItem,
    moveItem,
    removeItem,
  }
})

import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../services/db'
import { exportBackup, importBackupFile, normalizeBackupPayload } from '../services/backup'
import { importExcelFile, importExcelUrl, normalizeGameRecord } from '../services/importExcel'
import {
  deriveAnoFromData,
  durationToSeconds,
  formatTagsInput,
  nextNumericId,
  parseTagsInput,
} from '../utils/gameHelpers'

function defaultFilters() {
  return {
    busca: '',
    console: 'all',
    genero: 'all',
    ano: 'all',
    notaMinima: 0,
    ordenarPor: 'dataZerado',
    direcao: 'desc',
    pagina: 1,
    porPagina: 12,
  }
}

function defaultNovoJogo() {
  return {
    nome: '',
    console: '',
    genero: '',
    tipo: '',
    dataZerado: '',
    tempo: '00:00:00',
    nota: 0,
    dificuldade: '',
    tagsTexto: '',
    platinado: false,
  }
}

export const useGamesStore = defineStore('games', () => {
  const jogos = ref([])
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')
  const filters = reactive(defaultFilters())
  const novoJogo = reactive(defaultNovoJogo())

  const consoles = computed(() =>
    [...new Set(jogos.value.map((jogo) => jogo.console).filter(Boolean))].sort(),
  )

  const generos = computed(() =>
    [...new Set(jogos.value.map((jogo) => jogo.genero).filter(Boolean))].sort(),
  )

  const tipos = computed(() =>
    [...new Set(jogos.value.map((jogo) => jogo.tipo).filter(Boolean))].sort(),
  )

  const anos = computed(() =>
    [...new Set(jogos.value.map((jogo) => deriveAnoFromData(jogo.dataZerado)).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a))
      .map(String),
  )

  const jogosOrdenadosFiltrados = computed(() => {
    const busca = filters.busca.trim().toLowerCase()
    const items = jogos.value.filter((jogo) => {
      const ano = deriveAnoFromData(jogo.dataZerado)
      const bateBusca = !busca || jogo.nome.toLowerCase().includes(busca)
      const bateConsole = filters.console === 'all' || jogo.console === filters.console
      const bateGenero = filters.genero === 'all' || jogo.genero === filters.genero
      const bateAno = filters.ano === 'all' || String(ano) === String(filters.ano)
      const bateNota = Number(jogo.nota || 0) >= Number(filters.notaMinima || 0)
      return bateBusca && bateConsole && bateGenero && bateAno && bateNota
    })

    items.sort((a, b) => {
      const leftValue = a[filters.ordenarPor]
      const rightValue = b[filters.ordenarPor]

      if (leftValue == null && rightValue == null) return 0
      if (leftValue == null) return 1
      if (rightValue == null) return -1

      if (leftValue < rightValue) return filters.direcao === 'asc' ? -1 : 1
      if (leftValue > rightValue) return filters.direcao === 'asc' ? 1 : -1
      return 0
    })

    return items
  })

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(jogosOrdenadosFiltrados.value.length / filters.porPagina)),
  )

  const jogosPaginados = computed(() => {
    const start = (filters.pagina - 1) * filters.porPagina
    return jogosOrdenadosFiltrados.value.slice(start, start + filters.porPagina)
  })

  const resumo = computed(() => {
    const total = jogos.value.length
    const jogosComNota = jogos.value.filter((jogo) => Number.isFinite(Number(jogo.nota)))
    const notaMedia = jogosComNota.length
      ? jogosComNota.reduce((sum, jogo) => sum + Number(jogo.nota || 0), 0) / jogosComNota.length
      : 0

    return {
      total,
      notaMedia,
      tempoTotalSegundos: jogos.value.reduce((sum, jogo) => sum + durationToSeconds(jogo.tempo), 0),
    }
  })

  async function refresh() {
    jogos.value = await db.games.orderBy('id').reverse().toArray()
  }

  async function seedFromBundledExcel() {
    const count = await db.games.count()
    if (count > 0) return

    const imported = await importExcelUrl('/seed-jogos.xlsx')
    if (imported.length) {
      await db.games.bulkPut(imported)
    }
  }

  async function initialize() {
    if (initialized.value || loading.value) return

    loading.value = true
    error.value = ''

    try {
      await seedFromBundledExcel()
      await refresh()
      initialized.value = true
    } catch (err) {
      error.value = `Falha ao carregar jogos: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  async function addGame(payload) {
    const id = nextNumericId(jogos.value.map((jogo) => jogo.id))
    const jogo = normalizeGameRecord({
      id,
      ...payload,
    })
    await db.games.put(jogo)
    await refresh()
    return jogo
  }

  async function createFromForm() {
    loading.value = true
    error.value = ''

    try {
      await addGame({
        nome: novoJogo.nome,
        console: novoJogo.console,
        genero: novoJogo.genero,
        tipo: novoJogo.tipo,
        dataZerado: novoJogo.dataZerado,
        tempo: novoJogo.tempo,
        nota: novoJogo.nota,
        dificuldade: novoJogo.dificuldade,
        tags: parseTagsInput(novoJogo.tagsTexto),
        platinado: novoJogo.platinado,
      })
      Object.assign(novoJogo, defaultNovoJogo())
      filters.pagina = 1
    } catch (err) {
      error.value = `Falha ao criar jogo: ${err.message}`
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGame(id, patch) {
    const current = jogos.value.find((jogo) => String(jogo.id) === String(id))
    if (!current) return

    const updated = normalizeGameRecord({
      ...current,
      ...patch,
      id: current.id,
    })

    await db.games.put(updated)
    await refresh()
  }

  async function deleteGame(id) {
    await db.games.delete(id)
    await refresh()
  }

  async function importExcel(file, mode = 'replace') {
    loading.value = true
    error.value = ''

    try {
      const imported = await importExcelFile(file)
      await db.transaction('rw', db.games, async () => {
        if (mode === 'replace') {
          await db.games.clear()
        }
        await db.games.bulkPut(imported)
      })
      await refresh()
      filters.pagina = 1
      return imported.length
    } catch (err) {
      error.value = `Falha ao importar Excel: ${err.message}`
      throw err
    } finally {
      loading.value = false
    }
  }

  async function importBackup(file, mode = 'replace') {
    loading.value = true
    error.value = ''

    try {
      const raw = await importBackupFile(file)
      const payload = normalizeBackupPayload(raw)

      await db.transaction('rw', db.games, db.top10, db.statsAno, async () => {
        if (mode === 'replace') {
          await db.games.clear()
          await db.top10.clear()
          await db.statsAno.clear()
        }

        if (payload.jogos.length) {
          await db.games.bulkPut(payload.jogos)
        }
        if (payload.top10.length) {
          await db.top10.bulkPut(payload.top10)
        }
        if (payload.statsAno.length) {
          await db.statsAno.bulkPut(payload.statsAno)
        }
      })

      await refresh()
      return payload.jogos.length
    } catch (err) {
      error.value = `Falha ao importar backup: ${err.message}`
      throw err
    } finally {
      loading.value = false
    }
  }

  async function exportAllData() {
    return exportBackup()
  }

  function updateSort(field) {
    if (filters.ordenarPor === field) {
      filters.direcao = filters.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      filters.ordenarPor = field
      filters.direcao = field === 'nome' ? 'asc' : 'desc'
    }
  }

  function resetFilters() {
    Object.assign(filters, defaultFilters())
  }

  function setPage(page) {
    filters.pagina = Math.min(Math.max(page, 1), totalPaginas.value)
  }

  function getGameById(id) {
    return jogos.value.find((jogo) => String(jogo.id) === String(id)) || null
  }

  function getTagText(jogo) {
    return formatTagsInput(jogo.tags)
  }

  return {
    jogos,
    loading,
    initialized,
    error,
    filters,
    novoJogo,
    consoles,
    generos,
    tipos,
    anos,
    jogosOrdenadosFiltrados,
    jogosPaginados,
    totalPaginas,
    resumo,
    initialize,
    refresh,
    createFromForm,
    updateGame,
    deleteGame,
    importExcel,
    importBackup,
    exportAllData,
    updateSort,
    resetFilters,
    setPage,
    getGameById,
    getTagText,
  }
})

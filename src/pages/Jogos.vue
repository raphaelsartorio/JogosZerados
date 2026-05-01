<script setup>
import { reactive, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import InlineEdit from '../components/InlineEdit.vue'
import TableEditable from '../components/TableEditable.vue'
import { useGamesStore } from '../store/games'
import { formatDate, formatDurationCompact, formatNumber } from '../utils/formatters'
import { getDifficultyTone, getScoreTone, parseTagsInput } from '../utils/gameHelpers'

const store = useGamesStore()
const editingIds = ref([])
const drafts = reactive({})

const sortColumns = [
  { key: 'nome', label: 'Nome' },
  { key: 'console', label: 'Console' },
  { key: 'genero', label: 'Gênero' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'dataZerado', label: 'Data' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'nota', label: 'Nota' },
  { key: 'dificuldade', label: 'Dif.' },
]

const mainFields = [
  { key: 'console', label: 'Console' },
  { key: 'genero', label: 'Gênero' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'nota', label: 'Nota', format: (jogo) => formatNumber(jogo.nota), type: 'number' },
]

const metaFields = [
  { key: 'dataZerado', label: 'Data', format: (jogo) => formatDate(jogo.dataZerado), type: 'date' },
  { key: 'tempo', label: 'Tempo', format: (jogo) => formatDurationCompact(jogo.tempo) },
  { key: 'dificuldade', label: 'Dificuldade' },
]

function toneClasses(type, value) {
  const tone = type === 'score' ? getScoreTone(Number(value || 0)) : getDifficultyTone(value)
  const map = {
    emerald: 'bg-emerald-400/15 text-emerald-300',
    sky: 'bg-sky-400/15 text-sky-300',
    amber: 'bg-amber-400/15 text-amber-300',
    rose: 'bg-rose-400/15 text-rose-300',
    slate: 'bg-slate-400/15 text-slate-300',
  }
  return map[tone]
}

function isEditing(id) {
  return editingIds.value.includes(id)
}

function startEditing(jogo) {
  if (isEditing(jogo.id)) return

  drafts[jogo.id] = {
    nome: jogo.nome,
    console: jogo.console,
    genero: jogo.genero,
    tipo: jogo.tipo,
    dataZerado: jogo.dataZerado,
    tempo: jogo.tempo,
    nota: jogo.nota,
    dificuldade: jogo.dificuldade,
    tagsTexto: store.getTagText(jogo),
    platinado: jogo.platinado,
  }
  editingIds.value = [...editingIds.value, jogo.id]
}

function cancelEditing(id) {
  editingIds.value = editingIds.value.filter((entry) => entry !== id)
  delete drafts[id]
}

async function saveEditing(id) {
  const draft = drafts[id]
  if (!draft) return

  await store.updateGame(id, {
    nome: draft.nome,
    console: draft.console,
    genero: draft.genero,
    tipo: draft.tipo,
    dataZerado: draft.dataZerado,
    tempo: draft.tempo,
    nota: draft.nota,
    dificuldade: draft.dificuldade,
    tags: parseTagsInput(draft.tagsTexto),
    platinado: draft.platinado,
  })

  cancelEditing(id)
}

function displayField(jogo, field) {
  if (field.key === 'nota') {
    return formatNumber(jogo.nota)
  }
  return jogo[field.key] || 'N/D'
}

function updateDraftValue(jogoId, field, value) {
  drafts[jogoId][field] = value
}
</script>

<template>
  <div class="space-y-4">
    <TableEditable
      title="Novo jogo"
      description="Cadastro rápido. Preencha e salve sem sair da tela."
    >
      <template #head>
        <tr class="text-left text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <th class="px-5 py-4">Nome</th>
          <th class="px-5 py-4">Console</th>
          <th class="px-5 py-4">Gênero</th>
          <th class="px-5 py-4">Tipo</th>
          <th class="px-5 py-4">Data</th>
          <th class="px-5 py-4">Tempo</th>
          <th class="px-5 py-4">Nota</th>
          <th class="px-5 py-4">Dif.</th>
          <th class="px-5 py-4">Tags</th>
          <th class="px-5 py-4">Platina</th>
          <th class="px-5 py-4 text-right">Ação</th>
        </tr>
      </template>

      <tr class="border-b border-white/5 bg-white/[0.03]">
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.nome" placeholder="Nome do jogo" @commit="store.novoJogo.nome = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.console" placeholder="PC, PS2..." @commit="store.novoJogo.console = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.genero" placeholder="Ação" @commit="store.novoJogo.genero = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.tipo" placeholder="FPS" @commit="store.novoJogo.tipo = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.dataZerado" type="date" @commit="store.novoJogo.dataZerado = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.tempo" placeholder="12:30:00" @commit="store.novoJogo.tempo = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.nota" type="number" min="0" max="10" step="0.1" @commit="store.novoJogo.nota = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.dificuldade" placeholder="A, B, C..." @commit="store.novoJogo.dificuldade = $event" /></td>
        <td class="px-5 py-3"><InlineEdit v-model="store.novoJogo.tagsTexto" placeholder="100%, DLC" @commit="store.novoJogo.tagsTexto = $event" /></td>
        <td class="px-5 py-3 text-center"><InlineEdit v-model="store.novoJogo.platinado" type="checkbox" @commit="store.novoJogo.platinado = $event" /></td>
        <td class="px-5 py-3 text-right">
          <button
            type="button"
            class="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            @click="store.createFromForm"
          >
            Salvar
          </button>
        </td>
      </tr>
    </TableEditable>

    <section class="glass-panel rounded-[1.75rem] p-5">
      <div class="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Busca</span>
          <input
            v-model="store.filters.busca"
            class="app-input rounded-2xl px-4 py-3"
            type="search"
            placeholder="Nome do jogo"
            @input="store.setPage(1)"
          />
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Console</span>
          <select v-model="store.filters.console" class="app-select rounded-2xl px-4 py-3" @change="store.setPage(1)">
            <option value="all">Todos</option>
            <option v-for="console in store.consoles" :key="console" :value="console">{{ console }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Gênero</span>
          <select v-model="store.filters.genero" class="app-select rounded-2xl px-4 py-3" @change="store.setPage(1)">
            <option value="all">Todos</option>
            <option v-for="genero in store.generos" :key="genero" :value="genero">{{ genero }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Ano</span>
          <select v-model="store.filters.ano" class="app-select rounded-2xl px-4 py-3" @change="store.setPage(1)">
            <option value="all">Todos</option>
            <option v-for="ano in store.anos" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Nota mínima</span>
          <input
            v-model.number="store.filters.notaMinima"
            class="app-input rounded-2xl px-4 py-3"
            type="number"
            min="0"
            max="10"
            step="0.1"
            @input="store.setPage(1)"
          />
        </label>
        <label class="space-y-2">
          <span class="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Por página</span>
          <select v-model.number="store.filters.porPagina" class="app-select rounded-2xl px-4 py-3" @change="store.setPage(1)">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="36">36</option>
          </select>
        </label>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="app-button-muted rounded-2xl px-4 py-2"
          @click="store.resetFilters"
        >
          Limpar filtros
        </button>
      </div>
    </section>

    <section class="glass-panel overflow-hidden rounded-[1.75rem]">
      <div class="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="section-title">Biblioteca de jogos</h2>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            {{ store.jogosOrdenadosFiltrados.length }} resultados com leitura completa e edição por ação.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="column in sortColumns"
            :key="column.key"
            type="button"
            class="app-button-muted rounded-2xl px-3 py-2"
            @click="store.updateSort(column.key)"
          >
            {{ column.label }} <span v-if="store.filters.ordenarPor === column.key">{{ store.filters.direcao === 'asc' ? '↑' : '↓' }}</span>
          </button>
        </div>
      </div>

      <div class="space-y-4 p-5">
        <article
          v-for="jogo in store.jogosPaginados"
          :key="jogo.id"
          class="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
        >
          <div class="space-y-4">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">Jogo</p>
                <div v-if="isEditing(jogo.id)" class="mt-2 max-w-5xl">
                  <InlineEdit v-model="drafts[jogo.id].nome" @commit="updateDraftValue(jogo.id, 'nome', $event)" />
                </div>
                <h3 v-else class="mt-2 break-words text-xl font-semibold leading-tight">
                  {{ jogo.nome }}
                </h3>
              </div>

              <div class="flex flex-wrap gap-2">
                <span class="inline-flex rounded-full px-3 py-1 text-sm font-semibold" :class="toneClasses('score', jogo.nota)">
                  Nota {{ formatNumber(jogo.nota) }}
                </span>
                <span class="inline-flex rounded-full px-3 py-1 text-sm font-semibold" :class="toneClasses('difficulty', jogo.dificuldade)">
                  Dif. {{ jogo.dificuldade || 'N/D' }}
                </span>
                <span class="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                  {{ jogo.platinado ? 'Platinado' : 'Sem platina' }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <div
                v-for="field in mainFields"
                :key="`${jogo.id}-${field.key}`"
                class="min-w-[13rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 xl:flex-none"
              >
                <p class="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ field.label }}</p>
                <div v-if="isEditing(jogo.id)" class="mt-2">
                  <InlineEdit
                    v-model="drafts[jogo.id][field.key]"
                    :type="field.type || 'text'"
                    @commit="updateDraftValue(jogo.id, field.key, $event)"
                  />
                </div>
                <p v-else class="mt-1 truncate text-sm font-semibold leading-snug">
                  {{ displayField(jogo, field) }}
                </p>
              </div>

              <div
                v-for="field in metaFields"
                :key="`${jogo.id}-meta-${field.key}`"
                class="min-w-[13rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 xl:flex-none"
              >
                <p class="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{{ field.label }}</p>
                <div v-if="isEditing(jogo.id)" class="mt-2">
                  <InlineEdit
                    v-if="field.type !== 'checkbox'"
                    v-model="drafts[jogo.id][field.key]"
                    :type="field.type || 'text'"
                    @commit="updateDraftValue(jogo.id, field.key, $event)"
                  />
                  <InlineEdit
                    v-else
                    v-model="drafts[jogo.id][field.key]"
                    type="checkbox"
                    @commit="updateDraftValue(jogo.id, field.key, $event)"
                  />
                </div>
                <p v-else class="mt-1 truncate text-sm font-semibold leading-snug">
                  {{ field.format ? field.format(jogo) : (jogo[field.key] || 'N/D') }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              <template v-if="isEditing(jogo.id)">
                <button
                  type="button"
                  class="app-button-muted rounded-xl px-3 py-2"
                  @click="cancelEditing(jogo.id)"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  @click="saveEditing(jogo.id)"
                >
                  Salvar
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="app-button-muted rounded-xl px-3 py-2"
                  @click="startEditing(jogo)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
                  @click="store.deleteGame(jogo.id)"
                >
                  Deletar
                </button>
              </template>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div class="flex items-center justify-between px-1">
      <p class="text-sm text-[var(--color-muted)]">Página {{ store.filters.pagina }} de {{ store.totalPaginas }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="app-button-muted rounded-2xl p-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="store.filters.pagina === 1"
          @click="store.setPage(store.filters.pagina - 1)"
        >
          <ChevronLeftIcon class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="app-button-muted rounded-2xl p-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="store.filters.pagina === store.totalPaginas"
          @click="store.setPage(store.filters.pagina + 1)"
        >
          <ChevronRightIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

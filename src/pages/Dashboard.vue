<script setup>
import { computed } from 'vue'
import InlineEdit from '../components/InlineEdit.vue'
import TableEditable from '../components/TableEditable.vue'
import { buildGenreTypeCards, buildTop10Rows, buildYearRows } from '../services/stats'
import { useGamesStore } from '../store/games'
import { useStatsAnoStore } from '../store/statsAno'
import { useTop10Store } from '../store/top10'
import { formatDurationCompact, formatNumber } from '../utils/formatters'

const gamesStore = useGamesStore()
const top10Store = useTop10Store()
const statsAnoStore = useStatsAnoStore()

const anoRows = computed(() => buildYearRows(gamesStore.jogos, statsAnoStore.items))
const top10Rows = computed(() => buildTop10Rows(top10Store.orderedItems, gamesStore.jogos))
const tipoCards = computed(() => buildGenreTypeCards(gamesStore.jogos))

const nextAnoDisponivel = computed(() => {
  const anos = anoRows.value.map((row) => Number(row.ano)).filter(Boolean)
  if (!anos.length) {
    return new Date().getFullYear()
  }

  return Math.max(...anos) + 1
})

function jogosDoAno(ano) {
  return gamesStore.jogos
    .filter((jogo) => String(jogo.dataZerado || '').startsWith(String(ano)))
    .map((jogo) => ({
      label: jogo.nome,
      value: jogo.id,
    }))
}

async function addAnoRow() {
  await statsAnoStore.addItem(nextAnoDisponivel.value)
}

async function updateAnoJogo(ano, jogoDoAnoId) {
  await statsAnoStore.upsertByAno(ano, {
    jogoDoAnoId: jogoDoAnoId ? Number(jogoDoAnoId) : null,
  })
}

async function updateAnoManual(row, ano) {
  if (!row.statsAnoId) return
  await statsAnoStore.updateItem(row.statsAnoId, {
    ano: Number(ano),
  })
}

async function removeAnoRow(row) {
  if (row.statsAnoId) {
    await statsAnoStore.removeItem(row.statsAnoId)
  }
}

function getCoverUrl(row) {
  return row.capaUrl || row.jogoDoAno?.imagemUrl || ''
}

async function onAnoCoverSelected(row, event) {
  const [file] = event.target.files || []
  if (!file || !row.statsAnoId) return

  const reader = new FileReader()
  reader.onload = async () => {
    await statsAnoStore.updateItem(row.statsAnoId, {
      capaUrl: String(reader.result || ''),
    })
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

async function clearAnoCover(row) {
  if (!row.statsAnoId) return
  await statsAnoStore.updateItem(row.statsAnoId, {
    capaUrl: '',
  })
}

async function addTop10Row() {
  await top10Store.addItem()
}

async function updateTop10(row, jogoId) {
  await top10Store.updateItem(row.id, {
    jogoId: jogoId ? Number(jogoId) : null,
  })
}

function generoToneClass(genero) {
  const palette = [
    'from-rose-500 to-orange-500',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-fuchsia-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
    'from-pink-500 to-rose-600',
    'from-lime-500 to-emerald-600',
  ]

  const text = String(genero || '')
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 xl:grid-cols-3">
      <div class="glass-panel rounded-[1.75rem] p-5">
        <p class="text-sm text-[var(--color-muted)]">Jogos zerados</p>
        <p class="mt-3 text-3xl font-bold">{{ formatNumber(gamesStore.resumo.total, 0) }}</p>
      </div>
      <div class="glass-panel rounded-[1.75rem] p-5">
        <p class="text-sm text-[var(--color-muted)]">Média de nota</p>
        <p class="mt-3 text-3xl font-bold">{{ formatNumber(gamesStore.resumo.notaMedia, 2) }}</p>
      </div>
      <div class="glass-panel rounded-[1.75rem] p-5">
        <p class="text-sm text-[var(--color-muted)]">Tempo total</p>
        <p class="mt-3 text-3xl font-bold">
          {{ formatDurationCompact(gamesStore.resumo.tempoTotalSegundos) }}
        </p>
      </div>
    </div>

    <section class="glass-panel overflow-hidden rounded-[1.75rem]">
      <div class="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="section-title">Totais zerados ao longo dos anos</h2>
          <p class="mt-1 text-sm text-[var(--color-muted)]">
            Visual em cards com capa, horas jogadas e jogo do ano no estilo da planilha.
          </p>
        </div>
        <button
          type="button"
          class="rounded-2xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          @click="addAnoRow"
        >
          Adicionar ano
        </button>
      </div>

      <div class="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="row in anoRows"
          :key="`ano-card-${row.ano}-${row.statsAnoId || 'auto'}`"
          class="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--color-panel-strong)]"
        >
          <div class="relative aspect-[3/4] overflow-hidden border-b border-white/10 bg-slate-900/60">
            <img
              v-if="getCoverUrl(row)"
              :src="getCoverUrl(row)"
              :alt="row.jogoDoAno?.nome || `Capa ${row.ano}`"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full items-center justify-center bg-gradient-to-br from-sky-400/20 via-emerald-400/10 to-transparent px-6 text-center"
            >
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Jogo do ano</p>
                <p class="mt-3 text-lg font-semibold">{{ row.jogoDoAno?.nome || 'Sem capa' }}</p>
              </div>
            </div>

            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
              <div class="flex items-end justify-between gap-3">
                <div class="rounded-2xl bg-slate-950/70 px-3 py-2 backdrop-blur">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">Ano</p>
                  <p class="text-xl font-bold">{{ row.ano }}</p>
                </div>
                <div class="rounded-2xl bg-emerald-400/20 px-3 py-2 text-right backdrop-blur">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">Zerados</p>
                  <p class="text-xl font-bold text-emerald-200">{{ row.jogosZerados }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3 p-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl bg-white/5 px-3 py-3">
                <p class="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">Tempo</p>
                <p class="mt-2 font-semibold">{{ row.tempoTotalLabel }}</p>
              </div>
              <div class="rounded-2xl bg-white/5 px-3 py-3">
                <p class="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">Jogo do ano</p>
                <p class="mt-2 line-clamp-2 font-semibold">{{ row.jogoDoAno?.nome || 'Selecionar' }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <InlineEdit
                v-if="row.statsAnoId"
                :model-value="row.ano"
                type="number"
                @commit="updateAnoManual(row, $event)"
              />
              <InlineEdit
                :model-value="row.jogoDoAnoId || ''"
                type="select"
                :options="jogosDoAno(row.ano)"
                placeholder="Selecionar jogo do ano"
                @commit="updateAnoJogo(row.ano, $event)"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <label class="inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10">
                <input class="hidden" type="file" accept="image/*" @change="onAnoCoverSelected(row, $event)" />
                <span>Adicionar imagem</span>
              </label>
              <button
                v-if="row.capaUrl"
                type="button"
                class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                @click="clearAnoCover(row)"
              >
                Remover imagem
              </button>
              <button
                type="button"
                class="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
                @click="removeAnoRow(row)"
              >
                Remover ano
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <TableEditable
      title="Top 10 jogos favoritos"
      description="Escolha rápida da sua lista e reorganização por botões."
      add-label="Adicionar posição"
      :can-add="top10Store.items.length < 10"
      @add="addTop10Row"
    >
      <template #head>
        <tr class="text-left text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <th class="px-5 py-4">Posição</th>
          <th class="px-5 py-4">Jogo</th>
          <th class="px-5 py-4">Nota</th>
          <th class="px-5 py-4">Console</th>
          <th class="px-5 py-4 text-right">Ações</th>
        </tr>
      </template>

      <tr
        v-for="(row, index) in top10Rows"
        :key="row.id"
        :class="index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'"
        class="border-b border-white/5 transition hover:bg-white/[0.05]"
      >
        <td class="px-5 py-3 text-sm font-semibold">{{ row.posicao }}</td>
        <td class="px-5 py-3">
          <InlineEdit
            :model-value="row.jogoId || ''"
            type="select"
            :options="gamesStore.jogos.map((jogo) => ({ label: jogo.nome, value: jogo.id }))"
            placeholder="Selecionar jogo"
            @commit="updateTop10(row, $event)"
          />
        </td>
        <td class="px-5 py-3 text-sm">{{ row.jogo ? formatNumber(row.jogo.nota) : '-' }}</td>
        <td class="px-5 py-3 text-sm">{{ row.jogo?.console || '-' }}</td>
        <td class="px-5 py-3 text-right">
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
              @click="top10Store.moveItem(row.id, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
              @click="top10Store.moveItem(row.id, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
              @click="top10Store.removeItem(row.id)"
            >
              Remover
            </button>
          </div>
        </td>
      </tr>
    </TableEditable>

    <section class="glass-panel overflow-hidden rounded-[1.75rem]">
      <div class="border-b border-white/10 px-5 py-4">
        <h2 class="section-title">Estatísticas de tipos</h2>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          Cards por gênero com mini-tabelas ordenadas por quantidade de jogos zerados.
        </p>
      </div>

      <div class="grid gap-4 p-5 xl:grid-cols-2">
        <article
          v-for="card in tipoCards"
          :key="card.genero"
          class="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--color-panel-strong)]"
        >
          <header :class="generoToneClass(card.genero)" class="bg-gradient-to-r px-4 py-4 text-white">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.22em] text-white/80">Gênero</p>
                <h3 class="mt-1 text-xl font-bold">{{ card.genero }}</h3>
              </div>
              <div class="flex gap-2">
                <div class="rounded-2xl bg-black/20 px-3 py-2 text-right backdrop-blur">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-white/70">Jogos</p>
                  <p class="text-lg font-bold">{{ card.jogosZerados }}</p>
                </div>
                <div class="rounded-2xl bg-black/20 px-3 py-2 text-right backdrop-blur">
                  <p class="text-[10px] uppercase tracking-[0.2em] text-white/70">Tempo</p>
                  <p class="text-lg font-bold">{{ card.tempoTotalLabel }}</p>
                </div>
              </div>
            </div>
          </header>

          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
              <thead class="sticky top-0 bg-black/10 text-left text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                <tr>
                  <th class="px-4 py-3">Tipo</th>
                  <th class="px-4 py-3">Jogos</th>
                  <th class="px-4 py-3">Tempo</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(tipo, index) in card.tipos"
                  :key="`${card.genero}-${tipo.tipo}`"
                  :class="index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'"
                  class="border-b border-white/5 transition hover:bg-white/[0.05]"
                >
                  <td class="px-4 py-3 text-sm font-medium">{{ tipo.tipo }}</td>
                  <td class="px-4 py-3 text-sm">{{ tipo.jogosZerados }}</td>
                  <td class="px-4 py-3 text-sm">{{ tipo.tempoTotalLabel }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-white/[0.04]">
                <tr>
                  <td class="px-4 py-3 text-sm font-semibold">Subtotal</td>
                  <td class="px-4 py-3 text-sm font-semibold">{{ card.jogosZerados }}</td>
                  <td class="px-4 py-3 text-sm font-semibold">{{ card.tempoTotalLabel }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

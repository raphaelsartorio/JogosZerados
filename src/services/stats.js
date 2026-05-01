import { deriveAnoFromData, durationToSeconds, secondsToDuration } from '../utils/gameHelpers'
import { formatDurationCompact } from '../utils/formatters'

export function buildYearRows(jogos, statsAno) {
  const byYear = new Map()

  for (const jogo of jogos) {
    const ano = deriveAnoFromData(jogo.dataZerado)
    if (!ano) continue

    if (!byYear.has(ano)) {
      byYear.set(ano, {
        ano,
        jogosZerados: 0,
        tempoSegundos: 0,
      })
    }

    const row = byYear.get(ano)
    row.jogosZerados += 1
    row.tempoSegundos += durationToSeconds(jogo.tempo)
  }

  for (const item of statsAno) {
    const ano = Number(item.ano)
    if (!byYear.has(ano)) {
      byYear.set(ano, {
        ano,
        jogosZerados: 0,
        tempoSegundos: 0,
      })
    }

    byYear.get(ano).statsAnoId = item.id
    byYear.get(ano).jogoDoAnoId = item.jogoDoAnoId ?? null
    byYear.get(ano).capaUrl = item.capaUrl || ''
    byYear.get(ano).manual = true
  }

  return [...byYear.values()]
    .sort((a, b) => b.ano - a.ano)
    .map((row) => ({
      ...row,
      jogoDoAno: jogos.find((jogo) => String(jogo.id) === String(row.jogoDoAnoId)) || null,
      tempoTotal: secondsToDuration(row.tempoSegundos),
      tempoTotalLabel: formatDurationCompact(row.tempoSegundos),
    }))
}

export function buildTop10Rows(items, jogos) {
  return items.map((item) => {
    const jogo = jogos.find((entry) => String(entry.id) === String(item.jogoId)) || null
    return {
      ...item,
      jogo,
    }
  })
}

export function buildGenreTypeRows(jogos) {
  const groups = new Map()

  for (const jogo of jogos) {
    const key = `${jogo.genero}__${jogo.tipo}`
    if (!groups.has(key)) {
      groups.set(key, {
        genero: jogo.genero || 'Sem gênero',
        tipo: jogo.tipo || 'Sem tipo',
        jogosZerados: 0,
        tempoSegundos: 0,
      })
    }

    const group = groups.get(key)
    group.jogosZerados += 1
    group.tempoSegundos += durationToSeconds(jogo.tempo)
  }

  return [...groups.values()]
    .sort((a, b) => {
      if (a.genero === b.genero) {
        return a.tipo.localeCompare(b.tipo)
      }
      return a.genero.localeCompare(b.genero)
    })
    .map((row) => ({
      ...row,
      tempoTotal: secondsToDuration(row.tempoSegundos),
      tempoTotalLabel: formatDurationCompact(row.tempoSegundos),
    }))
}

export function buildGenreTypeCards(jogos) {
  const rows = buildGenreTypeRows(jogos)
  const cards = new Map()

  for (const row of rows) {
    if (!cards.has(row.genero)) {
      cards.set(row.genero, {
        genero: row.genero,
        jogosZerados: 0,
        tempoSegundos: 0,
        tipos: [],
      })
    }

    const card = cards.get(row.genero)
    card.tipos.push(row)
    card.jogosZerados += row.jogosZerados
    card.tempoSegundos += row.tempoSegundos
  }

  return [...cards.values()]
    .sort((a, b) => a.genero.localeCompare(b.genero))
    .map((card) => ({
      ...card,
      tempoTotal: secondsToDuration(card.tempoSegundos),
      tempoTotalLabel: formatDurationCompact(card.tempoSegundos),
      tipos: [...card.tipos].sort((a, b) => {
        if (b.jogosZerados !== a.jogosZerados) {
          return b.jogosZerados - a.jogosZerados
        }
        return b.tempoSegundos - a.tempoSegundos
      }),
    }))
}

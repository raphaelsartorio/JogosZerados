import { db } from './db'
import { normalizeGameRecord } from './importExcel'

export async function exportBackup() {
  const jogos = await db.games.orderBy('id').toArray()
  const top10 = await db.top10.orderBy('posicao').toArray()
  const statsAno = await db.statsAno.orderBy('ano').toArray()
  return {
    exportedAt: new Date().toISOString(),
    version: 2,
    jogos,
    top10,
    statsAno,
  }
}

export async function importBackupFile(file) {
  const content = await file.text()
  return JSON.parse(content)
}

export function normalizeBackupPayload(payload) {
  const jogosRaw = payload?.jogos ?? payload?.games ?? []
  const jogos = jogosRaw.map((item) => normalizeGameRecord(item)).filter(Boolean)
  const top10 = Array.isArray(payload?.top10)
    ? payload.top10
        .map((item, index) => ({
          id: item.id ?? Date.now() + index,
          posicao: Number(item.posicao ?? index + 1),
          jogoId: item.jogoId ?? null,
        }))
        .filter((item) => item.posicao > 0 && item.posicao <= 10)
    : []
  const statsAno = Array.isArray(payload?.statsAno)
    ? payload.statsAno
        .map((item, index) => ({
          id: item.id ?? Date.now() + index,
          ano: Number(item.ano),
          jogoDoAnoId: item.jogoDoAnoId ?? null,
          capaUrl: String(item.capaUrl || ''),
        }))
        .filter((item) => Number.isFinite(item.ano))
    : []

  return {
    jogos,
    top10,
    statsAno,
  }
}

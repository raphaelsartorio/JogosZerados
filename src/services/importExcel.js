import * as XLSX from 'xlsx'
import {
  buildTagsFromExcel,
  parseBooleanFlag,
  parseDateValue,
  parseScore,
  normalizeDifficulty,
  normalizeTempo,
} from '../utils/gameHelpers'

const COLUMN_MAP = {
  id: 0,
  name: 1,
  platform: 2,
  genre: 3,
  type: 4,
  completedAt: 5,
  playtime: 6,
  score: 7,
  difficulty: 8,
  completedVersionOne: 9,
  platinum: 10,
  completionCondition: 11,
}

function normalizeRow(row) {
  return normalizeGameRecord({
    id: Number(row[COLUMN_MAP.id]),
    nome: String(row[COLUMN_MAP.name] || '').trim(),
    console: String(row[COLUMN_MAP.platform] || 'Desconhecido').trim(),
    genero: String(row[COLUMN_MAP.genre] || 'Desconhecido').trim(),
    tipo: String(row[COLUMN_MAP.type] || 'Desconhecido').trim(),
    dataZerado: parseDateValue(row[COLUMN_MAP.completedAt]),
    tempo: row[COLUMN_MAP.playtime],
    nota: parseScore(row[COLUMN_MAP.score]),
    dificuldade: normalizeDifficulty(row[COLUMN_MAP.difficulty]),
    tags: buildTagsFromExcel(row[COLUMN_MAP.completedVersionOne], row[COLUMN_MAP.completionCondition]),
    platinado: parseBooleanFlag(row[COLUMN_MAP.platinum]),
  })
}

export function normalizeGameRecord(record) {
  const id = Number(record.id)
  const nome = String(record.nome || record.name || '').trim()

  if (!Number.isFinite(id) || !nome) {
    return null
  }

  return {
    id,
    nome,
    console: String(record.console || record.platform || 'Desconhecido').trim(),
    genero: String(record.genero || record.genre || 'Desconhecido').trim(),
    tipo: String(record.tipo || record.type || 'Desconhecido').trim(),
    dataZerado: parseDateValue(record.dataZerado || record.completedAt) || '',
    tempo: normalizeTempo(record.tempo),
    nota: parseScore(record.nota ?? record.score) ?? 0,
    dificuldade: normalizeDifficulty(record.dificuldade || record.difficulty),
    tags: Array.isArray(record.tags) ? record.tags.filter(Boolean).map((item) => String(item).trim()) : [],
    platinado: Boolean(record.platinado ?? record.platinum),
  }
}

function extractRows(workbook) {
  const primarySheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(primarySheet, {
    header: 1,
    defval: '',
    raw: true,
  })
}

export async function importExcelFile(file) {
  const buffer = await file.arrayBuffer()
  return importExcelBuffer(buffer)
}

export async function importExcelUrl(url) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return importExcelBuffer(buffer)
}

export async function importExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const rows = extractRows(workbook)
  return rows.map(normalizeRow).filter(Boolean)
}

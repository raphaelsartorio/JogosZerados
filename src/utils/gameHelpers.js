export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function parseTagsInput(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim())
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatTagsInput(tags) {
  return parseTagsInput(tags).join(', ')
}

export function parseBooleanFlag(value) {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) {
    return false
  }

  return ['sim', 's', 'x', '✔', '✅', 'true', '1'].includes(normalized)
}

export function excelSerialToIso(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30))
  const date = new Date(excelEpoch.getTime() + Number(serial) * 24 * 60 * 60 * 1000)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString().slice(0, 10)
}

export function parseDateValue(value) {
  if (value == null || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return excelSerialToIso(value)
  }

  const trimmed = String(value).trim()
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/)

  if (match) {
    const [, dayRaw, monthRaw, yearRaw] = match
    const year = yearRaw.length === 4 ? yearRaw : yearRaw.padStart(4, '2')
    const day = dayRaw.padStart(2, '0')
    const month = monthRaw.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

export function parseScore(value) {
  const numeric = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(numeric) ? numeric : null
}

export function durationToSeconds(value) {
  if (value == null || value === '') {
    return 0
  }

  if (typeof value === 'number') {
    return Math.round(value)
  }

  const raw = String(value).trim()
  if (!raw) {
    return 0
  }

  const timeMatch = raw.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
  if (timeMatch) {
    const hours = Number(timeMatch[1] || 0)
    const minutes = Number(timeMatch[2] || 0)
    const seconds = Number(timeMatch[3] || 0)
    return (hours * 3600) + (minutes * 60) + seconds
  }

  const verbose = raw.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m(?:in)?)?\s*(?:(\d+)\s*s)?/i)
  if (verbose && verbose[0].trim()) {
    const hours = Number(verbose[1] || 0)
    const minutes = Number(verbose[2] || 0)
    const seconds = Number(verbose[3] || 0)
    return (hours * 3600) + (minutes * 60) + seconds
  }

  const numeric = Number(raw.replace(',', '.'))
  if (Number.isFinite(numeric)) {
    return Math.round(numeric * 86400)
  }

  return 0
}

export function secondsToDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(Number(totalSeconds) || 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  return [hours, minutes, seconds].map((item) => String(item).padStart(2, '0')).join(':')
}

export function normalizeTempo(value) {
  if (value == null || value === '') {
    return '00:00:00'
  }

  if (typeof value === 'number') {
    return secondsToDuration(Math.round(value * 86400))
  }

  return secondsToDuration(durationToSeconds(value))
}

export function deriveAnoFromData(value) {
  if (!value) return null
  const parsed = parseDateValue(value)
  return parsed ? Number(parsed.slice(0, 4)) : null
}

export function buildTagsFromExcel(versionOneValue, completionConditionValue) {
  const tags = []
  if (parseBooleanFlag(versionOneValue)) {
    tags.push('1.0')
  }

  const condition = String(completionConditionValue || '').trim()
  if (condition) {
    tags.push(condition)
  }

  return [...new Set(tags)]
}

export function normalizeDifficulty(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (!raw) {
    return 'N/D'
  }
  return raw
}

export function getScoreTone(score) {
  if (score >= 9) return 'emerald'
  if (score >= 8) return 'sky'
  if (score >= 7) return 'amber'
  return 'rose'
}

export function getDifficultyTone(difficulty) {
  if (difficulty === 'S') return 'rose'
  if (difficulty === 'A' || difficulty === 'B') return 'amber'
  if (difficulty === 'C') return 'sky'
  return 'slate'
}

export function nextNumericId(values) {
  const max = values.reduce((highest, current) => Math.max(highest, Number(current) || 0), 0)
  return max + 1
}

import { durationToSeconds } from './gameHelpers'

export function formatDurationCompact(value) {
  const totalSeconds = durationToSeconds(value)
  if (!totalSeconds) {
    return '0h'
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (!hours) {
    return `${minutes}min`
  }

  return minutes ? `${hours}h ${minutes}min` : `${hours}h`
}

export function formatDate(isoDate) {
  if (!isoDate) {
    return 'Sem data'
  }

  const date = new Date(`${isoDate}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return 'Sem data'
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(1, maximumFractionDigits),
  }).format(value || 0)
}

export function formatYear(value) {
  return value || 'N/D'
}

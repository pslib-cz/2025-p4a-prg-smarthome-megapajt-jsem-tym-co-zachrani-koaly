export function formatTemperature(value: number): string {
  return value.toFixed(1)
}

export function formatPercent(value: number): string {
  return Math.round(value).toString()
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "–"
  const diffMs = Date.now() - date.getTime()
  const diffS = Math.floor(diffMs / 1000)
  if (diffS < 5) return "prave ted"
  if (diffS < 60) return `pred ${diffS}s`
  const diffM = Math.floor(diffS / 60)
  if (diffM < 60) return `pred ${diffM}m`
  const diffH = Math.floor(diffM / 60)
  return `pred ${diffH}h`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function formatDateForDisplay(value: unknown): string {
  if (!value) return ''

  const date = new Date(value as string | number | Date)

  if (Number.isNaN(date.getTime())) return String(value) // not a valid date, return as-is

  // Convert to local string (YYYY-MM-DD HH:mm)
  return date.toLocaleString() // you can customize locale or options
}

export function isDate(value: unknown) {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return true
  }
  return false
}

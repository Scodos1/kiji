export function firstError(data, fallback) {
  if (!data || typeof data !== 'object') return fallback
  if (typeof data.detail === 'string') return data.detail
  for (const key of Object.keys(data)) {
    const value = data[key]
    if (Array.isArray(value) && value.length) return value[0]
    if (typeof value === 'string') return value
  }
  return fallback
}

const KEY = 'kagc-registration-session-id'

function randomString() {
  return Math.random().toString(36).slice(2, 10)
}

export function getOrCreateSessionId() {
  const existing = localStorage.getItem(KEY)
  if (existing) return existing

  const value =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 24)
      : `${Date.now()}${randomString()}`

  localStorage.setItem(KEY, value)
  return value
}

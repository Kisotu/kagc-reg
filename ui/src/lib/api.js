const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function toQuery(params = {}) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined && value !== null) {
      search.set(key, String(value))
    }
  }

  const out = search.toString()
  return out ? `?${out}` : ''
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')
  const payload = hasJson ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || `Request failed: ${response.status}`
    throw new Error(message)
  }

  return payload
}

export const api = {
  request,
  toQuery,
  base: API_BASE,
}

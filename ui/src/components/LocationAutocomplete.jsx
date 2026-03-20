import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export function LocationAutocomplete({
  label,
  location,
  subcounty,
  onSelect,
  onClear,
  error,
  required = false,
}) {
  const [query, setQuery] = useState(location || '')
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(location || '')
  }, [location])

  const shouldSearch = useMemo(() => query.trim().length >= 3, [query])

  useEffect(() => {
    if (!shouldSearch) {
      setOptions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await api.request(`/public/locations/search?q=${encodeURIComponent(query.trim())}&limit=8`)
        setOptions(res.data || [])
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [query, shouldSearch])

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#5b4139]">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!e.target.value.trim()) {
            onClear()
          }
        }}
        placeholder="Type at least 3 characters"
        className={`field ${error ? 'field-error' : ''}`}
      />

      {loading && <p className="text-xs text-[#5b4139]">Searching locations...</p>}

      {!loading && options.length > 0 && (
        <div className="max-h-44 overflow-y-auto rounded-xl border border-[#e4beb466] bg-white">
          {options.map((item, idx) => (
            <button
              key={`${item.location}-${item.subcounty}-${idx}`}
              type="button"
              onClick={() => {
                setOptions([])
                setQuery(item.location)
                onSelect(item.location, item.subcounty)
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#eff4ff]"
            >
              <span className="font-semibold text-[#0b1c30]">{item.location}</span>
              <span className="text-[#5b4139]">{item.subcounty}</span>
            </button>
          ))}
        </div>
      )}

      {(location || subcounty) && (
        <p className="text-xs text-[#5b4139]">
          Selected: <span className="font-semibold">{location || '-'}</span> /{' '}
          <span className="font-semibold">{subcounty || '-'}</span>
        </p>
      )}

      {error ? <p className="text-xs font-semibold text-[#ba1a1a]">{error}</p> : null}
    </div>
  )
}

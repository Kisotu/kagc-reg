import { useEffect, useMemo, useState } from 'react'
import { AGE_BRACKETS, STAGING_STATUS } from '../../constants'
import { api } from '../../lib/api'

function Login({ onSuccess, loading, setLoading }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(ev) {
    ev.preventDefault()
    setError('')

    try {
      setLoading(true)
      await api.request('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      onSuccess()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel mx-auto max-w-xl space-y-5 p-6 sm:p-8">
      <h2 className="font-manrope text-3xl font-bold text-[#0b1c30]">Admin Login</h2>
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5b4139]">Username</label>
          <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5b4139]">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {error ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
    </section>
  )
}

function StagingReview({ csrfToken }) {
  const [filters, setFilters] = useState({ status: 'pending', location: '', dateFrom: '', dateTo: '', page: 1 })
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedDuplicates, setSelectedDuplicates] = useState([])
  const [rejectReason, setRejectReason] = useState({})
  const [mergeTarget, setMergeTarget] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadBatches() {
    try {
      setError('')
      const query = api.toQuery(filters)
      const out = await api.request(`/admin/staging/batches${query}`)
      setBatches(out.data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [filters.page, filters.status, filters.location, filters.dateFrom, filters.dateTo])

  async function loadBatch(batchId) {
    try {
      const out = await api.request(`/admin/staging/batches/${batchId}`)
      setSelectedBatch(out.data)
      setSelectedDuplicates([])
    } catch (e) {
      setError(e.message)
    }
  }

  async function loadDuplicates(memberId) {
    try {
      const out = await api.request(`/admin/staging/members/${memberId}/duplicates`)
      setSelectedDuplicates(out.data || [])
      setMergeTarget((m) => ({ ...m, [memberId]: out.data?.[0]?.id || '' }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function action(memberId, type) {
    try {
      setBusy(true)
      setError('')

      if (type === 'approve') {
        await api.request(`/admin/staging/members/${memberId}/approve`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
        })
      }

      if (type === 'reject') {
        await api.request(`/admin/staging/members/${memberId}/reject`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
          body: JSON.stringify({ reason: rejectReason[memberId] || 'Rejected by admin' }),
        })
      }

      if (type === 'merge') {
        await api.request(`/admin/staging/members/${memberId}/merge`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
          body: JSON.stringify({ targetMemberId: Number(mergeTarget[memberId]) }),
        })
      }

      if (selectedBatch) {
        await loadBatch(selectedBatch.id)
      }
      await loadBatches()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="panel space-y-4 p-5">
        <h3 className="font-manrope text-2xl font-bold">Pending Registrations</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select
            className="field"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          >
            {STAGING_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            className="field"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value, page: 1 }))}
          />
          <input
            className="field"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 1 }))}
          />
          <input
            className="field"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 1 }))}
          />
          <button type="button" className="btn-soft" onClick={loadBatches}>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-[#5b4139]">
                <th className="px-3">Batch</th>
                <th className="px-3">Type</th>
                <th className="px-3">Members</th>
                <th className="px-3">Duplicates</th>
                <th className="px-3">Status</th>
                <th className="px-3" />
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="rounded-xl bg-[#eff4ff]">
                  <td className="rounded-l-xl px-3 py-2 font-semibold">#{batch.id}</td>
                  <td className="px-3 py-2">{batch.registration_type}</td>
                  <td className="px-3 py-2">{batch.total_members}</td>
                  <td className="px-3 py-2">
                    {Number(batch.duplicate_members) > 0 ? (
                      <span className="rounded-full bg-[#ffdad6] px-2 py-1 text-xs font-semibold text-[#93000a]">
                        {batch.duplicate_members}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-3 py-2 capitalize">{batch.status}</td>
                  <td className="rounded-r-xl px-3 py-2 text-right">
                    <button className="btn-soft" type="button" onClick={() => loadBatch(batch.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBatch ? (
        <div className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-manrope text-xl font-bold">
              Batch #{selectedBatch.id} {selectedBatch.family_name ? `- ${selectedBatch.family_name}` : ''}
            </h4>
            <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-sm font-semibold capitalize">
              {selectedBatch.status}
            </span>
          </div>

          <div className="space-y-3">
            {selectedBatch.members.map((member) => (
              <article key={member.id} className="rounded-xl bg-[#f8f9ff] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-manrope text-lg font-bold text-[#0b1c30]">{member.name}</p>
                    <p className="text-sm text-[#5b4139]">
                      {member.phone || '-'} | {member.gender} | {member.age_bracket}
                    </p>
                    <p className="text-sm text-[#5b4139]">
                      {member.location || selectedBatch.location || '-'} /{' '}
                      {member.subcounty || selectedBatch.subcounty || '-'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.duplicate_flag ? (
                      <span className="rounded-full bg-[#ffdad6] px-2 py-1 text-xs font-bold text-[#93000a]">
                        Duplicate Flag
                      </span>
                    ) : null}
                    <button type="button" className="btn-soft" onClick={() => loadDuplicates(member.id)}>
                      Check Duplicates
                    </button>
                    <button
                      type="button"
                      className="btn-soft"
                      disabled={busy || member.status !== 'pending'}
                      onClick={() => action(member.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-soft"
                      disabled={busy || member.status !== 'pending'}
                      onClick={() => action(member.id, 'reject')}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <input
                    className="field"
                    placeholder="Rejection reason"
                    value={rejectReason[member.id] || ''}
                    onChange={(e) => setRejectReason((r) => ({ ...r, [member.id]: e.target.value }))}
                  />
                  <input
                    className="field"
                    type="number"
                    placeholder="Merge target member ID"
                    value={mergeTarget[member.id] || ''}
                    onChange={(e) => setMergeTarget((m) => ({ ...m, [member.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn-soft"
                    disabled={busy || !mergeTarget[member.id] || member.status !== 'pending'}
                    onClick={() => action(member.id, 'merge')}
                  >
                    Merge Into Existing
                  </button>
                </div>
              </article>
            ))}
          </div>

          {selectedDuplicates.length > 0 ? (
            <div className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(11,28,48,0.08)]">
              <p className="mb-3 font-manrope text-lg font-bold text-[#0b1c30]">Potential Duplicate Matches</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="text-left text-[#5b4139]">
                    <tr>
                      <th className="py-2">Member ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDuplicates.map((match) => (
                      <tr key={match.id} className="border-t border-[#e4beb44a]">
                        <td className="py-2 font-semibold">{match.id}</td>
                        <td className="py-2">{match.name}</td>
                        <td className="py-2">{match.phone || '-'}</td>
                        <td className="py-2">
                          {match.location || '-'} / {match.subcounty || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
    </section>
  )
}

function MembersExplorer() {
  const [query, setQuery] = useState({ search: '', location: '', ageBracket: '', page: 1 })
  const [rows, setRows] = useState([])
  const [familyRows, setFamilyRows] = useState([])
  const [error, setError] = useState('')

  const queryString = useMemo(() => api.toQuery(query), [query])

  useEffect(() => {
    api
      .request(`/admin/members${queryString}`)
      .then((out) => setRows(out.data || []))
      .catch((e) => setError(e.message))
  }, [queryString])

  function exportCsv() {
    const url = `${api.base}/admin/members/export.csv${queryString}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function openFamily(familyId) {
    if (!familyId) return
    try {
      const out = await api.request(`/admin/members/families/${familyId}/members`)
      setFamilyRows(out.data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="space-y-4">
      <div className="panel space-y-4 p-5">
        <h3 className="font-manrope text-2xl font-bold">Members</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            className="field md:col-span-2"
            placeholder="Search by name, phone or member number"
            value={query.search}
            onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
          />
          <input
            className="field"
            placeholder="Location"
            value={query.location}
            onChange={(e) => setQuery((q) => ({ ...q, location: e.target.value, page: 1 }))}
          />
          <select
            className="field"
            value={query.ageBracket}
            onChange={(e) => setQuery((q) => ({ ...q, ageBracket: e.target.value, page: 1 }))}
          >
            <option value="">All Ages</option>
            {AGE_BRACKETS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-left text-[#5b4139]">
              <tr>
                <th className="py-2">Member #</th>
                <th className="py-2">Name</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Age Bracket</th>
                <th className="py-2">Location</th>
                <th className="py-2">Family</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#e4beb44a]">
                  <td className="py-2 font-semibold">{row.member_number}</td>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.phone || '-'}</td>
                  <td className="py-2">{row.age_bracket}</td>
                  <td className="py-2">
                    {row.location || '-'} / {row.subcounty || '-'}
                  </td>
                  <td className="py-2">
                    {row.family_id ? (
                      <button className="btn-soft" type="button" onClick={() => openFamily(row.family_id)}>
                        {row.family_name || `Family ${row.family_id}`}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {familyRows.length > 0 ? (
        <div className="panel p-5">
          <h4 className="mb-3 font-manrope text-xl font-bold">Family Group</h4>
          <ul className="space-y-2">
            {familyRows.map((member) => (
              <li key={member.id} className="rounded-lg bg-[#eff4ff] p-3 text-sm">
                <span className="font-semibold">{member.name}</span> ({member.member_number})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
    </section>
  )
}

function AnalyticsView() {
  const [summary, setSummary] = useState(null)
  const [byLocation, setByLocation] = useState([])
  const [byAge, setByAge] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.request('/admin/analytics/summary'),
      api.request('/admin/analytics/by-location'),
      api.request('/admin/analytics/by-age-bracket'),
    ])
      .then(([summaryRes, locationRes, ageRes]) => {
        setSummary(summaryRes.data)
        setByLocation(locationRes.data || [])
        setByAge(ageRes.data || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  const maxLocation = Math.max(...byLocation.map((item) => Number(item.total)), 1)
  const maxAge = Math.max(...byAge.map((item) => Number(item.total)), 1)

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#5b4139]">Total Members</p>
          <p className="font-manrope text-3xl font-extrabold text-[#0b1c30]">{summary?.totalMembers ?? '-'}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#5b4139]">Total Families</p>
          <p className="font-manrope text-3xl font-extrabold text-[#0b1c30]">{summary?.totalFamilies ?? '-'}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#5b4139]">Pending Submissions</p>
          <p className="font-manrope text-3xl font-extrabold text-[#0b1c30]">{summary?.pendingSubmissions ?? '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h4 className="mb-3 font-manrope text-xl font-bold">Members by Location</h4>
          <ul className="space-y-2">
            {byLocation.map((entry) => (
              <li key={`${entry.location}-${entry.total}`}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{entry.location || 'Unknown'}</span>
                  <span>{entry.total}</span>
                </div>
                <div className="h-2 rounded-full bg-[#d3e4fe]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(120deg,#ae3100,#fe5b24)]"
                    style={{ width: `${(Number(entry.total) / maxLocation) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h4 className="mb-3 font-manrope text-xl font-bold">Members by Age Bracket</h4>
          <ul className="space-y-2">
            {byAge.map((entry) => (
              <li key={`${entry.age_bracket}-${entry.total}`}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{entry.age_bracket}</span>
                  <span>{entry.total}</span>
                </div>
                <div className="h-2 rounded-full bg-[#d3e4fe]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(120deg,#0b1c30,#5b4139)]"
                    style={{ width: `${(Number(entry.total) / maxAge) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
    </section>
  )
}

export function AdminPanel() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [csrfToken, setCsrfToken] = useState('')
  const [tab, setTab] = useState('staging')

  async function hydrate() {
    try {
      const me = await api.request('/admin/auth/me')
      setUser(me.data)
      const csrf = await api.request('/admin/auth/csrf-token')
      setCsrfToken(csrf.csrfToken)
    } catch {
      setUser(null)
      setCsrfToken('')
    }
  }

  useEffect(() => {
    hydrate()
  }, [])

  async function logout() {
    await api.request('/admin/auth/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken },
    })
    setUser(null)
    setCsrfToken('')
  }

  if (!user) {
    return <Login onSuccess={hydrate} loading={loading} setLoading={setLoading} />
  }

  return (
    <section className="space-y-4">
      <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-manrope text-3xl font-extrabold text-[#0b1c30]">Admin Dashboard</h2>
          <p className="text-sm text-[#5b4139]">
            Signed in as {user.username} ({user.role})
          </p>
        </div>
        <button className="btn-soft" type="button" onClick={logout}>
          Sign Out
        </button>
      </div>

      <div className="panel flex flex-wrap gap-2 p-3">
        <button
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'staging' ? 'bg-[#ae3100] text-white' : 'bg-[#eff4ff] text-[#0b1c30]'
          }`}
          onClick={() => setTab('staging')}
        >
          Staging Review
        </button>
        <button
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'members' ? 'bg-[#ae3100] text-white' : 'bg-[#eff4ff] text-[#0b1c30]'
          }`}
          onClick={() => setTab('members')}
        >
          Members
        </button>
        <button
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'analytics' ? 'bg-[#ae3100] text-white' : 'bg-[#eff4ff] text-[#0b1c30]'
          }`}
          onClick={() => setTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {tab === 'staging' ? <StagingReview csrfToken={csrfToken} /> : null}
      {tab === 'members' ? <MembersExplorer /> : null}
      {tab === 'analytics' ? <AnalyticsView /> : null}
    </section>
  )
}

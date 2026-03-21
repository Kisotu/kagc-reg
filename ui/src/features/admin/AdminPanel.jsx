import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AGE_BRACKETS, STAGING_STATUS } from '../../constants'
import { api } from '../../lib/api'

function NotificationStack({ notifications, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-2">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-[0_14px_30px_rgba(11,28,48,0.18)] ${
            item.type === 'success'
              ? 'border-[#1f8a46] bg-[#d9f7e1] text-[#0b4d24]'
              : item.type === 'danger'
                ? 'border-[#a42f2f] bg-[#ffe0dc] text-[#7d1919]'
                : 'border-[#2a5a9f] bg-[#deecff] text-[#163a6a]'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-manrope text-sm font-extrabold">{item.title}</p>
              <p className="text-sm font-semibold">{item.message}</p>
            </div>
            <button type="button" className="btn-notification-close" onClick={() => onDismiss(item.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfirmationDialog({ state, onClose }) {
  if (!state) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#0b1c3080] px-4">
      <div className="panel w-full max-w-md space-y-4 p-5">
        <div>
          <h3 className="font-manrope text-2xl font-bold text-[#0b1c30]">{state.title}</h3>
          <p className="mt-1 text-sm font-semibold text-[#5b4139]">{state.message}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-soft" onClick={() => onClose(false)}>
            Cancel
          </button>
          <button
            type="button"
            className={state.variant === 'danger' ? 'btn-danger' : state.variant === 'warning' ? 'btn-warning' : 'btn-success'}
            onClick={() => onClose(true)}
          >
            {state.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

function KpiCard({ tone = 'neutral', eyebrow, label, value, helper }) {
  return (
    <article className={`kpi-card ${`kpi-${tone}`}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="kpi-eyebrow">{eyebrow}</span>
        <span className="kpi-dot" aria-hidden="true" />
      </div>
      <p className="kpi-value">{value}</p>
      <p className="kpi-label">{label}</p>
      <p className="kpi-helper">{helper}</p>
    </article>
  )
}

function DashboardSnapshot() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .request('/admin/analytics/summary')
      .then((res) => setSummary(res.data || null))
      .catch((e) => setError(e.message))
  }, [])

  const totalMembers = Number(summary?.totalMembers || 0)
  const totalFamilies = Number(summary?.totalFamilies || 0)
  const pending = Number(summary?.pendingSubmissions || 0)
  const queueState = pending > 100 ? 'High queue pressure' : pending > 30 ? 'Moderate queue pressure' : 'Queue healthy'

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        tone="warm"
        eyebrow="Active Queue"
        value={summary ? pending : '-'}
        label="Pending Registrations"
        helper={queueState}
      />
      <KpiCard
        tone="brand"
        eyebrow="Directory"
        value={summary ? totalMembers : '-'}
        label="Total Members"
        helper="Registered and searchable profiles"
      />
      <KpiCard
        tone="calm"
        eyebrow="Households"
        value={summary ? totalFamilies : '-'}
        label="Total Families"
        helper="Community groups in the directory"
      />
      <KpiCard
        tone="neutral"
        eyebrow="Intake"
        value={summary ? `${Math.max(totalMembers - pending, 0)}` : '-'}
        label="Processed Members"
        helper="Already approved into directory"
      />

      {error ? <p className="sm:col-span-2 xl:col-span-4 rounded-lg bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{error}</p> : null}
    </section>
  )
}

function StagingReview({ csrfToken, onNotify, onConfirm }) {
  const [filters, setFilters] = useState({ status: 'pending', location: '', dateFrom: '', dateTo: '', page: 1 })
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedDuplicates, setSelectedDuplicates] = useState([])
  const [rejectReason, setRejectReason] = useState({})
  const [mergeTarget, setMergeTarget] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selectedBatchRef = useRef(null)

  const loadBatches = useCallback(async () => {
    try {
      setError('')
      const query = api.toQuery(filters)
      const out = await api.request(`/admin/staging/batches${query}`)
      setBatches(out.data || [])
    } catch (e) {
      setError(e.message)
    }
  }, [filters])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  useEffect(() => {
    if (!selectedBatch) return undefined

    const handleOutsidePointer = (event) => {
      const panel = selectedBatchRef.current
      if (!panel) return
      if (!panel.contains(event.target)) {
        setSelectedBatch(null)
        setSelectedDuplicates([])
      }
    }

    document.addEventListener('mousedown', handleOutsidePointer)
    document.addEventListener('touchstart', handleOutsidePointer)

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer)
      document.removeEventListener('touchstart', handleOutsidePointer)
    }
  }, [selectedBatch])

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
      onNotify('info', 'Duplicate Check Complete', `Loaded potential duplicates for member #${memberId}.`)
    } catch (e) {
      setError(e.message)
      onNotify('danger', 'Duplicate Check Failed', e.message)
    }
  }

  async function action(memberId, type) {
    try {
      const isConfirmed = await onConfirm({
        title:
          type === 'approve'
            ? 'Approve this member?'
            : type === 'reject'
              ? 'Reject this member?'
              : 'Merge this member into an existing profile?',
        message:
          type === 'approve'
            ? 'This will approve the member and finalize the registration.'
            : type === 'reject'
              ? 'This will reject the member submission and keep an audit trail.'
              : 'This will merge this pending member with an existing member record.',
        confirmText: type === 'merge' ? 'Merge Member' : type === 'reject' ? 'Reject Member' : 'Approve Member',
        variant: type === 'reject' ? 'danger' : type === 'merge' ? 'warning' : 'success',
      })

      if (!isConfirmed) {
        return
      }

      setBusy(true)
      setError('')

      if (type === 'approve') {
        await api.request(`/admin/staging/members/${memberId}/approve`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
        })
        onNotify('success', 'Member Approved', `Member #${memberId} was approved successfully.`)
      }

      if (type === 'reject') {
        await api.request(`/admin/staging/members/${memberId}/reject`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
          body: JSON.stringify({ reason: rejectReason[memberId] || 'Rejected by admin' }),
        })
        onNotify('danger', 'Member Rejected', `Member #${memberId} was rejected.`)
      }

      if (type === 'merge') {
        await api.request(`/admin/staging/members/${memberId}/merge`, {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken },
          body: JSON.stringify({ targetMemberId: Number(mergeTarget[memberId]) }),
        })
        onNotify('success', 'Members Merged', `Member #${memberId} was merged into #${mergeTarget[memberId]}.`)
      }

      await loadBatches()
      setSelectedBatch(null)
      setSelectedDuplicates([])
    } catch (e) {
      setError(e.message)
      onNotify('danger', 'Action Failed', e.message)
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
          <button
            type="button"
            className="btn-soft"
            onClick={loadBatches}
          >
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
        <div ref={selectedBatchRef} className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-manrope text-xl font-bold">
              Batch #{selectedBatch.id} {selectedBatch.family_name ? `- ${selectedBatch.family_name}` : ''}
            </h4>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-sm font-semibold capitalize">
                {selectedBatch.status}
              </span>
              <button
                type="button"
                className="btn-soft"
                onClick={() => {
                  setSelectedBatch(null)
                  setSelectedDuplicates([])
                }}
              >
                Close
              </button>
            </div>
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
                      className="btn-success"
                      disabled={busy || member.status !== 'pending'}
                      onClick={() => action(member.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
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
                    className="btn-warning"
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
  const familyPanelRef = useRef(null)

  const queryString = useMemo(() => api.toQuery(query), [query])

  useEffect(() => {
    api
      .request(`/admin/members${queryString}`)
      .then((out) => setRows(out.data || []))
      .catch((e) => setError(e.message))
  }, [queryString])

  useEffect(() => {
    if (familyRows.length === 0) return undefined

    const handleOutsidePointer = (event) => {
      const panel = familyPanelRef.current
      if (!panel) return
      if (!panel.contains(event.target)) {
        setFamilyRows([])
      }
    }

    document.addEventListener('mousedown', handleOutsidePointer)
    document.addEventListener('touchstart', handleOutsidePointer)

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer)
      document.removeEventListener('touchstart', handleOutsidePointer)
    }
  }, [familyRows.length])

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
        <div ref={familyPanelRef} className="panel p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="font-manrope text-xl font-bold">Family Group</h4>
            <button type="button" className="btn-soft" onClick={() => setFamilyRows([])}>
              Close
            </button>
          </div>
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
  const [byCounty, setByCounty] = useState([])
  const [byAge, setByAge] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.request('/admin/analytics/summary'),
      api.request('/admin/analytics/by-county'),
      api.request('/admin/analytics/by-age-bracket'),
    ])
      .then(([summaryRes, countyRes, ageRes]) => {
        setSummary(summaryRes.data)
        setByCounty(countyRes.data || [])
        setByAge(ageRes.data || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  const maxCounty = Math.max(...byCounty.map((item) => Number(item.total)), 1)
  const maxAge = Math.max(...byAge.map((item) => Number(item.total)), 1)
  const totalCountyMembers = byCounty.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const totalAgeMembers = byAge.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const rankedCounties = [...byCounty].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
  const rankedAges = [...byAge].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
  const agePalette = ['#1b4e91', '#ae3100', '#0b7e45', '#754706', '#6b3a92', '#256f73', '#7d1919']

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel analytic-card p-5">
          <div className="mb-3 flex items-end justify-between">
            <h4 className="font-manrope text-xl font-bold">Members by County</h4>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5b4139]">Distribution</p>
          </div>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#eff4ff] px-3 py-2">
            <p className="text-sm font-semibold text-[#5b4139]">Total in county analytics</p>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[#0b1c30]">
              {totalCountyMembers}
            </span>
          </div>

          <ul className="space-y-3">
            {rankedCounties.map((entry, idx) => {
              const total = Number(entry.total || 0)
              const pct = totalCountyMembers > 0 ? (total / totalCountyMembers) * 100 : 0
              const relative = (total / maxCounty) * 100

              return (
                <li key={`${entry.county}-${entry.total}`} className="analytic-row">
                  <div className="analytic-row-top">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="analytic-rank">{idx + 1}</span>
                      <span className="truncate font-semibold text-[#0b1c30]">{entry.county || 'Unknown'}</span>
                    </div>
                    <span className="analytic-count">{total}</span>
                  </div>

                  <div className="analytic-track" aria-hidden="true">
                    <div className="analytic-fill analytic-fill-location" style={{ width: `${relative}%` }} />
                  </div>

                  <div className="mt-1 flex justify-end text-xs font-semibold text-[#5b4139]">{pct.toFixed(1)}% of all members</div>
                </li>
              )
            })}
            {rankedCounties.length === 0 ? (
              <li className="rounded-lg bg-[#eff4ff] p-3 text-sm font-semibold text-[#5b4139]">No county data available.</li>
            ) : null}
          </ul>
        </div>

        <div className="panel analytic-card p-5">
          <div className="mb-3 flex items-end justify-between">
            <h4 className="font-manrope text-xl font-bold">Members by Age Bracket</h4>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5b4139]">Demographics</p>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#5b4139]">Population spread</span>
              <span className="font-extrabold text-[#0b1c30]">{totalAgeMembers} members</span>
            </div>
            <div className="analytic-segment-track" aria-hidden="true">
              {rankedAges.map((entry, idx) => {
                const total = Number(entry.total || 0)
                const width = totalAgeMembers > 0 ? (total / totalAgeMembers) * 100 : 0
                return (
                  <div
                    key={`${entry.age_bracket}-${entry.total}-segment`}
                    className="analytic-segment"
                    style={{ width: `${width}%`, background: agePalette[idx % agePalette.length] }}
                    title={`${entry.age_bracket}: ${total}`}
                  />
                )
              })}
            </div>
          </div>

          <ul className="space-y-3">
            {rankedAges.map((entry, idx) => {
              const total = Number(entry.total || 0)
              const pct = totalAgeMembers > 0 ? (total / totalAgeMembers) * 100 : 0
              const relative = (total / maxAge) * 100
              const chipColor = agePalette[idx % agePalette.length]

              return (
                <li key={`${entry.age_bracket}-${entry.total}`} className="analytic-row">
                  <div className="analytic-row-top">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="analytic-swatch" style={{ background: chipColor }} aria-hidden="true" />
                      <span className="truncate font-semibold text-[#0b1c30]">{entry.age_bracket}</span>
                    </div>
                    <span className="analytic-count">{total}</span>
                  </div>

                  <div className="analytic-track" aria-hidden="true">
                    <div className="analytic-fill" style={{ width: `${relative}%`, background: chipColor }} />
                  </div>

                  <div className="mt-1 flex justify-end text-xs font-semibold text-[#5b4139]">{pct.toFixed(1)}% share</div>
                </li>
              )
            })}
            {rankedAges.length === 0 ? (
              <li className="rounded-lg bg-[#eff4ff] p-3 text-sm font-semibold text-[#5b4139]">No age bracket data available.</li>
            ) : null}
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
  const [confirmState, setConfirmState] = useState(null)
  const [notifications, setNotifications] = useState([])

  const notify = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotifications((items) => [...items, { id, type, title, message }])
    window.setTimeout(() => {
      setNotifications((items) => items.filter((item) => item.id !== id))
    }, 4200)
  }, [])

  const requestConfirmation = useCallback(
    ({ title, message, confirmText, variant }) =>
      new Promise((resolve) => {
        setConfirmState({ title, message, confirmText, variant, resolve })
      }),
    [],
  )

  const closeConfirmation = useCallback((confirmed) => {
    setConfirmState((state) => {
      state?.resolve(Boolean(confirmed))
      return null
    })
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((items) => items.filter((item) => item.id !== id))
  }, [])

  const hydrate = useCallback(async () => {
    try {
      const me = await api.request('/admin/auth/me')
      setUser(me.data)
      const csrf = await api.request('/admin/auth/csrf-token')
      setCsrfToken(csrf.csrfToken)
    } catch {
      setUser(null)
      setCsrfToken('')
    }
  }, [])

  useEffect(() => {
    // Defer initial auth check to the microtask queue to satisfy strict lint rules.
    Promise.resolve().then(hydrate)
  }, [hydrate])

  async function logout() {
    const confirmed = await requestConfirmation({
      title: 'Sign out now?',
      message: 'You will need to sign back in to continue admin actions.',
      confirmText: 'Sign Out',
      variant: 'warning',
    })

    if (!confirmed) {
      return
    }

    try {
      await api.request('/admin/auth/logout', {
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken },
      })
      setUser(null)
      setCsrfToken('')
    } catch {
      // Keep sign-out failures in-place by preserving the existing authenticated state.
    }
  }

  if (!user) {
    return <Login onSuccess={hydrate} loading={loading} setLoading={setLoading} />
  }

  return (
    <>
      <NotificationStack notifications={notifications} onDismiss={dismissNotification} />
      <ConfirmationDialog state={confirmState} onClose={closeConfirmation} />

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

        <DashboardSnapshot />

        <div className="panel flex flex-wrap gap-2 p-3">
          <button
            type="button"
            className={`btn-tab ${tab === 'staging' ? 'is-active' : ''}`}
            onClick={() => setTab('staging')}
          >
            Staging Review
          </button>
          <button
            type="button"
            className={`btn-tab ${tab === 'members' ? 'is-active' : ''}`}
            onClick={() => setTab('members')}
          >
            Members
          </button>
          <button
            type="button"
            className={`btn-tab ${tab === 'analytics' ? 'is-active' : ''}`}
            onClick={() => setTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {tab === 'staging' ? (
          <StagingReview csrfToken={csrfToken} onNotify={notify} onConfirm={requestConfirmation} />
        ) : null}
        {tab === 'members' ? <MembersExplorer /> : null}
        {tab === 'analytics' ? <AnalyticsView /> : null}
      </section>
    </>
  )
}

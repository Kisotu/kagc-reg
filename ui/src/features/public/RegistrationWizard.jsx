import { useEffect, useMemo, useState } from 'react'
import { AGE_BRACKETS, GENDERS } from '../../constants'
import { LocationAutocomplete } from '../../components/LocationAutocomplete'
import { api } from '../../lib/api'

const LOCAL_PREFIX = 'kagc-local-draft-'

const defaultMemberDraft = {
  name: '',
  phone: '',
  gender: 'male',
  age_bracket: '16-25',
  location: '',
  subcounty: '',
}

const initialState = {
  registrationType: 'individual',
  individual: {
    name: '',
    phone: '',
    gender: 'male',
    age_bracket: '16-25',
    location: '',
    subcounty: '',
  },
  family: {
    family_name: '',
    location: '',
    subcounty: '',
    members: [],
  },
}

function cleanOptional(value) {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed : undefined
}

function validateState(state, step) {
  const errors = {}

  if (step >= 2 && state.registrationType === 'individual') {
    if (!state.individual.name.trim()) errors.individualName = 'Name is required'
    if (!state.individual.gender) errors.individualGender = 'Gender is required'
    if (!state.individual.age_bracket) errors.individualAge = 'Age bracket is required'
  }

  if (step >= 2 && state.registrationType === 'family') {
    if (!state.family.family_name.trim()) errors.familyName = 'Family name is required'
    if (!state.family.members.length) errors.familyMembers = 'Add at least one family member'
  }

  return errors
}

function payloadForSubmit(state, sessionId) {
  if (state.registrationType === 'individual') {
    return {
      url: '/public/registrations/individual',
      body: {
        sessionId,
        name: state.individual.name.trim(),
        phone: state.individual.phone.trim(),
        gender: state.individual.gender,
        age_bracket: state.individual.age_bracket,
        location: cleanOptional(state.individual.location),
        subcounty: cleanOptional(state.individual.subcounty),
      },
    }
  }

  return {
    url: '/public/registrations/family',
    body: {
      sessionId,
      family_name: state.family.family_name.trim(),
      location: cleanOptional(state.family.location),
      subcounty: cleanOptional(state.family.subcounty),
      members: state.family.members.map((member) => ({
        name: member.name.trim(),
        phone: member.phone.trim(),
        gender: member.gender,
        age_bracket: member.age_bracket,
        location: cleanOptional(member.location) || cleanOptional(state.family.location),
        subcounty: cleanOptional(member.subcounty) || cleanOptional(state.family.subcounty),
      })),
    },
  }
}

export function RegistrationWizard({ sessionId }) {
  const [step, setStep] = useState(1)
  const [state, setState] = useState(initialState)
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [submitOk, setSubmitOk] = useState(false)
  const [memberDraft, setMemberDraft] = useState(defaultMemberDraft)
  const [editingIndex, setEditingIndex] = useState(-1)

  const localKey = `${LOCAL_PREFIX}${sessionId}`

  useEffect(() => {
    let mounted = true

    const hydrate = async () => {
      const cached = localStorage.getItem(localKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.state) setState(parsed.state)
          if (parsed.step) setStep(parsed.step)
        } catch {
          localStorage.removeItem(localKey)
        }
      }

      try {
        const draft = await api.request(`/public/drafts/${sessionId}`)
        if (!mounted || !draft?.data?.payload) return
        const payload = draft.data.payload
        setState((current) => ({ ...current, ...payload }))
        if (draft.data.step) setStep(Number(draft.data.step) || 1)
      } catch {
        // Draft not found is expected for new sessions.
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [localKey, sessionId])

  useEffect(() => {
    localStorage.setItem(localKey, JSON.stringify({ step, state }))

    const timer = setTimeout(() => {
      api
        .request(`/public/drafts/${sessionId}`, {
          method: 'PUT',
          body: JSON.stringify({ step: String(step), payload: state }),
        })
        .catch(() => {
          // The local cache remains the resilience fallback.
        })
    }, 900)

    return () => clearTimeout(timer)
  }, [localKey, sessionId, state, step])

  const progress = useMemo(() => `${String(step).padStart(2, '0')} / 03`, [step])

  function next() {
    const nextErrors = validateState(state, step)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setStep((s) => Math.min(s + 1, 3))
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function resetMemberDraft() {
    setMemberDraft(defaultMemberDraft)
    setEditingIndex(-1)
  }

  function saveMember() {
    const memberErrors = {}
    if (!memberDraft.name.trim()) memberErrors.memberName = 'Member name is required'
    if (!memberDraft.gender) memberErrors.memberGender = 'Gender is required'
    if (!memberDraft.age_bracket) memberErrors.memberAge = 'Age bracket is required'

    if (Object.keys(memberErrors).length) {
      setErrors((prevErrors) => ({ ...prevErrors, ...memberErrors }))
      return
    }

    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors }
      delete nextErrors.memberName
      delete nextErrors.memberGender
      delete nextErrors.memberAge
      return nextErrors
    })

    setState((current) => {
      const members = [...current.family.members]
      if (editingIndex >= 0) {
        members[editingIndex] = { ...memberDraft }
      } else {
        members.push({ ...memberDraft })
      }

      return {
        ...current,
        family: {
          ...current.family,
          members,
        },
      }
    })

    resetMemberDraft()
  }

  async function submit() {
    const finalErrors = validateState(state, 3)
    if (!privacyConfirmed) {
      finalErrors.privacyConfirmed = "Please confirm you have read Karen AGC's privacy policy"
    }
    setErrors(finalErrors)
    if (Object.keys(finalErrors).length) {
      setStep(2)
      if (finalErrors.privacyConfirmed) {
        setStep(3)
      }
      return
    }

    try {
      setLoading(true)
      setMessage('')
      const payload = payloadForSubmit(state, sessionId)
      await api.request(payload.url, {
        method: 'POST',
        body: JSON.stringify(payload.body),
      })

      setSubmitOk(true)
      setMessage('Registration submitted for admin review.')
      localStorage.removeItem(localKey)
      await api.request(`/public/drafts/${sessionId}`, { method: 'DELETE' }).catch(() => {})
      setState(initialState)
      setPrivacyConfirmed(false)
      setStep(1)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const e = errors

  return (
    <section className="animate-in space-y-6">
      <div className="panel p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-manrope text-4xl font-extrabold text-[#0b1c3033] sm:text-6xl">{progress}</p>
            <h1 className="font-manrope text-2xl font-bold text-[#0b1c30] sm:text-3xl">
              {step === 1 && 'Registration Type'}
              {step === 2 && 'Member Details'}
              {step === 3 && 'Review and Submit'}
            </h1>
          </div>
          <p className="text-sm text-[#5b4139] sm:text-right">Session: {sessionId.slice(0, 10)}...</p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#d3e4fe]">
          <div
            className="h-full bg-[#ae3100] transition-[width] duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="panel space-y-5 p-6 sm:p-8">
          <h2 className="font-manrope text-2xl font-bold text-[#0b1c30]">Who is being registered?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { value: 'individual', title: 'Individual', description: 'Single member registration.' },
              { value: 'family', title: 'Family', description: 'Register a household and all members.' },
            ].map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setState((s) => ({ ...s, registrationType: choice.value }))}
                className={`rounded-2xl px-5 py-6 text-left transition duration-200 ${
                  state.registrationType === choice.value
                    ? 'bg-[#eff4ff] ring-2 ring-[#ae3100]'
                    : 'bg-white ring-1 ring-[#e4beb44f] hover:-translate-y-0.5 hover:bg-[#f8f9ff]'
                }`}
              >
                <p className="font-manrope text-xl font-bold text-[#0b1c30]">{choice.title}</p>
                <p className="mt-1 text-sm text-[#5b4139]">{choice.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && state.registrationType === 'individual' && (
        <div className="panel space-y-5 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-[#5b4139]">Name *</label>
              <input
                className={`field ${e.individualName ? 'field-error' : ''}`}
                value={state.individual.name}
                onChange={(ev) =>
                  setState((s) => ({
                    ...s,
                    individual: { ...s.individual, name: ev.target.value },
                  }))
                }
              />
              {e.individualName ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.individualName}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5b4139]">Phone</label>
              <input
                className="field"
                value={state.individual.phone}
                onChange={(ev) =>
                  setState((s) => ({
                    ...s,
                    individual: { ...s.individual, phone: ev.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5b4139]">Gender *</label>
              <select
                className={`field ${e.individualGender ? 'field-error' : ''}`}
                value={state.individual.gender}
                onChange={(ev) =>
                  setState((s) => ({
                    ...s,
                    individual: { ...s.individual, gender: ev.target.value },
                  }))
                }
              >
                {GENDERS.map((gender) => (
                  <option key={gender.value} value={gender.value}>
                    {gender.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-[#5b4139]">Age Bracket *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AGE_BRACKETS.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        individual: { ...s.individual, age_bracket: age },
                      }))
                    }
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      state.individual.age_bracket === age
                        ? 'bg-[#ae3100] text-white'
                        : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <LocationAutocomplete
                label="Location"
                location={state.individual.location}
                subcounty={state.individual.subcounty}
                onSelect={(location, subcounty) =>
                  setState((s) => ({
                    ...s,
                    individual: { ...s.individual, location, subcounty },
                  }))
                }
                onClear={() =>
                  setState((s) => ({
                    ...s,
                    individual: { ...s.individual, location: '', subcounty: '' },
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && state.registrationType === 'family' && (
        <div className="space-y-6">
          <div className="panel space-y-5 p-6 sm:p-8">
            <h2 className="font-manrope text-2xl font-bold text-[#0b1c30]">Family Foundation</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#5b4139]">Family Name *</label>
                <input
                  className={`field ${e.familyName ? 'field-error' : ''}`}
                  value={state.family.family_name}
                  onChange={(ev) =>
                    setState((s) => ({
                      ...s,
                      family: { ...s.family, family_name: ev.target.value },
                    }))
                  }
                />
                {e.familyName ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.familyName}</p> : null}
              </div>

              <LocationAutocomplete
                label="Family Location"
                location={state.family.location}
                subcounty={state.family.subcounty}
                onSelect={(location, subcounty) =>
                  setState((s) => ({
                    ...s,
                    family: { ...s.family, location, subcounty },
                  }))
                }
                onClear={() =>
                  setState((s) => ({
                    ...s,
                    family: { ...s.family, location: '', subcounty: '' },
                  }))
                }
              />
            </div>
          </div>

          <div className="panel space-y-4 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-manrope text-xl font-bold text-[#0b1c30]">Household Members</h3>
                <p className="text-sm text-[#5b4139]">Add, edit, and remove members before submission.</p>
              </div>
              <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-sm font-semibold text-[#5b4139]">
                {state.family.members.length} members
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl bg-[#eff4ff] p-4">
                <p className="font-manrope text-lg font-bold text-[#0b1c30]">
                  {editingIndex >= 0 ? 'Edit Member' : 'New Member'}
                </p>

                <input
                  className={`field ${e.memberName ? 'field-error' : ''}`}
                  placeholder="Member name"
                  value={memberDraft.name}
                  onChange={(ev) => setMemberDraft((m) => ({ ...m, name: ev.target.value }))}
                />

                <input
                  className="field"
                  placeholder="Phone"
                  value={memberDraft.phone}
                  onChange={(ev) => setMemberDraft((m) => ({ ...m, phone: ev.target.value }))}
                />

                <select
                  className={`field ${e.memberGender ? 'field-error' : ''}`}
                  value={memberDraft.gender}
                  onChange={(ev) => setMemberDraft((m) => ({ ...m, gender: ev.target.value }))}
                >
                  {GENDERS.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>

                <select
                  className={`field ${e.memberAge ? 'field-error' : ''}`}
                  value={memberDraft.age_bracket}
                  onChange={(ev) => setMemberDraft((m) => ({ ...m, age_bracket: ev.target.value }))}
                >
                  {AGE_BRACKETS.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>

                <LocationAutocomplete
                  label="Member Location"
                  location={memberDraft.location}
                  subcounty={memberDraft.subcounty}
                  onSelect={(location, subcounty) => setMemberDraft((m) => ({ ...m, location, subcounty }))}
                  onClear={() => setMemberDraft((m) => ({ ...m, location: '', subcounty: '' }))}
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" className="btn-primary" onClick={saveMember}>
                    {editingIndex >= 0 ? 'Update Member' : 'Add Family Member'}
                  </button>
                  {editingIndex >= 0 ? (
                    <button type="button" className="btn-soft" onClick={resetMemberDraft}>
                      Cancel
                    </button>
                  ) : null}
                </div>
                {e.familyMembers ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.familyMembers}</p> : null}
              </div>

              <div className="space-y-3">
                {state.family.members.length === 0 && (
                  <div className="rounded-2xl bg-[#f8f9ff] p-4 text-sm text-[#5b4139]">
                    No members added yet.
                  </div>
                )}

                {state.family.members.map((member, idx) => (
                  <article
                    key={`${member.name}-${idx}`}
                    className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(11,28,48,0.08)] transition duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-manrope text-lg font-bold text-[#0b1c30]">{member.name}</p>
                        <p className="text-sm text-[#5b4139]">
                          {member.gender} | {member.age_bracket}
                        </p>
                        <p className="text-sm text-[#5b4139]">{member.phone || 'No phone'}</p>
                        <p className="text-sm text-[#5b4139]">
                          {member.location || state.family.location || '-'} /{' '}
                          {member.subcounty || state.family.subcounty || '-'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          className="btn-soft"
                          onClick={() => {
                            setEditingIndex(idx)
                            setMemberDraft(member)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-soft"
                          onClick={() =>
                            setState((s) => ({
                              ...s,
                              family: {
                                ...s.family,
                                members: s.family.members.filter((_, memberIndex) => memberIndex !== idx),
                              },
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel space-y-5 p-6 sm:p-8">
          <h2 className="font-manrope text-2xl font-bold text-[#0b1c30]">Review</h2>
          {state.registrationType === 'individual' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Type</p>
                <p className="font-semibold">Individual</p>
              </div>
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Name</p>
                <p className="font-semibold">{state.individual.name}</p>
              </div>
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Phone</p>
                <p className="font-semibold">{state.individual.phone || '-'}</p>
              </div>
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Location</p>
                <p className="font-semibold">
                  {state.individual.location || '-'} / {state.individual.subcounty || '-'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Family Name</p>
                <p className="font-semibold">{state.family.family_name}</p>
              </div>
              <div className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b4139]">Members</p>
                <p className="font-semibold">{state.family.members.length}</p>
              </div>
              {state.family.members.map((member, idx) => (
                <div
                  key={`${member.name}-${idx}`}
                  className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(11,28,48,0.08)] transition duration-200 hover:-translate-y-0.5"
                >
                  <p className="font-semibold text-[#0b1c30]">{member.name}</p>
                  <p className="text-sm text-[#5b4139]">
                    {member.gender} | {member.age_bracket} | {member.phone || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}

          <section className="rounded-xl border border-[#e4beb44f] bg-[#eff4ff] p-5">
            <h3 className="font-manrope text-lg font-bold text-[#0b1c30]">Privacy &amp; Approval Workflow</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b4139]">
              By submitting this registration, you confirm you have read Karen AGC&apos;s privacy policy. Your
              information is stored securely and can only be accessed by Karen AGC church administrators.
              Submissions enter a pending review state and are approved by the ministry team before final
              onboarding.
            </p>
            <label className="mt-4 flex items-start gap-3 text-sm font-semibold text-[#0b1c30]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[#8f7067] text-[#ae3100]"
                checked={privacyConfirmed}
                onChange={(ev) => {
                  setPrivacyConfirmed(ev.target.checked)
                  setErrors((prevErrors) => {
                    const nextErrors = { ...prevErrors }
                    delete nextErrors.privacyConfirmed
                    return nextErrors
                  })
                }}
              />
              <span>I confirm that I have read Karen AGC&apos;s Privacy Policy.</span>
            </label>
            {e.privacyConfirmed ? <p className="mt-2 text-xs font-semibold text-[#ba1a1a]">{e.privacyConfirmed}</p> : null}
          </section>
        </div>
      )}

      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <button type="button" className="btn-soft" onClick={prev} disabled={step === 1 || loading}>
          Previous
        </button>
        <div className="flex gap-2">
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={next} disabled={loading}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-xl p-4 text-sm font-semibold ${
            submitOk ? 'bg-[#e8f7ec] text-[#165a2d]' : 'bg-[#ffdad6] text-[#93000a]'
          }`}
        >
          {message}
        </div>
      ) : null}
    </section>
  )
}

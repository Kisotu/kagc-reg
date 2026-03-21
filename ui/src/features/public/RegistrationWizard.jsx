import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { RegistrationStepOnePage, RegistrationWelcomeCard } from './wizardPages/RegistrationStepOnePage'
import { RegistrationStepTwoPage } from './wizardPages/RegistrationStepTwoPage'
import { RegistrationStepThreePage } from './wizardPages/RegistrationStepThreePage'

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

  function onSelectRegistrationType(registrationType) {
    setState((current) => ({ ...current, registrationType }))
  }

  function onIndividualFieldChange(field, value) {
    setState((current) => ({
      ...current,
      individual: { ...current.individual, [field]: value },
    }))
  }

  function onIndividualLocationSelect(location, subcounty) {
    setState((current) => ({
      ...current,
      individual: { ...current.individual, location, subcounty },
    }))
  }

  function onIndividualLocationClear() {
    setState((current) => ({
      ...current,
      individual: { ...current.individual, location: '', subcounty: '' },
    }))
  }

  function onFamilyFieldChange(field, value) {
    setState((current) => ({
      ...current,
      family: { ...current.family, [field]: value },
    }))
  }

  function onFamilyLocationSelect(location, subcounty) {
    setState((current) => ({
      ...current,
      family: { ...current.family, location, subcounty },
    }))
  }

  function onFamilyLocationClear() {
    setState((current) => ({
      ...current,
      family: { ...current.family, location: '', subcounty: '' },
    }))
  }

  function onMemberDraftChange(field, value) {
    setMemberDraft((current) => ({ ...current, [field]: value }))
  }

  function onMemberLocationSelect(location, subcounty) {
    setMemberDraft((current) => ({ ...current, location, subcounty }))
  }

  function onMemberLocationClear() {
    setMemberDraft((current) => ({ ...current, location: '', subcounty: '' }))
  }

  function onEditMember(index, member) {
    setEditingIndex(index)
    setMemberDraft(member)
  }

  function onRemoveMember(index) {
    setState((current) => ({
      ...current,
      family: {
        ...current.family,
        members: current.family.members.filter((_, memberIndex) => memberIndex !== index),
      },
    }))
  }

  function onPrivacyChange(checked) {
    setPrivacyConfirmed(checked)
    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors }
      delete nextErrors.privacyConfirmed
      return nextErrors
    })
  }

  const stepItems = [
    { step: 1, key: 'type', title: 'Registration Type', label: 'Choose Type' },
    { step: 2, key: 'details', title: 'Member Details', label: 'Enter Details' },
    { step: 3, key: 'review', title: 'Review and Submit', label: 'Confirm & Submit' },
  ]
  const currentStepMeta = stepItems[step - 1]

  return (
    <section className="animate-in space-y-6">
      {step === 1 ? <RegistrationWelcomeCard /> : null}

      <div className="panel p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5b4139]">Step {step} of 3</p>
            <h1 className="font-manrope text-2xl font-bold text-[#0b1c30] sm:text-3xl">{currentStepMeta.title}</h1>
          </div>
          <p className="text-sm text-[#5b4139] sm:text-right">Session: {sessionId.slice(0, 10)}...</p>
        </div>

        <div>
          <div className="relative">
            <span
              className="absolute top-5 h-1 rounded-full bg-[#d3e4fe]"
              style={{ left: 'calc(16.6667% + 1.25rem)', width: 'calc(33.3333% - 2.5rem)' }}
              aria-hidden="true"
            />
            <span
              className="absolute top-5 h-1 rounded-full bg-[#d3e4fe]"
              style={{ left: 'calc(50% + 1.25rem)', width: 'calc(33.3333% - 2.5rem)' }}
              aria-hidden="true"
            />
            <span
              className={`absolute top-5 h-1 rounded-full ${step > 1 ? 'bg-[#1f8a46]' : 'bg-transparent'}`}
              style={{ left: 'calc(16.6667% + 1.25rem)', width: 'calc(33.3333% - 2.5rem)' }}
              aria-hidden="true"
            />
            <span
              className={`absolute top-5 h-1 rounded-full ${step > 2 ? 'bg-[#1f8a46]' : 'bg-transparent'}`}
              style={{ left: 'calc(50% + 1.25rem)', width: 'calc(33.3333% - 2.5rem)' }}
              aria-hidden="true"
            />

            <div className="grid grid-cols-3">
              {stepItems.map((item) => {
                const isActive = step === item.step
                const isDone = step > item.step

                return (
                  <div key={item.step} className="flex justify-center">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-[#1f8a46] text-white'
                          : isActive
                            ? 'bg-[#ae3100] text-white ring-4 ring-[#ffebe2]'
                            : 'bg-[#d3e4fe] text-[#46648d]'
                      }`}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M9.55 16.2 5.8 12.45a.75.75 0 1 0-1.06 1.06l4.28 4.29a.75.75 0 0 0 1.06 0l9.18-9.19a.75.75 0 1 0-1.06-1.06l-8.65 8.65Z" />
                        </svg>
                      ) : item.key === 'type' ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M5.75 3.75A2.75 2.75 0 0 0 3 6.5v11A2.75 2.75 0 0 0 5.75 20.25h12.5A2.75 2.75 0 0 0 21 17.5v-11a2.75 2.75 0 0 0-2.75-2.75H5.75Zm1.5 4.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h5a.75.75 0 1 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z" />
                        </svg>
                      ) : item.key === 'details' ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M12 3.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 9.5c-4.07 0-7.25 2.26-7.25 5.15a.75.75 0 0 0 1.5 0c0-1.86 2.35-3.65 5.75-3.65s5.75 1.79 5.75 3.65a.75.75 0 0 0 1.5 0c0-2.89-3.18-5.15-7.25-5.15Z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M12 2.75A9.25 9.25 0 1 0 21.25 12 9.26 9.26 0 0 0 12 2.75Zm4.67 7.78-5.2 5.2a.75.75 0 0 1-1.06 0l-2.03-2.03a.75.75 0 0 1 1.06-1.06l1.5 1.5 4.67-4.67a.75.75 0 1 1 1.06 1.06Z" />
                        </svg>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {stepItems.map((item) => {
              const isActive = step === item.step
              const isDone = step > item.step

              return (
                <p
                  key={item.step}
                  className={`text-center text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs ${
                    isDone ? 'text-[#1f8a46]' : isActive ? 'text-[#ae3100]' : 'text-[#5b4139]'
                  }`}
                >
                  {item.label}
                </p>
              )
            })}
          </div>
        </div>
      </div>

      {step === 1 ? (
        <RegistrationStepOnePage
          registrationType={state.registrationType}
          onSelectRegistrationType={onSelectRegistrationType}
        />
      ) : null}

      {step === 2 ? (
        <RegistrationStepTwoPage
          state={state}
          errors={errors}
          memberDraft={memberDraft}
          editingIndex={editingIndex}
          onIndividualFieldChange={onIndividualFieldChange}
          onIndividualLocationSelect={onIndividualLocationSelect}
          onIndividualLocationClear={onIndividualLocationClear}
          onFamilyFieldChange={onFamilyFieldChange}
          onFamilyLocationSelect={onFamilyLocationSelect}
          onFamilyLocationClear={onFamilyLocationClear}
          onMemberDraftChange={onMemberDraftChange}
          onMemberLocationSelect={onMemberLocationSelect}
          onMemberLocationClear={onMemberLocationClear}
          onSaveMember={saveMember}
          onResetMemberDraft={resetMemberDraft}
          onEditMember={onEditMember}
          onRemoveMember={onRemoveMember}
        />
      ) : null}

      {step === 3 ? (
        <RegistrationStepThreePage
          state={state}
          privacyConfirmed={privacyConfirmed}
          errors={errors}
          onPrivacyChange={onPrivacyChange}
        />
      ) : null}

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

import { AGE_BRACKETS, GENDERS } from '../../../constants'
import { LocationAutocomplete } from '../../../components/LocationAutocomplete'

export function RegistrationStepTwoPage({
  state,
  errors,
  memberDraft,
  editingIndex,
  onIndividualFieldChange,
  onIndividualLocationSelect,
  onIndividualLocationClear,
  onFamilyFieldChange,
  onFamilyLocationSelect,
  onFamilyLocationClear,
  onMemberDraftChange,
  onMemberLocationSelect,
  onMemberLocationClear,
  onSaveMember,
  onResetMemberDraft,
  onEditMember,
  onRemoveMember,
}) {
  const e = errors

  if (state.registrationType === 'individual') {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="panel space-y-5 p-6 lg:col-span-4 lg:p-7">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#ffebe2] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#9a2f00]">
              <span className="h-2 w-2 rounded-full bg-[#ae3100]" aria-hidden="true" />
              Individual Flow
            </p>
            <h2 className="font-manrope text-3xl font-extrabold leading-tight text-[#0b1c30]">
              Personal Details
            </h2>
            <p className="text-sm leading-relaxed text-[#5b4139]">
              Fill in your information accurately so church administrators can review and approve your registration quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-[#bfd3f3] bg-[#f4f8ff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#5b4139]">Registration Progress</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d3e4fe]">
              <div className="h-full bg-[#ae3100]" style={{ width: '66.67%' }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#46648d]">Step 2 of 3 completed</p>
          </div>

          <div className="space-y-3">
            <article className="flex items-start gap-3 rounded-xl border border-[#e4beb44f] bg-white p-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 3.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 9.5c-4.07 0-7.25 2.26-7.25 5.15a.75.75 0 0 0 1.5 0c0-1.86 2.35-3.65 5.75-3.65s5.75 1.79 5.75 3.65a.75.75 0 0 0 1.5 0c0-2.89-3.18-5.15-7.25-5.15Z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">Required identity details</p>
                <p className="text-xs text-[#5b4139]">Name, gender, and age bracket are mandatory.</p>
              </div>
            </article>

            <article className="flex items-start gap-3 rounded-xl border border-[#e4beb44f] bg-white p-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 2.75A9.25 9.25 0 1 0 21.25 12 9.26 9.26 0 0 0 12 2.75Zm.75 4.5a.75.75 0 0 0-1.5 0V12c0 .2.08.39.22.53l2.75 2.75a.75.75 0 1 0 1.06-1.06l-2.53-2.53V7.25Z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">Takes less than 2 minutes</p>
                <p className="text-xs text-[#5b4139]">You can continue to review once this section is complete.</p>
              </div>
            </article>
          </div>
        </aside>

        <div className="panel space-y-6 p-6 lg:col-span-8 lg:p-8">
          <div className="border-b border-[#e4beb44f] pb-4">
            <h3 className="font-manrope text-2xl font-bold text-[#0b1c30]">Personal Information</h3>
            <p className="mt-1 text-sm text-[#5b4139]">Use your official details to avoid approval delays.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-[#5b4139]">Name *</label>
              <input
                className={`field ${e.individualName ? 'field-error' : ''}`}
                value={state.individual.name}
                onChange={(ev) => onIndividualFieldChange('name', ev.target.value)}
              />
              {e.individualName ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.individualName}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5b4139]">Phone</label>
              <input
                className="field"
                value={state.individual.phone}
                onChange={(ev) => onIndividualFieldChange('phone', ev.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5b4139]">Gender *</label>
              <select
                className={`field ${e.individualGender ? 'field-error' : ''}`}
                value={state.individual.gender}
                onChange={(ev) => onIndividualFieldChange('gender', ev.target.value)}
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
                    onClick={() => onIndividualFieldChange('age_bracket', age)}
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
                onSelect={onIndividualLocationSelect}
                onClear={onIndividualLocationClear}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="panel space-y-5 p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-xl border border-[#bfd3f3] bg-[#f4f8ff] p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#163a6a]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.5 13.25c-2.49 0-4.5 1.39-4.5 3.17a.75.75 0 0 0 1.5 0c0-.77 1.2-1.67 3-1.67s3 .9 3 1.67a.75.75 0 0 0 1.5 0c0-1.78-2.01-3.17-4.5-3.17Zm9.5-.25c-2.21 0-4 1.21-4 2.75a.75.75 0 0 0 1.5 0c0-.53.96-1.25 2.5-1.25s2.5.72 2.5 1.25a.75.75 0 0 0 1.5 0c0-1.54-1.79-2.75-4-2.75Z" />
            </svg>
          </span>
          <div>
            <h2 className="font-manrope text-2xl font-bold text-[#0b1c30]">Family Foundation</h2>
            <p className="mt-1 text-sm text-[#5b4139]">Capture family details first, then add each household member below.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#5b4139]">Family Name *</label>
            <input
              className={`field ${e.familyName ? 'field-error' : ''}`}
              value={state.family.family_name}
              onChange={(ev) => onFamilyFieldChange('family_name', ev.target.value)}
            />
            {e.familyName ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.familyName}</p> : null}
          </div>

          <LocationAutocomplete
            label="Family Location"
            location={state.family.location}
            subcounty={state.family.subcounty}
            onSelect={onFamilyLocationSelect}
            onClear={onFamilyLocationClear}
          />
        </div>
      </div>

      <div className="panel space-y-4 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-manrope text-xl font-bold text-[#0b1c30]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffe9de] text-[#9a2f00]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 3.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 9.5c-4.07 0-7.25 2.26-7.25 5.15a.75.75 0 0 0 1.5 0c0-1.86 2.35-3.65 5.75-3.65s5.75 1.79 5.75 3.65a.75.75 0 0 0 1.5 0c0-2.89-3.18-5.15-7.25-5.15Z" />
                </svg>
              </span>
              Household Members
            </h3>
            <p className="text-sm text-[#5b4139]">Add, edit, and remove members before submission.</p>
          </div>
          <span className="rounded-full border border-[#bfd3f3] bg-[#f4f8ff] px-3 py-1 text-sm font-semibold text-[#163a6a]">
            {state.family.members.length} members
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[#bfd3f3] bg-[#f4f8ff] p-4">
            <p className="font-manrope text-lg font-bold text-[#0b1c30]">
              {editingIndex >= 0 ? 'Edit Member' : 'New Member'}
            </p>

            <input
              className={`field ${e.memberName ? 'field-error' : ''}`}
              placeholder="Member name"
              value={memberDraft.name}
              onChange={(ev) => onMemberDraftChange('name', ev.target.value)}
            />

            <input
              className="field"
              placeholder="Phone"
              value={memberDraft.phone}
              onChange={(ev) => onMemberDraftChange('phone', ev.target.value)}
            />

            <select
              className={`field ${e.memberGender ? 'field-error' : ''}`}
              value={memberDraft.gender}
              onChange={(ev) => onMemberDraftChange('gender', ev.target.value)}
            >
              {GENDERS.map((gender) => (
                <option key={gender.value} value={gender.value}>
                  {gender.label}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5b4139]">Age Bracket *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AGE_BRACKETS.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => onMemberDraftChange('age_bracket', age)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      memberDraft.age_bracket === age
                        ? 'bg-[#ae3100] text-white'
                        : 'bg-white text-[#0b1c30] ring-1 ring-[#d3e4fe] hover:bg-[#eff4ff]'
                    } ${e.memberAge ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <LocationAutocomplete
              label="Member Location"
              location={memberDraft.location}
              subcounty={memberDraft.subcounty}
              onSelect={onMemberLocationSelect}
              onClear={onMemberLocationClear}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-primary" onClick={onSaveMember}>
                {editingIndex >= 0 ? 'Update Member' : 'Add Family Member'}
              </button>
              {editingIndex >= 0 ? (
                <button type="button" className="btn-soft" onClick={onResetMemberDraft}>
                  Cancel
                </button>
              ) : null}
            </div>

            {e.memberAge ? <p className="text-xs font-semibold text-[#ba1a1a]">{e.memberAge}</p> : null}
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
                className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(11,28,48,0.08)] transition duration-200"
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
                      onClick={() => onEditMember(idx, member)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-soft"
                      onClick={() => onRemoveMember(idx)}
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
  )
}

export function RegistrationStepThreePage({ state, privacyConfirmed, errors, onPrivacyChange }) {
  return (
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
              className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(11,28,48,0.08)] transition duration-200"
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
            onChange={(ev) => onPrivacyChange(ev.target.checked)}
          />
          <span>I confirm that I have read Karen AGC&apos;s Privacy Policy.</span>
        </label>
        {errors.privacyConfirmed ? <p className="mt-2 text-xs font-semibold text-[#ba1a1a]">{errors.privacyConfirmed}</p> : null}
      </section>
    </div>
  )
}

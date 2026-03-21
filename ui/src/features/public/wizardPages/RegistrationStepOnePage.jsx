export function RegistrationWelcomeCard() {
  return (
    <div className="panel overflow-hidden p-0">
      <div className="border-b border-[#e4beb44f] bg-[#f8f9ff] p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#ffebe2] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#9a2f00]">
          <span className="h-2 w-2 rounded-full bg-[#ae3100]" aria-hidden="true" />
          Karen AGC Registration
        </p>
        <h2 className="mt-4 font-manrope text-2xl font-extrabold leading-tight text-[#0b1c30] sm:text-3xl">
          Welcome to Karen Africa Gospel Church Kenya
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5b4139] sm:text-base">
          Start your registration by choosing whether you are signing up as an individual or as a family.
          All registrations from this page are for the same ceremony event below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
        <article className="rounded-2xl border border-[#e4beb44f] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5b4139]">Location</p>
          <div className="mt-2 flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2.75a7.25 7.25 0 0 0-7.25 7.25c0 5.51 6.32 10.7 6.59 10.92a1 1 0 0 0 1.32 0c.27-.22 6.59-5.4 6.59-10.92A7.25 7.25 0 0 0 12 2.75Zm0 9.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z" />
              </svg>
            </span>
            <p className="font-semibold text-[#0b1c30]">Karen ACG, Kenya</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e4beb44f] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5b4139]">Date</p>
          <div className="mt-2 flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.25A2.75 2.75 0 0 1 22 6.75v12.5A2.75 2.75 0 0 1 19.25 22H4.75A2.75 2.75 0 0 1 2 19.25V6.75A2.75 2.75 0 0 1 4.75 4H6V3a1 1 0 0 1 1-1Zm13 8H4v9.25c0 .41.34.75.75.75h14.5c.41 0 .75-.34.75-.75V10Z" />
              </svg>
            </span>
            <p className="font-semibold text-[#0b1c30]">19th April, 2026</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e4beb44f] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5b4139]">Time</p>
          <div className="mt-2 flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2.75A9.25 9.25 0 1 0 21.25 12 9.26 9.26 0 0 0 12 2.75Zm0 17a7.75 7.75 0 1 1 7.75-7.75A7.76 7.76 0 0 1 12 19.75Zm.75-12a.75.75 0 0 0-1.5 0V12c0 .2.08.39.22.53l2.75 2.75a.75.75 0 1 0 1.06-1.06l-2.53-2.53V7.75Z" />
              </svg>
            </span>
            <p className="font-semibold text-[#0b1c30]">9:00am to 1:00pm</p>
          </div>
        </article>
      </div>
    </div>
  )
}

export function RegistrationStepOnePage({ registrationType, onSelectRegistrationType }) {
  return (
    <div className="panel space-y-5 p-6 sm:p-8">
      <h3 className="font-manrope text-2xl font-bold text-[#0b1c30]">Choose Registration Type</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            value: 'individual',
            title: 'Individual Registration',
            description: 'Single member registration with personal details.',
            helper: 'Best for one person joining the ceremony.',
            iconBg: 'bg-[#ffe9de]',
            iconFg: 'text-[#9a2f00]',
            cardBg: 'bg-[#fff7f2]',
            cardBorder: 'border-[#efc3ad]',
            accents: ['One member profile', 'Quick and simple flow'],
            action: 'Register as Individual',
          },
          {
            value: 'family',
            title: 'Family Registration',
            description: 'Register a household with all family members.',
            helper: 'Best for parents, guardians, and dependants.',
            iconBg: 'bg-[#e7f0ff]',
            iconFg: 'text-[#163a6a]',
            cardBg: 'bg-[#f4f8ff]',
            cardBorder: 'border-[#bfd3f3]',
            accents: ['Add multiple members', 'Manage one family entry'],
            action: 'Register as Family',
          },
        ].map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => onSelectRegistrationType(choice.value)}
            className={`relative rounded-2xl border px-5 py-6 text-left transition duration-200 ${
              registrationType === choice.value
                ? 'border-[#ae3100] ring-2 ring-[#ae310033]'
                : 'border-[#e4beb44f] bg-white'
            }`}
          >
            <span
              className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                registrationType === choice.value
                  ? 'bg-[#ae3100] text-white'
                  : 'bg-[#ffffffbf] text-[#5b4139] ring-1 ring-[#e4beb44f]'
              }`}
            >
              {registrationType === choice.value ? 'Selected' : 'Choose'}
            </span>

            <div className={`rounded-xl border p-4 ${choice.cardBg} ${choice.cardBorder}`}>
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full ${choice.iconBg} ${choice.iconFg}`} aria-hidden="true">
                {choice.value === 'individual' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 3.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 9.5c-4.07 0-7.25 2.26-7.25 5.15a.75.75 0 0 0 1.5 0c0-1.86 2.35-3.65 5.75-3.65s5.75 1.79 5.75 3.65a.75.75 0 0 0 1.5 0c0-2.89-3.18-5.15-7.25-5.15Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.5 13.25c-2.49 0-4.5 1.39-4.5 3.17a.75.75 0 0 0 1.5 0c0-.77 1.2-1.67 3-1.67s3 .9 3 1.67a.75.75 0 0 0 1.5 0c0-1.78-2.01-3.17-4.5-3.17Zm9.5-.25c-2.21 0-4 1.21-4 2.75a.75.75 0 0 0 1.5 0c0-.53.96-1.25 2.5-1.25s2.5.72 2.5 1.25a.75.75 0 0 0 1.5 0c0-1.54-1.79-2.75-4-2.75Z" />
                  </svg>
                )}
              </div>

              <p className="font-manrope text-xl font-bold text-[#0b1c30]">{choice.title}</p>
              <p className="mt-1 text-sm text-[#5b4139]">{choice.description}</p>

              <ul className="mt-4 space-y-2">
                {choice.accents.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#0b1c30]">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#2f6b14] ring-1 ring-[#b8d8a8]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                        <path d="M9.55 16.2 5.8 12.45a.75.75 0 1 0-1.06 1.06l4.28 4.29a.75.75 0 0 0 1.06 0l9.18-9.19a.75.75 0 1 0-1.06-1.06l-8.65 8.65Z" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7d6158]">{choice.helper}</p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#e4beb44f] bg-white px-3 py-2.5">
              <span className="text-sm font-bold text-[#0b1c30]">{choice.action}</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff] text-[#163a6a]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M13.22 5.47a.75.75 0 0 0 0 1.06l4.72 4.72H4a.75.75 0 0 0 0 1.5h13.94l-4.72 4.72a.75.75 0 1 0 1.06 1.06l6-6a.75.75 0 0 0 0-1.06l-6-6a.75.75 0 0 0-1.06 0Z" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

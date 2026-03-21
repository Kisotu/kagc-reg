import { useMemo } from 'react'
import { RegistrationWizard } from './features/public/RegistrationWizard'
import { getOrCreateSessionId } from './lib/session'

function App() {
  const sessionId = useMemo(() => getOrCreateSessionId(), [])

  return (
    <div className="page-shell min-h-screen font-body text-slate-900">
      <div className="page-orb page-orb-primary" aria-hidden="true" />
      <div className="page-orb page-orb-secondary" aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-[#e4beb433] bg-[#f3f6fbea] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/kagc-logo.png" alt="Karen Africa Gospel Church Kenya logo" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-manrope text-xl font-extrabold tracking-tight text-[#0b1c30]">KAGC Registration</p>
              <p className="text-sm text-[#5b4139]">Church member onboarding portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <RegistrationWizard sessionId={sessionId} />
      </main>
    </div>
  )
}

export default App

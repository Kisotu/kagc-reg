import { useMemo, useState } from 'react'
import { AdminPanel } from './features/admin/AdminPanel'
import { RegistrationWizard } from './features/public/RegistrationWizard'
import { getOrCreateSessionId } from './lib/session'

function App() {
  const [mode, setMode] = useState('register')
  const sessionId = useMemo(() => getOrCreateSessionId(), [])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffffff,_#f8f9ff_45%,_#e5eeff)] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#e4beb433] bg-[#f8f9ffc7] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <div>
            <p className="font-manrope text-xl font-extrabold tracking-tight text-[#0b1c30]">KAGC Registration</p>
            <p className="text-sm text-[#5b4139]">Church member onboarding and admin review</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(11,28,48,0.08)]">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'register' ? 'bg-[#ae3100] text-white' : 'text-[#5b4139] hover:bg-[#eff4ff]'
              }`}
            >
              Public Registration
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'admin' ? 'bg-[#ae3100] text-white' : 'text-[#5b4139] hover:bg-[#eff4ff]'
              }`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        {mode === 'register' ? <RegistrationWizard sessionId={sessionId} /> : <AdminPanel />}
      </main>
    </div>
  )
}

export default App

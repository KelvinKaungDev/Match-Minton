import { useAuth } from './context/AuthContext.jsx'
import { useAppState } from './hooks/useAppState.js'
import { useLang } from './context/LangContext.jsx'
import LangToggle from './components/shared/LangToggle.jsx'
import LandingPage from './components/landing/LandingPage.jsx'
import SetupScreen from './components/setup/SetupScreen.jsx'
import SessionScreen from './components/session/SessionScreen.jsx'
import SummaryScreen from './components/summary/SummaryScreen.jsx'

function AppContent() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const state = useAppState(user.uid)

  if (state.loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-[#34d399] text-sm">{t.loading}</div>
      </div>
    )
  }

  const screen = state.session?.screen ?? 'setup'

  return (
    <>
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
        <button
          onClick={logout}
          className="bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium px-2.5 py-1 rounded-lg border border-stone-700 transition-colors"
        >
          {user.email?.split('@')[0]}
        </button>
        <LangToggle inline />
      </div>
      {screen === 'setup' && <SetupScreen state={state} />}
      {screen === 'session' && <SessionScreen state={state} />}
      {screen === 'summary' && <SummaryScreen state={state} />}
    </>
  )
}

export default function App() {
  const { user } = useAuth()

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-[#34d399] text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return <AppContent />
}

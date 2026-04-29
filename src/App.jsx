import { useAppState } from './hooks/useAppState.js'
import SetupScreen from './components/setup/SetupScreen.jsx'
import SessionScreen from './components/session/SessionScreen.jsx'
import SummaryScreen from './components/summary/SummaryScreen.jsx'

export default function App() {
  const state = useAppState()

  if (state.loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-orange-400 text-sm">Loading...</div>
      </div>
    )
  }

  const screen = state.session?.screen ?? 'setup'

  return (
    <>
      {screen === 'setup' && <SetupScreen state={state} />}
      {screen === 'session' && <SessionScreen state={state} />}
      {screen === 'summary' && <SummaryScreen state={state} />}
    </>
  )
}

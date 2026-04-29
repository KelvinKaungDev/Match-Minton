import { useState } from 'react'
import SessionHeader from './SessionHeader.jsx'
import CourtsTab from './CourtsTab.jsx'
import BenchTab from './BenchTab.jsx'
import WaitingTab from './WaitingTab.jsx'
import DoneTab from './DoneTab.jsx'
import { useTimer } from '../../hooks/useTimer.js'

const TABS = ['Courts', 'Bench', 'Waiting', 'Done']

export default function SessionScreen({ state }) {
  const { players, session, courts, markLeave, activatePlayer, volunteerMore, nextRound, fillEmptyCourts, endSession } = state
  const [tab, setTab] = useState('Courts')
  const timer = useTimer((session?.config?.roundMinutes ?? 15) * 60)

  if (!session) return null

  return (
    <div className="min-h-screen bg-stone-950 pb-28">
      <SessionHeader session={session} players={players} timer={timer} />

      <div className="flex border-b border-stone-800 bg-stone-950 sticky top-0 z-10">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Courts' && <CourtsTab courts={courts} onLeave={markLeave} history={session.history ?? []} />}
      {tab === 'Bench' && <BenchTab players={players} session={session} onLeave={markLeave} onFillCourts={fillEmptyCourts} />}
      {tab === 'Waiting' && <WaitingTab players={players} onActivate={activatePlayer} />}
      {tab === 'Done' && <DoneTab players={players} onVolunteer={volunteerMore} />}

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3 flex gap-3">
        <button
          onClick={endSession}
          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors"
        >
          End Early
        </button>
        <button
          onClick={nextRound}
          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl py-2.5 transition-colors"
        >
          Next Round →
        </button>
      </div>
    </div>
  )
}

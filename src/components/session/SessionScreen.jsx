import { useState } from 'react'
import SessionHeader from './SessionHeader.jsx'
import CourtsTab from './CourtsTab.jsx'
import BenchTab from './BenchTab.jsx'
import WaitingTab from './WaitingTab.jsx'
import DoneTab from './DoneTab.jsx'
import { useLang } from '../../context/LangContext.jsx'

const TAB_KEYS = ['courts', 'bench', 'waiting', 'done']

export default function SessionScreen({ state }) {
  const { t } = useLang()
  const { players, session, courts, markLeave, activatePlayer, volunteerMore, fillEmptyCourts, completeCourt, refillCourt, addWalkIn, endSession } = state
  const [tabKey, setTabKey] = useState('courts')

  if (!session) return null

  const TAB_LABELS = {
    courts: t.tabCourts,
    bench: t.tabBench,
    waiting: t.tabWaiting,
    done: t.tabDone,
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-20">
      <SessionHeader session={session} players={players} />

      <div className="flex border-b border-stone-800 bg-stone-950 sticky top-0 z-10">
        {TAB_KEYS.map(key => (
          <button
            key={key}
            onClick={() => setTabKey(key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabKey === key
                ? 'text-[#34d399] border-b-2 border-[#34d399]'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {tabKey === 'courts' && <CourtsTab courts={courts} onLeave={markLeave} onComplete={completeCourt} onRefill={refillCourt} players={players} history={session.history ?? []} />}
      {tabKey === 'bench' && <BenchTab players={players} session={session} onLeave={markLeave} onFillCourts={fillEmptyCourts} onWalkIn={addWalkIn} />}
      {tabKey === 'waiting' && <WaitingTab players={players} onActivate={activatePlayer} />}
      {tabKey === 'done' && <DoneTab players={players} session={session} onVolunteer={volunteerMore} />}

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3">
        <button
          onClick={endSession}
          className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors"
        >
          {t.endSession}
        </button>
      </div>
    </div>
  )
}

import SkillBadge from '../shared/SkillBadge.jsx'
import { calcPlayerCost, STATUS } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

export default function DoneTab({ players, session, onVolunteer }) {
  const { t } = useLang()
  const done = players.filter(p => p.status === STATUS.DONE)
  const left = players.filter(p => p.status === STATUS.LEAVE)

  const fullRoundPrice = session?.config?.fullRoundPrice ?? 0
  const maxRoundsPerPlayer = session?.config?.maxRoundsPerPlayer ?? 0

  if (done.length === 0 && left.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-12">{t.noDone}</p>
  }

  return (
    <div className="space-y-2 p-4">
      {done.map(p => {
        const cost = fullRoundPrice > 0
          ? calcPlayerCost(p.roundsPlayed, fullRoundPrice, maxRoundsPerPlayer)
          : null
        return (
          <div key={p.id} className="flex items-center justify-between bg-stone-900 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <SkillBadge skill={p.skill} />
              <span className="text-white text-sm truncate">{p.name}</span>
              <span className="text-stone-600 text-xs shrink-0">{t.rounds(p.roundsPlayed)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {cost !== null && (
                <span className="text-[#34d399] font-semibold text-sm">{cost.toLocaleString()}</span>
              )}
              <button
                onClick={() => onVolunteer(p.id)}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
              >
                {t.playMore}
              </button>
            </div>
          </div>
        )
      })}

      {left.length > 0 && (
        <>
          {done.length > 0 && <div className="border-t border-stone-800 my-1" />}
          <p className="text-stone-500 text-xs uppercase tracking-wide px-1">{t.leftEarly}</p>
          {left.map(p => {
            const cost = fullRoundPrice > 0
              ? calcPlayerCost(p.roundsPlayed, fullRoundPrice, maxRoundsPerPlayer)
              : null
            return (
              <div key={p.id} className="flex items-center justify-between bg-stone-900/60 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <SkillBadge skill={p.skill} />
                  <span className="text-stone-400 text-sm truncate">{p.name}</span>
                  <span className="text-stone-600 text-xs shrink-0">{t.rounds(p.roundsPlayed)}</span>
                </div>
                {cost !== null && (
                  <span className="text-stone-400 font-semibold text-sm shrink-0 ml-2">{cost.toLocaleString()}</span>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

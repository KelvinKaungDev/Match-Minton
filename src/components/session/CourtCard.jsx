import SkillBadge from '../shared/SkillBadge.jsx'
import { useLang } from '../../context/LangContext.jsx'

function PlayerRow({ player, onLeave }) {
  const { t } = useLang()
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <SkillBadge skill={player.skill} />
        <span className="text-white text-sm truncate">{player.name}</span>
        <span className="text-stone-600 text-xs shrink-0">{t.rounds(player.roundsPlayed)}</span>
      </div>
      <button
        onClick={() => onLeave(player.id)}
        className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors shrink-0 ml-2"
      >
        {t.leave}
      </button>
    </div>
  )
}

export default function CourtCard({ court, onLeave, onComplete, onRefill, canRefill }) {
  const { t } = useLang()
  const isEmpty = court.teamA.length === 0 && court.teamB.length === 0

  if (isEmpty) {
    return (
      <div className="bg-stone-900 rounded-xl p-4 border border-dashed border-stone-700">
        <div className="text-stone-500 text-xs font-semibold tracking-widest mb-3">
          {t.courtLabel(court.id)}
        </div>
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-stone-600 text-sm">{t.courtEmpty}</p>
          <button
            onClick={() => onRefill(court.id)}
            disabled={!canRefill}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-stone-800 disabled:text-stone-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {canRefill ? t.startMatch : t.need4}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-900 rounded-xl p-4">
      <div className="text-stone-500 text-xs font-semibold tracking-widest mb-3">
        {t.courtLabel(court.id)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sky-400 text-xs font-semibold mb-1">{t.teamA}</div>
          {court.teamA.map(p => (
            <PlayerRow key={p.id} player={p} onLeave={onLeave} />
          ))}
        </div>
        <div>
          <div className="text-amber-400 text-xs font-semibold mb-1">{t.teamB}</div>
          {court.teamB.map(p => (
            <PlayerRow key={p.id} player={p} onLeave={onLeave} />
          ))}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-stone-800">
        <button
          onClick={() => onComplete(court.id)}
          className="w-full py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-xs font-semibold rounded-lg transition-colors"
        >
          {t.courtDone}
        </button>
      </div>
    </div>
  )
}

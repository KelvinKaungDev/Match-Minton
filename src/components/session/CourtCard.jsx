import SkillBadge from '../shared/SkillBadge.jsx'
import { useLang } from '../../context/LangContext.jsx'

function PlayerRow({ player, onLeave, onSwapSelect, isSwapping }) {
  const { t } = useLang()
  return (
    <div className={`flex items-center justify-between py-1 px-1 rounded-md transition-colors ${isSwapping ? 'bg-amber-500/10' : ''}`}>
      <div className="flex items-center gap-1 min-w-0">
        <SkillBadge skill={player.skill} />
        <span className="text-white text-xs truncate">{player.name}</span>
      </div>
      <div className="flex gap-0.5 ml-1 shrink-0">
        <button
          onClick={() => onSwapSelect(player.id)}
          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
            isSwapping
              ? 'bg-amber-500/40 text-amber-300 ring-1 ring-amber-400/50'
              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          }`}
        >
          {t.swap}
        </button>
        <button
          onClick={() => onLeave(player.id)}
          className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
        >
          {t.leave}
        </button>
      </div>
    </div>
  )
}

export default function CourtCard({
  court, onLeave, onComplete, onRefill, canRefill,
  swapPlayerId, benchPlayers, onSwapSelect, onSwapConfirm, onCancelSwap,
}) {
  const { t } = useLang()
  const isEmpty = court.teamA.length === 0 && court.teamB.length === 0
  const swappingPlayer = swapPlayerId
    ? [...court.teamA, ...court.teamB].find(p => p.id === swapPlayerId)
    : null

  if (isEmpty) {
    return (
      <div className="bg-stone-900 rounded-xl p-3 border border-dashed border-stone-700 flex flex-col gap-2">
        <div className="text-stone-500 text-[10px] font-semibold tracking-widest">
          {t.courtLabel(court.name ?? court.id)}
        </div>
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-stone-600 text-xs">{t.courtEmpty}</p>
          <button
            onClick={() => onRefill(court.id)}
            disabled={!canRefill}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-stone-800 disabled:text-stone-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {canRefill ? t.startMatch : t.need4}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-900 rounded-xl p-3 flex flex-col gap-2">
      <div className="text-stone-500 text-[10px] font-semibold tracking-widest">
        {t.courtLabel(court.name ?? court.id)}
      </div>

      {/* Team A */}
      <div>
        <div className="text-sky-400 text-[10px] font-semibold mb-0.5">{t.teamA}</div>
        {court.teamA.map(p => (
          <PlayerRow
            key={p.id}
            player={p}
            onLeave={onLeave}
            onSwapSelect={(pid) => onSwapSelect(pid, court.id)}
            isSwapping={swapPlayerId === p.id}
          />
        ))}
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-px bg-stone-800" />
        <span className="text-stone-600 text-[10px] font-bold">VS</span>
        <div className="flex-1 h-px bg-stone-800" />
      </div>

      {/* Team B */}
      <div>
        <div className="text-amber-400 text-[10px] font-semibold mb-0.5">{t.teamB}</div>
        {court.teamB.map(p => (
          <PlayerRow
            key={p.id}
            player={p}
            onLeave={onLeave}
            onSwapSelect={(pid) => onSwapSelect(pid, court.id)}
            isSwapping={swapPlayerId === p.id}
          />
        ))}
      </div>

      {/* Footer: swap picker or done button */}
      <div className="pt-2 border-t border-stone-800">
        {swappingPlayer ? (
          <div className="space-y-1.5">
            <p className="text-amber-400 text-[10px] font-semibold">
              {t.swapWith(swappingPlayer.name)}
            </p>
            {benchPlayers.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {benchPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSwapConfirm(p.id)}
                    className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-stone-800 hover:bg-[#34d399]/20 text-stone-300 hover:text-[#34d399] rounded border border-stone-700 hover:border-[#34d399]/40 transition-colors"
                  >
                    <SkillBadge skill={p.skill} />
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-[10px]">{t.noBenchForSwap}</p>
            )}
            <button
              onClick={onCancelSwap}
              className="w-full py-1 text-stone-500 hover:text-stone-300 text-[10px] transition-colors"
            >
              {t.cancelSwap}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onComplete(court.id)}
            className="w-full py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-[10px] font-semibold rounded-lg transition-colors"
          >
            {t.courtDone}
          </button>
        )}
      </div>
    </div>
  )
}

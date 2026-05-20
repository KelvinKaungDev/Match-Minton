import { STATUS, calcPlayerCost } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

export default function SummaryScreen({ state }) {
  const { t } = useLang()
  const { players, session, resetSession } = state

  const activePlayers = players.filter(p => p.status !== STATUS.WAITING)
  const maxRoundsPerPlayer = session?.config?.maxRoundsPerPlayer ?? 0
  const fullRoundPrice = session?.config?.fullRoundPrice ?? 0
  const roundsPlayed = session?.currentRound ?? 0
  const avgRounds = activePlayers.length > 0
    ? (activePlayers.reduce((s, p) => s + p.roundsPlayed, 0) / activePlayers.length).toFixed(1)
    : '0'
  const mvp = [...activePlayers].sort((a, b) => b.roundsPlayed - a.roundsPlayed)[0]
  const sorted = [...players].sort((a, b) => b.roundsPlayed - a.roundsPlayed)

  const totalCollect = fullRoundPrice > 0
    ? sorted.reduce((sum, p) => sum + calcPlayerCost(p.roundsPlayed, fullRoundPrice, maxRoundsPerPlayer), 0)
    : 0

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-[#34d399] font-bold text-2xl tracking-tight">{t.sessionSummary}</h1>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: roundsPlayed, label: t.roundsPlayed },
            { value: players.length, label: t.totalPlayers },
            { value: avgRounds, label: t.avgRounds },
            { value: mvp?.name ?? '—', label: t.mvpLabel(mvp?.roundsPlayed ?? 0), accent: true },
          ].map(({ value, label, accent }) => (
            <div key={label} className="bg-stone-900 rounded-xl p-4 text-center">
              <div className={`font-bold text-xl truncate ${accent ? 'text-[#34d399]' : 'text-white'}`}>
                {value}
              </div>
              <div className="text-stone-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {fullRoundPrice > 0 && (
          <div className="bg-stone-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.payment}</h2>
              <div className="text-right">
                <span className="text-[#34d399] font-bold text-lg">{totalCollect.toLocaleString()}</span>
                <span className="text-stone-500 text-xs ml-1">{t.totalCollect}</span>
              </div>
            </div>
            {sorted.filter(p => p.roundsPlayed > 0).map(p => {
              const cost = calcPlayerCost(p.roundsPlayed, fullRoundPrice, maxRoundsPerPlayer)
              const isFullRound = p.roundsPlayed >= maxRoundsPerPlayer
              const isLeft = p.status === STATUS.LEAVE
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white text-sm truncate">{p.name}</span>
                    {isLeft && (
                      <span className="text-red-400/70 text-xs shrink-0">{t.leftEarly}</span>
                    )}
                    {!isFullRound && (
                      <span className="text-stone-500 text-xs shrink-0">{t.rounds(p.roundsPlayed)}</span>
                    )}
                  </div>
                  <span className={`font-semibold text-sm shrink-0 ${isFullRound ? 'text-[#34d399]' : 'text-stone-300'}`}>
                    {cost.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-stone-900 rounded-xl p-4 space-y-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.allPlayers}</h2>
          {sorted.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-white text-sm w-28 truncate shrink-0">{p.name}</span>
              <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#34d399] rounded-full transition-all"
                  style={{ width: `${maxRoundsPerPlayer ? Math.min(100, (p.roundsPlayed / maxRoundsPerPlayer) * 100) : 0}%` }}
                />
              </div>
              <span className="text-stone-400 text-xs w-8 text-right shrink-0">{t.rounds(p.roundsPlayed)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3">
        <button
          onClick={resetSession}
          className="w-full bg-[#34d399] hover:bg-[#6ee7b7] text-[#0f1923] font-semibold rounded-xl py-3.5 transition-colors"
        >
          {t.newSession}
        </button>
      </div>
    </div>
  )
}

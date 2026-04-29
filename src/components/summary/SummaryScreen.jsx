import { STATUS } from '../../models/index.js'

export default function SummaryScreen({ state }) {
  const { players, session, resetSession } = state

  const activePlayers = players.filter(p => p.status !== STATUS.WAITING)
  const totalRounds = session?.config?.totalRounds ?? 0
  const roundsPlayed = session?.currentRound ?? 0
  const avgRounds = activePlayers.length > 0
    ? (activePlayers.reduce((s, p) => s + p.roundsPlayed, 0) / activePlayers.length).toFixed(1)
    : '0'
  const mvp = [...activePlayers].sort((a, b) => b.roundsPlayed - a.roundsPlayed)[0]
  const sorted = [...players].sort((a, b) => b.roundsPlayed - a.roundsPlayed)

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-orange-400 font-bold text-2xl tracking-tight">Session Summary</h1>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: roundsPlayed, label: 'Rounds Played' },
            { value: players.length, label: 'Total Players' },
            { value: avgRounds, label: 'Avg Rounds' },
            { value: mvp?.name ?? '—', label: `MVP (${mvp?.roundsPlayed ?? 0}r)`, accent: true },
          ].map(({ value, label, accent }) => (
            <div key={label} className="bg-stone-900 rounded-xl p-4 text-center">
              <div className={`font-bold text-xl truncate ${accent ? 'text-orange-400' : 'text-white'}`}>
                {value}
              </div>
              <div className="text-stone-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-stone-900 rounded-xl p-4 space-y-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">All Players</h2>
          {sorted.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-white text-sm w-28 truncate shrink-0">{p.name}</span>
              <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${totalRounds ? Math.min(100, (p.roundsPlayed / totalRounds) * 100) : 0}%` }}
                />
              </div>
              <span className="text-stone-400 text-xs w-6 text-right shrink-0">{p.roundsPlayed}r</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3">
        <button
          onClick={resetSession}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl py-3.5 transition-colors"
        >
          New Session
        </button>
      </div>
    </div>
  )
}

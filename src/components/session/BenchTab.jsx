import PlayerPill from '../shared/PlayerPill.jsx'
import { STATUS } from '../../models/index.js'

export default function BenchTab({ players, session, onLeave, onFillCourts }) {
  const bench = [...players.filter(p => p.status === STATUS.BENCH)]
    .sort((a, b) => a.roundsPlayed - b.roundsPlayed)

  const emptyCourts = (session?.config?.courts ?? 0) - (session?.courts?.length ?? 0)
  const courtsCanFill = Math.min(emptyCourts, Math.floor(bench.length / 4))
  const showFill = emptyCourts > 0 && bench.length >= 4

  return (
    <div className="space-y-3 p-4">
      {showFill && (
        <div className="bg-orange-950/60 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-orange-400 text-sm font-semibold">
              {bench.length} players on bench
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              {emptyCourts} empty court{emptyCourts > 1 ? 's' : ''} · can fill {courtsCanFill}
            </p>
          </div>
          <button
            onClick={onFillCourts}
            className="shrink-0 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Match Now
          </button>
        </div>
      )}

      {bench.length === 0 && (
        <p className="text-stone-600 text-sm text-center py-12">No players on bench</p>
      )}

      {bench.map(p => (
        <PlayerPill
          key={p.id}
          player={p}
          action={{
            label: 'Leave',
            onClick: () => onLeave(p.id),
            className: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
          }}
        />
      ))}
    </div>
  )
}

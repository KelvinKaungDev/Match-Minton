import { SKILLS, STATUS } from '../../models/index.js'

export default function PlayerList({ players, maxPlayers = 36, onSkillChange, onToggle, onRemove, onMarkAllBench }) {
  const benchCount = players.filter(p => p.status === STATUS.BENCH).length
  const waitingCount = players.filter(p => p.status === STATUS.WAITING).length

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
          Players ({players.length}/{maxPlayers})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">
            {benchCount} bench · {waitingCount} waiting
          </span>
          {waitingCount > 0 && (
            <button
              onClick={onMarkAllBench}
              className="text-xs px-2.5 py-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded-lg transition-colors"
            >
              All Arrived
            </button>
          )}
        </div>
      </div>

      {players.length === 0 && (
        <p className="text-stone-600 text-sm text-center py-6">No players added yet</p>
      )}

      {players.map(player => (
        <div key={player.id} className="flex items-center gap-2 bg-stone-800 rounded-lg px-3 py-2">
          <button
            onClick={() => onToggle(player.id)}
            className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 transition-colors ${
              player.status === STATUS.BENCH
                ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            }`}
          >
            {player.status === STATUS.BENCH ? 'Bench' : 'Waiting'}
          </button>

          <span className="text-white text-sm flex-1 truncate">{player.name}</span>

          <div className="flex gap-1 shrink-0">
            {SKILLS.map(s => (
              <button
                key={s}
                onClick={() => onSkillChange(player.id, s)}
                className={`text-xs w-7 h-7 rounded-lg font-bold transition-colors ${
                  player.skill === s
                    ? 'bg-orange-600 text-white'
                    : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => onRemove(player.id)}
            className="text-stone-600 hover:text-red-400 text-sm px-1 shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

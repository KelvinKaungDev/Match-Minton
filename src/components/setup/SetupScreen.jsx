import SessionConfig from './SessionConfig.jsx'
import AddPlayer from './AddPlayer.jsx'
import PlayerList from './PlayerList.jsx'
import { STATUS } from '../../models/index.js'

export default function SetupScreen({ state }) {
  const {
    players, session,
    updateConfig, addPlayer, addPlayers,
    removePlayer, updatePlayerSkill, togglePlayerStatus, markAllBench,
    startSession,
  } = state

  if (!session) return null

  const bench = players.filter(p => p.status === STATUS.BENCH)
  const canStart = bench.length >= 4

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-orange-400 font-bold text-2xl tracking-tight">Match Minton</h1>
          <span className="text-stone-600 text-xs">🏸</span>
        </div>

        <SessionConfig config={session.config} onUpdate={updateConfig} />
        <AddPlayer onAdd={addPlayer} onAddBulk={addPlayers} maxPlayers={session.config.maxPlayers} />

        {players.length > 0 && (
          <PlayerList
            players={players}
            maxPlayers={session.config.maxPlayers}
            onSkillChange={updatePlayerSkill}
            onToggle={togglePlayerStatus}
            onRemove={removePlayer}
            onMarkAllBench={markAllBench}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3">
        <button
          onClick={startSession}
          disabled={!canStart}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-semibold rounded-xl py-3.5 transition-colors"
        >
          {canStart
            ? `Start Session — ${bench.length} players ready`
            : `Need ≥4 bench players (${bench.length}/4)`}
        </button>
      </div>
    </div>
  )
}

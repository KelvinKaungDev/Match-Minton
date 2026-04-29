import RoundTimer from '../shared/RoundTimer.jsx'
import { STATUS } from '../../models/index.js'

export default function SessionHeader({ session, players, timer }) {
  const { currentRound, config } = session
  const progress = Math.round((currentRound / config.totalRounds) * 100)

  const counts = {
    playing: players.filter(p => p.status === STATUS.PLAYING).length,
    bench: players.filter(p => p.status === STATUS.BENCH).length,
    waiting: players.filter(p => p.status === STATUS.WAITING).length,
    done: players.filter(p => p.status === STATUS.DONE).length,
  }

  return (
    <div className="bg-stone-900 px-4 py-3 space-y-2.5 border-b border-stone-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white font-bold text-base">Round {currentRound}</span>
          <span className="text-stone-500 text-sm"> / {config.totalRounds}</span>
        </div>
        <RoundTimer {...timer} />
      </div>

      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-4 text-xs">
        <span className="text-orange-400">{counts.playing} playing</span>
        <span className="text-sky-400">{counts.bench} bench</span>
        <span className="text-yellow-400">{counts.waiting} waiting</span>
        <span className="text-purple-400">{counts.done} done</span>
      </div>
    </div>
  )
}

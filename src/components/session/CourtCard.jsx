import SkillBadge from '../shared/SkillBadge.jsx'

function PlayerRow({ player, onLeave }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <SkillBadge skill={player.skill} />
        <span className="text-white text-sm truncate">{player.name}</span>
        <span className="text-stone-600 text-xs shrink-0">{player.roundsPlayed}r</span>
      </div>
      <button
        onClick={() => onLeave(player.id)}
        className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors shrink-0 ml-2"
      >
        Leave
      </button>
    </div>
  )
}

export default function CourtCard({ court, onLeave }) {
  return (
    <div className="bg-stone-900 rounded-xl p-4">
      <div className="text-stone-500 text-xs font-semibold tracking-widest mb-3">
        COURT {court.id}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sky-400 text-xs font-semibold mb-1">TEAM A</div>
          {court.teamA.map(p => (
            <PlayerRow key={p.id} player={p} onLeave={onLeave} />
          ))}
        </div>
        <div>
          <div className="text-amber-400 text-xs font-semibold mb-1">TEAM B</div>
          {court.teamB.map(p => (
            <PlayerRow key={p.id} player={p} onLeave={onLeave} />
          ))}
        </div>
      </div>
    </div>
  )
}

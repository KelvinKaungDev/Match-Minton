import PlayerPill from '../shared/PlayerPill.jsx'
import { STATUS } from '../../models/index.js'

export default function DoneTab({ players, onVolunteer }) {
  const done = players.filter(p => p.status === STATUS.DONE)

  if (done.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-12">No done players</p>
  }

  return (
    <div className="space-y-2 p-4">
      {done.map(p => (
        <PlayerPill
          key={p.id}
          player={p}
          action={{
            label: 'Play More',
            onClick: () => onVolunteer(p.id),
            className: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
          }}
        />
      ))}
    </div>
  )
}

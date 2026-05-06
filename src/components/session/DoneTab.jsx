import PlayerPill from '../shared/PlayerPill.jsx'
import { STATUS } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

export default function DoneTab({ players, onVolunteer }) {
  const { t } = useLang()
  const done = players.filter(p => p.status === STATUS.DONE)

  if (done.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-12">{t.noDone}</p>
  }

  return (
    <div className="space-y-2 p-4">
      {done.map(p => (
        <PlayerPill
          key={p.id}
          player={p}
          action={{
            label: t.playMore,
            onClick: () => onVolunteer(p.id),
            className: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
          }}
        />
      ))}
    </div>
  )
}

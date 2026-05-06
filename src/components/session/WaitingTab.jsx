import PlayerPill from '../shared/PlayerPill.jsx'
import { STATUS } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

export default function WaitingTab({ players, onActivate }) {
  const { t } = useLang()
  const waiting = players.filter(p => p.status === STATUS.WAITING)

  if (waiting.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-12">{t.noWaiting}</p>
  }

  return (
    <div className="space-y-2 p-4">
      {waiting.map(p => (
        <PlayerPill
          key={p.id}
          player={p}
          action={{
            label: t.arrived,
            onClick: () => onActivate(p.id),
            className: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
          }}
        />
      ))}
    </div>
  )
}

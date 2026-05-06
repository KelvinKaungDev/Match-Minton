import SkillBadge from './SkillBadge.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function PlayerPill({ player, action }) {
  const { t } = useLang()
  return (
    <div className="flex items-center justify-between bg-stone-900 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <SkillBadge skill={player.skill} />
        <span className="text-white text-sm truncate">{player.name}</span>
        <span className="text-stone-600 text-xs shrink-0">{t.rounds(player.roundsPlayed)}</span>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={`text-xs px-2.5 py-1 rounded-lg shrink-0 ml-2 ${action.className}`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

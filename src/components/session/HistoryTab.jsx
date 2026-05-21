import SkillBadge from '../shared/SkillBadge.jsx'
import { useLang } from '../../context/LangContext.jsx'

function HistoryCourtCard({ court }) {
  const { t } = useLang()
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-sky-400 text-xs font-medium mb-1">{t.teamA}</div>
        {court.teamA.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 py-0.5">
            <SkillBadge skill={p.skill} />
            <span className="text-stone-300 text-xs">{p.name}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-amber-400 text-xs font-medium mb-1">{t.teamB}</div>
        {court.teamB.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 py-0.5">
            <SkillBadge skill={p.skill} />
            <span className="text-stone-300 text-xs">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HistoryTab({ history = [] }) {
  const { t } = useLang()
  const entries = [...history]
    .filter(e => e.court && e.matchNo != null)
    .reverse()

  if (entries.length === 0) {
    return (
      <p className="text-stone-600 text-sm text-center py-12 px-4">{t.noHistory}</p>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {entries.map(entry => (
        <div key={entry.matchNo} className="bg-stone-900 rounded-xl px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm font-semibold">{t.matchNo(entry.matchNo)}</span>
            <span className="text-[#34d399] text-xs font-semibold">{t.courtLabel(entry.court.name ?? entry.court.id)}</span>
          </div>
          <HistoryCourtCard court={entry.court} />
        </div>
      ))}
    </div>
  )
}

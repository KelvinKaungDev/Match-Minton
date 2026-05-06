import CourtCard from './CourtCard.jsx'
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

function MatchHistoryItem({ entry }) {
  const { t } = useLang()
  return (
    <div className="bg-stone-800/50 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-stone-400 text-sm font-medium">{t.matchNo(entry.matchNo)}</span>
        <span className="text-stone-600 text-xs">{t.courtNo(entry.court.id)}</span>
      </div>
      <HistoryCourtCard court={entry.court} />
    </div>
  )
}

export default function CourtsTab({ courts, onLeave, onComplete, onRefill, players = [], history = [] }) {
  const { t } = useLang()
  const benchCount = players.filter(p => p.status === 'bench').length

  return (
    <div className="space-y-3 p-4">
      {courts.length === 0
        ? <p className="text-stone-600 text-sm text-center py-12">{t.noCourts}</p>
        : courts.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              onLeave={onLeave}
              onComplete={onComplete}
              onRefill={onRefill}
              canRefill={benchCount >= 4}
            />
          ))
      }

      {history.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-stone-600 text-xs uppercase tracking-widest">{t.history}</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          <div className="space-y-2">
            {[...history].reverse()
              .filter(entry => entry.court && entry.matchNo != null)
              .map(entry => (
                <MatchHistoryItem key={entry.matchNo} entry={entry} />
              ))}
          </div>
        </>
      )}
    </div>
  )
}

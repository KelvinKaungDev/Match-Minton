import { useState } from 'react'
import CourtCard from './CourtCard.jsx'
import SkillBadge from '../shared/SkillBadge.jsx'

function HistoryCourtCard({ court }) {
  return (
    <div className="bg-stone-800/50 rounded-lg p-3">
      <div className="text-stone-500 text-xs font-semibold tracking-widest mb-2">
        COURT {court.id}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-sky-400 text-xs font-medium mb-1">TEAM A</div>
          {court.teamA.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5">
              <SkillBadge skill={p.skill} />
              <span className="text-stone-300 text-xs">{p.name}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-amber-400 text-xs font-medium mb-1">TEAM B</div>
          {court.teamB.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5">
              <SkillBadge skill={p.skill} />
              <span className="text-stone-300 text-xs">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoundHistoryItem({ entry }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-stone-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-800/40 transition-colors"
      >
        <span className="text-stone-400 text-sm font-medium">Round {entry.round}</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-600 text-xs">{entry.courts.length} courts</span>
          <span className="text-stone-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-stone-800/60">
          {entry.courts.map(court => (
            <HistoryCourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CourtsTab({ courts, onLeave, history = [] }) {
  return (
    <div className="space-y-3 p-4">
      {courts.length === 0
        ? <p className="text-stone-600 text-sm text-center py-12">No active courts</p>
        : courts.map(court => <CourtCard key={court.id} court={court} onLeave={onLeave} />)
      }

      {history.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-stone-800" />
            <span className="text-stone-600 text-xs uppercase tracking-widest">History</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          <div className="space-y-2">
            {[...history].reverse().map(entry => (
              <RoundHistoryItem key={entry.round} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

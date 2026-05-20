import { useState } from 'react'
import PlayerPill from '../shared/PlayerPill.jsx'
import { STATUS, SKILLS, SKILL } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

function WalkInForm({ onWalkIn, maxPlayers, playerCount }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [skill, setSkill] = useState(SKILL.B)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      const result = await onWalkIn(trimmed, skill)
      if (result?.error === 'duplicate') { setError(t.duplicateName); return }
      if (result?.error === 'max') { setError(t.sessionFull(maxPlayers)); return }
      setName('')
      setError('')
      setOpen(false)
    } catch {
      setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={playerCount >= maxPlayers}
        className="w-full py-2.5 border border-dashed border-stone-700 hover:border-[#34d399]/50 text-stone-500 hover:text-[#34d399] rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.walkIn}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-700 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold">{t.walkInTitle}</span>
        <button type="button" onClick={() => { setOpen(false); setError('') }} className="text-stone-500 hover:text-stone-300 text-xs">{t.cancel}</button>
      </div>
      <input
        autoFocus
        value={name}
        onChange={e => { setName(e.target.value); setError('') }}
        placeholder={t.playerName}
        className="w-full bg-stone-800 rounded-lg px-3 py-2 text-white placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-[#34d399]"
      />
      <div className="flex gap-2">
        {SKILLS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSkill(s)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${skill === s ? 'bg-[#34d399] text-[#0f1923]' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
          >
            {s}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" className="w-full bg-[#34d399] hover:bg-[#6ee7b7] text-[#0f1923] rounded-lg py-2 text-sm font-semibold transition-colors">
        {t.addToBench}
      </button>
    </form>
  )
}

export default function BenchTab({ players, session, onLeave, onFillCourts, onWalkIn }) {
  const { t } = useLang()
  const bench = [...players.filter(p => p.status === STATUS.BENCH)]
    .sort((a, b) => a.roundsPlayed - b.roundsPlayed)

  const emptyCourts = (session?.config?.courts ?? 0) - (session?.courts?.length ?? 0)
  const courtsCanFill = Math.min(emptyCourts, Math.floor(bench.length / 4))
  const showFill = emptyCourts > 0 && bench.length >= 4
  const maxPlayers = session?.config?.maxPlayers ?? 36

  return (
    <div className="space-y-3 p-4">
      {showFill && (
        <div className="bg-[#0a2d1a]/60 border border-[#34d399]/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[#34d399] text-sm font-semibold">
              {t.onBench(bench.length)}
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              {t.emptyCourts(emptyCourts, courtsCanFill)}
            </p>
          </div>
          <button
            onClick={onFillCourts}
            className="shrink-0 bg-[#34d399] hover:bg-[#6ee7b7] text-[#0f1923] text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {t.matchNow}
          </button>
        </div>
      )}

      <WalkInForm onWalkIn={onWalkIn} maxPlayers={maxPlayers} playerCount={players.length} />

      {bench.length === 0 && (
        <p className="text-stone-600 text-sm text-center py-8">{t.noBench}</p>
      )}

      {bench.map(p => (
        <PlayerPill
          key={p.id}
          player={p}
          action={{
            label: t.leave,
            onClick: () => onLeave(p.id),
            className: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
          }}
        />
      ))}
    </div>
  )
}

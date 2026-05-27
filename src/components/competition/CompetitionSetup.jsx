import { useState } from 'react'
import { useCompetition, DEFAULT_SCORE_CONFIG } from '../../hooks/useCompetition.js'
import ProGate from '../shared/ProGate.jsx'
import CourtCodeCard from './CourtCodeCard.jsx'
import LiveScoreOverview from './LiveScoreOverview.jsx'

// ── Scoreboard URL copy row ───────────────────────────────────────────────────
function CopyUrlRow({ sessionId }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/scoreboard/${sessionId}`
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="bg-stone-900 rounded-xl p-3 flex items-center gap-3 border border-stone-800">
      <div className="flex-1 min-w-0">
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-0.5">Scoreboard URL</p>
        <p className="text-stone-400 text-xs font-mono truncate">{url}</p>
      </div>
      <button
        onClick={copy}
        className={`text-xs px-3 py-1.5 rounded-lg shrink-0 font-semibold transition-colors ${
          copied
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

// ── Reusable number input row ────────────────────────────────────────────────
function NumberField({ label, hint, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {hint && <p className="text-stone-500 text-xs mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-lg font-bold flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-white text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-lg font-bold flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {hint && <p className="text-stone-500 text-xs mt-0.5">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#34d399]' : 'bg-stone-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// ── Trophy icon ───────────────────────────────────────────────────────────────
function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
    </svg>
  )
}

// ── Inner content (wrapped by ProGate) ────────────────────────────────────────
function CompetitionContent({ courts }) {
  const { config, updateConfig, activeSessionId, activeCourts, starting, startCompetition, syncCourts, endCompetition } = useCompetition()
  const [syncing, setSyncing] = useState(false)

  const activeCourtsWithPlayers = courts.filter(
    c => c.teamA.length > 0 || c.teamB.length > 0
  )

  // Detect session courts whose players differ from what's registered in the competition
  const courtsToSync = activeCourtsWithPlayers.filter(sessionCourt => {
    const label = sessionCourt.name ?? String(sessionCourt.id)
    const existing = activeCourts.find(c => (c.courtName ?? String(c.courtNumber)) === label)
    if (!existing) return true // brand new court
    const registeredIds = new Set([...(existing.teamA ?? []), ...(existing.teamB ?? [])].map(p => p.id))
    return [...sessionCourt.teamA, ...sessionCourt.teamB].some(p => !registeredIds.has(p.id))
  })

  const handleSync = async () => {
    setSyncing(true)
    try { await syncCourts(courtsToSync) } finally { setSyncing(false) }
  }

  // ── Active competition: show court code cards ────────────────────────────
  if (activeSessionId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Competition Active</h2>
            <p className="text-stone-500 text-xs mt-0.5">Share codes or QR via Line to judges</p>
          </div>
          <button
            onClick={endCompetition}
            className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            End Competition
          </button>
        </div>

        <CopyUrlRow sessionId={activeSessionId} />

        {courtsToSync.length > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-[#34d399] font-semibold text-sm transition-colors border border-stone-700"
          >
            {syncing ? 'Updating…' : `↺ Update ${courtsToSync.length} court${courtsToSync.length > 1 ? 's' : ''} with new teams`}
          </button>
        )}

        {activeCourts.length === 0 ? (
          <div className="text-stone-500 text-sm text-center py-6">Loading courts…</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeCourts.map(court => (
                <CourtCodeCard key={court.id} court={court} />
              ))}
            </div>
            <div className="border-t border-stone-800 pt-4">
              <LiveScoreOverview courts={activeCourts} />
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Setup form ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <TrophyIcon />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Competition Mode</h2>
          <p className="text-stone-500 text-xs">Configure scoring rules for this round</p>
        </div>
      </div>

      {/* Score config card */}
      <div className="bg-stone-900 rounded-xl p-4 space-y-4">
        <NumberField
          label="Points to Win"
          hint="Standard rally point scoring"
          value={config.pointsToWin}
          min={11}
          max={30}
          onChange={v => updateConfig('pointsToWin', v)}
        />
        <div className="border-t border-stone-800" />
        <NumberField
          label="Number of Games"
          hint="Best of this many games"
          value={config.numberOfGames}
          min={1}
          max={5}
          onChange={v => updateConfig('numberOfGames', v)}
        />
        <div className="border-t border-stone-800" />
        <Toggle
          label="Deuce Rule"
          hint="Must win by 2 when tied"
          checked={config.deuceRule}
          onChange={v => updateConfig('deuceRule', v)}
        />
        {config.deuceRule && (
          <>
            <div className="border-t border-stone-800" />
            <NumberField
              label="Max Points (Deuce Cap)"
              hint="Game ends at this score regardless"
              value={config.maxPoints}
              min={config.pointsToWin + 1}
              max={40}
              onChange={v => updateConfig('maxPoints', v)}
            />
          </>
        )}
      </div>

      {/* Courts preview */}
      {activeCourtsWithPlayers.length > 0 ? (
        <div className="bg-stone-900 rounded-xl p-4">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide mb-3">
            Courts to register ({activeCourtsWithPlayers.length})
          </p>
          <div className="space-y-2">
            {activeCourtsWithPlayers.map((court, i) => (
              <div key={court.id} className="flex items-center gap-3 text-sm">
                <span className="text-stone-500 w-16 shrink-0">Court {court.name ?? i + 1}</span>
                <span className="text-white truncate">
                  {court.teamA.map(p => p.name).join(', ')}
                </span>
                <span className="text-stone-600 shrink-0">vs</span>
                <span className="text-white truncate">
                  {court.teamB.map(p => p.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-xl p-4 text-center text-stone-500 text-sm">
          No active courts — start a session round first
        </div>
      )}

      {/* Start button */}
      <button
        onClick={() => startCompetition(activeCourtsWithPlayers)}
        disabled={starting || activeCourtsWithPlayers.length === 0}
        className="w-full py-3 rounded-xl bg-[#34d399] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-sm transition-colors"
      >
        {starting ? 'Starting…' : `Start Competition (${activeCourtsWithPlayers.length} courts)`}
      </button>
    </div>
  )
}

// ── Public export — wrapped in ProGate ────────────────────────────────────────
export default function CompetitionSetup({ courts = [] }) {
  return (
    <ProGate>
      <CompetitionContent courts={courts} />
    </ProGate>
  )
}

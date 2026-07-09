import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/apiClient.js'
import { fetchCourtFull } from '../../hooks/useCompetition.js'

const POLL_INTERVAL_MS = 3000

// ── Backend polling ─────────────────────────────────────────────────────────

function useScoreboardData(sessionId) {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)   // null | 'not-found' | 'error'

  const refresh = useCallback(async () => {
    try {
      const session = await api.get(`/api/competition-sessions/${sessionId}`)
      const scoreConfig = {
        pointsToWin: session.pointsToWin,
        numberOfGames: session.numberOfGames,
        deuceRule: session.deuceRule,
        maxPoints: session.maxPoints,
      }
      const rawCourts = await api.get(`/api/competition-courts/session/${sessionId}`)
      const sorted = [...rawCourts].sort((a, b) => a.courtNumber - b.courtNumber)
      const full = await Promise.all(sorted.map(c => fetchCourtFull(c, scoreConfig)))
      setCourts(full)
      setLoading(false)
    } catch {
      setError('error')
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    api.get(`/api/competition-sessions/${sessionId}`)
      .then(() => { if (!cancelled) refresh() })
      .catch(() => { if (!cancelled) { setError('not-found'); setLoading(false) } })

    return () => { cancelled = true }
  }, [sessionId, refresh])

  useEffect(() => {
    if (!sessionId || error) return
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [sessionId, error, refresh])

  return { courts, loading, error }
}

// ── Live clock ────────────────────────────────────────────────────────────────

function useClock() {
  const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── Sizing system — vw-based so everything scales with screen resolution ──────

function getColCount(n) {
  if (n <= 1) return 1
  if (n <= 4) return 2
  if (n <= 6) return 3
  return 4
}

const SZ = {
  1: { score: '13vw', name: '2.4vw', label: '1.4vw', chip: '1.3vw', pip: '1.2vw', banner: '1.6vw' },
  2: { score: '9vw',  name: '1.9vw', label: '1.1vw', chip: '1.1vw', pip: '1vw',   banner: '1.3vw' },
  3: { score: '6.5vw',name: '1.5vw', label: '0.9vw', chip: '0.9vw', pip: '0.85vw',banner: '1.1vw' },
  4: { score: '5vw',  name: '1.3vw', label: '0.8vw', chip: '0.8vw', pip: '0.75vw',banner: '1vw'   },
}

// ── Score colour logic ────────────────────────────────────────────────────────
// Green on the currently leading (or match-winning) team; dimmed on the other.

function scoreColors(score, matchWinner) {
  const GREEN = '#34d399'
  const DIM   = 'rgba(255,255,255,0.22)'
  const WHITE = '#ffffff'
  if (matchWinner === 'teamA') return { a: GREEN, b: DIM }
  if (matchWinner === 'teamB') return { a: DIM,   b: GREEN }
  if (score.teamA > score.teamB) return { a: GREEN, b: 'rgba(255,255,255,0.55)' }
  if (score.teamB > score.teamA) return { a: 'rgba(255,255,255,0.55)', b: GREEN }
  return { a: WHITE, b: WHITE }
}

// ── Court tile ────────────────────────────────────────────────────────────────

function CourtTile({ court, sz }) {
  const {
    courtName, courtNumber,
    teamA = [], teamB = [],
    scoreConfig = {},
    currentScore,
    currentGame,
    matchWinner,
    gamesWon,
    completedGames,
  } = court

  const score      = currentScore ?? { teamA: 0, teamB: 0 }
  const wins       = gamesWon ?? { teamA: 0, teamB: 0 }
  const totalGames = scoreConfig.numberOfGames ?? 3
  const needed     = Math.ceil(totalGames / 2)
  const game       = currentGame ?? 1
  const isFinished = !!matchWinner
  const hasStarted = !!currentScore
  const colors     = scoreColors(score, matchWinner)

  const namesA = teamA.map(p => p.name).join(' · ') || 'Team A'
  const namesB = teamB.map(p => p.name).join(' · ') || 'Team B'
  const winnerNames = matchWinner === 'teamA' ? namesA : namesB

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.025)',
      border: isFinished ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1rem',
      padding: '1.4vw',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6vw',
      overflow: 'hidden',
      minHeight: 0,
    }}>

      {/* ── Winner banner ── */}
      {isFinished && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6vw',
          background: 'rgba(52,211,153,0.1)',
          borderRadius: '0.5rem',
          padding: '0.35vw 0.8vw',
        }}>
          <span style={{ fontSize: sz.banner }}>🏆</span>
          <span style={{
            color: '#34d399',
            fontSize: sz.banner,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {winnerNames} Wins
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: sz.chip, fontWeight: 600, flexShrink: 0 }}>
            {wins.teamA}–{wins.teamB}
          </span>
        </div>
      )}

      {/* ── Court header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: sz.label,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}>
          Court {courtName ?? courtNumber}
        </span>
        {!isFinished && (
          <span style={{
            color: hasStarted ? '#34d399' : 'rgba(255,255,255,0.18)',
            fontSize: sz.chip,
            fontWeight: 600,
          }}>
            {hasStarted ? `Game ${game} / ${totalGames}` : 'Waiting'}
          </span>
        )}
      </div>

      {/* ── Team names ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8vw' }}>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: sz.name,
          fontWeight: 600,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {namesA}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: sz.chip, flexShrink: 0 }}>vs</span>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: sz.name,
          fontWeight: 600,
          flex: 1,
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {namesB}
        </span>
      </div>

      {/* ── BIG SCORE ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5vw', minHeight: 0 }}>

        {/* Team A side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vw' }}>
          <span style={{
            color: colors.a,
            fontSize: sz.score,
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.4s',
          }}>
            {score.teamA}
          </span>
          {/* Game-win pips */}
          <div style={{ display: 'flex', gap: '0.4vw' }}>
            {Array.from({ length: needed }).map((_, i) => (
              <span key={i} style={{
                display: 'inline-block',
                width: sz.pip, height: sz.pip,
                borderRadius: '50%',
                backgroundColor: i < wins.teamA ? '#34d399' : 'rgba(255,255,255,0.1)',
                transition: 'background-color 0.4s',
              }} />
            ))}
          </div>
        </div>

        {/* Separator */}
        <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: sz.score, fontWeight: 200, flexShrink: 0, lineHeight: 1 }}>
          —
        </span>

        {/* Team B side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vw' }}>
          <span style={{
            color: colors.b,
            fontSize: sz.score,
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.4s',
          }}>
            {score.teamB}
          </span>
          <div style={{ display: 'flex', gap: '0.4vw' }}>
            {Array.from({ length: needed }).map((_, i) => (
              <span key={i} style={{
                display: 'inline-block',
                width: sz.pip, height: sz.pip,
                borderRadius: '50%',
                backgroundColor: i < wins.teamB ? '#34d399' : 'rgba(255,255,255,0.1)',
                transition: 'background-color 0.4s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Game history chips ── */}
      {completedGames?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5vw', flexWrap: 'wrap', justifyContent: 'center' }}>
          {completedGames.map(g => (
            <span key={g.game} style={{
              fontSize: sz.chip,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              padding: '0.2vw 0.55vw',
              borderRadius: '0.3rem',
              backgroundColor: g.winner === 'teamA' ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.06)',
              color: g.winner === 'teamA' ? '#34d399' : 'rgba(255,255,255,0.45)',
            }}>
              G{g.game}: {g.teamA}–{g.teamB}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Full-screen states ────────────────────────────────────────────────────────

const PAGE_STYLE = {
  height: '100svh',
  backgroundColor: '#030712',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Outfit', sans-serif",
  overflow: 'hidden',
  color: '#ffffff',
}

function FullScreenMessage({ children }) {
  return (
    <div style={{ ...PAGE_STYLE, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  )
}

// ── Scoreboard header ─────────────────────────────────────────────────────────

function Header({ clock, total, finished }) {
  return (
    <div style={{
      height: '3.5vw',
      minHeight: '44px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2vw',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backgroundColor: 'rgba(255,255,255,0.02)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
        <div style={{
          width: '1.8vw', minWidth: '24px',
          height: '1.8vw', minHeight: '24px',
          borderRadius: '50%',
          backgroundColor: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1vw',
        }}>
          🏸
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1vw', fontWeight: 700, letterSpacing: '0.02em' }}>
          Match Minton
        </span>
      </div>

      {/* Centre label */}
      <span style={{ color: '#34d399', fontSize: '1.1vw', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Live Scoreboard
      </span>

      {/* Right: clock + progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
        {total > 0 && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9vw', fontWeight: 500 }}>
            {finished}/{total} complete
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1vw', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {clock}
        </span>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function BigScreenScoreboard() {
  const { sessionId } = useParams()
  const { courts, loading, error } = useScoreboardData(sessionId)
  const clock = useClock()

  if (loading) {
    return (
      <FullScreenMessage>
        <svg style={{ width: '2vw', height: '2vw', color: '#34d399', animation: 'spin 1s linear infinite' }}
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p style={{ marginTop: '1vw', color: 'rgba(255,255,255,0.35)', fontSize: '1.2vw' }}>Loading scoreboard…</p>
      </FullScreenMessage>
    )
  }

  if (error === 'not-found') {
    return (
      <FullScreenMessage>
        <p style={{ color: '#f87171', fontSize: '2vw', fontWeight: 800 }}>Session Not Found</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.2vw', marginTop: '0.8vw' }}>
          This scoreboard link is invalid or has expired.
        </p>
      </FullScreenMessage>
    )
  }

  if (error) {
    return (
      <FullScreenMessage>
        <p style={{ color: '#f87171', fontSize: '2vw', fontWeight: 800 }}>Connection Error</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.2vw', marginTop: '0.8vw' }}>
          Could not reach the server. Check your connection.
        </p>
      </FullScreenMessage>
    )
  }

  if (courts.length === 0) {
    return (
      <div style={PAGE_STYLE}>
        <Header clock={clock} total={0} finished={0} />
        <FullScreenMessage>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1.8vw', fontWeight: 700 }}>
            Waiting for judges to start scoring…
          </p>
        </FullScreenMessage>
      </div>
    )
  }

  const colCount = getColCount(courts.length)
  const sz       = SZ[colCount]
  const finished = courts.filter(c => c.matchWinner).length

  return (
    <div style={PAGE_STYLE}>
      <Header clock={clock} total={courts.length} finished={finished} />

      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
        gridAutoRows: '1fr',
        gap: '1vw',
        padding: '1vw',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {courts.map(court => (
          <CourtTile key={court.id} court={court} sz={sz} />
        ))}
      </main>
    </div>
  )
}

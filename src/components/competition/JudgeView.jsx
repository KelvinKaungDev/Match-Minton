import { Link, useParams } from 'react-router-dom'
import { QRCode } from 'react-qr-code'
import { useCompetitionScoring } from '../../hooks/useCompetitionScoring.js'
import ScoreControl from './ScoreControl.jsx'

// ── Small helpers ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-[#34d399]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function GamesWonDots({ won, needed, color }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: needed }).map((_, i) => (
        <span key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < won ? color : 'bg-stone-700'}`} />
      ))}
    </div>
  )
}

// ── Loading / error screens ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-stone-400 text-sm">Loading court…</p>
      </div>
    </div>
  )
}

function ErrorScreen({ error }) {
  const messages = {
    'not-found': { title: 'Court Not Found', body: "This code doesn't match any active court.", color: 'text-red-400' },
    'session-ended': { title: 'Session Has Ended', body: 'The organiser has closed this competition session.', color: 'text-amber-400' },
    'error': { title: 'Connection Error', body: 'Could not reach the server. Please check your connection.', color: 'text-red-400' },
  }
  const { title, body, color } = messages[error] ?? messages['error']

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <p className={`text-4xl font-black mb-3 ${color}`}>{title}</p>
      <p className="text-stone-400 text-sm mb-8 max-w-xs">{body}</p>
      <Link
        to="/judge"
        className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold transition-colors"
      >
        ← Try Another Code
      </Link>
    </div>
  )
}

// ── Winner overlay ────────────────────────────────────────────────────────────

function WinnerBanner({ matchState, courtId }) {
  const resultUrl = `${window.location.origin}/result/${courtId}`
  const { matchWinner, gamesWon, completedGames } = matchState
  const isA = matchWinner === 'teamA'
  const winnerLabel = isA ? 'Team A' : 'Team B'
  const winnerColor = isA ? 'text-emerald-400' : 'text-sky-400'
  const winnerBg = isA ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-sky-500/10 border-sky-500/30'

  return (
    <div className="fixed inset-0 bg-stone-950/96 z-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🏆</div>
      <h1 className={`text-4xl font-black mb-1 ${winnerColor}`}>{winnerLabel} Wins!</h1>
      <p className="text-stone-400 text-sm mb-6">
        Match score: {gamesWon.teamA} — {gamesWon.teamB} games
      </p>

      <div className={`w-full max-w-xs border rounded-xl p-4 mb-8 space-y-2 ${winnerBg}`}>
        {completedGames.map(g => (
          <div key={g.game} className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Game {g.game}</span>
            <span className="text-white font-bold tabular-nums">
              {g.teamA} — {g.teamB}
            </span>
            <span className={`text-xs font-semibold ${g.winner === 'teamA' ? 'text-emerald-400' : 'text-sky-400'}`}>
              {g.winner === 'teamA' ? 'Team A' : 'Team B'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-2 rounded-xl mb-2">
        <QRCode value={resultUrl} size={112} level="M" />
      </div>
      <p className="text-stone-500 text-xs mb-6">Players: scan to get your result card</p>

      <Link
        to="/judge"
        className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold transition-colors"
      >
        Score Another Court
      </Link>
    </div>
  )
}

// ── Game history table ────────────────────────────────────────────────────────

function GameHistory({ completedGames }) {
  if (!completedGames.length) return null
  return (
    <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
      <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-3">Game History</p>
      <div className="space-y-2">
        {completedGames.map(g => (
          <div key={g.game} className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Game {g.game}</span>
            <span className="text-white font-bold tabular-nums">{g.teamA} — {g.teamB}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              g.winner === 'teamA'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-sky-500/20 text-sky-400'
            }`}>
              {g.winner === 'teamA' ? 'Team A' : 'Team B'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main judge view ───────────────────────────────────────────────────────────

export default function JudgeView() {
  const { code } = useParams()
  const { courtData, matchState, loading, error, scorePoint, undoLastPoint, canUndo } = useCompetitionScoring(code)

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  const {
    courtName, courtNumber,
    teamA = [], teamB = [],
    scoreConfig = {},
  } = courtData

  const score = matchState?.currentScore ?? { teamA: 0, teamB: 0 }
  const gamesWon = matchState?.gamesWon ?? { teamA: 0, teamB: 0 }
  const gamesNeeded = matchState?.gamesNeededToWin ?? 1
  const currentGame = matchState?.currentGame ?? 1
  const totalGames = scoreConfig.numberOfGames ?? 3
  const isFinished = !!matchState?.matchWinner

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Header ── */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center">
        <Link
          to="/judge"
          className="text-stone-400 hover:text-white text-sm flex items-center gap-1 w-16 shrink-0 transition-colors"
        >
          ← Back
        </Link>
        <div className="flex-1 text-center">
          <p className="text-white font-bold">Court {courtName ?? courtNumber}</p>
          <p className="text-stone-500 text-xs">
            {isFinished ? 'Match complete' : `Game ${currentGame} of ${totalGames}`}
          </p>
        </div>
        <div className="w-16 shrink-0 text-right">
          <span className="text-stone-600 text-xs font-mono tracking-widest">{code}</span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">

        {/* ── Big score display ── */}
        <div className="bg-stone-900 rounded-2xl px-4 py-5 border border-stone-800">
          <div className="flex items-stretch">
            {/* Team A */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Team A</p>
              <p className="text-8xl font-black text-emerald-400 leading-none tabular-nums">{score.teamA}</p>
              <GamesWonDots won={gamesWon.teamA} needed={gamesNeeded} color="bg-emerald-500" />
            </div>

            {/* Separator */}
            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-stone-700 text-4xl font-light">—</span>
            </div>

            {/* Team B */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Team B</p>
              <p className="text-8xl font-black text-sky-400 leading-none tabular-nums">{score.teamB}</p>
              <GamesWonDots won={gamesWon.teamB} needed={gamesNeeded} color="bg-sky-500" />
            </div>
          </div>

          {/* Deuce / set point indicator */}
          {!isFinished && (() => {
            const { pointsToWin, deuceRule, maxPoints } = scoreConfig
            const hi = Math.max(score.teamA, score.teamB)
            const lo = Math.min(score.teamA, score.teamB)
            if (deuceRule && hi >= pointsToWin - 1 && hi === lo) {
              return <p className="text-center text-amber-400 text-xs font-semibold mt-3">DEUCE</p>
            }
            if (hi >= pointsToWin - 1 && hi !== lo) {
              const leader = score.teamA > score.teamB ? 'Team A' : 'Team B'
              return <p className="text-center text-amber-400 text-xs font-semibold mt-3">{leader} — SET POINT</p>
            }
            return null
          })()}
        </div>

        {/* ── Score buttons ── */}
        <ScoreControl
          teamA={teamA}
          teamB={teamB}
          onScore={scorePoint}
          onUndo={undoLastPoint}
          canUndo={canUndo}
          disabled={isFinished}
        />

        {/* ── Game history ── */}
        <GameHistory completedGames={matchState?.completedGames ?? []} />

      </div>

      {/* ── Winner overlay ── */}
      {isFinished && <WinnerBanner matchState={matchState} courtId={courtData.id} />}

    </div>
  )
}

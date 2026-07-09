import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '../services/apiClient.js'

const POLL_INTERVAL_MS = 3000

// ── Pure scoring logic (no side effects) ─────────────────────────────────────

function getGameWinner(score, { pointsToWin, deuceRule, maxPoints }) {
  const { teamA, teamB } = score
  const hi = Math.max(teamA, teamB)
  const lo = Math.min(teamA, teamB)
  if (hi < pointsToWin) return null
  const leader = teamA > teamB ? 'teamA' : teamB > teamA ? 'teamB' : null
  if (!leader) return null               // exact tie at or above pointsToWin (deuce)
  if (!deuceRule) return leader          // no deuce: first to reach pointsToWin wins
  if (hi >= maxPoints) return leader     // cap reached: whoever is ahead wins
  if (hi - lo >= 2) return leader        // standard deuce: 2-point lead required
  return null
}

// Same output shape as the old pointLog-driven computeMatchState, but derived
// from the backend's Game rows (running score per game, no point-by-point log).
function computeMatchStateFromGames(games, config) {
  const { numberOfGames } = config
  const gamesNeededToWin = Math.ceil(numberOfGames / 2)
  const sorted = [...games].sort((a, b) => a.gameNumber - b.gameNumber)

  const completedGames = sorted
    .filter(g => g.status === 'finished')
    .map(g => ({ game: g.gameNumber, teamA: g.teamAScore, teamB: g.teamBScore, winner: g.winner }))
  const gamesWon = { teamA: 0, teamB: 0 }
  for (const g of completedGames) gamesWon[g.winner]++

  const activeGame = sorted.find(g => g.status === 'active')
  const lastGame = sorted[sorted.length - 1]
  const currentScore = activeGame
    ? { teamA: activeGame.teamAScore, teamB: activeGame.teamBScore }
    : lastGame
      ? { teamA: lastGame.teamAScore, teamB: lastGame.teamBScore }
      : { teamA: 0, teamB: 0 }
  const currentGame = activeGame?.gameNumber ?? lastGame?.gameNumber ?? 1

  const matchWinner = gamesWon.teamA >= gamesNeededToWin ? 'teamA'
    : gamesWon.teamB >= gamesNeededToWin ? 'teamB' : null

  return {
    currentGame,
    currentScore,
    completedGames,
    gamesWon,
    matchWinner,
    matchStatus: matchWinner ? 'finished' : 'playing',
    totalGames: numberOfGames,
    gamesNeededToWin,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCompetitionScoring(code) {
  const [court, setCourt] = useState(null)
  const [scoreConfig, setScoreConfig] = useState(null)
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)   // null | 'not-found' | 'session-ended' | 'error'

  // Session-local only: the backend keeps a running score per game, not a
  // point-by-point log, so "undo" can only reverse the point this browser
  // tab just scored — it won't survive a refresh or sync to another device.
  const lastScoredTeamRef = useRef(null)

  const refreshCourtData = useCallback(async (courtId) => {
    const [players, gamesList] = await Promise.all([
      api.get(`/api/players/court/${courtId}`),
      api.get(`/api/games/court/${courtId}`),
    ])
    setTeamA(players.filter(p => p.team === 'teamA'))
    setTeamB(players.filter(p => p.team === 'teamB'))
    setGames(gamesList)
  }, [])

  // Step 1: resolve code → court + session (one-time on mount)
  useEffect(() => {
    if (!code) return
    let cancelled = false

    api.get(`/api/competition-courts/code/${code}`)
      .then(async foundCourt => {
        if (cancelled) return
        const session = await api.get(`/api/competition-sessions/${foundCourt.sessionId}`)
        if (cancelled) return
        if (session.status === 'finished') { setError('session-ended'); setLoading(false); return }

        setCourt(foundCourt)
        setScoreConfig({
          pointsToWin: session.pointsToWin,
          numberOfGames: session.numberOfGames,
          deuceRule: session.deuceRule,
          maxPoints: session.maxPoints,
        })
        await refreshCourtData(foundCourt.id)
        if (!cancelled) setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError('not-found'); setLoading(false) } })

    return () => { cancelled = true }
  }, [code, refreshCourtData])

  // Step 2: poll for updates once resolved
  useEffect(() => {
    if (!court) return
    const id = setInterval(() => refreshCourtData(court.id), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [court, refreshCourtData])

  const matchState = useMemo(() => {
    if (!scoreConfig) return null
    return computeMatchStateFromGames(games, scoreConfig)
  }, [games, scoreConfig])

  const courtData = court ? {
    id: court.id,
    courtName: String(court.courtNumber),
    courtNumber: court.courtNumber,
    teamA: teamA.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
    teamB: teamB.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
    scoreConfig,
  } : null

  const scorePoint = async (team) => {
    if (!court || !scoreConfig || matchState?.matchWinner) return

    const sorted = [...games].sort((a, b) => a.gameNumber - b.gameNumber)
    let activeGame = sorted.find(g => g.status === 'active')
    if (!activeGame) {
      const nextGameNumber = (sorted[sorted.length - 1]?.gameNumber ?? 0) + 1
      activeGame = await api.post('/api/games', {
        courtId: court.id, gameNumber: nextGameNumber, teamAScore: 0, teamBScore: 0, status: 'active',
      })
    }

    const teamAScore = activeGame.teamAScore + (team === 'teamA' ? 1 : 0)
    const teamBScore = activeGame.teamBScore + (team === 'teamB' ? 1 : 0)
    await api.put(`/api/games/${activeGame.id}`, {
      courtId: court.id, gameNumber: activeGame.gameNumber, teamAScore, teamBScore, status: 'active',
    })
    lastScoredTeamRef.current = team

    const winner = getGameWinner({ teamA: teamAScore, teamB: teamBScore }, scoreConfig)
    if (winner) {
      await api.patch(`/api/games/${activeGame.id}/finish?winner=${winner}`)

      const gamesWon = { teamA: 0, teamB: 0 }
      for (const g of sorted.filter(g => g.status === 'finished')) gamesWon[g.winner]++
      gamesWon[winner]++
      const gamesNeededToWin = Math.ceil(scoreConfig.numberOfGames / 2)
      if (gamesWon[winner] >= gamesNeededToWin) {
        await api.patch(`/api/competition-courts/${court.id}/finish?winner=${winner}`)
      }
    }

    await refreshCourtData(court.id)
  }

  const undoLastPoint = async () => {
    const team = lastScoredTeamRef.current
    if (!team || !court) return

    const sorted = [...games].sort((a, b) => a.gameNumber - b.gameNumber)
    const activeGame = sorted.find(g => g.status === 'active') ?? sorted[sorted.length - 1]
    if (!activeGame) return

    const teamAScore = Math.max(0, activeGame.teamAScore - (team === 'teamA' ? 1 : 0))
    const teamBScore = Math.max(0, activeGame.teamBScore - (team === 'teamB' ? 1 : 0))
    await api.put(`/api/games/${activeGame.id}`, {
      courtId: court.id, gameNumber: activeGame.gameNumber, teamAScore, teamBScore, status: 'active',
    })
    lastScoredTeamRef.current = null
    await refreshCourtData(court.id)
  }

  return {
    courtData, matchState, loading, error, scorePoint, undoLastPoint,
    canUndo: lastScoredTeamRef.current !== null,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/apiClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export const DEFAULT_SCORE_CONFIG = {
  pointsToWin: 21,
  numberOfGames: 3,
  deuceRule: true,
  maxPoints: 30,
}

const POLL_INTERVAL_MS = 3000

// Unambiguous chars — no 0/O, 1/I/L
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCourtCode(courtIndex) {
  const letter = String.fromCharCode(65 + (courtIndex % 26))  // A, B, C…
  const digit = String((courtIndex + 1) % 10)                 // 1, 2, 3…
  const r1 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  const r2 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return `${letter}${digit}${r1}${r2}`
}

function mapPlayer(p) {
  return { id: p.id, name: p.name, skill: p.skill }
}

function mapCourtFull(court, players, games, scoreConfig) {
  const teamA = players.filter(p => p.team === 'teamA').map(mapPlayer)
  const teamB = players.filter(p => p.team === 'teamB').map(mapPlayer)
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
      : null
  const currentGame = activeGame?.gameNumber ?? lastGame?.gameNumber ?? 1
  const matchWinner = court.status === 'finished' ? court.winner : null

  return {
    id: court.id,
    code: court.courtCode,
    courtNumber: court.courtNumber,
    courtName: String(court.courtNumber),
    teamA, teamB,
    scoreConfig,
    currentScore,
    currentGame,
    gamesWon,
    completedGames,
    matchWinner,
    matchStatus: matchWinner ? 'finished' : 'playing',
  }
}

export async function fetchCourtFull(court, scoreConfig) {
  const [players, games] = await Promise.all([
    api.get(`/api/players/court/${court.id}`),
    api.get(`/api/games/court/${court.id}`),
  ])
  return mapCourtFull(court, players, games, scoreConfig)
}

export function useCompetition() {
  const { user } = useAuth()
  const [config, setConfig] = useState(DEFAULT_SCORE_CONFIG)
  const [activeSessionId, setActiveSessionId] = useState(
    () => localStorage.getItem('activeCompetitionSession')
  )
  const [activeCourts, setActiveCourts] = useState([])
  const [starting, setStarting] = useState(false)
  const sessionConfigRef = useRef(DEFAULT_SCORE_CONFIG)

  const refreshCourts = useCallback(async () => {
    if (!activeSessionId) return
    try {
      const session = await api.get(`/api/competition-sessions/${activeSessionId}`)
      sessionConfigRef.current = {
        pointsToWin: session.pointsToWin,
        numberOfGames: session.numberOfGames,
        deuceRule: session.deuceRule,
        maxPoints: session.maxPoints,
      }
      const courts = await api.get(`/api/competition-courts/session/${activeSessionId}`)
      const sorted = [...courts].sort((a, b) => a.courtNumber - b.courtNumber)
      const full = await Promise.all(sorted.map(c => fetchCourtFull(c, sessionConfigRef.current)))
      setActiveCourts(full)
    } catch (err) {
      console.error('Competition refresh error:', err)
    }
  }, [activeSessionId])

  useEffect(() => {
    if (!activeSessionId) return
    refreshCourts()
    const id = setInterval(refreshCourts, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [activeSessionId, refreshCourts])

  const updateConfig = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }, [])

  const startCompetition = async (courts) => {
    if (!user || courts.length === 0) return { success: false }
    setStarting(true)
    try {
      const session = await api.post('/api/competition-sessions', {
        organizerId: user.uid,
        name: `Session ${new Date().toLocaleString()}`,
        status: 'active',
        pointsToWin: config.pointsToWin,
        numberOfGames: config.numberOfGames,
        deuceRule: config.deuceRule,
        maxPoints: config.maxPoints,
        courtCount: courts.length,
      })

      for (let i = 0; i < courts.length; i++) {
        const court = courts[i]
        const createdCourt = await api.post('/api/competition-courts', {
          sessionId: session.id,
          courtNumber: i + 1,
          courtCode: generateCourtCode(i),
          status: 'waiting',
        })
        for (const p of court.teamA) {
          await api.post('/api/players', { courtId: createdCourt.id, name: p.name, team: 'teamA', skill: p.skill })
        }
        for (const p of court.teamB) {
          await api.post('/api/players', { courtId: createdCourt.id, name: p.name, team: 'teamB', skill: p.skill })
        }
      }

      localStorage.setItem('activeCompetitionSession', session.id)
      setActiveSessionId(session.id)
      return { success: true, sessionId: session.id }
    } finally {
      setStarting(false)
    }
  }

  const syncCourts = async (sessionCourts) => {
    if (!user || !activeSessionId || sessionCourts.length === 0) return

    for (let i = 0; i < sessionCourts.length; i++) {
      const sessionCourt = sessionCourts[i]
      const courtNumber = i + 1
      const existing = activeCourts.find(c => c.courtNumber === courtNumber)

      if (existing) {
        // Same court slot — wipe games, replace roster, reset to waiting
        const [oldPlayers, oldGames] = await Promise.all([
          api.get(`/api/players/court/${existing.id}`),
          api.get(`/api/games/court/${existing.id}`),
        ])
        await Promise.all([
          ...oldPlayers.map(p => api.delete(`/api/players/${p.id}`)),
          ...oldGames.map(g => api.delete(`/api/games/${g.id}`)),
        ])
        await api.put(`/api/competition-courts/${existing.id}`, {
          sessionId: activeSessionId,
          courtNumber,
          courtCode: existing.code,
          status: 'waiting',
          winner: null,
        })
        for (const p of sessionCourt.teamA) {
          await api.post('/api/players', { courtId: existing.id, name: p.name, team: 'teamA', skill: p.skill })
        }
        for (const p of sessionCourt.teamB) {
          await api.post('/api/players', { courtId: existing.id, name: p.name, team: 'teamB', skill: p.skill })
        }
      } else {
        const createdCourt = await api.post('/api/competition-courts', {
          sessionId: activeSessionId,
          courtNumber,
          courtCode: generateCourtCode(courtNumber - 1),
          status: 'waiting',
        })
        for (const p of sessionCourt.teamA) {
          await api.post('/api/players', { courtId: createdCourt.id, name: p.name, team: 'teamA', skill: p.skill })
        }
        for (const p of sessionCourt.teamB) {
          await api.post('/api/players', { courtId: createdCourt.id, name: p.name, team: 'teamB', skill: p.skill })
        }
      }
    }

    await refreshCourts()
  }

  const endCompetition = async () => {
    if (activeSessionId) {
      await api.patch(`/api/competition-sessions/${activeSessionId}/finish`)
    }
    localStorage.removeItem('activeCompetitionSession')
    setActiveSessionId(null)
    setActiveCourts([])
  }

  return { config, updateConfig, activeSessionId, activeCourts, starting, startCompetition, syncCourts, endCompetition }
}

import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/apiClient.js'
import { computeConfig, DEFAULT_CONFIG, STATUS } from '../models/index.js'

function mapPlayer(dto) {
  return {
    id: dto.id,
    name: dto.name,
    skill: dto.skill,
    status: dto.status,
    roundsPlayed: dto.roundsPlayed,
  }
}

function mapCourt(dto) {
  return {
    id: dto.id,
    name: dto.name,
    teamA: dto.teamA.map(mapPlayer),
    teamB: dto.teamB.map(mapPlayer),
  }
}

function mapHistoryEntry(dto) {
  return {
    matchNo: dto.roundNumber,
    court: {
      id: dto.courtNumber,
      name: dto.courtName,
      teamA: dto.teamA,
      teamB: dto.teamB,
    },
  }
}

function mapState(stateDto) {
  const s = stateDto.session
  const courts = stateDto.courts.map(mapCourt)
  return {
    players: stateDto.players.map(mapPlayer),
    session: {
      id: s.id,
      screen: s.screen,
      config: computeConfig(s.courts, s.maxRoundsPerPlayer, s.maxPlayers, s.fullRoundPrice, s.courtNames),
      history: stateDto.history.map(mapHistoryEntry),
      courts,
    },
    courts,
  }
}

export function useAppState(uid) {
  const [players, setPlayers] = useState([])
  const [session, setSession] = useState(null)
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)

  const applyState = useCallback((stateDto) => {
    const mapped = mapState(stateDto)
    setPlayers(mapped.players)
    setSession(mapped.session)
    setCourts(mapped.courts)
  }, [])

  const refresh = useCallback(async () => {
    const stateDto = await api.get(`/api/rotation-sessions/organizer/${uid}`)
    applyState(stateDto)
  }, [uid, applyState])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get(`/api/rotation-sessions/organizer/${uid}`)
      .then(stateDto => {
        if (!cancelled) { applyState(stateDto); setLoading(false) }
      })
      .catch(err => {
        console.error('Rotation state error:', err)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [uid, applyState])

  const updateConfig = async (courtsCount, maxRoundsPerPlayer, maxPlayers, fullRoundPrice, courtNames = null) => {
    const computed = computeConfig(courtsCount, maxRoundsPerPlayer, maxPlayers, fullRoundPrice, courtNames)
    const stateDto = await api.put(`/api/rotation-sessions/${session.id}`, {
      courts: computed.courts,
      maxRoundsPerPlayer: computed.maxRoundsPerPlayer,
      maxPlayers: computed.maxPlayers,
      fullRoundPrice: computed.fullRoundPrice,
      courtNames: computed.courtNames,
    })
    applyState(stateDto)
  }

  const addPlayer = async (name, skill) => {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return { error: 'duplicate' }
    const maxPlayers = session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers
    if (players.length >= maxPlayers) return { error: 'max' }
    const stateDto = await api.post('/api/rotation-players', { rotationSessionId: session.id, name, skill })
    applyState(stateDto)
    return { success: true }
  }

  const addPlayers = async (names, skill) => {
    const existing = new Set(players.map(p => p.name.toLowerCase()))
    const toAdd = names
      .filter(n => !existing.has(n.toLowerCase()))
      .slice(0, (session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers) - players.length)
    if (toAdd.length === 0) return 0
    for (const name of toAdd) {
      await api.post('/api/rotation-players', { rotationSessionId: session.id, name, skill })
    }
    await refresh()
    return toAdd.length
  }

  const removePlayer = async (id) => {
    await api.delete(`/api/rotation-players/${id}`)
    await refresh()
  }

  const updatePlayerSkill = async (id, skill) => {
    const stateDto = await api.patch(`/api/rotation-players/${id}`, { skill })
    applyState(stateDto)
  }

  const togglePlayerStatus = async (id) => {
    const player = players.find(p => p.id === id)
    if (!player) return
    const status = player.status === STATUS.WAITING ? STATUS.BENCH : STATUS.WAITING
    const stateDto = await api.patch(`/api/rotation-players/${id}/status`, { status })
    applyState(stateDto)
  }

  const markAllBench = async () => {
    const waiting = players.filter(p => p.status === STATUS.WAITING)
    if (waiting.length === 0) return
    const stateDto = await api.post(`/api/rotation-sessions/${session.id}/mark-all-bench`)
    applyState(stateDto)
  }

  const startSession = async () => {
    if (!session) return
    const bench = players.filter(p => p.status === STATUS.BENCH)
    if (bench.length < 4) return
    const stateDto = await api.post(`/api/rotation-sessions/${session.id}/start`)
    applyState(stateDto)
  }

  const completeCourt = async (courtId) => {
    if (!session) return
    const stateDto = await api.post(`/api/rotation-courts/${courtId}/complete`)
    applyState(stateDto)
  }

  const refillCourt = async (courtId) => {
    const bench = players.filter(p => p.status === STATUS.BENCH)
    if (bench.length < 4) return
    const stateDto = await api.post(`/api/rotation-courts/${courtId}/refill`)
    applyState(stateDto)
  }

  const fillEmptyCourts = async () => {
    if (!session) return
    const activeCourts = session.courts.length
    const emptyCourts = session.config.courts - activeCourts
    if (emptyCourts <= 0) return

    const bench = players.filter(p => p.status === STATUS.BENCH)
    if (bench.length < 4) return

    const stateDto = await api.post(`/api/rotation-sessions/${session.id}/fill-empty-courts`)
    applyState(stateDto)
  }

  const markLeave = async (id) => {
    const player = players.find(p => p.id === id)
    if (!player) return
    const stateDto = await api.post(`/api/rotation-players/${id}/leave`)
    applyState(stateDto)
  }

  const addWalkIn = async (name, skill) => {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return { error: 'duplicate' }
    const maxPlayers = session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers
    if (players.length >= maxPlayers) return { error: 'max' }
    const stateDto = await api.post('/api/rotation-players', {
      rotationSessionId: session.id, name, skill, status: STATUS.BENCH,
    })
    applyState(stateDto)
    return { success: true }
  }

  const swapPlayers = async (courtPlayerId, benchPlayerId, courtId) => {
    const benchPlayer = players.find(p => p.id === benchPlayerId)
    if (!benchPlayer || !session) return
    const stateDto = await api.post(`/api/rotation-courts/${courtId}/swap`, { courtPlayerId, benchPlayerId })
    applyState(stateDto)
  }

  const activatePlayer = async (id) => {
    const stateDto = await api.patch(`/api/rotation-players/${id}/status`, { status: STATUS.BENCH })
    applyState(stateDto)
  }

  const volunteerMore = async (id) => {
    const stateDto = await api.patch(`/api/rotation-players/${id}/status`, { status: STATUS.BENCH })
    applyState(stateDto)
  }

  const endSession = async () => {
    const stateDto = await api.patch(`/api/rotation-sessions/${session.id}/screen`, { screen: 'summary' })
    applyState(stateDto)
  }

  const resetSession = async () => {
    const stateDto = await api.post(`/api/rotation-sessions/${session.id}/reset`)
    applyState(stateDto)
  }

  return {
    players, session, courts, loading,
    updateConfig, addPlayer, addPlayers, removePlayer,
    updatePlayerSkill, togglePlayerStatus, markAllBench,
    startSession, fillEmptyCourts, markLeave, swapPlayers,
    completeCourt, refillCourt,
    activatePlayer, volunteerMore, addWalkIn,
    endSession, resetSession,
  }
}

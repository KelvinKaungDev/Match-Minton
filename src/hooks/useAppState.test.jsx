import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { api } from '../services/apiClient.js'
import { STATUS } from '../models/index.js'
import { useAppState } from './useAppState.js'

// ─── apiClient mock ───────────────────────────────────────────────────────────

vi.mock('../services/apiClient.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const UID = 'organizer-1'
const SESSION_ID = 'session-1'

function mkSessionDto(overrides = {}) {
  return {
    id: SESSION_ID,
    organizerId: UID,
    organizerName: 'Organizer',
    courts: 3,
    maxRoundsPerPlayer: 4,
    maxPlayers: 36,
    fullRoundPrice: 0,
    courtNames: [],
    screen: 'session',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function mkPlayerDto(id, overrides = {}) {
  return {
    id,
    rotationSessionId: SESSION_ID,
    name: `Player_${id}`,
    skill: 'B',
    status: STATUS.BENCH,
    roundsPlayed: 0,
    courtId: null,
    team: null,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function mkStateDto({ players = [], courts = [], history = [], session = {} } = {}) {
  return {
    session: mkSessionDto(session),
    players,
    courts,
    history,
  }
}

async function setup({ players = [], courts = [], history = [], session = {} } = {}) {
  const initial = mkStateDto({ players, courts, history, session })
  api.get.mockResolvedValue(initial)

  const { result } = renderHook(() => useAppState(UID))
  await act(async () => {})
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── addPlayer ────────────────────────────────────────────────────────────────

describe('addPlayer', () => {
  it('returns { error: "duplicate" } when name already exists (case-insensitive)', async () => {
    const result = await setup({ players: [mkPlayerDto('1', { name: 'Alice' })] })
    const res = await result.current.addPlayer('alice', 'B')
    expect(res).toEqual({ error: 'duplicate' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('returns { error: "max" } when player count reaches maxPlayers', async () => {
    const full = Array.from({ length: 36 }, (_, i) => mkPlayerDto(`p${i}`))
    const result = await setup({ players: full })
    const res = await result.current.addPlayer('NewPlayer', 'B')
    expect(res).toEqual({ error: 'max' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('posts the new player and returns { success: true }', async () => {
    const result = await setup()
    api.post.mockResolvedValue(mkStateDto({ players: [mkPlayerDto('new', { name: 'Alice', skill: 'S' })] }))

    const res = await result.current.addPlayer('Alice', 'S')

    expect(res).toEqual({ success: true })
    expect(api.post).toHaveBeenCalledWith('/api/rotation-players', {
      rotationSessionId: SESSION_ID, name: 'Alice', skill: 'S',
    })
  })

  it('respects a custom maxPlayers from session config', async () => {
    const full = [mkPlayerDto('a'), mkPlayerDto('b')]
    const result = await setup({ players: full, session: { maxPlayers: 2 } })
    const res = await result.current.addPlayer('Third', 'B')
    expect(res).toEqual({ error: 'max' })
  })
})

// ── addPlayers ───────────────────────────────────────────────────────────────

describe('addPlayers', () => {
  it('posts every new name and returns the count', async () => {
    const result = await setup()
    api.post.mockResolvedValue(mkStateDto())
    api.get.mockResolvedValue(mkStateDto())

    const count = await result.current.addPlayers(['Alice', 'Bob', 'Carol'], 'B')

    expect(count).toBe(3)
    expect(api.post).toHaveBeenCalledTimes(3)
  })

  it('filters out names that already exist (case-insensitive)', async () => {
    const result = await setup({ players: [mkPlayerDto('x', { name: 'Alice' })] })
    api.post.mockResolvedValue(mkStateDto())
    api.get.mockResolvedValue(mkStateDto())

    const count = await result.current.addPlayers(['alice', 'Bob'], 'A')

    expect(count).toBe(1)
    expect(api.post).toHaveBeenCalledTimes(1)
  })

  it('slices the list to the remaining capacity', async () => {
    const existing = Array.from({ length: 34 }, (_, i) => mkPlayerDto(`p${i}`))
    const result = await setup({ players: existing })
    api.post.mockResolvedValue(mkStateDto())
    api.get.mockResolvedValue(mkStateDto())

    const count = await result.current.addPlayers(['New1', 'New2', 'New3'], 'C')

    expect(count).toBe(2)
    expect(api.post).toHaveBeenCalledTimes(2)
  })

  it('returns 0 and skips network calls when every name is a duplicate', async () => {
    const result = await setup({ players: [mkPlayerDto('a', { name: 'Alice' })] })
    const count = await result.current.addPlayers(['Alice', 'ALICE'], 'B')
    expect(count).toBe(0)
    expect(api.post).not.toHaveBeenCalled()
  })
})

// ── removePlayer ─────────────────────────────────────────────────────────────

describe('removePlayer', () => {
  it('calls DELETE on the player and refetches state', async () => {
    const result = await setup({ players: [mkPlayerDto('abc')] })
    api.delete.mockResolvedValue(null)
    api.get.mockResolvedValue(mkStateDto())

    await result.current.removePlayer('abc')

    expect(api.delete).toHaveBeenCalledWith('/api/rotation-players/abc')
    expect(api.get).toHaveBeenCalledWith(`/api/rotation-sessions/organizer/${UID}`)
  })
})

// ── updatePlayerSkill ─────────────────────────────────────────────────────────

describe('updatePlayerSkill', () => {
  it('PATCHes the new skill', async () => {
    const result = await setup({ players: [mkPlayerDto('abc')] })
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.updatePlayerSkill('abc', 'S')

    expect(api.patch).toHaveBeenCalledWith('/api/rotation-players/abc', { skill: 'S' })
  })
})

// ── togglePlayerStatus ────────────────────────────────────────────────────────

describe('togglePlayerStatus', () => {
  it('switches a WAITING player to BENCH', async () => {
    const result = await setup({ players: [mkPlayerDto('w1', { status: STATUS.WAITING })] })
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.togglePlayerStatus('w1')

    expect(api.patch).toHaveBeenCalledWith('/api/rotation-players/w1/status', { status: STATUS.BENCH })
  })

  it('switches a BENCH player to WAITING', async () => {
    const result = await setup({ players: [mkPlayerDto('b1', { status: STATUS.BENCH })] })
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.togglePlayerStatus('b1')

    expect(api.patch).toHaveBeenCalledWith('/api/rotation-players/b1/status', { status: STATUS.WAITING })
  })

  it('does nothing when the player id is not found', async () => {
    const result = await setup()
    await result.current.togglePlayerStatus('ghost')
    expect(api.patch).not.toHaveBeenCalled()
  })
})

// ── markAllBench ──────────────────────────────────────────────────────────────

describe('markAllBench', () => {
  it('calls the bulk endpoint when WAITING players exist', async () => {
    const players = [
      mkPlayerDto('w1', { status: STATUS.WAITING }),
      mkPlayerDto('w2', { status: STATUS.WAITING }),
      mkPlayerDto('b1', { status: STATUS.BENCH }),
    ]
    const result = await setup({ players })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.markAllBench()

    expect(api.post).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}/mark-all-bench`)
  })

  it('skips the call entirely when no WAITING players exist', async () => {
    const result = await setup({ players: [mkPlayerDto('b1', { status: STATUS.BENCH })] })
    await result.current.markAllBench()
    expect(api.post).not.toHaveBeenCalled()
  })
})

// ── markLeave ─────────────────────────────────────────────────────────────────

describe('markLeave', () => {
  it('calls the leave endpoint for the player', async () => {
    const result = await setup({ players: [mkPlayerDto('p1', { status: STATUS.BENCH })] })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.markLeave('p1')

    expect(api.post).toHaveBeenCalledWith('/api/rotation-players/p1/leave')
  })

  it('does nothing when the player id is not found', async () => {
    const result = await setup()
    await result.current.markLeave('ghost')
    expect(api.post).not.toHaveBeenCalled()
  })
})

// ── activatePlayer / volunteerMore ────────────────────────────────────────────

describe('activatePlayer', () => {
  it('PATCHes status to BENCH', async () => {
    const result = await setup({ players: [mkPlayerDto('p1', { status: STATUS.DONE })] })
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.activatePlayer('p1')

    expect(api.patch).toHaveBeenCalledWith('/api/rotation-players/p1/status', { status: STATUS.BENCH })
  })
})

describe('volunteerMore', () => {
  it('PATCHes status to BENCH', async () => {
    const result = await setup({ players: [mkPlayerDto('p1', { status: STATUS.DONE })] })
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.volunteerMore('p1')

    expect(api.patch).toHaveBeenCalledWith('/api/rotation-players/p1/status', { status: STATUS.BENCH })
  })
})

// ── startSession / fillEmptyCourts / refillCourt ──────────────────────────────

describe('startSession', () => {
  it('starts when at least 4 players are on the bench', async () => {
    const players = Array.from({ length: 4 }, (_, i) => mkPlayerDto(`b${i}`, { status: STATUS.BENCH }))
    const result = await setup({ players })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.startSession()

    expect(api.post).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}/start`)
  })

  it('does nothing with fewer than 4 bench players', async () => {
    const result = await setup({ players: [mkPlayerDto('b1', { status: STATUS.BENCH })] })
    await result.current.startSession()
    expect(api.post).not.toHaveBeenCalled()
  })
})

describe('refillCourt', () => {
  it('does nothing with fewer than 4 bench players', async () => {
    const result = await setup({ players: [mkPlayerDto('b1', { status: STATUS.BENCH })] })
    await result.current.refillCourt('court-1')
    expect(api.post).not.toHaveBeenCalled()
  })

  it('calls the refill endpoint with at least 4 bench players', async () => {
    const players = Array.from({ length: 4 }, (_, i) => mkPlayerDto(`b${i}`, { status: STATUS.BENCH }))
    const result = await setup({ players })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.refillCourt('court-1')

    expect(api.post).toHaveBeenCalledWith('/api/rotation-courts/court-1/refill')
  })
})

describe('completeCourt', () => {
  it('calls the complete endpoint', async () => {
    const result = await setup()
    api.post.mockResolvedValue(mkStateDto())

    await result.current.completeCourt('court-1')

    expect(api.post).toHaveBeenCalledWith('/api/rotation-courts/court-1/complete')
  })
})

describe('swapPlayers', () => {
  it('calls the swap endpoint with both player ids', async () => {
    const result = await setup({ players: [mkPlayerDto('bench-1', { status: STATUS.BENCH })] })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.swapPlayers('court-player-1', 'bench-1', 'court-1')

    expect(api.post).toHaveBeenCalledWith('/api/rotation-courts/court-1/swap', {
      courtPlayerId: 'court-player-1', benchPlayerId: 'bench-1',
    })
  })
})

// ── addWalkIn ─────────────────────────────────────────────────────────────────

describe('addWalkIn', () => {
  it('returns { error: "duplicate" } when name already exists', async () => {
    const result = await setup({ players: [mkPlayerDto('1', { name: 'Alice' })] })
    const res = await result.current.addWalkIn('alice', 'B')
    expect(res).toEqual({ error: 'duplicate' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('posts the player with status bench', async () => {
    const result = await setup()
    api.post.mockResolvedValue(mkStateDto())

    const res = await result.current.addWalkIn('Alice', 'B')

    expect(res).toEqual({ success: true })
    expect(api.post).toHaveBeenCalledWith('/api/rotation-players', {
      rotationSessionId: SESSION_ID, name: 'Alice', skill: 'B', status: STATUS.BENCH,
    })
  })
})

// ── endSession ────────────────────────────────────────────────────────────────

describe('endSession', () => {
  it('PATCHes the session screen to "summary"', async () => {
    const result = await setup()
    api.patch.mockResolvedValue(mkStateDto())

    await result.current.endSession()

    expect(api.patch).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}/screen`, { screen: 'summary' })
  })
})

// ── resetSession ──────────────────────────────────────────────────────────────

describe('resetSession', () => {
  it('calls the reset endpoint', async () => {
    const result = await setup({ players: [mkPlayerDto('a'), mkPlayerDto('b')] })
    api.post.mockResolvedValue(mkStateDto())

    await result.current.resetSession()

    expect(api.post).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}/reset`)
  })
})

// ── updateConfig ──────────────────────────────────────────────────────────────

describe('updateConfig', () => {
  it('PUTs a recomputed config with default court names', async () => {
    const result = await setup()
    api.put.mockResolvedValue(mkStateDto())

    await result.current.updateConfig(4, 6, 40, 0)

    expect(api.put).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}`, {
      courts: 4,
      maxRoundsPerPlayer: 6,
      maxPlayers: 40,
      fullRoundPrice: 0,
      courtNames: ['1', '2', '3', '4'],
    })
  })

  it('preserves custom court names when provided', async () => {
    const result = await setup()
    api.put.mockResolvedValue(mkStateDto())

    await result.current.updateConfig(2, 6, 40, 0, ['North', 'South'])

    expect(api.put).toHaveBeenCalledWith(`/api/rotation-sessions/${SESSION_ID}`, {
      courts: 2,
      maxRoundsPerPlayer: 6,
      maxPlayers: 40,
      fullRoundPrice: 0,
      courtNames: ['North', 'South'],
    })
  })
})

// ── initial load ──────────────────────────────────────────────────────────────

describe('initial load', () => {
  it('fetches state for the given organizer and maps it', async () => {
    const result = await setup({
      players: [mkPlayerDto('p1', { name: 'Alice', status: STATUS.BENCH })],
      courts: [{ id: 'c1', courtNumber: 1, name: '1', teamA: [], teamB: [] }],
    })

    expect(api.get).toHaveBeenCalledWith(`/api/rotation-sessions/organizer/${UID}`)
    expect(result.current.loading).toBe(false)
    expect(result.current.players).toHaveLength(1)
    expect(result.current.players[0]).toMatchObject({ id: 'p1', name: 'Alice', status: STATUS.BENCH })
    expect(result.current.session.screen).toBe('session')
    expect(result.current.courts).toHaveLength(1)
  })
})

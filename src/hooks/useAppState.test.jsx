import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { STATUS } from '../models/index.js'
import { useAppState } from './useAppState.js'

// ─── shared mock state (hoisted so vi.mock factory can reference it) ─────────

const shared = vi.hoisted(() => {
  const batch = {
    set:    vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  }
  return {
    batch,
    callbacks: { session: null, players: null },
  }
})

// ─── Firebase mocks ───────────────────────────────────────────────────────────

vi.mock('../services/firebase.js', () => ({ db: {} }))

vi.mock('firebase/firestore', () => {
  const SESSION = Symbol('session-ref')
  const PLAYERS = Symbol('players-ref')
  return {
    doc:        vi.fn((_, col) => col === 'session' ? SESSION : { _col: col }),
    collection: vi.fn(() => PLAYERS),
    onSnapshot: vi.fn((ref, cb) => {
      if (ref === PLAYERS) shared.callbacks.players = cb
      else                 shared.callbacks.session = cb
      return vi.fn()
    }),
    setDoc:     vi.fn().mockResolvedValue(undefined),
    updateDoc:  vi.fn().mockResolvedValue(undefined),
    deleteDoc:  vi.fn().mockResolvedValue(undefined),
    writeBatch: vi.fn().mockReturnValue(shared.batch),
    getDoc:     vi.fn().mockResolvedValue({ exists: () => true }),
    arrayUnion: vi.fn(v => v),
  }
})

// ─── helpers ──────────────────────────────────────────────────────────────────

const CONFIG = {
  courts: 3, sessionHours: 2, roundMinutes: 15,
  totalRounds: 8, playersPerRound: 12, maxRoundsPerPlayer: 4, maxPlayers: 36,
}
const BASE_SESSION = { config: CONFIG, currentRound: 1, screen: 'session', courts: [], history: [] }

function mkPlayer(id, overrides = {}) {
  return { id, name: `Player_${id}`, skill: 'B', status: STATUS.BENCH, roundsPlayed: 0, ...overrides }
}

function toFirestoreDocs(players) {
  return {
    docs: players.map(p => ({
      id: p.id,
      data: () => ({ name: p.name, skill: p.skill, status: p.status, roundsPlayed: p.roundsPlayed }),
    })),
  }
}

async function setup(players = [], session = BASE_SESSION) {
  const { result } = renderHook(() => useAppState())
  await act(async () => {
    shared.callbacks.session({ exists: () => true, data: () => session })
    shared.callbacks.players(toFirestoreDocs(players))
  })
  return result
}

// ─── tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // clearAllMocks only clears call history; restore resolved values for batch.commit
  shared.batch.commit.mockResolvedValue(undefined)
})

// ── addPlayer ────────────────────────────────────────────────────────────────

describe('addPlayer', () => {
  it('returns { error: "duplicate" } when name already exists (case-insensitive)', async () => {
    const result = await setup([mkPlayer('1', { name: 'Alice' })])
    const res = await result.current.addPlayer('alice', 'B')
    expect(res).toEqual({ error: 'duplicate' })
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('returns { error: "max" } when player count reaches maxPlayers', async () => {
    const full = Array.from({ length: 36 }, (_, i) => mkPlayer(`p${i}`))
    const result = await setup(full)
    const res = await result.current.addPlayer('NewPlayer', 'B')
    expect(res).toEqual({ error: 'max' })
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('writes the new player to Firestore and returns { success: true }', async () => {
    const result = await setup()
    const res = await result.current.addPlayer('Alice', 'S')
    expect(res).toEqual({ success: true })
    expect(setDoc).toHaveBeenCalledOnce()
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'Alice', skill: 'S', status: STATUS.WAITING, roundsPlayed: 0 }),
    )
  })

  it('respects a custom maxPlayers from session config', async () => {
    const customSession = { ...BASE_SESSION, config: { ...CONFIG, maxPlayers: 2 } }
    const full = [mkPlayer('a'), mkPlayer('b')]
    const result = await setup(full, customSession)
    const res = await result.current.addPlayer('Third', 'B')
    expect(res).toEqual({ error: 'max' })
  })
})

// ── addPlayers ───────────────────────────────────────────────────────────────

describe('addPlayers', () => {
  it('writes all new names and returns the count', async () => {
    const result = await setup()
    const count = await result.current.addPlayers(['Alice', 'Bob', 'Carol'], 'B')
    expect(count).toBe(3)
    expect(shared.batch.set).toHaveBeenCalledTimes(3)
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })

  it('filters out names that already exist (case-insensitive)', async () => {
    const result = await setup([mkPlayer('x', { name: 'Alice' })])
    const count = await result.current.addPlayers(['alice', 'Bob'], 'A')
    expect(count).toBe(1)
    expect(shared.batch.set).toHaveBeenCalledTimes(1)
  })

  it('slices the list to the remaining capacity', async () => {
    const existing = Array.from({ length: 34 }, (_, i) => mkPlayer(`p${i}`))
    const result = await setup(existing)
    const count = await result.current.addPlayers(['New1', 'New2', 'New3'], 'C')
    expect(count).toBe(2)
    expect(shared.batch.set).toHaveBeenCalledTimes(2)
  })

  it('returns 0 and skips the batch when every name is a duplicate', async () => {
    const result = await setup([mkPlayer('a', { name: 'Alice' })])
    const count = await result.current.addPlayers(['Alice', 'ALICE'], 'B')
    expect(count).toBe(0)
    expect(shared.batch.commit).not.toHaveBeenCalled()
  })
})

// ── removePlayer ─────────────────────────────────────────────────────────────

describe('removePlayer', () => {
  it('calls deleteDoc with the correct player ref', async () => {
    const result = await setup([mkPlayer('abc')])
    await result.current.removePlayer('abc')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})

// ── updatePlayerSkill ─────────────────────────────────────────────────────────

describe('updatePlayerSkill', () => {
  it('calls updateDoc with the new skill', async () => {
    const result = await setup([mkPlayer('abc')])
    await result.current.updatePlayerSkill('abc', 'S')
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { skill: 'S' })
  })
})

// ── togglePlayerStatus ────────────────────────────────────────────────────────

describe('togglePlayerStatus', () => {
  it('switches a WAITING player to BENCH', async () => {
    const result = await setup([mkPlayer('w1', { status: STATUS.WAITING })])
    await result.current.togglePlayerStatus('w1')
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: STATUS.BENCH })
  })

  it('switches a BENCH player to WAITING', async () => {
    const result = await setup([mkPlayer('b1', { status: STATUS.BENCH })])
    await result.current.togglePlayerStatus('b1')
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: STATUS.WAITING })
  })

  it('does nothing when the player id is not found', async () => {
    const result = await setup()
    await result.current.togglePlayerStatus('ghost')
    expect(updateDoc).not.toHaveBeenCalled()
  })
})

// ── markAllBench ──────────────────────────────────────────────────────────────

describe('markAllBench', () => {
  it('batch-updates every WAITING player to BENCH', async () => {
    const players = [
      mkPlayer('w1', { status: STATUS.WAITING }),
      mkPlayer('w2', { status: STATUS.WAITING }),
      mkPlayer('b1', { status: STATUS.BENCH   }),
    ]
    const result = await setup(players)
    await result.current.markAllBench()
    expect(shared.batch.update).toHaveBeenCalledTimes(2)
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })

  it('skips the batch entirely when no WAITING players exist', async () => {
    const result = await setup([mkPlayer('b1', { status: STATUS.BENCH })])
    await result.current.markAllBench()
    expect(shared.batch.commit).not.toHaveBeenCalled()
  })
})

// ── markLeave ─────────────────────────────────────────────────────────────────

describe('markLeave', () => {
  it('sets the player status to LEAVE', async () => {
    const result = await setup([mkPlayer('p1', { status: STATUS.BENCH })])
    await result.current.markLeave('p1')
    expect(shared.batch.update).toHaveBeenCalledWith(
      expect.anything(),
      { status: STATUS.LEAVE },
    )
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })

  it('substitutes the bench player with fewest rounds when the leaver was PLAYING', async () => {
    const session = {
      ...BASE_SESSION,
      courts: [{ id: 1, teamA: ['pl1', 'pl2'], teamB: ['pl3', 'pl4'] }],
    }
    const players = [
      mkPlayer('pl1', { status: STATUS.PLAYING, roundsPlayed: 2 }),
      mkPlayer('pl2', { status: STATUS.PLAYING, roundsPlayed: 2 }),
      mkPlayer('pl3', { status: STATUS.PLAYING, roundsPlayed: 2 }),
      mkPlayer('pl4', { status: STATUS.PLAYING, roundsPlayed: 2 }),
      mkPlayer('sub', { status: STATUS.BENCH,   roundsPlayed: 0 }),
    ]
    const result = await setup(players, session)
    await result.current.markLeave('pl1')

    // sub should be promoted to PLAYING
    const subCall = shared.batch.update.mock.calls.find(
      ([, data]) => data.status === STATUS.PLAYING,
    )
    expect(subCall).toBeDefined()
    expect(subCall[1]).toMatchObject({ status: STATUS.PLAYING, roundsPlayed: 1 })
  })

  it('removes the leaver from courts without a sub when no bench player exists', async () => {
    const session = {
      ...BASE_SESSION,
      courts: [{ id: 1, teamA: ['pl1', 'pl2'], teamB: ['pl3', 'pl4'] }],
    }
    const players = [
      mkPlayer('pl1', { status: STATUS.PLAYING }),
      mkPlayer('pl2', { status: STATUS.PLAYING }),
      mkPlayer('pl3', { status: STATUS.PLAYING }),
      mkPlayer('pl4', { status: STATUS.PLAYING }),
    ]
    const result = await setup(players, session)
    await result.current.markLeave('pl1')

    // Courts should be updated (leaver removed), but no player promoted
    const promotedCall = shared.batch.update.mock.calls.find(
      ([, data]) => data.status === STATUS.PLAYING,
    )
    expect(promotedCall).toBeUndefined()
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })
})

// ── activatePlayer ────────────────────────────────────────────────────────────

describe('activatePlayer', () => {
  it('sets player status to BENCH', async () => {
    const result = await setup([mkPlayer('p1', { status: STATUS.DONE })])
    await result.current.activatePlayer('p1')
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: STATUS.BENCH })
  })
})

// ── volunteerMore ─────────────────────────────────────────────────────────────

describe('volunteerMore', () => {
  it('sets player status to BENCH', async () => {
    const result = await setup([mkPlayer('p1', { status: STATUS.DONE })])
    await result.current.volunteerMore('p1')
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: STATUS.BENCH })
  })
})

// ── endSession ────────────────────────────────────────────────────────────────

describe('endSession', () => {
  it('updates the session screen to "summary"', async () => {
    const result = await setup()
    await result.current.endSession()
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { screen: 'summary' })
  })
})

// ── resetSession ──────────────────────────────────────────────────────────────

describe('resetSession', () => {
  it('deletes every player and resets the session document', async () => {
    const players = [mkPlayer('a'), mkPlayer('b'), mkPlayer('c')]
    const result = await setup(players)
    await result.current.resetSession()
    expect(shared.batch.delete).toHaveBeenCalledTimes(3)
    expect(shared.batch.set).toHaveBeenCalledOnce()   // resets session doc
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })

  it('still commits the batch when there are no players', async () => {
    const result = await setup()
    await result.current.resetSession()
    expect(shared.batch.delete).not.toHaveBeenCalled()
    expect(shared.batch.set).toHaveBeenCalledOnce()
    expect(shared.batch.commit).toHaveBeenCalledOnce()
  })
})

// ── updateConfig ──────────────────────────────────────────────────────────────

describe('updateConfig', () => {
  it('calls updateDoc with a recomputed config object', async () => {
    const result = await setup()
    await result.current.updateConfig(4, 3, 40)
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ config: expect.objectContaining({ courts: 4, sessionHours: 3, maxPlayers: 40 }) }),
    )
  })

  it('falls back to current maxPlayers when none is provided', async () => {
    const result = await setup()
    await result.current.updateConfig(2, 2)
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ config: expect.objectContaining({ maxPlayers: CONFIG.maxPlayers }) }),
    )
  })
})

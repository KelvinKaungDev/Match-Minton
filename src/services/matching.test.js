import { describe, it, expect } from 'vitest'
import { generateRound, findBestSub } from './matching.js'
import { STATUS } from '../models/index.js'

function player(id, overrides = {}) {
  return { id, name: `P${id}`, skill: 'B', status: STATUS.BENCH, roundsPlayed: 0, ...overrides }
}

function bench(n, roundsPlayed = 0) {
  return Array.from({ length: n }, (_, i) => player(`b${i}`, { roundsPlayed }))
}

// ─── generateRound ──────────────────────────────────────────────────────────

describe('generateRound — court count', () => {
  it('fills as many courts as players allow (8 players → 2 courts max 3)', () => {
    const { courts } = generateRound(bench(8), 3)
    expect(courts).toHaveLength(2)
  })

  it('fills all requested courts when enough bench players exist', () => {
    const { courts } = generateRound(bench(12), 3)
    expect(courts).toHaveLength(3)
  })

  it('returns no courts when fewer than 4 bench players', () => {
    const { courts } = generateRound(bench(3), 3)
    expect(courts).toHaveLength(0)
  })

  it('returns no courts when player list is empty', () => {
    const { courts } = generateRound([], 2)
    expect(courts).toHaveLength(0)
  })

  it('caps courts at the numCourts argument even with excess players', () => {
    const { courts } = generateRound(bench(40), 3)
    expect(courts).toHaveLength(3)
  })
})

describe('generateRound — court structure', () => {
  it('each court has exactly 2 players per team', () => {
    const { courts } = generateRound(bench(8), 2)
    for (const court of courts) {
      expect(court.teamA).toHaveLength(2)
      expect(court.teamB).toHaveLength(2)
    }
  })

  it('courts are numbered starting from 1', () => {
    const { courts } = generateRound(bench(12), 3)
    expect(courts.map(c => c.id)).toEqual([1, 2, 3])
  })

  it('the playing array equals every player across all court teams', () => {
    const { courts, playing } = generateRound(bench(12), 3)
    const fromCourts = courts.flatMap(c => [...c.teamA, ...c.teamB]).map(p => p.id).sort()
    expect(playing.map(p => p.id).sort()).toEqual(fromCourts)
    expect(playing).toHaveLength(12)
  })

  it('returns an empty playing array when no courts are filled', () => {
    const { playing } = generateRound(bench(3), 3)
    expect(playing).toHaveLength(0)
  })
})

describe('generateRound — player eligibility', () => {
  it('uses only BENCH players when enough are available', () => {
    const benchPlayers = bench(8)
    const donePlayers  = Array.from({ length: 4 }, (_, i) => player(`d${i}`, { status: STATUS.DONE }))
    const { playing } = generateRound([...benchPlayers, ...donePlayers], 2)
    const ids = new Set(playing.map(p => p.id))
    for (const p of benchPlayers) expect(ids.has(p.id)).toBe(true)
    for (const p of donePlayers)  expect(ids.has(p.id)).toBe(false)
  })

  it('falls back to DONE players when BENCH count is insufficient', () => {
    const benchPlayers = bench(4)
    const donePlayers  = Array.from({ length: 4 }, (_, i) => player(`d${i}`, { status: STATUS.DONE }))
    const { courts } = generateRound([...benchPlayers, ...donePlayers], 2)
    expect(courts).toHaveLength(2)
  })

  it('ignores WAITING players', () => {
    const waitingPlayers = Array.from({ length: 8 }, (_, i) =>
      player(`w${i}`, { status: STATUS.WAITING })
    )
    const { courts } = generateRound([...bench(8), ...waitingPlayers], 2)
    const allIds = courts.flatMap(c => [...c.teamA, ...c.teamB]).map(p => p.id)
    for (const p of waitingPlayers) expect(allIds).not.toContain(p.id)
  })

  it('ignores PLAYING players', () => {
    const playingPlayers = Array.from({ length: 4 }, (_, i) =>
      player(`pl${i}`, { status: STATUS.PLAYING })
    )
    const { courts } = generateRound([...bench(8), ...playingPlayers], 2)
    const allIds = courts.flatMap(c => [...c.teamA, ...c.teamB]).map(p => p.id)
    for (const p of playingPlayers) expect(allIds).not.toContain(p.id)
  })

  it('ignores LEAVE players', () => {
    const leavePlayers = Array.from({ length: 4 }, (_, i) =>
      player(`lv${i}`, { status: STATUS.LEAVE })
    )
    const { courts } = generateRound([...bench(8), ...leavePlayers], 2)
    const allIds = courts.flatMap(c => [...c.teamA, ...c.teamB]).map(p => p.id)
    for (const p of leavePlayers) expect(allIds).not.toContain(p.id)
  })
})

describe('generateRound — round fairness', () => {
  it('places players with fewer roundsPlayed before those with more', () => {
    // 4 players with 0 rounds, 4 players with 5 rounds, 1 court
    const fresh = Array.from({ length: 4 }, (_, i) => player(`f${i}`, { roundsPlayed: 0 }))
    const tired = Array.from({ length: 4 }, (_, i) => player(`t${i}`, { roundsPlayed: 5 }))
    const { playing } = generateRound([...tired, ...fresh], 1)
    const playingIds = new Set(playing.map(p => p.id))
    for (const p of fresh)  expect(playingIds.has(p.id)).toBe(true)
    for (const p of tired)  expect(playingIds.has(p.id)).toBe(false)
  })
})

// ─── findBestSub ─────────────────────────────────────────────────────────────

describe('findBestSub', () => {
  it('returns the bench player with the fewest roundsPlayed', () => {
    const players = [
      player('a', { status: STATUS.BENCH, roundsPlayed: 3 }),
      player('b', { status: STATUS.BENCH, roundsPlayed: 1 }),
      player('c', { status: STATUS.BENCH, roundsPlayed: 2 }),
    ]
    expect(findBestSub(players)?.id).toBe('b')
  })

  it('prefers bench over done players even when done has fewer rounds', () => {
    const players = [
      player('bench', { status: STATUS.BENCH, roundsPlayed: 5 }),
      player('done',  { status: STATUS.DONE,  roundsPlayed: 0 }),
    ]
    expect(findBestSub(players)?.id).toBe('bench')
  })

  it('falls back to the done player with fewest rounds when no bench exists', () => {
    const players = [
      player('d1', { status: STATUS.DONE, roundsPlayed: 3 }),
      player('d2', { status: STATUS.DONE, roundsPlayed: 1 }),
      player('d3', { status: STATUS.DONE, roundsPlayed: 2 }),
    ]
    expect(findBestSub(players)?.id).toBe('d2')
  })

  it('returns null when no bench or done players exist', () => {
    const players = [
      player('w',  { status: STATUS.WAITING }),
      player('pl', { status: STATUS.PLAYING }),
      player('lv', { status: STATUS.LEAVE   }),
    ]
    expect(findBestSub(players)).toBeNull()
  })

  it('returns null for an empty array', () => {
    expect(findBestSub([])).toBeNull()
  })

  it('returns the only bench player when there is just one', () => {
    const p = player('solo', { status: STATUS.BENCH })
    expect(findBestSub([p])).toEqual(p)
  })

  it('ignores WAITING, PLAYING, and LEAVE players entirely', () => {
    const players = [
      player('w',    { status: STATUS.WAITING, roundsPlayed: 0 }),
      player('pl',   { status: STATUS.PLAYING, roundsPlayed: 0 }),
      player('lv',   { status: STATUS.LEAVE,   roundsPlayed: 0 }),
      player('best', { status: STATUS.BENCH,   roundsPlayed: 9 }),
    ]
    expect(findBestSub(players)?.id).toBe('best')
  })
})

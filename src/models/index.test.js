import { describe, it, expect } from 'vitest'
import { computeConfig, createPlayer, DEFAULT_CONFIG, STATUS, SKILL, SKILLS } from './index.js'

describe('DEFAULT_CONFIG', () => {
  it('has 5 courts', () => expect(DEFAULT_CONFIG.courts).toBe(5))
  it('has 6 maxRoundsPerPlayer', () => expect(DEFAULT_CONFIG.maxRoundsPerPlayer).toBe(6))
  it('has 36 max players', () => expect(DEFAULT_CONFIG.maxPlayers).toBe(36))
})

describe('STATUS', () => {
  it('defines all five statuses', () => {
    expect(STATUS.WAITING).toBe('waiting')
    expect(STATUS.BENCH).toBe('bench')
    expect(STATUS.PLAYING).toBe('playing')
    expect(STATUS.DONE).toBe('done')
    expect(STATUS.LEAVE).toBe('leave')
  })
})

describe('SKILLS / SKILL', () => {
  it('has four skill levels in order S A B C', () => {
    expect(SKILLS).toEqual(['S', 'A', 'B', 'C'])
  })

  it('SKILL constants match SKILLS array entries', () => {
    expect(SKILL.S).toBe('S')
    expect(SKILL.A).toBe('A')
    expect(SKILL.B).toBe('B')
    expect(SKILL.C).toBe('C')
  })
})

describe('computeConfig', () => {
  it('calculates playersPerRound as courts * 4', () => {
    expect(computeConfig(5, 6).playersPerRound).toBe(20)
    expect(computeConfig(1, 6).playersPerRound).toBe(4)
    expect(computeConfig(10, 6).playersPerRound).toBe(40)
  })

  it('passes through maxRoundsPerPlayer directly', () => {
    expect(computeConfig(5, 6).maxRoundsPerPlayer).toBe(6)
    expect(computeConfig(5, 3).maxRoundsPerPlayer).toBe(3)
    expect(computeConfig(5, 10).maxRoundsPerPlayer).toBe(10)
  })

  it('defaults maxPlayers to 36', () => {
    expect(computeConfig(5, 6).maxPlayers).toBe(36)
  })

  it('accepts and passes through a custom maxPlayers', () => {
    expect(computeConfig(5, 6, 50).maxPlayers).toBe(50)
    expect(computeConfig(5, 6, 100).maxPlayers).toBe(100)
  })

  it('passes through courts unchanged', () => {
    expect(computeConfig(7, 6).courts).toBe(7)
  })

  it('returns an object with all expected fields', () => {
    expect(computeConfig(3, 4, 24)).toEqual({
      courts: 3,
      maxRoundsPerPlayer: 4,
      playersPerRound: 12,
      maxPlayers: 24,
    })
  })
})

describe('createPlayer', () => {
  it('sets the provided name', () => {
    expect(createPlayer('Alice').name).toBe('Alice')
  })

  it('defaults skill to B when omitted', () => {
    expect(createPlayer('Bob').skill).toBe(SKILL.B)
  })

  it('accepts any valid skill', () => {
    expect(createPlayer('Carol', SKILL.S).skill).toBe('S')
    expect(createPlayer('Dan',   SKILL.A).skill).toBe('A')
    expect(createPlayer('Eve',   SKILL.C).skill).toBe('C')
  })

  it('initialises status as WAITING', () => {
    expect(createPlayer('Frank').status).toBe(STATUS.WAITING)
  })

  it('initialises roundsPlayed as 0', () => {
    expect(createPlayer('Grace').roundsPlayed).toBe(0)
  })

  it('generates a non-empty id', () => {
    expect(createPlayer('Hank').id).toBeTruthy()
    expect(typeof createPlayer('Hank').id).toBe('string')
  })

  it('generates a unique id for every player', () => {
    const ids = Array.from({ length: 20 }, (_, i) => createPlayer(`P${i}`).id)
    expect(new Set(ids).size).toBe(20)
  })
})

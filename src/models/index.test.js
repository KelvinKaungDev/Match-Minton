import { describe, it, expect } from 'vitest'
import { computeConfig, createPlayer, DEFAULT_CONFIG, STATUS, SKILL, SKILLS } from './index.js'

describe('DEFAULT_CONFIG', () => {
  it('has 5 courts', () => expect(DEFAULT_CONFIG.courts).toBe(5))
  it('has 3 session hours', () => expect(DEFAULT_CONFIG.sessionHours).toBe(3))
  it('has 15 round minutes', () => expect(DEFAULT_CONFIG.roundMinutes).toBe(15))
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
  it('calculates totalRounds as floor((hours * 60) / roundMinutes)', () => {
    expect(computeConfig(5, 3).totalRounds).toBe(12)   // 180 / 15
    expect(computeConfig(3, 2).totalRounds).toBe(8)    // 120 / 15
    expect(computeConfig(1, 1).totalRounds).toBe(4)    // 60  / 15
  })

  it('calculates playersPerRound as courts * 4', () => {
    expect(computeConfig(5, 3).playersPerRound).toBe(20)
    expect(computeConfig(1, 3).playersPerRound).toBe(4)
    expect(computeConfig(10, 3).playersPerRound).toBe(40)
  })

  it('calculates maxRoundsPerPlayer as floor(totalRounds / 2)', () => {
    expect(computeConfig(5, 3).maxRoundsPerPlayer).toBe(6)   // floor(12 / 2)
    expect(computeConfig(3, 2).maxRoundsPerPlayer).toBe(4)   // floor(8  / 2)
    expect(computeConfig(1, 1).maxRoundsPerPlayer).toBe(2)   // floor(4  / 2)
  })

  it('respects a custom roundMinutes value', () => {
    expect(computeConfig(5, 1, 20).totalRounds).toBe(3)   // floor(60 / 20)
    expect(computeConfig(5, 1, 10).totalRounds).toBe(6)   // floor(60 / 10)
  })

  it('defaults maxPlayers to 36', () => {
    expect(computeConfig(5, 3).maxPlayers).toBe(36)
  })

  it('accepts and passes through a custom maxPlayers', () => {
    expect(computeConfig(5, 3, 15, 50).maxPlayers).toBe(50)
    expect(computeConfig(5, 3, 15, 100).maxPlayers).toBe(100)
  })

  it('passes through courts and sessionHours unchanged', () => {
    const cfg = computeConfig(7, 4)
    expect(cfg.courts).toBe(7)
    expect(cfg.sessionHours).toBe(4)
  })

  it('returns an object with all expected fields', () => {
    expect(computeConfig(3, 2, 15, 24)).toEqual({
      courts: 3,
      sessionHours: 2,
      roundMinutes: 15,
      totalRounds: 8,
      playersPerRound: 12,
      maxRoundsPerPlayer: 4,
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

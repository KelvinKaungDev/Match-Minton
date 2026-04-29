export const STATUS = {
  WAITING: 'waiting',
  BENCH: 'bench',
  PLAYING: 'playing',
  DONE: 'done',
  LEAVE: 'leave',
}

export const SKILL = { S: 'S', A: 'A', B: 'B', C: 'C' }
export const SKILLS = ['S', 'A', 'B', 'C']

export const DEFAULT_CONFIG = { courts: 5, sessionHours: 3, roundMinutes: 15, maxPlayers: 36 }

export function computeConfig(courts, sessionHours, roundMinutes = 15, maxPlayers = 36) {
  const totalRounds = Math.floor((sessionHours * 60) / roundMinutes)
  const playersPerRound = courts * 4
  const maxRoundsPerPlayer = Math.floor(totalRounds / 2)
  return { courts, sessionHours, roundMinutes, totalRounds, playersPerRound, maxRoundsPerPlayer, maxPlayers }
}

export function createPlayer(name, skill = SKILL.B) {
  return {
    id: crypto.randomUUID(),
    name,
    skill,
    status: STATUS.WAITING,
    roundsPlayed: 0,
  }
}

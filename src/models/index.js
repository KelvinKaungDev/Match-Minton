export const STATUS = {
  WAITING: 'waiting',
  BENCH: 'bench',
  PLAYING: 'playing',
  DONE: 'done',
  LEAVE: 'leave',
}

export const SKILL = { S: 'S', A: 'A', B: 'B', C: 'C' }
export const SKILLS = ['S', 'A', 'B', 'C']

export const DEFAULT_CONFIG = { courts: 5, maxRoundsPerPlayer: 6, maxPlayers: 36, fullRoundPrice: 0 }

export function computeConfig(courts, maxRoundsPerPlayer = 6, maxPlayers = 36, fullRoundPrice = 0, courtNames = null) {
  const names = Array.from({ length: courts }, (_, i) => courtNames?.[i] ?? String(i + 1))
  return { courts, maxRoundsPerPlayer, playersPerRound: courts * 4, maxPlayers, fullRoundPrice, courtNames: names }
}

export function calcPlayerCost(roundsPlayed, fullRoundPrice, maxRoundsPerPlayer) {
  if (!fullRoundPrice || !maxRoundsPerPlayer) return 0
  const pricePerRound = fullRoundPrice / maxRoundsPerPlayer
  return Math.round(roundsPlayed * pricePerRound)
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

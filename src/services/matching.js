import { STATUS } from '../models/index.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sortByRoundsShuffled(players) {
  const groups = {}
  for (const p of players) {
    groups[p.roundsPlayed] = groups[p.roundsPlayed] || []
    groups[p.roundsPlayed].push(p)
  }
  return Object.keys(groups)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap(k => shuffle(groups[k]))
}

export function generateRound(players, numCourts) {
  const bench = players.filter(p => p.status === STATUS.BENCH)
  const done = players.filter(p => p.status === STATUS.DONE)

  let pool = sortByRoundsShuffled(bench)
  const needed = numCourts * 4
  if (pool.length < needed) {
    pool = [...pool, ...sortByRoundsShuffled(done)]
  }

  const activeCourts = Math.min(numCourts, Math.floor(pool.length / 4))
  const selected = pool.slice(0, activeCourts * 4)
  const shuffled = shuffle(selected)

  const courts = []
  for (let i = 0; i < activeCourts; i++) {
    const four = shuffled.slice(i * 4, i * 4 + 4)
    courts.push({ id: i + 1, teamA: [four[0], four[1]], teamB: [four[2], four[3]] })
  }

  return { courts, playing: courts.flatMap(c => [...c.teamA, ...c.teamB]) }
}

export function findBestSub(players) {
  const bench = players.filter(p => p.status === STATUS.BENCH)
  if (bench.length > 0) {
    return bench.reduce((b, p) => p.roundsPlayed < b.roundsPlayed ? p : b)
  }
  const done = players.filter(p => p.status === STATUS.DONE)
  if (done.length > 0) {
    return done.reduce((b, p) => p.roundsPlayed < b.roundsPlayed ? p : b)
  }
  return null
}

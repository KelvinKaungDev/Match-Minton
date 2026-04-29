import { useState, useEffect } from 'react'
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, writeBatch, getDoc, arrayUnion,
} from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { createPlayer, computeConfig, DEFAULT_CONFIG, STATUS } from '../models/index.js'
import { generateRound, findBestSub } from '../services/matching.js'

const SESSION_REF = doc(db, 'session', 'current')
const PLAYERS_REF = collection(db, 'players')

const DEFAULT_SESSION = {
  config: computeConfig(DEFAULT_CONFIG.courts, DEFAULT_CONFIG.sessionHours),
  currentRound: 0,
  screen: 'setup',
  courts: [],
  history: [],
}

export function useAppState() {
  const [players, setPlayers] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoc(SESSION_REF).then(snap => {
      if (!snap.exists()) setDoc(SESSION_REF, DEFAULT_SESSION)
    }).catch(console.error)

    const unsubSession = onSnapshot(
      SESSION_REF,
      snap => {
        setSession(snap.exists() ? snap.data() : DEFAULT_SESSION)
        setLoading(false)
      },
      err => {
        console.error('Firestore session error:', err)
        setSession(DEFAULT_SESSION)
        setLoading(false)
      }
    )

    const unsubPlayers = onSnapshot(
      PLAYERS_REF,
      snap => setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Firestore players error:', err)
    )

    return () => { unsubSession(); unsubPlayers() }
  }, [])

  const updateConfig = async (courts, sessionHours, maxPlayers) => {
    const mp = maxPlayers ?? session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers
    await updateDoc(SESSION_REF, { config: computeConfig(courts, sessionHours, 15, mp) })
  }

  const addPlayer = async (name, skill) => {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return { error: 'duplicate' }
    const maxPlayers = session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers
    if (players.length >= maxPlayers) return { error: 'max' }
    const player = createPlayer(name, skill)
    await setDoc(doc(db, 'players', player.id), {
      name: player.name, skill: player.skill,
      status: player.status, roundsPlayed: player.roundsPlayed,
    })
    return { success: true }
  }

  const addPlayers = async (names, skill) => {
    const existing = new Set(players.map(p => p.name.toLowerCase()))
    const toAdd = names
      .filter(n => !existing.has(n.toLowerCase()))
      .slice(0, (session?.config?.maxPlayers ?? DEFAULT_CONFIG.maxPlayers) - players.length)
    if (toAdd.length === 0) return 0
    const batch = writeBatch(db)
    for (const name of toAdd) {
      const player = createPlayer(name, skill)
      batch.set(doc(db, 'players', player.id), {
        name: player.name, skill: player.skill,
        status: player.status, roundsPlayed: player.roundsPlayed,
      })
    }
    await batch.commit()
    return toAdd.length
  }

  const removePlayer = async (id) => deleteDoc(doc(db, 'players', id))

  const updatePlayerSkill = async (id, skill) => updateDoc(doc(db, 'players', id), { skill })

  const togglePlayerStatus = async (id) => {
    const player = players.find(p => p.id === id)
    if (!player) return
    const status = player.status === STATUS.WAITING ? STATUS.BENCH : STATUS.WAITING
    await updateDoc(doc(db, 'players', id), { status })
  }

  const markAllBench = async () => {
    const waiting = players.filter(p => p.status === STATUS.WAITING)
    if (waiting.length === 0) return
    const batch = writeBatch(db)
    for (const p of waiting) {
      batch.update(doc(db, 'players', p.id), { status: STATUS.BENCH })
    }
    await batch.commit()
  }

  const startSession = async () => {
    if (!session) return
    const bench = players.filter(p => p.status === STATUS.BENCH)
    if (bench.length < 4) return
    const { courts, playing } = generateRound(players, session.config.courts)
    const batch = writeBatch(db)
    for (const p of playing) {
      batch.update(doc(db, 'players', p.id), { status: STATUS.PLAYING, roundsPlayed: p.roundsPlayed + 1 })
    }
    batch.update(SESSION_REF, {
      currentRound: 1,
      screen: 'session',
      history: [],
      courts: courts.map(c => ({
        id: c.id,
        teamA: c.teamA.map(p => p.id),
        teamB: c.teamB.map(p => p.id),
      })),
    })
    await batch.commit()
  }

  const nextRound = async () => {
    if (!session) return
    const { currentRound, config } = session

    // Snapshot current round courts into history (store names+skills for display)
    const historyEntry = {
      round: currentRound,
      courts: (session.courts ?? []).map(c => ({
        id: c.id,
        teamA: c.teamA.map(id => { const p = players.find(pl => pl.id === id); return p ? { name: p.name, skill: p.skill } : null }).filter(Boolean),
        teamB: c.teamB.map(id => { const p = players.find(pl => pl.id === id); return p ? { name: p.name, skill: p.skill } : null }).filter(Boolean),
      })),
    }

    if (currentRound >= config.totalRounds) {
      await updateDoc(SESSION_REF, { screen: 'summary', history: arrayUnion(historyEntry) })
      return
    }

    const prevPlaying = players.filter(p => p.status === STATUS.PLAYING)
    const updatedPlayers = players.map(p => {
      if (p.status !== STATUS.PLAYING) return p
      return { ...p, status: p.roundsPlayed >= config.maxRoundsPerPlayer ? STATUS.DONE : STATUS.BENCH }
    })
    const { courts, playing } = generateRound(updatedPlayers, config.courts)
    const batch = writeBatch(db)
    for (const p of prevPlaying) {
      const updated = updatedPlayers.find(u => u.id === p.id)
      batch.update(doc(db, 'players', p.id), { status: updated.status })
    }
    for (const p of playing) {
      batch.update(doc(db, 'players', p.id), { status: STATUS.PLAYING, roundsPlayed: p.roundsPlayed + 1 })
    }
    batch.update(SESSION_REF, {
      currentRound: currentRound + 1,
      history: arrayUnion(historyEntry),
      courts: courts.map(c => ({
        id: c.id,
        teamA: c.teamA.map(p => p.id),
        teamB: c.teamB.map(p => p.id),
      })),
    })
    await batch.commit()
  }

  const fillEmptyCourts = async () => {
    if (!session) return
    const activeCourts = session.courts.length
    const emptyCourts = session.config.courts - activeCourts
    if (emptyCourts <= 0) return

    const bench = players.filter(p => p.status === STATUS.BENCH)
    if (bench.length < 4) return

    // Generate courts using only bench players, only fill empty slots
    const { courts: newCourts, playing } = generateRound(bench, emptyCourts)

    // Renumber so new court IDs continue from the last active court
    const renumbered = newCourts.map((c, i) => ({
      ...c,
      id: activeCourts + i + 1,
    }))

    const batch = writeBatch(db)
    for (const p of playing) {
      batch.update(doc(db, 'players', p.id), {
        status: STATUS.PLAYING,
        roundsPlayed: p.roundsPlayed + 1,
      })
    }
    batch.update(SESSION_REF, {
      courts: [
        ...session.courts,
        ...renumbered.map(c => ({
          id: c.id,
          teamA: c.teamA.map(p => p.id),
          teamB: c.teamB.map(p => p.id),
        })),
      ],
    })
    await batch.commit()
  }

  const markLeave = async (id) => {
    const player = players.find(p => p.id === id)
    if (!player) return
    const batch = writeBatch(db)
    batch.update(doc(db, 'players', id), { status: STATUS.LEAVE })
    if (player.status === STATUS.PLAYING && session) {
      const sub = findBestSub(players.filter(p => p.id !== id))
      if (sub) {
        batch.update(doc(db, 'players', sub.id), {
          status: STATUS.PLAYING, roundsPlayed: sub.roundsPlayed + 1,
        })
        const newCourts = session.courts.map(c => ({
          ...c,
          teamA: c.teamA.map(pid => pid === id ? sub.id : pid),
          teamB: c.teamB.map(pid => pid === id ? sub.id : pid),
        }))
        batch.update(SESSION_REF, { courts: newCourts })
      } else {
        const newCourts = session.courts.map(c => ({
          ...c,
          teamA: c.teamA.filter(pid => pid !== id),
          teamB: c.teamB.filter(pid => pid !== id),
        }))
        batch.update(SESSION_REF, { courts: newCourts })
      }
    }
    await batch.commit()
  }

  const activatePlayer = async (id) => updateDoc(doc(db, 'players', id), { status: STATUS.BENCH })

  const volunteerMore = async (id) => updateDoc(doc(db, 'players', id), { status: STATUS.BENCH })

  const endSession = async () => updateDoc(SESSION_REF, { screen: 'summary' })

  const resetSession = async () => {
    const batch = writeBatch(db)
    for (const p of players) batch.delete(doc(db, 'players', p.id))
    batch.set(SESSION_REF, DEFAULT_SESSION)
    await batch.commit()
  }

  const courts = session?.courts?.map(c => ({
    ...c,
    teamA: c.teamA.map(id => players.find(p => p.id === id)).filter(Boolean),
    teamB: c.teamB.map(id => players.find(p => p.id === id)).filter(Boolean),
  })) ?? []

  return {
    players, session, courts, loading,
    updateConfig, addPlayer, addPlayers, removePlayer,
    updatePlayerSkill, togglePlayerStatus, markAllBench,
    startSession, nextRound, fillEmptyCourts, markLeave,
    activatePlayer, volunteerMore,
    endSession, resetSession,
  }
}

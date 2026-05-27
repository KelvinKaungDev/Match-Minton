import { useState, useEffect, useMemo } from 'react'
import {
  collectionGroup, query, where, getDocs, getDoc,
  onSnapshot, updateDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase.js'

// ── Pure scoring logic (no side effects) ─────────────────────────────────────

function getGameWinner(score, { pointsToWin, deuceRule, maxPoints }) {
  const { teamA, teamB } = score
  const hi = Math.max(teamA, teamB)
  const lo = Math.min(teamA, teamB)
  if (hi < pointsToWin) return null
  const leader = teamA > teamB ? 'teamA' : teamB > teamA ? 'teamB' : null
  if (!leader) return null               // exact tie at or above pointsToWin (deuce)
  if (!deuceRule) return leader          // no deuce: first to reach pointsToWin wins
  if (hi >= maxPoints) return leader     // cap reached: whoever is ahead wins
  if (hi - lo >= 2) return leader        // standard deuce: 2-point lead required
  return null
}

export function computeMatchState(pointLog, config) {
  const { numberOfGames } = config
  const gamesNeededToWin = Math.ceil(numberOfGames / 2)
  const completedGames = []
  const gamesWon = { teamA: 0, teamB: 0 }
  let currentGame = 1
  let currentScore = { teamA: 0, teamB: 0 }
  let matchWinner = null

  for (const point of pointLog) {
    if (matchWinner) break
    currentScore = { ...currentScore, [point.team]: currentScore[point.team] + 1 }
    const gameWinner = getGameWinner(currentScore, config)
    if (gameWinner) {
      completedGames.push({
        game: currentGame,
        teamA: currentScore.teamA,
        teamB: currentScore.teamB,
        winner: gameWinner,
      })
      gamesWon[gameWinner]++
      if (gamesWon[gameWinner] >= gamesNeededToWin) {
        matchWinner = gameWinner
      } else {
        currentGame++
        currentScore = { teamA: 0, teamB: 0 }
      }
    }
  }

  return {
    currentGame,
    currentScore,
    completedGames,
    gamesWon,
    matchWinner,
    matchStatus: matchWinner ? 'finished' : 'playing',
    totalGames: numberOfGames,
    gamesNeededToWin,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCompetitionScoring(code) {
  const [courtRef, setCourtRef] = useState(null)
  const [courtData, setCourtData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)   // null | 'not-found' | 'session-ended' | 'error'

  // Step 1: resolve code → court doc ref (one-time query on mount)
  useEffect(() => {
    if (!code) return
    let cancelled = false
    getDocs(query(collectionGroup(db, 'courts'), where('code', '==', code)))
      .then(async snap => {
        if (cancelled) return
        if (snap.empty) { setError('not-found'); setLoading(false); return }

        const courtDoc = snap.docs[0]
        const sessionSnap = await getDoc(courtDoc.ref.parent.parent)
        if (cancelled) return

        if (!sessionSnap.exists() || sessionSnap.data().status === 'ended') {
          setError('session-ended')
          setLoading(false)
          return
        }
        setCourtRef(courtDoc.ref)
      })
      .catch(() => { if (!cancelled) { setError('error'); setLoading(false) } })
    return () => { cancelled = true }
  }, [code])

  // Step 2: live subscription once ref is resolved
  useEffect(() => {
    if (!courtRef) return
    return onSnapshot(
      courtRef,
      snap => {
        if (!snap.exists()) { setError('not-found'); setLoading(false); return }
        setCourtData({ id: snap.id, ...snap.data() })
        setLoading(false)
      },
      () => { setError('error'); setLoading(false) }
    )
  }, [courtRef])

  const matchState = useMemo(() => {
    if (!courtData?.scoreConfig) return null
    return computeMatchState(courtData.pointLog ?? [], courtData.scoreConfig)
  }, [courtData])

  // Write a new point log + derived summary fields to Firestore
  const applyLog = async (newLog) => {
    if (!courtRef || !courtData?.scoreConfig) return
    const newState = computeMatchState(newLog, courtData.scoreConfig)
    await updateDoc(courtRef, {
      pointLog: newLog,
      currentScore: newState.currentScore,
      currentGame: newState.currentGame,
      completedGames: newState.completedGames,
      gamesWon: newState.gamesWon,
      matchWinner: newState.matchWinner,
      matchStatus: newState.matchStatus,
    })
  }

  const scorePoint = (team) => {
    if (!courtData || matchState?.matchWinner) return
    applyLog([...(courtData.pointLog ?? []), { team }])
  }

  const undoLastPoint = () => {
    const log = courtData?.pointLog ?? []
    if (!log.length) return
    applyLog(log.slice(0, -1))
  }

  return { courtData, matchState, loading, error, scorePoint, undoLastPoint }
}

import { useState, useEffect, useCallback } from 'react'
import { doc, collection, onSnapshot, writeBatch, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

export const DEFAULT_SCORE_CONFIG = {
  pointsToWin: 21,
  numberOfGames: 3,
  deuceRule: true,
  maxPoints: 30,
}

// Unambiguous chars — no 0/O, 1/I/L
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCourtCode(courtIndex) {
  const letter = String.fromCharCode(65 + (courtIndex % 26))  // A, B, C…
  const digit = String((courtIndex + 1) % 10)                 // 1, 2, 3…
  const r1 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  const r2 = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return `${letter}${digit}${r1}${r2}`
}

export function useCompetition() {
  const { user } = useAuth()
  const [config, setConfig] = useState(DEFAULT_SCORE_CONFIG)
  const [activeSessionId, setActiveSessionId] = useState(
    () => localStorage.getItem('activeCompetitionSession')
  )
  const [activeCourts, setActiveCourts] = useState([])
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!activeSessionId) return
    const courtsRef = collection(db, 'competitionSessions', activeSessionId, 'courts')
    return onSnapshot(courtsRef, snap => {
      setActiveCourts(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.courtNumber - b.courtNumber)
      )
    })
  }, [activeSessionId])

  const updateConfig = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }, [])

  const startCompetition = async (courts) => {
    if (!user || courts.length === 0) return { success: false }
    setStarting(true)
    try {
      const sessionId = `${user.uid}-${Date.now()}`
      const batch = writeBatch(db)

      batch.set(doc(db, 'competitionSessions', sessionId), {
        uid: user.uid,
        scoreConfig: config,
        courtCount: courts.length,
        createdAt: serverTimestamp(),
      })

      courts.forEach((court, index) => {
        batch.set(
          doc(db, 'competitionSessions', sessionId, 'courts', `court-${index + 1}`),
          {
            code: generateCourtCode(index),
            courtNumber: index + 1,
            courtName: court.name ?? String(index + 1),
            teamA: court.teamA.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
            teamB: court.teamB.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
            scoreConfig: config,
            createdAt: serverTimestamp(),
          }
        )
      })

      await batch.commit()
      localStorage.setItem('activeCompetitionSession', sessionId)
      setActiveSessionId(sessionId)
      return { success: true, sessionId }
    } finally {
      setStarting(false)
    }
  }

  const syncCourts = async (sessionCourts) => {
    if (!user || !activeSessionId || sessionCourts.length === 0) return
    const batch = writeBatch(db)
    let newIndex = activeCourts.length

    for (const sessionCourt of sessionCourts) {
      const courtLabel = sessionCourt.name ?? String(sessionCourt.id)
      const existing = activeCourts.find(
        c => (c.courtName ?? String(c.courtNumber)) === courtLabel
      )
      if (existing) {
        // Same court — keep code, reset scores, update teams
        batch.update(doc(db, 'competitionSessions', activeSessionId, 'courts', existing.id), {
          teamA: sessionCourt.teamA.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
          teamB: sessionCourt.teamB.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
          pointLog: [],
          currentScore: { teamA: 0, teamB: 0 },
          currentGame: 1,
          completedGames: [],
          gamesWon: { teamA: 0, teamB: 0 },
          matchWinner: null,
        })
      } else {
        // New court — generate fresh code
        batch.set(doc(db, 'competitionSessions', activeSessionId, 'courts', `court-${newIndex + 1}-${Date.now()}`), {
          code: generateCourtCode(newIndex),
          courtNumber: newIndex + 1,
          courtName: courtLabel,
          teamA: sessionCourt.teamA.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
          teamB: sessionCourt.teamB.map(p => ({ id: p.id, name: p.name, skill: p.skill })),
          scoreConfig: config,
          createdAt: serverTimestamp(),
        })
        newIndex++
      }
    }
    await batch.commit()
  }

  const endCompetition = async () => {
    if (activeSessionId) {
      await updateDoc(doc(db, 'competitionSessions', activeSessionId), { status: 'ended' })
    }
    localStorage.removeItem('activeCompetitionSession')
    setActiveSessionId(null)
    setActiveCourts([])
  }

  return { config, updateConfig, activeSessionId, activeCourts, starting, startCompetition, syncCourts, endCompetition }
}

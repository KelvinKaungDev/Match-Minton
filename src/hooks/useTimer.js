import { useState, useEffect, useRef } from 'react'

export function useTimer(initialSeconds = 900) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setRunning(false); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  useEffect(() => {
    setTimeLeft(initialSeconds)
    setRunning(false)
  }, [initialSeconds])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return {
    timeLeft,
    running,
    display: `${mm}:${ss}`,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => { setRunning(false); setTimeLeft(initialSeconds) },
  }
}

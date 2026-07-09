import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/apiClient.js'

// ── Status values ─────────────────────────────────────────────────────────────
// idle | loading | invalid | expired

async function lookupCode(code) {
  let court
  try {
    court = await api.get(`/api/competition-courts/code/${code}`)
  } catch {
    return 'invalid'
  }

  try {
    const session = await api.get(`/api/competition-sessions/${court.sessionId}`)
    if (session.status === 'finished') return 'expired'
    return 'valid'
  } catch {
    return 'expired'
  }
}

export default function JudgeEntry() {
  const [chars, setChars] = useState(['', '', '', ''])
  const [status, setStatus] = useState('idle')
  const inputRefs = useRef([])
  const navigate = useNavigate()

  const handleChange = (index, raw) => {
    const char = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    const next = [...chars]
    next[index] = char
    setChars(next)
    setStatus('idle')
    if (char && index < 3) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') handleSubmit()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const next = ['', '', '', '']
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setChars(next)
    setStatus('idle')
    const focusIndex = Math.min(pasted.length, 3)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async () => {
    const code = chars.join('')
    if (code.length < 4) return
    setStatus('loading')
    try {
      const result = await lookupCode(code)
      if (result === 'valid') {
        navigate(`/judge/${code}`)
      } else {
        setStatus(result) // 'invalid' or 'expired'
        setChars(['', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      console.error('lookupCode error:', err)
      setStatus('error')
    }
  }

  const code = chars.join('')
  const isReady = code.length === 4
  const isLoading = status === 'loading'

  return (
    <div
      className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-[#0f1923] font-bold text-xl"
          style={{ backgroundColor: '#34d399' }}
        >
          🏸
        </div>
        <span className="text-white text-xl font-bold tracking-tight">Match Minton</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-white text-xl font-bold">Enter Court Code</h1>
          <p className="text-stone-500 text-sm mt-1">Get the 4-character code from your organiser</p>
        </div>

        {/* 4-box OTP input */}
        <div className="flex gap-3" onPaste={handlePaste}>
          {chars.map((char, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={char}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={2}
              disabled={isLoading}
              className={`w-14 h-16 text-center text-2xl font-black tracking-widest rounded-xl bg-stone-800 text-white border transition-colors focus:outline-none disabled:opacity-50
                ${status !== 'idle' && status !== 'loading'
                  ? 'border-red-500/60'
                  : char
                    ? 'border-[#34d399]'
                    : 'border-stone-700 focus:border-[#34d399]'
                }`}
            />
          ))}
        </div>

        {/* Error messages */}
        <div className="h-5 flex items-center">
          {status === 'invalid' && (
            <p className="text-red-400 text-sm">Invalid code, try again</p>
          )}
          {status === 'expired' && (
            <p className="text-amber-400 text-sm">Session has ended</p>
          )}
          {status === 'error' && (
            <p className="text-amber-400 text-sm">Connection error — check console</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isReady || isLoading}
          className="w-full py-3.5 rounded-xl bg-[#34d399] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-sm transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon />
              Checking…
            </span>
          ) : (
            'Enter Court'
          )}
        </button>
      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

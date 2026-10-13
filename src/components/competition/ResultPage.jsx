import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/apiClient.js'

const CARD_W = 1080
const CARD_H = 1350

function fitText(ctx, text, maxWidth) {
  let out = text
  while (out.length > 1 && ctx.measureText(out).width > maxWidth) out = out.slice(0, -1)
  return out === text ? text : `${out}…`
}

// Draws the share card straight onto a canvas so no extra library is needed.
function drawCard(result) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  const font = (size, weight = 700) => `${weight} ${size}px Outfit, system-ui, sans-serif`

  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H)
  bg.addColorStop(0, '#0c0a09')
  bg.addColorStop(1, '#052e22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#34d399'
  ctx.font = font(44, 800)
  ctx.fillText('🏸 MATCH MINTON', CARD_W / 2, 120)

  ctx.fillStyle = '#a8a29e'
  ctx.font = font(36, 500)
  ctx.fillText(fitText(ctx, result.sessionName ?? '', 900), CARD_W / 2, 185)
  const date = result.playedAt ? new Date(result.playedAt).toLocaleDateString() : ''
  ctx.fillText(`Court ${result.courtNumber}${date ? ` · ${date}` : ''}`, CARD_W / 2, 235)

  const gamesWon = { teamA: 0, teamB: 0 }
  result.games.forEach(g => { if (g.winner) gamesWon[g.winner]++ })

  const colX = { teamA: 300, teamB: 780 }
  const colColor = { teamA: '#34d399', teamB: '#38bdf8' }
  ;['teamA', 'teamB'].forEach(team => {
    const won = result.winner === team
    ctx.fillStyle = colColor[team]
    ctx.font = font(34, 700)
    ctx.fillText(team === 'teamA' ? 'TEAM A' : 'TEAM B', colX[team], 360)
    ctx.font = font(230, 900)
    ctx.fillText(String(gamesWon[team]), colX[team], 590)
    if (won) {
      ctx.font = font(34, 800)
      ctx.fillText('🏆 WINNER', colX[team], 650)
    }
    ctx.fillStyle = '#e7e5e4'
    ctx.font = font(36, 600)
    const names = team === 'teamA' ? result.teamAPlayers : result.teamBPlayers
    names.forEach((name, i) => ctx.fillText(fitText(ctx, name, 420), colX[team], 730 + i * 52))
  })
  ctx.fillStyle = '#57534e'
  ctx.font = font(120, 300)
  ctx.fillText('—', CARD_W / 2, 560)

  // Per-game scores
  ctx.fillStyle = '#a8a29e'
  ctx.font = font(30, 600)
  ctx.fillText('GAME SCORES', CARD_W / 2, 930)
  ctx.fillStyle = '#fafaf9'
  ctx.font = font(52, 800)
  result.games.slice(0, 5).forEach((g, i) => {
    ctx.fillText(`${g.teamAScore}  —  ${g.teamBScore}`, CARD_W / 2, 1000 + i * 68)
  })

  ctx.fillStyle = '#57534e'
  ctx.font = font(30, 500)
  ctx.fillText('Run your own sessions with Match Minton', CARD_W / 2, 1300)
  return canvas
}

function canvasToFile(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Could not create image'))
      resolve(new File([blob], 'match-result.png', { type: 'image/png' }))
    }, 'image/png')
  })
}

export default function ResultPage() {
  const { courtId } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    api.get(`/api/competition-courts/${courtId}/result`)
      .then(data => { if (!cancelled) setResult(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [courtId])

  const shell = (children) => (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center px-4 py-8 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {children}
    </div>
  )

  if (error) return shell(<p className="text-red-400 mt-24">{error}</p>)
  if (!result) return shell(<p className="text-stone-400 mt-24">Loading…</p>)

  if (!result.shareEnabled) {
    return shell(
      <div className="mt-24 max-w-xs">
        <p className="text-white text-xl font-bold mb-2">Result sharing is a Pro feature</p>
        <p className="text-stone-400 text-sm">Ask the organiser to upgrade to Pro to get shareable match cards.</p>
      </div>
    )
  }

  if (result.status !== 'finished') {
    return shell(<p className="text-stone-400 mt-24">This match isn't finished yet. Check back soon.</p>)
  }

  const gamesWon = { teamA: 0, teamB: 0 }
  result.games.forEach(g => { if (g.winner) gamesWon[g.winner]++ })

  const share = async () => {
    try {
      const file = await canvasToFile(drawCard(result))
      if (navigator.canShare?.({ files: [file] })) {
        // Files only: bundling a title/url with the image makes AirDrop fail on Apple devices
        await navigator.share({ files: [file] })
        return
      }
      // Desktop / unsupported browsers: download the image instead
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = file.name
      a.click()
      URL.revokeObjectURL(a.href)
      setNotice('Image saved')
    } catch (err) {
      if (err.name !== 'AbortError') setNotice('Could not share. Try again.')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice('Link copied')
    } catch {
      setNotice('Could not copy link')
    }
  }

  return shell(
    <>
      <p className="text-[#34d399] font-extrabold tracking-wide">🏸 MATCH MINTON</p>
      <p className="text-stone-400 text-sm mt-1">{result.sessionName} · Court {result.courtNumber}</p>

      <div className="w-full max-w-sm mt-6 bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <div className="flex items-start">
          {['teamA', 'teamB'].map(team => (
            <div key={team} className="flex-1">
              <p className={`text-xs font-semibold uppercase tracking-wide ${team === 'teamA' ? 'text-emerald-400' : 'text-sky-400'}`}>
                {team === 'teamA' ? 'Team A' : 'Team B'}
              </p>
              <p className={`text-7xl font-black tabular-nums ${team === 'teamA' ? 'text-emerald-400' : 'text-sky-400'}`}>{gamesWon[team]}</p>
              {result.winner === team && <p className="text-xs text-amber-400 font-bold">🏆 Winner</p>}
              <div className="mt-2 space-y-0.5">
                {(team === 'teamA' ? result.teamAPlayers : result.teamBPlayers).map(n => (
                  <p key={n} className="text-white text-sm truncate">{n}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-800 mt-4 pt-3 space-y-1">
          {result.games.map(g => (
            <p key={g.gameNumber} className="text-stone-300 text-sm tabular-nums">
              Game {g.gameNumber}: <span className="text-white font-bold">{g.teamAScore} — {g.teamBScore}</span>
            </p>
          ))}
        </div>
      </div>

      <button onClick={share} className="mt-6 w-full max-w-sm bg-[#34d399] hover:bg-emerald-300 text-stone-950 font-bold py-3 rounded-xl transition-colors">
        Share result
      </button>
      <button onClick={copyLink} className="mt-3 w-full max-w-sm bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold py-3 rounded-xl transition-colors">
        Copy link
      </button>
      {notice && <p className="text-stone-400 text-xs mt-3" role="status">{notice}</p>}
    </>
  )
}

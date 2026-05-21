import { useState } from 'react'
import CourtCard from './CourtCard.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { STATUS } from '../../models/index.js'

export default function CourtsTab({ courts, onLeave, onComplete, onRefill, onSwap, players = [] }) {
  const { t } = useLang()
  const benchCount = players.filter(p => p.status === STATUS.BENCH).length
  const benchPlayers = players.filter(p => p.status === STATUS.BENCH)

  // { playerId, courtId } | null
  const [swapTarget, setSwapTarget] = useState(null)

  const handleSwapSelect = (playerId, courtId) => {
    setSwapTarget(prev =>
      prev?.playerId === playerId ? null : { playerId, courtId }
    )
  }

  const handleSwapConfirm = async (benchPlayerId) => {
    if (!swapTarget) return
    await onSwap(swapTarget.playerId, benchPlayerId, swapTarget.courtId)
    setSwapTarget(null)
  }

  const handleCancelSwap = () => setSwapTarget(null)

  return (
    <div className="p-3">
      {courts.length === 0
        ? <p className="text-stone-600 text-sm text-center py-12">{t.noCourts}</p>
        : (
          <div className="grid grid-cols-2 gap-2">
            {courts.map(court => (
              <CourtCard
                key={court.id}
                court={court}
                onLeave={onLeave}
                onComplete={onComplete}
                onRefill={onRefill}
                canRefill={benchCount >= 4}
                swapPlayerId={swapTarget?.courtId === court.id ? swapTarget.playerId : null}
                benchPlayers={benchPlayers}
                onSwapSelect={handleSwapSelect}
                onSwapConfirm={handleSwapConfirm}
                onCancelSwap={handleCancelSwap}
              />
            ))}
          </div>
        )
      }

    </div>
  )
}

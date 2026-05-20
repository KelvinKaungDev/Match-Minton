import { useState } from 'react'
import SessionConfig from './SessionConfig.jsx'
import AddPlayer from './AddPlayer.jsx'
import PlayerList from './PlayerList.jsx'
import { STATUS } from '../../models/index.js'
import { useLang } from '../../context/LangContext.jsx'

function ConfigErrorAlert({ errors, onDismiss }) {
  const { t } = useLang()
  return (
    <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">
          {t.configErrorTitle}
        </span>
        <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 text-base leading-none">✕</button>
      </div>
      <ul className="space-y-1">
        {errors.map((err, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-red-300">
            <span className="shrink-0 mt-0.5">•</span>
            <span>{err}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PricePrompt({ onConfirm, onSkip }) {
  const { t } = useLang()
  const [price, setPrice] = useState('')

  const handleConfirm = () => {
    const val = parseInt(price, 10)
    onConfirm(isNaN(val) || val <= 0 ? 0 : val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
        <div>
          <h3 className="text-white font-bold text-base">{t.setPriceTitle}</h3>
          <p className="text-stone-400 text-sm mt-1">{t.setPriceDesc}</p>
        </div>
        <input
          type="number"
          min={0}
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="0"
          autoFocus
          className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-stone-500 focus:outline-none focus:border-[#34d399]"
        />
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl text-stone-400 text-sm font-medium border border-stone-700 hover:border-stone-500 transition-colors"
          >
            {t.skipPrice}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-[#0f1923] transition-colors"
            style={{ backgroundColor: '#34d399' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#6ee7b7'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#34d399'}
          >
            {t.setAndStart}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SetupScreen({ state }) {
  const { t } = useLang()
  const {
    players, session,
    updateConfig, addPlayer, addPlayers,
    removePlayer, updatePlayerSkill, togglePlayerStatus, markAllBench,
    startSession,
  } = state

  const [configErrors, setConfigErrors] = useState([])
  const [showPricePrompt, setShowPricePrompt] = useState(false)

  if (!session) return null

  const bench = players.filter(p => p.status === STATUS.BENCH)
  const canStart = bench.length >= 4
  const { courts, maxRoundsPerPlayer, maxPlayers, fullRoundPrice = 0 } = session.config

  const getErrors = () => {
    const errs = []
    if (!courts || courts < 1) errs.push(t.errorNoCourts)
    if (!maxRoundsPerPlayer || maxRoundsPerPlayer < 1) errs.push(t.errorNoRounds)
    if (!maxPlayers || maxPlayers < 1) errs.push(t.errorNoMaxPlayers)
    if (!fullRoundPrice || fullRoundPrice <= 0) errs.push(t.errorNoPrice)
    return errs
  }

  const handleAddPlayer = async (name, skill) => {
    const errs = getErrors()
    if (errs.length > 0) { setConfigErrors(errs); return }
    return addPlayer(name, skill)
  }

  const handleAddPlayers = async (names, skill) => {
    const errs = getErrors()
    if (errs.length > 0) { setConfigErrors(errs); return }
    return addPlayers(names, skill)
  }

  const handleStart = () => {
    const errs = getErrors().filter(e => e !== t.errorNoPrice)
    if (errs.length > 0) { setConfigErrors(errs); return }
    if (fullRoundPrice === 0) { setShowPricePrompt(true); return }
    startSession()
  }

  const handlePriceConfirm = async (price) => {
    if (price > 0) {
      await updateConfig(courts, maxRoundsPerPlayer, maxPlayers, price)
    }
    setShowPricePrompt(false)
    startSession()
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[#34d399] font-bold text-2xl tracking-tight">Match Minton</h1>
          <span className="text-stone-600 text-xs">🏸</span>
        </div>

        <SessionConfig config={session.config} onUpdate={updateConfig} />

        {configErrors.length > 0 && (
          <ConfigErrorAlert errors={configErrors} onDismiss={() => setConfigErrors([])} />
        )}

        <AddPlayer
          onAdd={handleAddPlayer}
          onAddBulk={handleAddPlayers}
          maxPlayers={session.config.maxPlayers}
        />

        {players.length > 0 && (
          <PlayerList
            players={players}
            maxPlayers={session.config.maxPlayers}
            onSkillChange={updatePlayerSkill}
            onToggle={togglePlayerStatus}
            onRemove={removePlayer}
            onMarkAllBench={markAllBench}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur border-t border-stone-800 px-4 py-3">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full bg-[#34d399] hover:bg-[#6ee7b7] disabled:bg-stone-800 disabled:text-stone-600 text-[#0f1923] font-semibold rounded-xl py-3.5 transition-colors"
        >
          {canStart ? t.startReady(bench.length) : t.needPlayers(bench.length)}
        </button>
      </div>

      {showPricePrompt && (
        <PricePrompt
          onConfirm={handlePriceConfirm}
          onSkip={() => { setShowPricePrompt(false); startSession() }}
        />
      )}
    </div>
  )
}

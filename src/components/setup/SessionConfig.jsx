import { useLang } from '../../context/LangContext.jsx'

function Stepper({ label, value, min, max, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-400 text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center disabled:opacity-30"
        >
          −
        </button>
        <span className="text-white font-bold w-6 text-center">{value}</span>
        <button
          onClick={onIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function SessionConfig({ config, onUpdate }) {
  const { t } = useLang()
  const { courts, maxRoundsPerPlayer, playersPerRound, maxPlayers = 36 } = config

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-4">
      <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.sessionConfig}</h2>

      <Stepper
        label={t.courts}
        value={courts}
        min={1} max={15}
        onDecrement={() => onUpdate(courts - 1, maxRoundsPerPlayer, maxPlayers)}
        onIncrement={() => onUpdate(courts + 1, maxRoundsPerPlayer, maxPlayers)}
      />
      <Stepper
        label={t.maxRounds}
        value={maxRoundsPerPlayer}
        min={1} max={20}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer - 1, maxPlayers)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer + 1, maxPlayers)}
      />
      <Stepper
        label={t.maxPlayers}
        value={maxPlayers}
        min={4} max={200}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers - 1)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers + 1)}
      />

      <div className="pt-3 border-t border-stone-800 text-center">
        <div className="text-orange-400 font-bold text-lg">{playersPerRound}</div>
        <div className="text-stone-500 text-xs mt-0.5">{t.playersPerMatch}</div>
      </div>
    </div>
  )
}

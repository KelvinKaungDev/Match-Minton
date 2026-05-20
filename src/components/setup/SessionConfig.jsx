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
  const { courts, maxRoundsPerPlayer, playersPerRound, maxPlayers = 36, fullRoundPrice = 0 } = config
  const pricePerRound = maxRoundsPerPlayer > 0 && fullRoundPrice > 0
    ? Math.round(fullRoundPrice / maxRoundsPerPlayer)
    : 0

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-4">
      <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.sessionConfig}</h2>

      <Stepper
        label={t.courts}
        value={courts}
        min={1} max={15}
        onDecrement={() => onUpdate(courts - 1, maxRoundsPerPlayer, maxPlayers, fullRoundPrice)}
        onIncrement={() => onUpdate(courts + 1, maxRoundsPerPlayer, maxPlayers, fullRoundPrice)}
      />
      <Stepper
        label={t.maxRounds}
        value={maxRoundsPerPlayer}
        min={1} max={20}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer - 1, maxPlayers, fullRoundPrice)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer + 1, maxPlayers, fullRoundPrice)}
      />
      <Stepper
        label={t.maxPlayers}
        value={maxPlayers}
        min={4} max={200}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers - 1, fullRoundPrice)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers + 1, fullRoundPrice)}
      />

      <div className="flex items-center justify-between pt-3 border-t border-stone-800">
        <span className="text-stone-400 text-sm">{t.fullRoundPrice}</span>
        <input
          type="number"
          min={0}
          value={fullRoundPrice === 0 ? '' : fullRoundPrice}
          placeholder="0"
          onChange={e => {
            const val = parseInt(e.target.value, 10)
            onUpdate(courts, maxRoundsPerPlayer, maxPlayers, isNaN(val) ? 0 : val)
          }}
          className="w-24 bg-stone-800 text-white text-right font-bold rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#34d399]"
        />
      </div>

      {pricePerRound > 0 && (
        <div className="text-stone-500 text-xs text-right -mt-2">
          {t.pricePerRound(pricePerRound)}
        </div>
      )}

      <div className="pt-3 border-t border-stone-800 text-center">
        <div className="text-[#34d399] font-bold text-lg">{playersPerRound}</div>
        <div className="text-stone-500 text-xs mt-0.5">{t.playersPerMatch}</div>
      </div>
    </div>
  )
}

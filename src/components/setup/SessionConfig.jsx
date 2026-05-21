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
  const { courts, maxRoundsPerPlayer, playersPerRound, maxPlayers = 36, fullRoundPrice = 0, courtNames = [] } = config
  const pricePerRound = maxRoundsPerPlayer > 0 && fullRoundPrice > 0
    ? Math.round(fullRoundPrice / maxRoundsPerPlayer)
    : 0

  const names = Array.from({ length: courts }, (_, i) => courtNames[i] ?? String(i + 1))

  const handleCourtsChange = (delta) => {
    const next = courts + delta
    const nextNames = Array.from({ length: next }, (_, i) => courtNames[i] ?? String(i + 1))
    onUpdate(next, maxRoundsPerPlayer, maxPlayers, fullRoundPrice, nextNames)
  }

  const handleNameChange = (i, val) => {
    const nextNames = [...names]
    nextNames[i] = val
    onUpdate(courts, maxRoundsPerPlayer, maxPlayers, fullRoundPrice, nextNames)
  }

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-4">
      <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{t.sessionConfig}</h2>

      <Stepper
        label={t.courts}
        value={courts}
        min={1} max={15}
        onDecrement={() => handleCourtsChange(-1)}
        onIncrement={() => handleCourtsChange(1)}
      />

      {/* Court name inputs */}
      <div className="space-y-1.5">
        <span className="text-stone-400 text-xs">{t.courtNames}</span>
        <div className="flex flex-wrap gap-1.5">
          {names.map((name, i) => (
            <input
              key={i}
              value={name}
              onChange={e => handleNameChange(i, e.target.value)}
              maxLength={5}
              className="w-12 bg-stone-800 text-white text-center text-sm font-bold rounded-lg px-1 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#34d399]"
            />
          ))}
        </div>
      </div>

      <Stepper
        label={t.maxRounds}
        value={maxRoundsPerPlayer}
        min={1} max={20}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer - 1, maxPlayers, fullRoundPrice, names)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer + 1, maxPlayers, fullRoundPrice, names)}
      />
      <Stepper
        label={t.maxPlayers}
        value={maxPlayers}
        min={4} max={200}
        onDecrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers - 1, fullRoundPrice, names)}
        onIncrement={() => onUpdate(courts, maxRoundsPerPlayer, maxPlayers + 1, fullRoundPrice, names)}
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
            onUpdate(courts, maxRoundsPerPlayer, maxPlayers, isNaN(val) ? 0 : val, names)
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

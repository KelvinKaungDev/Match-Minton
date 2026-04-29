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
  const { courts, sessionHours, totalRounds, playersPerRound, maxRoundsPerPlayer, maxPlayers = 36 } = config

  return (
    <div className="bg-stone-900 rounded-xl p-4 space-y-4">
      <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Session Config</h2>

      <Stepper
        label="Courts"
        value={courts}
        min={1} max={15}
        onDecrement={() => onUpdate(courts - 1, sessionHours, maxPlayers)}
        onIncrement={() => onUpdate(courts + 1, sessionHours, maxPlayers)}
      />
      <Stepper
        label="Session Hours"
        value={sessionHours}
        min={1} max={12}
        onDecrement={() => onUpdate(courts, sessionHours - 1, maxPlayers)}
        onIncrement={() => onUpdate(courts, sessionHours + 1, maxPlayers)}
      />
      <Stepper
        label="Max Players"
        value={maxPlayers}
        min={4} max={200}
        onDecrement={() => onUpdate(courts, sessionHours, maxPlayers - 1)}
        onIncrement={() => onUpdate(courts, sessionHours, maxPlayers + 1)}
      />

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-800">
        {[
          { value: totalRounds, label: 'Total Rounds' },
          { value: playersPerRound, label: 'Per Round' },
          { value: maxRoundsPerPlayer, label: 'Max / Player' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-orange-400 font-bold text-lg">{value}</div>
            <div className="text-stone-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

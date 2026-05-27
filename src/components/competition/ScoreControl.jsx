function UndoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
      <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clipRule="evenodd" />
    </svg>
  )
}

function TeamButton({ label, players, color, onScore, disabled }) {
  const green = color === 'green'
  return (
    <button
      onClick={onScore}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 select-none transition-all active:scale-95
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : green
            ? 'cursor-pointer bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25 active:bg-emerald-500/35'
            : 'cursor-pointer bg-sky-500/15 border-sky-500/30 hover:bg-sky-500/25 active:bg-sky-500/35'
        }`}
    >
      <span className={`text-5xl font-black leading-none ${green ? 'text-emerald-400' : 'text-sky-400'}`}>
        +1
      </span>
      <span className="text-white text-sm font-bold tracking-wide">{label}</span>
      <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 max-w-[140px]">
        {players.map((p, i) => (
          <span key={p.id ?? i} className="text-stone-400 text-xs leading-snug">{p.name}</span>
        ))}
      </div>
    </button>
  )
}

export default function ScoreControl({ teamA = [], teamB = [], onScore, onUndo, canUndo, disabled }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <TeamButton
          label="Team A" players={teamA} color="green"
          onScore={() => onScore('teamA')} disabled={disabled}
        />
        <TeamButton
          label="Team B" players={teamB} color="blue"
          onScore={() => onScore('teamB')} disabled={disabled}
        />
      </div>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 text-sm font-medium flex items-center justify-center gap-2 border border-stone-700 transition-colors"
      >
        <UndoIcon />
        Undo Last Point
      </button>
    </div>
  )
}

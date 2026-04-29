export default function RoundTimer({ display, running, start, pause, reset }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-lg font-bold text-white tabular-nums">{display}</span>
      <div className="flex gap-1">
        {running ? (
          <button onClick={pause} className="text-xs px-2 py-1 bg-stone-800 rounded-lg text-stone-300 hover:bg-stone-700">
            Pause
          </button>
        ) : (
          <button onClick={start} className="text-xs px-2 py-1 bg-orange-700 rounded-lg text-white hover:bg-orange-600">
            Start
          </button>
        )}
        <button onClick={reset} className="text-xs px-2 py-1 bg-stone-800 rounded-lg text-stone-400 hover:bg-stone-700">
          Reset
        </button>
      </div>
    </div>
  )
}

function GamesWonPips({ won, needed, color }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: needed }).map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i < won ? color : 'bg-stone-700'}`} />
      ))}
    </div>
  )
}

function CourtScoreCard({ court }) {
  const {
    courtName, courtNumber,
    teamA = [], teamB = [],
    scoreConfig = {},
    currentScore,
    currentGame,
    matchWinner,
    matchStatus,
    gamesWon,
    completedGames,
  } = court

  const score = currentScore ?? { teamA: 0, teamB: 0 }
  const game = currentGame ?? 1
  const wins = gamesWon ?? { teamA: 0, teamB: 0 }
  const totalGames = scoreConfig.numberOfGames ?? 3
  const gamesNeeded = Math.ceil(totalGames / 2)
  const isFinished = matchStatus === 'finished' || !!matchWinner
  const hasScoring = !!currentScore

  const teamAName = teamA.map(p => p.name).join(', ')
  const teamBName = teamB.map(p => p.name).join(', ')

  return (
    <div className={`bg-stone-900 rounded-xl p-4 border transition-colors ${
      isFinished ? 'border-amber-500/30' : 'border-stone-800'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-stone-400 text-xs font-semibold uppercase tracking-wide">
          Court {courtName ?? courtNumber}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isFinished
            ? 'bg-amber-500/20 text-amber-400'
            : hasScoring
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-stone-700 text-stone-500'
        }`}>
          {isFinished
            ? `${matchWinner === 'teamA' ? 'Team A' : 'Team B'} Wins`
            : hasScoring
              ? `G${game}/${totalGames}`
              : 'Waiting'
          }
        </span>
      </div>

      {/* Score row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 text-center">
          <p className={`text-4xl font-black tabular-nums leading-none ${
            matchWinner === 'teamA' ? 'text-emerald-400' : 'text-white'
          }`}>
            {score.teamA}
          </p>
          <div className="flex justify-center mt-1.5">
            <GamesWonPips won={wins.teamA} needed={gamesNeeded} color="bg-emerald-500" />
          </div>
        </div>

        <div className="text-stone-600 text-xl font-light">—</div>

        <div className="flex-1 text-center">
          <p className={`text-4xl font-black tabular-nums leading-none ${
            matchWinner === 'teamB' ? 'text-sky-400' : 'text-white'
          }`}>
            {score.teamB}
          </p>
          <div className="flex justify-center mt-1.5">
            <GamesWonPips won={wins.teamB} needed={gamesNeeded} color="bg-sky-500" />
          </div>
        </div>
      </div>

      {/* Team names */}
      <div className="flex justify-between gap-2 text-xs text-stone-600 mt-2">
        <span className="truncate">{teamAName || 'Team A'}</span>
        <span className="truncate text-right">{teamBName || 'Team B'}</span>
      </div>

      {/* Completed game scores inline */}
      {completedGames?.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {completedGames.map(g => (
            <span
              key={g.game}
              className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                g.winner === 'teamA' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'
              }`}
            >
              {g.teamA}-{g.teamB}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LiveScoreOverview({ courts = [] }) {
  if (courts.length === 0) return null

  const finished = courts.filter(c => c.matchWinner).length
  const playing = courts.length - finished

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Live Scores</h3>
        {finished > 0 && (
          <span className="text-stone-500 text-xs">{finished}/{courts.length} complete</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {courts.map(court => (
          <CourtScoreCard key={court.id} court={court} />
        ))}
      </div>

      {playing === 0 && finished > 0 && (
        <p className="text-center text-emerald-400 text-sm font-semibold pt-1">All matches complete 🏆</p>
      )}
    </div>
  )
}
